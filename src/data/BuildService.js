// BuildService
//
// The single entry point the UI should use for everything Build-related.
// Conceptually:
//
//   Build UI -> BuildService -> localStorage        (today)
//   Build UI -> BuildService -> Tower Backend        (later)
//
// No component should read/write localStorage directly — that all happens
// here so the storage layer can be swapped out later without touching the
// UI. Builds only ever REFERENCE Items/Eternals by id; this module never
// copies Wiki item/effect/set-bonus data into a Build record. Anything
// display-worthy about the referenced Eternal/Items is resolved live via
// ArkheronDataService (see `resolveBuildLoadout` below).
//
// Everything under "ranking / popularity" is an explicitly-labeled
// prototype heuristic over local/mock metrics (rating, ratingCount,
// viewCount, createdAt/updatedAt) — none of it represents real community
// data yet.

import ArkheronDataService from './ArkheronDataService.js'
import { SEED_BUILDS } from './devBuilds.js'

const LOCAL_BUILDS_KEY = 'tower.builds.local.v1'
const STATS_OVERLAY_KEY = 'tower.builds.stats.v1'

/**
 * A Build is a free-form LOADOUT — a Consumable + Crown + Amulet + two
 * Weapons picked from ANY items in the database. There is intentionally NO
 * required Eternal field: Arkheron builds mix and match Eternal items and
 * Echo items freely, and Tower should not force every build to "belong" to
 * one Eternal. Eternal affiliation/set-bonus relevance is always DERIVED
 * from the selected item ids at read time (see `computeBuildSynergies`),
 * never stored on the Build itself.
 *
 * @typedef {Object} Build
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} [author]
 * @property {string} [bigIdea] - "The Big Idea": how the build works
 * @property {string} [rotation] - optional ordered gameplan/rotation notes
 * @property {string} [tips] - optional practical tips
 * @property {string} [playstyle]
 * @property {string} [recommendedUse]
 * @property {string} [anchorItemId] - optional Anchor Ability
 * @property {string} [crownItemId]
 * @property {string} [amuletItemId]
 * @property {string} [weapon1ItemId]
 * @property {string} [weapon2ItemId]
 * @property {string} [consumableId]
 * @property {string[]} [tags] - user-selected descriptive tags (playstyle labels, not derived from items)
 * @property {number} [rating] - prototype/local metric, 0-5
 * @property {number} [ratingCount] - prototype/local metric
 * @property {number} [viewCount] - prototype/local metric
 * @property {number} [commentCount] - prototype/local metric (no comments backend yet)
 * @property {'draft'|'published'} [status]
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

// ---------------------------------------------------------------------------
// localStorage helpers (the only place this module talks to the browser)
// ---------------------------------------------------------------------------

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error(`Failed to read "${key}" from localStorage:`, err)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to write "${key}" to localStorage:`, err)
  }
}

function readLocalBuilds() {
  return readJson(LOCAL_BUILDS_KEY, [])
}

function writeLocalBuilds(builds) {
  writeJson(LOCAL_BUILDS_KEY, builds)
}

// A small "stats overlay" keyed by build id lets prototype metrics (right
// now just view count) update for ANY build — including the bundled seed
// builds, which otherwise aren't writable — without mutating devBuilds.js.
function readStatsOverlay() {
  return readJson(STATS_OVERLAY_KEY, {})
}

function writeStatsOverlay(overlay) {
  writeJson(STATS_OVERLAY_KEY, overlay)
}

function applyStatsOverlay(build) {
  const overlay = readStatsOverlay()[build.id]
  return overlay ? { ...build, ...overlay } : build
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'build'
}

function uniqueSlug(baseSlug, existingSlugs) {
  if (!existingSlugs.has(baseSlug)) return baseSlug
  let attempt = 2
  while (existingSlugs.has(`${baseSlug}-${attempt}`)) attempt += 1
  return `${baseSlug}-${attempt}`
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

function getAllBuildsRaw() {
  return [...SEED_BUILDS, ...readLocalBuilds()].map(applyStatsOverlay)
}

/**
 * Published builds only — what the Build browser (`/builds`) should list.
 * @returns {Build[]}
 */
export function getBuilds() {
  return getAllBuildsRaw().filter((build) => build.status !== 'draft')
}

/**
 * All builds, including local drafts. Used internally so a draft build can
 * still be opened directly via its detail-page link/URL while it stays out
 * of the public browse list.
 * @returns {Build[]}
 */
export function getAllBuildsIncludingDrafts() {
  return getAllBuildsRaw()
}

/**
 * @param {string} idOrSlug
 * @returns {Build | undefined}
 */
export function getBuild(idOrSlug) {
  return getAllBuildsRaw().find((build) => build.id === idOrSlug || build.slug === idOrSlug)
}

// ---------------------------------------------------------------------------
// Writes (localStorage only — no backend yet)
// ---------------------------------------------------------------------------

