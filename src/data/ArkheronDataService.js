// ArkheronDataService
//
// The single entry point the UI should use to retrieve Arkheron data.
// It sits between the UI and WikiProvider, and is responsible for turning
// raw MediaWiki content into a clean, predictable Tower data model.
//
// Eternals and Items (Eternal/Echo items via the Cargo "Items" table, plus
// Consumables and Anchor Abilities, which the Wiki only exposes as plain
// wikitext list pages rather than Cargo rows) are implemented. Fields the
// Wiki does not provide are simply omitted (left `undefined`/absent) rather
// than guessed.

import { getCategoryMembers, getPagesWikitext, getImageUrls, cargoQuery, WIKI_BASE_URL } from './WikiProvider.js'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes — lightweight in-memory cache only

let eternalsCache = null // { data: Eternal[], fetchedAt: number }
let eternalsPromise = null // in-flight request, to avoid duplicate concurrent fetches

let itemsCache = null // { data: Item[], fetchedAt: number }
let itemsPromise = null // in-flight request, to avoid duplicate concurrent fetches

let glossaryCache = null // { data: Record<string,string>, fetchedAt: number }
let glossaryPromise = null // in-flight request, to avoid duplicate concurrent fetches

let monstersCache = null // { data: Monster[], fetchedAt: number }
let monstersPromise = null // in-flight request, to avoid duplicate concurrent fetches

let mapsCache = null // { data: MapEntity[], fetchedAt: number }
let mapsPromise = null // in-flight request, to avoid duplicate concurrent fetches

// ---------------------------------------------------------------------------
// Wikitext parsing helpers
// ---------------------------------------------------------------------------

/**
 * Strip common wikitext markup down to plain text.
 * Handles bold/italic quotes, [[wiki links]], and simple templates.
 */
