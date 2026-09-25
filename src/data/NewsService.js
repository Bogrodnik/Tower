// NewsService
//
// Thin orchestration layer between the UI and ArkheronNewsProvider:
//
//   ArkheronNewsProvider -> NewsService (this file) -> Tower News UI
//
// Responsibilities:
//   - cache fetched articles in localStorage so News works offline / while
//     the provider is unavailable
//   - resolve each article's `mentions` (plain entity names) into confirmed
//     `relatedEntities` by checking them against the live ArkheronDataService
//     — an entity is only linked when its name matches an existing Eternal
//     or Item exactly (case-insensitive), never guessed
//   - expose simple read APIs (list, get one, categories, search) so pages
//     never talk to the provider or localStorage directly
//
// This does not duplicate the item/Eternal database — it only stores a
// small { type, id, name } pointer per confirmed mention.

import { fetchOfficialArticles } from '../services/ArkheronNewsProvider.js'
import ArkheronDataService from './ArkheronDataService.js'

// Bump this whenever the article dataset in ArkheronNewsProvider changes
// materially (e.g. the full historical backfill), so browsers holding an
// older cached copy under the previous key automatically ignore it instead
// of waiting out the TTL.
const CACHE_KEY = 'tower.news.cache.v4'
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export const CATEGORIES = [
  'Updates',
  'Patch Notes',
  'Hotfix',
  'Developer Update',
  'Tower Hour',
  'Events',
  'Community',
  'Announcement',
]
export const FALLBACK_CATEGORY = 'News'

// ---------------------------------------------------------------------------
// localStorage cache helpers
// ---------------------------------------------------------------------------

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read News cache from localStorage:', err)
    return null
  }
}

function writeCache(articles) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ articles, fetchedAt: Date.now() }))
  } catch (err) {
    console.error('Failed to write News cache to localStorage:', err)
  }
}

// ---------------------------------------------------------------------------
// Related-entity resolution
// ---------------------------------------------------------------------------

/**
 * Resolve an article's raw `mentions` (plain entity names) into confirmed
 * `relatedEntities`, matching only against real Eternals/Items already
 * loaded by ArkheronDataService. Unmatched mentions are dropped rather than
 * guessed at.
 */
async function resolveRelatedEntities(mentions) {
  if (!mentions || mentions.length === 0) return []

  const [eternals, items] = await Promise.all([
    ArkheronDataService.getEternals().catch(() => []),
    ArkheronDataService.getItems().catch(() => []),
  ])

  const resolved = []
  for (const mention of mentions) {
    const name = mention.name?.trim().toLowerCase()
    if (!name) continue

    if (mention.type === 'eternal') {
      const match = eternals.find((eternal) => eternal.name?.trim().toLowerCase() === name)
      if (match) resolved.push({ type: 'eternal', id: match.id, name: match.name })
    } else if (mention.type === 'item') {
      const match = items.find((item) => item.name?.trim().toLowerCase() === name)
      if (match) resolved.push({ type: 'item', id: match.id, name: match.name })
    }
  }
  return resolved
}

async function loadAndResolveArticles() {
  const rawArticles = await fetchOfficialArticles()
  const articles = await Promise.all(
    rawArticles.map(async (article) => ({
      ...article,
      relatedEntities: await resolveRelatedEntities(article.mentions),
    }))
  )
  // Newest first.
  return articles.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ---------------------------------------------------------------------------
// Public read API
// ---------------------------------------------------------------------------

/**
 * Get all news articles, newest first.
 * Falls back to the last cached copy if the provider throws, and only
 * throws itself if there is neither fresh data nor a cache to fall back on.
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<object[]>}
 */
export async function getArticles(options = {}) {
  const { forceRefresh = false } = options
  const cached = readCache()
  const isCacheFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS

  if (isCacheFresh && !forceRefresh) {
    return cached.articles
  }

  try {
    const articles = await loadAndResolveArticles()
    writeCache(articles)
    return articles
  } catch (err) {
    console.error('Failed to load official Arkheron news, falling back to cache:', err)
    if (cached) return cached.articles
    throw err
  }
}

/**
 * Get a single article by id or slug.
 * @param {string} idOrSlug
 * @returns {Promise<object | undefined>}
 */
export async function getArticle(idOrSlug) {
  const articles = await getArticles()
  return articles.find((article) => article.id === idOrSlug || article.slug === idOrSlug)
}

/**
 * Get related news for an article — other articles, most recent first,
 * preferring the same category.
 * @param {string} idOrSlug
 * @param {number} [limit]
 * @returns {Promise<object[]>}
 */
export async function getRelatedArticles(idOrSlug, limit = 3) {
  const articles = await getArticles()
  const current = articles.find((article) => article.id === idOrSlug || article.slug === idOrSlug)
  if (!current) return []

  const others = articles.filter((article) => article.id !== current.id)
  const sameCategory = others.filter((article) => article.category === current.category)
  const rest = others.filter((article) => article.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

/**
 * List the categories actually present in the current article set, in the
 * canonical taxonomy order.
 * @returns {Promise<string[]>}
 */
export async function getAvailableCategories() {
  const articles = await getArticles()
  const present = new Set(articles.map((article) => article.category))
  return [...CATEGORIES, FALLBACK_CATEGORY].filter((category) => present.has(category))
}

export default {
  CATEGORIES,
  FALLBACK_CATEGORY,
  getArticles,
  getArticle,
  getRelatedArticles,
  getAvailableCategories,
}