/**
 * Create or update a locally-saved build (draft or published).
 * Seed builds are read-only and are never written back to localStorage.
 * @param {Partial<Build> & { id?: string }} input
 * @returns {Build}
 */
export function saveBuild(input) {
  const now = new Date().toISOString()
  const localBuilds = readLocalBuilds()
  const existingSlugs = new Set(getAllBuildsRaw().map((build) => build.slug))

  if (input.id) {
    const index = localBuilds.findIndex((build) => build.id === input.id)
    if (index !== -1) {
      const updated = { ...localBuilds[index], ...input, updatedAt: now }
      localBuilds[index] = updated
      writeLocalBuilds(localBuilds)
      return updated
    }
  }

  const baseSlug = slugify(input.name || 'untitled-build')
  const slug = uniqueSlug(baseSlug, existingSlugs)
  const created = {
    rating: 0,
    ratingCount: 0,
    viewCount: 0,
    commentCount: 0,
    status: 'published',
    tags: [],
    ...input,
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    createdAt: now,
    updatedAt: now,
  }
  localBuilds.push(created)
  writeLocalBuilds(localBuilds)
  return created
}

/**
 * Delete a locally-saved build. Seed builds cannot be deleted.
 * @param {string} id
 */
export function deleteBuild(id) {
  writeLocalBuilds(readLocalBuilds().filter((build) => build.id !== id))
}

/**
 * Prototype "view" tracking — increments a local-only view counter for any
 * build (seed or local). This is NOT a real analytics/community metric.
 * @param {string} id
 */
export function recordBuildView(id) {
  const build = getAllBuildsRaw().find((b) => b.id === id)
  if (!build) return
  const overlay = readStatsOverlay()
  const currentViews = overlay[id]?.viewCount ?? build.viewCount ?? 0
  overlay[id] = { ...overlay[id], viewCount: currentViews + 1 }
  writeStatsOverlay(overlay)
}

// ---------------------------------------------------------------------------
// Ranking / sorting — prototype heuristics over local/mock metrics only.
// These do not represent real community popularity; they exist so the
// Build browser's sort UI has something concrete and clearly-defined to do
// until Tower has a real backend with real engagement data.
// ---------------------------------------------------------------------------

function popularityScore(build) {
  const rating = build.rating ?? 0
  const ratingCount = build.ratingCount ?? 0
  const viewCount = build.viewCount ?? 0
  // Weighs total views alongside "rating weight" (rating x number of raters)
  // so a build with a few 5-star ratings doesn't outrank one that's been
  // widely viewed and rated. Purely a placeholder formula.
  return viewCount + rating * ratingCount * 5
}

function trendingScore(build) {
  const ageInHours = Math.max(1, (Date.now() - new Date(build.updatedAt).getTime()) / 3_600_000)
  // Decays popularity by recency of last update, similar in spirit to a
  // "hot" ranking algorithm — favors builds with recent engagement over
  // pure all-time popularity. Placeholder formula, not a real trending
  // algorithm.
  return popularityScore(build) / Math.pow(ageInHours + 2, 1.4)
}

export function sortByTrending(builds) {
  return [...builds].sort((a, b) => trendingScore(b) - trendingScore(a))
}

export function sortByPopularity(builds) {
  return [...builds].sort((a, b) => popularityScore(b) - popularityScore(a))
}

export function sortByRating(builds) {
  return [...builds].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0))
}

export function sortByViews(builds) {
  return [...builds].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
}