function stripWikiMarkup(text) {
  if (!text) return text
  return text
    .replace(/\{\{#ev:[^}]*\}\}/gi, '') // embedded video templates
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2') // [[target|label]] -> label
    .replace(/\[\[([^\]]*)\]\]/g, '$1') // [[target]] -> target
    .replace(/\[(https?:\/\/[^\s\]]+)\s*([^\]]*)\]/g, '$2') // [url label] -> label
    .replace(/'''([^']*)'''/g, '$1') // bold
    .replace(/''([^']*)''/g, '$1') // italic
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parse a MediaWiki infobox-style template call into a flat key/value map.
 * Only splits on top-level "\n|" boundaries, so nested templates used as a
 * parameter value (e.g. `{{Item_tag|tag1=x|tag2=y}}`) are preserved intact
 * inside that parameter's raw value rather than being split apart.
 */
function parseTemplateParams(wikitext) {
  const match = wikitext.match(/\{\{\s*([^\n|{}]+?)\s*(?:\n|\|)([\s\S]*)\}\}\s*$/)
  if (!match) return { templateName: null, params: {} }

  const templateName = match[1].trim()
  const body = `\n${match[2]}`
  const chunks = body.split(/\n\|/).slice(1) // drop the empty first split

  const params = {}
  for (const chunk of chunks) {
    const eq = chunk.indexOf('=')
    if (eq === -1) continue
    const key = chunk.slice(0, eq).trim()
    const value = chunk.slice(eq + 1).trim()
    params[key] = value
  }

  return { templateName, params }
}

/**
 * Parse `{{Item_tag|tag1=a|tag2=b|...}}` values into a plain string array.
 */
function parseTags(rawValue) {
  if (!rawValue) return []
  const tags = []
  const tagRegex = /tag\d+\s*=\s*([^|}]+)/g
  let m
  while ((m = tagRegex.exec(rawValue)) !== null) {
    tags.push(m[1].trim())
  }
  return tags
}

/**
 * Parse a semicolon-separated stat string like:
 *   "Damage: '''35''';Cooldown: '''26'''s;Max Range: '''9'''m"
 * into [{ label: 'Damage', value: '35' }, ...]
 */
function parseStats(rawValue) {
  if (!rawValue) return []
  return rawValue
    .split(';')
    .map((part) => stripWikiMarkup(part))
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf(':')
      if (idx === -1) return { label: part.trim(), value: '' }
      return {
        label: part.slice(0, idx).trim(),
        value: part.slice(idx + 1).trim(),
      }
    })
}

/**
 * Extract the first prose section from an Eternal's own page wikitext
 * (e.g. the "== The Dancer ==" intro paragraph on the Dahla page) to use
 * as its description. Returns undefined if no such section is found.
 */
function extractDescription(pageWikitext) {
  if (!pageWikitext) return undefined
  const match = pageWikitext.match(/^==\s*[^=]+?\s*==\s*\n([\s\S]*?)(?=\n==|\{\{Eternal Box\}\}|\[\[Category:|$)/m)
  if (!match) return undefined
  const cleaned = stripWikiMarkup(match[1])
  return cleaned || undefined
}

/**
 * Parse the rendered `item-tag` HTML spans the Items Cargo table stores,
 * e.g. `<span class="item-tag item-tag-status ">'''SLOW'''</span>`, into
 * plain tag objects. A tag can carry an `item-tag-greyed` class, meaning it
 * is only unlocked at a higher upgrade level (see `parseStats`/Level2/Level3).
 */
function parseItemTagSpans(rawValue) {
  if (!rawValue) return []
  const spanRegex = /<span class="([^"]*)">([\s\S]*?)<\/span>/g
  const tags = []
  let m
  while ((m = spanRegex.exec(rawValue)) !== null) {
    const classes = m[1].trim().split(/\s+/).filter(Boolean)
    const greyed = classes.includes('item-tag-greyed')
    const categoryClass = classes.find((c) => c.startsWith('item-tag-') && c !== 'item-tag-greyed')
    const category = categoryClass ? categoryClass.replace('item-tag-', '') : 'default'
    const labelMatch = m[2].match(/'''([^']*)'''/)
    const label = (labelMatch ? labelMatch[1] : stripWikiMarkup(m[2])).trim()
    if (label) {
      tags.push({ label, category, greyed })
    }
  }
  return tags
}

/**
 * Parse a simple "wikitable" of the shape used by the Wiki's Consumables and
 * Anchor Abilities list pages (there is no Cargo data or per-item Wiki page
 * for either of these — this single-page wikitable IS the only structured
 * source for them):
 *
 *   {| class="wikitable" ...
 *   ! Image !! Name !! Usage
 *   |-
 *   ! [[File:Foo.png|100x100px|link=Bar]]
 *   | '''Bar'''
 *   |
 *   * Some effect line.
 *   * Some other line: '''123'''
 *   |}
 *
 * Returns one record per row: { name, image, description, stats }.
 * "key: value" bullet lines become stats; everything else becomes prose.
 */
function parseSimpleWikiTable(wikitext) {
  if (!wikitext) return []
  const tableMatch = wikitext.match(/\{\|[\s\S]*?\n\|\}/)
  if (!tableMatch) return []

  const rows = tableMatch[0].split(/\n\|-/).slice(1)
  const records = []

  for (const row of rows) {
    const imageMatch = row.match(/\[\[File:([^|\]]+)/)
    const nameMatch = row.match(/'''([^']+)'''/)
    if (!nameMatch) continue

    const name = nameMatch[1].trim()
    const image = imageMatch ? imageMatch[1].trim() : undefined
    const afterName = row.slice(row.indexOf(nameMatch[0]) + nameMatch[0].length)

    const lines = afterName
      .split('\n')
      .map((line) => line.replace(/^\s*[|!]\s*/, '').trim())
      .filter(Boolean)

    const descriptionParts = []
    const stats = []
    for (const line of lines) {
      const bulleted = line.startsWith('*')
      const text = bulleted ? line.replace(/^\*\s*/, '') : line
      const statMatch = text.match(/^([A-Za-z][A-Za-z0-9 /]*):\s*(.+)$/)
      if (statMatch) {
        stats.push({ label: stripWikiMarkup(statMatch[1]), value: stripWikiMarkup(statMatch[2]) })
      } else {
        const cleaned = stripWikiMarkup(text)
        if (cleaned) descriptionParts.push(cleaned)
      }
    }

    records.push({
      name,
      image,
      description: descriptionParts.join(' ') || undefined,
      stats,
    })
  }

  return records
}

/**
 * Parse the Wiki's "Glossary" page wikitext into a lowercase
 * effect-name -> definition map. This is the authoritative source used for
 * effect tag tooltips — no definitions are invented beyond what the Glossary
 * itself documents. Terms without a Glossary entry simply have no tooltip.
 */
function parseGlossary(wikitext) {
  if (!wikitext) return {}
  const tableMatch = wikitext.match(/\{\|[\s\S]*?\n\|\}/)
  if (!tableMatch) return {}

  const rows = tableMatch[0].split(/\n\|-/).slice(1)
  const glossary = {}

  for (const row of rows) {
    const termMatch = row.match(/tag1=([^}|]+)/)
    if (!termMatch) continue
    const term = termMatch[1].trim().toLowerCase()

    const afterTerm = row.slice(row.indexOf(termMatch[0]) + termMatch[0].length).replace(/^\}\}/, '')
    const cells = afterTerm.split(/\n\|/)
    const firstCell = cells[1] || ''
    const paragraph = firstCell.split(/\n\s*\n/)[0] || ''
    const text = stripWikiMarkup(paragraph.trim().replace(/^colspan="2"\|/, ''))

    if (term && text) glossary[term] = text
  }

  return glossary
}

// Note: this intentionally returns the raw title rather than a URL-encoded
// value. React Router encodes route params when building links (via <Link>)
// and decodes them again in useParams(), so ids must stay "plain" here to
// compare equal on both ends.
function slugify(title) {
  return title
}

/**
 * Extract a "== Heading ==" section's body from wikitext, up to (but not
 * including) the next top-level heading. Used by both Monster and Map
 * pages, which share this basic MediaWiki section structure.
 */
