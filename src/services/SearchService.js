// SearchService
//
// A thin read-only aggregator over Tower's EXISTING data services. It never
// stores or duplicates records — it just asks ArkheronDataService/
// BuildService/NewsService for what they already have in memory/cache and
// ranks/filters the results for the global search UI.
//
// Guides are intentionally omitted: there is no real Guide dataset yet
// (the Guides page is still a placeholder), so searching it would either
// be empty or fabricated. Once real guide data exists this service can add
// a `guides` category the same way as the others.

import ArkheronDataService from '../data/ArkheronDataService.js'
import BuildService from '../data/BuildService.js'
import NewsService from '../data/NewsService.js'

const RESULT_LIMIT_PER_CATEGORY = 8

function normalize(value) {
  return (value || '').toString().trim().toLowerCase()
}

/**
 * Score how well `haystack` matches `query`. Higher is better; `null` means
 * "no match". Exact matches rank highest, then "starts with", then
 * "contains" — deliberately simple, non-fuzzy matching per spec.
 */
function matchScore(haystack, query) {
  const value = normalize(haystack)
  if (!value || !query) return null
  if (value === query) return 100
  if (value.startsWith(query)) return 80
  if (value.includes(query)) return 50
  return null
}

/**
 * Best score across several candidate fields (name matches weighted higher
 * than secondary/description fields via the `weight` multiplier).
 */
function bestFieldScore(fields, query) {
  let best = null
  for (const { value, weight = 1 } of fields) {
    const score = matchScore(value, query)
    if (score == null) continue
    const weighted = score * weight
    if (best == null || weighted > best) best = weighted
  }
  return best
}

function rankAndLimit(scored) {
  return scored
    .filter((entry) => entry.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULT_LIMIT_PER_CATEGORY)
    .map((entry) => entry.result)
}

function searchEternals(eternals, query) {
  const scored = eternals.map((eternal) => {
    const ability = eternal.eternalAbility
    // An Eternal Ability match (e.g. searching its name) is still surfaced
    // as an Eternal result, since the ability isn't a separate database
    // record — but its name is shown as the subtitle so it's clear why the
    // Eternal matched.
    const abilityScore = ability
      ? bestFieldScore(
          [
            { value: ability.name, weight: 0.9 },
            { value: ability.description, weight: 0.3 },
          ],
          query,
        )
      : null
    const nameScore = bestFieldScore(
      [
        { value: eternal.name, weight: 1 },
        { value: eternal.description, weight: 0.3 },
      ],
      query,
    )
    const score =
      nameScore == null && abilityScore == null
        ? null
        : Math.max(nameScore ?? -Infinity, abilityScore ?? -Infinity)
    return {
      score,
      result: {
        type: 'eternal',
        id: eternal.id,
        title: eternal.name,
        subtitle:
          ability && (abilityScore ?? -Infinity) > (nameScore ?? -Infinity)
            ? `Eternal · ${ability.name}`
            : 'Eternal',
        image: eternal.image,
        href: `/eternals/${encodeURIComponent(eternal.id)}`,
      },
    }
  })
  return rankAndLimit(scored)
}

function searchItems(items, query) {
  const scored = items.map((item) => ({
    score: bestFieldScore(
      [
        { value: item.name, weight: 1 },
        { value: item.category, weight: 0.4 },
        { value: item.eternalName, weight: 0.4 },
        { value: item.flavorText, weight: 0.25 },
        { value: item.bonus, weight: 0.25 },
      ],
      query,
    ),
    result: {
      type: 'item',
      id: item.id,
      title: item.name,
      subtitle: [item.category, item.eternalName || item.source].filter(Boolean).join(' · '),
      image: item.image,
      href: `/items/${encodeURIComponent(item.id)}`,
    },
  }))
  return rankAndLimit(scored)
}

function searchBuilds(builds, query) {
  const scored = builds.map((build) => ({
    score: bestFieldScore(
      [
        { value: build.name, weight: 1 },
        { value: build.author, weight: 0.5 },
        { value: (build.tags || []).join(' '), weight: 0.5 },
        { value: build.bigIdea, weight: 0.25 },
      ],
      query,
    ),
    result: {
      type: 'build',
      id: build.id,
      title: build.name,
      subtitle: build.author ? `Community Build · ${build.author}` : 'Community Build',
      image: undefined,
      href: `/builds/${encodeURIComponent(build.slug || build.id)}`,
    },
  }))
  return rankAndLimit(scored)
}

function searchNews(articles, query) {
  const scored = articles.map((article) => ({
    score: bestFieldScore(
      [
        { value: article.title, weight: 1 },
        { value: article.category, weight: 0.4 },
        { value: article.excerpt, weight: 0.3 },
      ],
      query,
    ),
    result: {
      type: 'news',
      id: article.id,
      title: article.title,
      subtitle: article.category || 'News',
      image: article.heroImage || article.image,
      href: `/news/${encodeURIComponent(article.slug || article.id)}`,
    },
  }))
  return rankAndLimit(scored)
}

function searchMonsters(monsters, query) {
  const scored = monsters.map((monster) => ({
    score: bestFieldScore(
      [
        { value: monster.name, weight: 1 },
        { value: monster.summary, weight: 0.4 },
        { value: monster.description, weight: 0.25 },
      ],
      query,
    ),
    result: {
      type: 'monster',
      id: monster.id,
      title: monster.name,
      subtitle: 'Monster',
      image: monster.icon || monster.image,
      href: `/monsters/${encodeURIComponent(monster.id)}`,
    },
  }))
  return rankAndLimit(scored)
}

function searchMaps(maps, query) {
  const scored = maps.map((map) => ({
    score: bestFieldScore(
      [
        { value: map.name, weight: 1 },
        { value: map.category, weight: 0.5 },
        { value: map.description, weight: 0.3 },
      ],
      query,
    ),
    result: {
      type: 'map',
      id: map.id,
      title: map.name,
      subtitle: map.entityType === 'floor' ? 'Map · Floor' : `Map · ${map.category}`,
      image: map.image,
      href: `/maps/${encodeURIComponent(map.id)}`,
    },
  }))
  return rankAndLimit(scored)
}

/**
 * Search Tower's already-loaded data for `query`.
 * @param {string} query
 * @returns {Promise<{ eternals: object[], items: object[], builds: object[], news: object[], guides: object[] }>}
 */
export async function search(query) {
  const empty = { eternals: [], items: [], monsters: [], maps: [], builds: [], news: [], guides: [] }
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return empty

  const [eternals, items, monsters, maps, articles] = await Promise.all([
    ArkheronDataService.getEternals().catch(() => []),
    ArkheronDataService.getItems().catch(() => []),
    ArkheronDataService.getMonsters().catch(() => []),
    ArkheronDataService.getMaps().catch(() => []),
    NewsService.getArticles().catch(() => []),
  ])
  const builds = BuildService.getBuilds()

  return {
    eternals: searchEternals(eternals, normalizedQuery),
    items: searchItems(items, normalizedQuery),
    monsters: searchMonsters(monsters, normalizedQuery),
    maps: searchMaps(maps, normalizedQuery),
    builds: searchBuilds(builds, normalizedQuery),
    news: searchNews(articles, normalizedQuery),
    // No real Guide dataset exists yet — always empty until one does.
    guides: [],
  }
}

/** Total result count across all categories — handy for "no results" checks. */
export function countResults(results) {
  return Object.values(results).reduce((total, list) => total + list.length, 0)
}

const SearchService = { search, countResults }

export default SearchService