export function sortByNewest(builds) {
  return [...builds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/** Centralized so the Build browser's sort dropdown has one place to look up a sorter. */
export const BUILD_SORTERS = {
  trending: { label: 'Trending', sort: sortByTrending },
  popular: { label: 'Popular', sort: sortByPopularity },
  rating: { label: 'Highest Rated', sort: sortByRating },
  views: { label: 'Most Viewed', sort: sortByViews },
  newest: { label: 'Newest', sort: sortByNewest },
}

// ---------------------------------------------------------------------------
// Item/Eternal resolution — the ONLY source of truth for what a build's
// items/Eternals actually look like is ArkheronDataService. Nothing here
// duplicates Wiki data; it just looks referenced ids up and groups them.
//
// A build is a free-form loadout, so its Eternal affiliation is a DERIVED
// property, not stored metadata: a loadout can span zero, one, or several
// Eternals (plus Echo items, which have no eternalId at all).
// ---------------------------------------------------------------------------

/**
 * Group the (up to four) Crown/Amulet/Weapon/Weapon items by the Eternal
 * they belong to, and report how many of that Eternal's items are present.
 * The Wiki only documents a single set-bonus string per Eternal (not
 * separate 2-piece/4-piece text), so both thresholds surface that same
 * documented bonus once enough of the loadout belongs to that Eternal. No
 * bonus text is invented; a build can validly have zero active set bonuses.
 * @param {object[]} loadoutItems - resolved Crown/Amulet/Weapon/Weapon items (consumable excluded — it isn't Eternal-specific)
 * @param {object[]} [eternals] - resolved Eternal records, used to look up bonus text/canonical names
 * @returns {Array<{eternalId:string, eternalName:string, bonusText:string|undefined, bonusImage:string|undefined, matchedCount:number, totalSlots:number, twoPieceActive:boolean, fourPieceActive:boolean}>}
 */
export function computeBuildSynergies(loadoutItems, eternals = []) {
  const groups = new Map()
  loadoutItems.filter(Boolean).forEach((item) => {
    if (!item.eternalId) return // Echo items don't contribute to any Eternal's set
    if (!groups.has(item.eternalId)) groups.set(item.eternalId, [])
    groups.get(item.eternalId).push(item)
  })

  const synergies = Array.from(groups.entries()).map(([eternalId, matchedItems]) => {
    const eternal = eternals.find((e) => e.id === eternalId)
    const matchedCount = matchedItems.length
    return {
      eternalId,
      eternalName: eternal?.name || matchedItems[0].eternalName || eternalId,
      bonusText: eternal?.bonus,
      // The actual per-Eternal "set bonus" badge icon from the Wiki (e.g.
      // https://arkheron.wiki.gg/wiki/File:Dahla_set_bonus.png) — used to
      // visually badge matched items in the loadout, never a made-up icon.
      bonusImage: eternal?.bonusImage,
      matchedCount,
      totalSlots: 4,
      twoPieceActive: matchedCount >= 2,
      fourPieceActive: matchedCount >= 4,
    }
  })

  return synergies.sort((a, b) => b.matchedCount - a.matchedCount)
}

/**
 * A short "composition" label for a loadout — e.g. ['Dahla'], ['Dahla',
 * 'Echo'], or ['Hollow', 'Dahla', 'Echo'] — derived purely from the
 * selected items' own source data. Never persisted; recomputed on read.
 * @param {object[]} loadoutItems
 * @returns {string[]}
 */
export function getLoadoutComposition(loadoutItems) {
  const labels = []
  loadoutItems.filter(Boolean).forEach((item) => {
    const label = item.eternalId ? item.eternalName || item.eternalId : 'Echo'
    if (!labels.includes(label)) labels.push(label)
  })
  return labels
}

/**
 * Resolve a Build's referenced Items (and derived Eternal synergies) from
 * the live Tower database.
 * @param {Build} build
 * @returns {Promise<{ anchor: object|undefined, crown: object|undefined, amulet: object|undefined, weapon1: object|undefined, weapon2: object|undefined, consumable: object|undefined, synergies: object[], composition: string[] }>}
 */
export async function resolveBuildLoadout(build) {
  if (!build) return null

  const [items, eternals] = await Promise.all([
    ArkheronDataService.getItems(),
    ArkheronDataService.getEternals(),
  ])

  const findItem = (id) => (id ? items.find((item) => item.id === id) : undefined)

  const anchor = findItem(build.anchorItemId)
  const crown = findItem(build.crownItemId)
  const amulet = findItem(build.amuletItemId)
  const weapon1 = findItem(build.weapon1ItemId)
  const weapon2 = findItem(build.weapon2ItemId)
  const consumable = findItem(build.consumableId)

  // Anchor Abilities (like Consumables) aren't Eternal-affiliated, so they're
  // excluded from set-synergy math — only Crown/Amulet/Weapon slots count.
  const loadoutItems = [crown, amulet, weapon1, weapon2].filter(Boolean)
  const synergies = computeBuildSynergies(loadoutItems, eternals)
  const composition = getLoadoutComposition(loadoutItems)

  return { anchor, crown, amulet, weapon1, weapon2, consumable, synergies, composition }
}

/**
 * Published builds whose resolved loadout includes at least one item that
 * belongs to the given Eternal (i.e. `eternalId` appears in the build's
 * derived synergies). Used for the "Community Builds" preview on the
 * Eternal directory/detail pages — this never stores an Eternal on a Build,
 * it's a live read-time filter over `resolveBuildLoadout`.
 * @param {string} eternalId
 * @param {{limit?: number}} [options]
 * @returns {Promise<Build[]>}
 */
export async function getBuildsForEternal(eternalId, { limit } = {}) {
  const builds = getBuilds()
  const resolved = await Promise.all(builds.map((build) => resolveBuildLoadout(build)))
  const matches = builds.filter((_, index) => resolved[index]?.synergies?.some((synergy) => synergy.eternalId === eternalId))
  const sorted = sortByTrending(matches)
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

const BuildService = {
  getBuilds,
  getAllBuildsIncludingDrafts,
  getBuild,
  saveBuild,
  deleteBuild,
  recordBuildView,
  resolveBuildLoadout,
  computeBuildSynergies,
  getLoadoutComposition,
  getBuildsForEternal,
  sortByTrending,
  sortByPopularity,
  sortByRating,
  sortByViews,
  sortByNewest,
  BUILD_SORTERS,
}

export default BuildService