function extractWikiSection(wikitext, heading) {
  const re = new RegExp(`==\\s*${heading}\\s*==\\n([\\s\\S]*?)(?=\\n==[^=]|$)`, 'i')
  const match = wikitext.match(re)
  return match ? match[1].trim() : undefined
}

/**
 * Parse a "* bullet\n* bullet" wikitext list into a plain string array.
 */
function parseBulletList(sectionText) {
  if (!sectionText) return []
  return sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('*'))
    .map((line) => stripWikiMarkup(line.replace(/^\*+\s*/, '')))
    .filter(Boolean)
}

/**
 * Parse the Wiki's `<div class="ak-card">...</div>` grid layout (used on
 * the Destroyer page's "Attacks" section) into plain objects. Each card has
 * an image, a title, a description, and an optional stat line.
 */
function parseAkCards(sectionText) {
  const chunks = sectionText.split('<div class="ak-card">').slice(1)
  return chunks
    .map((chunk) => {
      const image = (chunk.match(/ak-media">\[\[File:([^|\]]+)/) || [])[1]
      const name = (chunk.match(/ak-card__title">([^<]+)</) || [])[1]
      const descRaw = (chunk.match(/ak-card__meta__desc">([^<]+)</) || [])[1]
      const statsRaw = (chunk.match(/ak-card__meta__stats">([^<]+)</) || [])[1]
      if (!name) return null
      return {
        name: name.trim(),
        image: image ? image.trim() : undefined,
        description: descRaw ? stripWikiMarkup(descRaw) : undefined,
        stats: statsRaw ? parseStats(statsRaw.replace(/<br\s*\/?>/gi, ';')) : [],
      }
    })
    .filter(Boolean)
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Eternal model assembly
// ---------------------------------------------------------------------------

/**
 * Build a clean Eternal model from parsed infobox params + resolved image URLs.
 * Any field the Wiki doesn't provide is simply left out.
 */
function buildEternal({ pageId, title, infoboxParams, description, imageUrls }) {
  const resolveImage = (fileName) => (fileName ? imageUrls[fileName] : undefined)

  const eternal = {
    id: slugify(title),
    pageId,
    name: infoboxParams.title || title,
    description,
    image: resolveImage(infoboxParams.image),
    wikiUrl: `${WIKI_BASE_URL}/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  }

  if (infoboxParams.Bonus) {
    eternal.bonus = stripWikiMarkup(infoboxParams.Bonus)
  }

  // The Wiki doesn't expose this as an infobox param — every Eternal page
  // renders it from a file that follows the convention "<Eternal> set
  // bonus.png" (confirmed against the live Wiki), so it's resolved the same
  // way as any other per-Eternal image.
  const bonusImage = resolveImage(`${title} set bonus.png`)
  if (bonusImage) {
    eternal.bonusImage = bonusImage
  }

  // NOTE: the Eternal infobox also carries Crown/Amulet/Weapon1/Weapon2
  // name+image text fields, but those are intentionally NOT copied onto the
  // Eternal model here. They would be a second, independently-maintained
  // partial Item representation (and can drift out of sync with the actual
  // Items Cargo table — e.g. an item renamed on its own page but not in this
  // infobox). The canonical loadout items are resolved by the UI straight
  // from `getItems()`, filtered by `eternalId` + `itemType` (see Eternals.jsx
  // / EternalDetail.jsx) — the single source of truth for Item data.

  if (infoboxParams.EternalAbility) {
    eternal.eternalAbility = {
      name: infoboxParams.EternalAbility,
      image: resolveImage(infoboxParams.EternalAbilityImage),
      description: stripWikiMarkup(infoboxParams.EternalAbilityDescription),
      tags: parseTags(infoboxParams.EternalAbilityTags),
      stats: parseStats(infoboxParams.EternalAbilityStats),
    }
  }

  return eternal
}

/**
 * Collect every Wiki file name referenced by a set of infobox params, so
 * they can all be resolved to real URLs in a single batched request.
 */
function collectImageFileNames(paramsList) {
  const names = new Set()
  // Crown/Amulet/Weapon1/Weapon2 infobox image fields are intentionally NOT
  // resolved here — those relic images come from the canonical Items Cargo
  // table instead (see buildEternal's note above), so fetching them again
  // here would just be a redundant request for data Items already provides.
  const keys = ['image', 'EternalAbilityImage']
  for (const params of paramsList) {
    for (const key of keys) {
      if (params[key]) names.add(params[key])
    }
  }
  return Array.from(names)
}

async function fetchEternalsFromWiki() {
  const members = await getCategoryMembers('Eternals')
  if (!members.length) return []

  const templateTitles = members.map((m) => `Template:${m.title}`)
  const pageTitles = members.map((m) => m.title)

  const [templateWikitext, pageWikitext] = await Promise.all([
    getPagesWikitext(templateTitles),
    getPagesWikitext(pageTitles),
  ])

  const parsedByTitle = members.map((member) => {
    const raw = templateWikitext[`Template:${member.title}`]
    const { params } = raw ? parseTemplateParams(raw) : { params: {} }
    return { member, params }
  })

  const imageFileNames = [
    ...collectImageFileNames(parsedByTitle.map((p) => p.params)),
    ...parsedByTitle.map(({ member }) => `${member.title} set bonus.png`),
  ]
  const imageUrls = await getImageUrls(imageFileNames)

  return parsedByTitle.map(({ member, params }) =>
    buildEternal({
      pageId: member.pageId,
      title: member.title,
      infoboxParams: params,
      description: extractDescription(pageWikitext[member.title]),
      imageUrls,
    }),
  )
}

// ---------------------------------------------------------------------------
// Item model assembly (backed by the Wiki's "Items" Cargo table — a
// structured data table, so no wikitext template parsing is needed here).
// ---------------------------------------------------------------------------

const ITEM_CARGO_FIELDS = [
  '_pageID=pageId',
  '_pageName=pageName',
  'title=title',
  'image=image',
  'itemType=itemType',
  'isEternal=isEternal',
  'eternal=eternalName',
  'fragment_cost=fragmentCost',
  'Attack_label=attackLabel',
  'AttackTags=attackTags1',
  'AttackTags_2=attackTags2',
  'AttackTags_3=attackTags3',
  'AttackStats=attackStats1',
  'AttackStats_2=attackStats2',
  'AttackStats_3=attackStats3',
  'AttackDescription=attackDescription',
  'Ability_label=abilityLabel',
  'AbilityTags=abilityTags1',
  'AbilityTags_2=abilityTags2',
  'AbilityTags_3=abilityTags3',
  'AbilityStats=abilityStats1',
  'AbilityStats_2=abilityStats2',
  'AbilityStats_3=abilityStats3',
  'AbilityDescription=abilityDescription',
  'Level2=level2',
  'Level3=level3',
  'Bonus=bonus',
  'FlavorText=flavorText',
]

const ITEM_TYPE_LABELS = {
  weapon: 'Weapon',
  crown: 'Crown',
  amulet: 'Amulet',
  consumable: 'Consumable',
  'anchor-ability': 'Anchor Ability',
}

/**
 * Build a clean Item model from a raw Cargo row + resolved image URLs.
 * Any field the Wiki doesn't provide is simply left out.
 */
function buildItem(row, imageUrls) {
  const resolveImage = (fileName) => (fileName ? imageUrls[fileName] : undefined)
  const isEternal = row.isEternal === '1'

  const item = {
    id: slugify(row.pageName || row.title),
    pageId: row.pageId ? Number(row.pageId) : undefined,
    name: row.title,
    image: resolveImage(row.image),
    itemType: row.itemType || undefined,
    category: ITEM_TYPE_LABELS[row.itemType] || row.itemType,
    isEternal,
    source: isEternal ? 'Eternal' : 'Echo',
    eternalName: row.eternalName || undefined,
    eternalId: row.eternalName ? slugify(row.eternalName) : undefined,
    fragmentCost: row.fragmentCost || undefined,
    wikiUrl: `${WIKI_BASE_URL}/wiki/${encodeURIComponent((row.pageName || row.title).replace(/ /g, '_'))}`,
  }

  if (row.bonus) {
    item.bonus = stripWikiMarkup(row.bonus)
  }

  if (row.flavorText) {
    item.flavorText = stripWikiMarkup(row.flavorText)
  }

  if (row.attackLabel || row.attackDescription || row.attackTags1 || row.attackStats1) {
    item.attack = {
      label: row.attackLabel || undefined,
      description: row.attackDescription ? stripWikiMarkup(row.attackDescription) : undefined,
      tags: parseItemTagSpans(row.attackTags1),
      stats: parseStats(row.attackStats1),
    }
  }

  if (row.abilityLabel || row.abilityDescription || row.abilityTags1 || row.abilityStats1) {
    item.ability = {
      label: row.abilityLabel || undefined,
      description: row.abilityDescription ? stripWikiMarkup(row.abilityDescription) : undefined,
      tags: parseItemTagSpans(row.abilityTags1),
      stats: parseStats(row.abilityStats1),
    }
  }

  const upgrades = []
  if (row.level2) upgrades.push({ level: 2, description: stripWikiMarkup(row.level2) })
  if (row.level3) upgrades.push({ level: 3, description: stripWikiMarkup(row.level3) })
  if (upgrades.length) {
    item.upgrades = upgrades
  }

  // Deduplicated effect vocabulary for this item, drawn only from tags that
  // actually appear in the Wiki data (used to drive the Items filter list
  // and the colored EffectTag chips). Category comes straight from the
  // Wiki's own item-tag-<category> classes (see parseItemTagSpans).
  const effectMap = new Map()
  ;[row.attackTags1, row.abilityTags1].forEach((raw) => {
    parseItemTagSpans(raw).forEach((tag) => {
      if (!effectMap.has(tag.label)) {
        effectMap.set(tag.label, { label: tag.label, category: tag.category })
      }
    })
  })
  item.effects = Array.from(effectMap.values())

  return item
}

function collectItemImageFileNames(rows) {
  const names = new Set()
  for (const row of rows) {
    if (row.image) names.add(row.image)
  }
  return Array.from(names)
}

async function fetchItemsFromWiki() {
  const rows = await cargoQuery({ tables: 'Items', fields: ITEM_CARGO_FIELDS, limit: 500 })

  const imageFileNames = collectItemImageFileNames(rows)
  const imageUrls = await getImageUrls(imageFileNames)

  const cargoItems = rows.map((row) => buildItem(row, imageUrls))
  const [consumables, anchorAbilities] = await Promise.all([
    fetchConsumablesFromWiki(),
    fetchAnchorAbilitiesFromWiki(),
  ])

  return [...cargoItems, ...consumables, ...anchorAbilities]
}

// ---------------------------------------------------------------------------
// Consumables + Anchor Abilities
//
// Unlike Eternal/Echo items, these are NOT present in the Wiki's "Items"
// Cargo table and have no individual per-item Wiki pages. The Wiki only
// documents them as a single wikitable on a standalone list page
// ("Consumables", "Anchor Abilities"), so they're parsed from that page's
// wikitext instead. No Attack/Ability tags, upgrade levels, or set bonuses
// are fabricated for them — the Wiki simply doesn't provide that structure
// for these two item kinds, so those sections are left absent.
// ---------------------------------------------------------------------------

function buildListPageItem({ record, itemType, source, listPageTitle, imageUrls }) {
  const resolveImage = (fileName) => (fileName ? imageUrls[fileName] : undefined)

  return {
    id: slugify(record.name),
    name: record.name,
    image: resolveImage(record.image),
    itemType,
    category: ITEM_TYPE_LABELS[itemType] || itemType,
    isEternal: false,
    source,
    // No dedicated per-item Wiki page exists for these — link to the shared
    // list page that documents them instead of inventing a URL.
    wikiUrl: `${WIKI_BASE_URL}/wiki/${encodeURIComponent(listPageTitle.replace(/ /g, '_'))}`,
    ability: {
      description: record.description,
      tags: [],
      stats: record.stats,
    },
    effects: [],
  }
}

async function fetchConsumablesFromWiki() {
  const wikitext = (await getPagesWikitext(['Consumables'])).Consumables
  const records = parseSimpleWikiTable(wikitext)
  if (!records.length) return []

  const imageFileNames = records.filter((r) => r.image).map((r) => r.image)
  const imageUrls = await getImageUrls(imageFileNames)

  return records.map((record) =>
    buildListPageItem({ record, itemType: 'consumable', source: 'Consumable', listPageTitle: 'Consumables', imageUrls }),
  )
}

async function fetchAnchorAbilitiesFromWiki() {
  const wikitext = (await getPagesWikitext(['Anchor Abilities']))['Anchor Abilities']
  const records = parseSimpleWikiTable(wikitext)
  if (!records.length) return []

  const imageFileNames = records.filter((r) => r.image).map((r) => r.image)
  const imageUrls = await getImageUrls(imageFileNames)

  return records.map((record) =>
    buildListPageItem({
      record,
      itemType: 'anchor-ability',
      source: 'Anchor Ability',
      listPageTitle: 'Anchor Abilities',
      imageUrls,
    }),
  )
}

/**
 * Get the full list of Items from the Arkheron Wiki.
 * Results are cached in memory for a short time to avoid refetching on
 * every render/navigation.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getItems(options = {}) {
  const { forceRefresh = false } = options
  const isCacheValid = itemsCache && Date.now() - itemsCache.fetchedAt < CACHE_TTL_MS

  if (isCacheValid && !forceRefresh) {
    return itemsCache.data
  }

  if (itemsPromise && !forceRefresh) {
    return itemsPromise
  }

  itemsPromise = fetchItemsFromWiki()
    .then((data) => {
      itemsCache = { data, fetchedAt: Date.now() }
      itemsPromise = null
      return data
    })
    .catch((err) => {
      itemsPromise = null
      throw err
    })

  return itemsPromise
}

/**
 * Get a single Item by its Tower id (derived from its Wiki page title).
 * @param {string} id
 * @returns {Promise<object | undefined>}
 */
export async function getItem(id) {
  const items = await getItems()
  return items.find((item) => item.id === id)
}

/**
 * Get the full list of Eternals from the Arkheron Wiki.
 * Results are cached in memory for a short time to avoid refetching on
 * every render/navigation.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getEternals(options = {}) {
  const { forceRefresh = false } = options
  const isCacheValid = eternalsCache && Date.now() - eternalsCache.fetchedAt < CACHE_TTL_MS

  if (isCacheValid && !forceRefresh) {
    return eternalsCache.data
  }

  if (eternalsPromise && !forceRefresh) {
    return eternalsPromise
  }

  eternalsPromise = fetchEternalsFromWiki()
    .then((data) => {
      eternalsCache = { data, fetchedAt: Date.now() }
      eternalsPromise = null
      return data
    })
    .catch((err) => {
      eternalsPromise = null
      throw err
    })

  return eternalsPromise
}

/**
 * Get a single Eternal by its Tower id (derived from its Wiki page title).
 * Foundation for a future `/eternals/:id` detail page.
 * @param {string} id
 * @returns {Promise<object | undefined>}
 */
export async function getEternal(id) {
  const eternals = await getEternals()
  return eternals.find((eternal) => eternal.id === id)
}

// ---------------------------------------------------------------------------
// Monster model assembly
//
// The Wiki has no "Monsters" Category or Cargo table — the "Monsters" page
// itself is the source of truth, and it only names three monster
// categories (Remnants, Tormentors, Destroyers), each linking to its own
// page. Of those three links, only "Destroyer" currently resolves to a real
// Wiki page; "Remnant" and "Tormentor" are still redlinks (confirmed via the
// Wiki API — they return `missing: true`). Rather than assuming a fixed
// list, every linked category is fetched and only pages that actually exist
// are given full detail; the other categories are kept as lightweight
// entries using only the summary text the "Monsters" page itself provides.
// ---------------------------------------------------------------------------

const MONSTER_CATEGORY_REGEX = /'''\[\[([^|\]]+)(?:\|([^\]]+))?\]\]'''\s*-\s*([^\n]+)/g

function parseMonsterCategories(wikitext) {
  const categories = []
  let m
  const re = new RegExp(MONSTER_CATEGORY_REGEX)
  while ((m = re.exec(wikitext)) !== null) {
    categories.push({
      linkedTitle: m[1].trim(),
      label: (m[2] || m[1]).trim(),
      summary: stripWikiMarkup(m[3].trim()),
    })
  }
  return categories
}

/**
 * Parse a monster's own Wiki page (e.g. "Destroyer") into whatever
 * structured sections it actually has. Only "Attacks" and "Strategy" exist
 * today; other pages may have different/no sections, so every field here
 * is optional and left absent rather than guessed.
 */
function parseMonsterPage(wikitext) {
  const firstHeadingIdx = wikitext.search(/\n==\s*[^=]/)
  const introRaw = firstHeadingIdx === -1 ? wikitext : wikitext.slice(0, firstHeadingIdx)

  // The intro typically opens with one or two [[File:...]] image links
  // (a large framed preview + a small inline icon) before any prose.
  const fileLinkMatches = [...introRaw.matchAll(/\[\[File:([^\]]+)\]\]/g)].map((m) => m[1])
  let imageFile
  let iconFile
  for (const raw of fileLinkMatches) {
    const [fileName, ...opts] = raw.split('|').map((s) => s.trim())
    if (opts.includes('frame') && !imageFile) imageFile = fileName
    if (!iconFile) iconFile = fileName
  }

  const introWithoutFiles = introRaw.replace(/\[\[File:[^\]]*\]\]/g, '')
  const description = stripWikiMarkup(introWithoutFiles) || undefined

  const attacksSection = extractWikiSection(wikitext, 'Attacks')
  const attacksIntro = attacksSection ? stripWikiMarkup(attacksSection.split('<div')[0]) : undefined
  const attacks = attacksSection ? parseAkCards(attacksSection) : []

  const strategySection = extractWikiSection(wikitext, 'Strategy')
  const strategy = strategySection ? parseBulletList(strategySection) : []

  return {
    description,
    imageFile: imageFile || iconFile,
    iconFile: imageFile && iconFile !== imageFile ? iconFile : undefined,
    attacksIntro,
    attacks,
    strategy,
  }
}

function buildMonster({ category, detail, imageUrls }) {
  const monster = {
    id: category.linkedTitle,
    name: toTitleCase(category.label),
    summary: category.summary,
    hasWikiPage: !!detail,
    wikiUrl: `${WIKI_BASE_URL}/wiki/${encodeURIComponent(category.linkedTitle.replace(/ /g, '_'))}`,
  }

  if (detail) {
    if (detail.description) monster.description = detail.description

    const image = detail.imageFile ? imageUrls[detail.imageFile] : undefined
    if (image) monster.image = image
    const icon = detail.iconFile ? imageUrls[detail.iconFile] : undefined
    if (icon) monster.icon = icon

    if (detail.attacksIntro) monster.attacksIntro = detail.attacksIntro
    if (detail.attacks?.length) {
      monster.attacks = detail.attacks.map((attack) => ({
        name: attack.name,
        image: attack.image ? imageUrls[attack.image] : undefined,
        description: attack.description,
        stats: attack.stats,
      }))
    }
    if (detail.strategy?.length) monster.strategy = detail.strategy
  }

  return monster
}

async function fetchMonstersFromWiki() {
  const overviewWikitext = (await getPagesWikitext(['Monsters'])).Monsters
  if (!overviewWikitext) return []

  const categories = parseMonsterCategories(overviewWikitext)
  if (!categories.length) return []

  const detailWikitext = await getPagesWikitext(categories.map((c) => c.linkedTitle))

  const parsed = categories.map((category) => {
    const raw = detailWikitext[category.linkedTitle]
    return { category, detail: raw ? parseMonsterPage(raw) : null }
  })

  const imageFileNames = new Set()
  parsed.forEach(({ detail }) => {
    if (!detail) return
    if (detail.imageFile) imageFileNames.add(detail.imageFile)
    if (detail.iconFile) imageFileNames.add(detail.iconFile)
    detail.attacks?.forEach((attack) => attack.image && imageFileNames.add(attack.image))
  })
  const imageUrls = await getImageUrls(Array.from(imageFileNames))

  return parsed.map(({ category, detail }) => buildMonster({ category, detail, imageUrls }))
}

/**
 * Get the full list of Monster entries from the Arkheron Wiki.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getMonsters(options = {}) {
  const { forceRefresh = false } = options
  const isCacheValid = monstersCache && Date.now() - monstersCache.fetchedAt < CACHE_TTL_MS

  if (isCacheValid && !forceRefresh) {
    return monstersCache.data
  }

  if (monstersPromise && !forceRefresh) {
    return monstersPromise
  }

  monstersPromise = fetchMonstersFromWiki()
    .then((data) => {
      monstersCache = { data, fetchedAt: Date.now() }
      monstersPromise = null
      return data
    })
    .catch((err) => {
      monstersPromise = null
      throw err
    })

  return monstersPromise
}

/**
 * Get a single Monster by its Tower id (its Wiki page title, e.g. "Destroyer").
 * @param {string} id
 * @returns {Promise<object | undefined>}
 */
export async function getMonster(id) {
  const monsters = await getMonsters()
  return monsters.find((monster) => monster.id === id)
}

// ---------------------------------------------------------------------------
// Map model assembly
//
// The Wiki does not have per-floor pages, a Maps Category, or a Cargo
// table — it explicitly says an interactive map "is in the works" and only
// documents map information as a single reference page ("Map Information"):
// a legend table of icons (grouped under Beacons / Enemies / Objectives /
// Points of Interest) plus four floor preview images. Those are exposed
// here as two kinds of Map entities rather than invented per-floor data:
//   - "floor"   entities: one per floor preview image (Floor 1..4)
//   - "feature" entities: one per legend row (Beacon Available, Portal, ...)
// The Wiki does not state which features belong to which floor, so no such
// relationship is fabricated here.
// ---------------------------------------------------------------------------

function extractMapNotice(wikitext) {
  const idx = wikitext.search(/\n==/)
  const intro = idx === -1 ? wikitext : wikitext.slice(0, idx)
  return stripWikiMarkup(intro) || undefined
}

function parseMapFloors(wikitext) {
  const section = extractWikiSection(wikitext, 'Map Floors')
  if (!section) return []
  const matches = [...section.matchAll(/\[\[File:([^|\]]+)\|frame\|([^\]]+)\]\]/g)]
  return matches.map((m) => ({ imageFile: m[1].trim(), name: m[2].trim() }))
}

function parseMapFeatures(wikitext) {
  const tableMatch = wikitext.match(/\{\|[\s\S]*?\n\|\}/)
  if (!tableMatch) return []
  const rows = tableMatch[0].split(/\n\|-/).slice(1)

  const features = []
  let currentCategory
  const usedIndexes = new Set()

  for (let i = 0; i < rows.length; i++) {
    if (usedIndexes.has(i)) continue
    const row = rows[i]

    // Category header row, e.g. `! colspan="3"|Beacons`.
    const categoryMatch = row.match(/!\s*colspan="3"\|([^\n]+)/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      continue
    }

    // A feature with separate locked/unlocked icons (Portal, Gateway,
    // Bridge, Key) spans two consecutive row chunks: the first names the
    // feature (via a rowspan cell), the second holds its two icon files.
    const pairedMatch = row.match(
      /!\s*(?:Closed|Key)\s*\n!\s*(?:Open|Key Room)\s*\n\|\s*rowspan="2"\|'''([^']+)'''\s*(?:<br\s*\/?>)?\s*\n?([\s\S]*)/,
    )
    if (pairedMatch) {
      const name = pairedMatch[1].trim()
      const description = stripWikiMarkup(pairedMatch[2].replace(/\|\}\s*$/, '')) || undefined
      const nextRow = rows[i + 1] || ''
      const imageFiles = [...nextRow.matchAll(/\[\[File:([^|\]]+)/g)].map((m) => m[1].trim())
      usedIndexes.add(i + 1)
      features.push({ category: currentCategory, name, description, imageFiles })
      continue
    }

    // A simple single-icon feature row, e.g. Beacon Available / Destroyer / Shrine.
    const singleMatch = row.match(/!\s*colspan="2"\|\[\[File:([^|\]]+)[^\n]*\n\|\s*([\s\S]+)/)
    if (singleMatch) {
      const fileName = singleMatch[1].trim()
      const cellText = singleMatch[2].replace(/\|\}\s*$/, '').trim()
      // If the cell's own text bolds a name first (e.g. "'''Shrine'''<br>..."),
      // that IS the Wiki's own display label for this row — prefer it.
      // Otherwise fall back to the icon's file name (e.g.
      // "Beacon Available.png" -> "Beacon Available"), since the Wiki
      // doesn't give these rows any other name.
      const boldFirst = cellText.match(/^'''([^']+)'''\s*(?:<br\s*\/?>)?\s*\n?([\s\S]*)$/)
      const name = boldFirst ? boldFirst[1].trim() : fileName.replace(/\.[a-z0-9]+$/i, '')
      const description = stripWikiMarkup(boldFirst ? boldFirst[2] : cellText) || undefined
      features.push({ category: currentCategory, name, description, imageFiles: [fileName] })
    }
  }

  return features
}

function slugifyMapName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

async function fetchMapsFromWiki() {
  const wikitext = (await getPagesWikitext(['Map Information']))['Map Information']
  if (!wikitext) return []

  const notice = extractMapNotice(wikitext)
  const floors = parseMapFloors(wikitext)
  const features = parseMapFeatures(wikitext)

  const imageFileNames = new Set()
  floors.forEach((f) => f.imageFile && imageFileNames.add(f.imageFile))
  features.forEach((f) => f.imageFiles.forEach((name) => imageFileNames.add(name)))
  const imageUrls = await getImageUrls(Array.from(imageFileNames))

  const wikiUrl = `${WIKI_BASE_URL}/wiki/Map_Information`

  const floorEntities = floors.map((floor) => ({
    id: slugifyMapName(floor.name),
    entityType: 'floor',
    category: 'Floors',
    name: floor.name,
    notice,
    image: imageUrls[floor.imageFile],
    wikiUrl,
  }))

  const featureEntities = features.map((feature) => ({
    id: slugifyMapName(`${feature.category}-${feature.name}`),
    entityType: 'feature',
    category: feature.category,
    name: feature.name,
    description: feature.description,
    image: imageUrls[feature.imageFiles[0]],
    images: feature.imageFiles.map((name) => imageUrls[name]).filter(Boolean),
    wikiUrl,
  }))

  return [...floorEntities, ...featureEntities]
}

/**
 * Get the full list of Map entities (floor previews + map-icon legend
 * entries) from the Arkheron Wiki's "Map Information" page.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getMaps(options = {}) {
  const { forceRefresh = false } = options
  const isCacheValid = mapsCache && Date.now() - mapsCache.fetchedAt < CACHE_TTL_MS

  if (isCacheValid && !forceRefresh) {
    return mapsCache.data
  }

  if (mapsPromise && !forceRefresh) {
    return mapsPromise
  }

  mapsPromise = fetchMapsFromWiki()
    .then((data) => {
      mapsCache = { data, fetchedAt: Date.now() }
      mapsPromise = null
      return data
    })
    .catch((err) => {
      mapsPromise = null
      throw err
    })

  return mapsPromise
}

/**
 * Get a single Map entity by its Tower id.
 * @param {string} id
 * @returns {Promise<object | undefined>}
 */
export async function getMap(id) {
  const maps = await getMaps()
  return maps.find((map) => map.id === id)
}

// ---------------------------------------------------------------------------
// Effect glossary (tooltip definitions)
// ---------------------------------------------------------------------------

async function fetchGlossaryFromWiki() {
  const wikitext = (await getPagesWikitext(['Glossary'])).Glossary
  return parseGlossary(wikitext)
}

/**
 * Get the lowercase effect-name -> definition map sourced from the Wiki's
 * "Glossary" page. Used to power EffectTag tooltips.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<Record<string, string>>}
 */
export async function getEffectGlossary(options = {}) {
  const { forceRefresh = false } = options
  const isCacheValid = glossaryCache && Date.now() - glossaryCache.fetchedAt < CACHE_TTL_MS

  if (isCacheValid && !forceRefresh) {
    return glossaryCache.data
  }

  if (glossaryPromise && !forceRefresh) {
    return glossaryPromise
  }

  glossaryPromise = fetchGlossaryFromWiki()
    .then((data) => {
      glossaryCache = { data, fetchedAt: Date.now() }
      glossaryPromise = null
      return data
    })
    .catch((err) => {
      glossaryPromise = null
      throw err
    })

  return glossaryPromise
}

/**
 * Get the Glossary definition for a single effect label, if the Wiki
 * documents one. Returns undefined rather than a guessed definition.
 * @param {string} label
 * @returns {Promise<string | undefined>}
 */
export async function getEffectDefinition(label) {
  if (!label) return undefined
  const glossary = await getEffectGlossary()
  return glossary[label.trim().toLowerCase()]
}

const ArkheronDataService = {
  getEternals,
  getEternal,
  getItems,
  getItem,
  getMonsters,
  getMonster,
  getMaps,
  getMap,
  getEffectGlossary,
  getEffectDefinition,
}

export default ArkheronDataService
