// WikiProvider
//
// Thin, low-level wrapper around the Arkheron Wiki's MediaWiki API
// (https://arkheron.wiki.gg/api.php). This module knows how to talk to the
// Wiki and nothing else — it does not know about "Eternals", "Tower", or any
// domain concept. Higher-level modules (e.g. ArkheronDataService) are
// responsible for interpreting the raw Wiki data.
//
// The Wiki supports anonymous cross-origin reads when the `origin=*` query
// parameter is supplied, which is what allows this to run directly from the
// browser without a proxy server.

const API_BASE = 'https://arkheron.wiki.gg/api.php'

export class WikiApiError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'WikiApiError'
    this.cause = cause
  }
}

/**
 * Perform a raw request against the Arkheron Wiki MediaWiki API.
 * @param {Record<string, string>} params - MediaWiki API query parameters.
 * @returns {Promise<any>} parsed JSON response
 */
async function apiRequest(params) {
  const url = new URL(API_BASE)
  url.searchParams.set('format', 'json')
  url.searchParams.set('formatversion', '2')
  // Enables anonymous CORS access to the MediaWiki API from the browser.
  url.searchParams.set('origin', '*')
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  let response
  try {
    response = await fetch(url.toString())
  } catch (err) {
    throw new WikiApiError('Unable to reach the Arkheron Wiki API.', err)
  }

  if (!response.ok) {
    throw new WikiApiError(`Arkheron Wiki API returned status ${response.status}.`)
  }

  const data = await response.json()

  if (data.error) {
    throw new WikiApiError(data.error.info || 'Arkheron Wiki API returned an error.')
  }

  return data
}

/**
 * List the members (pages) of a given Wiki category.
 * @param {string} categoryTitle - e.g. "Eternals" (without the "Category:" prefix)
 * @returns {Promise<{ pageId: number, title: string }[]>}
 */
export async function getCategoryMembers(categoryTitle) {
  const data = await apiRequest({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${categoryTitle}`,
    cmlimit: '500',
  })

  const members = data?.query?.categorymembers || []
  return members.map((member) => ({
    pageId: member.pageid,
    title: member.title,
  }))
}

// Anonymous (non-bot) requests to the MediaWiki API are limited to 50
// values per multi-value parameter (e.g. `titles`), so batch requests are
// split into chunks of this size.
const MAX_TITLES_PER_REQUEST = 50

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Fetch the raw wikitext content of one or more pages, batching requests as
 * needed to stay within the API's per-request title limit.
 * @param {string[]} titles - full page titles, e.g. ["Dahla", "Template:Dahla"]
 * @returns {Promise<Record<string, string>>} map of title -> wikitext (missing pages are omitted)
 */
export async function getPagesWikitext(titles) {
  if (!titles.length) return {}

  const batches = chunk(titles, MAX_TITLES_PER_REQUEST)
  const result = {}

  for (const batch of batches) {
    const data = await apiRequest({
      action: 'query',
      titles: batch.join('|'),
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
    })

    const pages = data?.query?.pages || []
    for (const page of pages) {
      if (page.missing) continue
      const content = page.revisions?.[0]?.slots?.main?.content
      if (typeof content === 'string') {
        result[page.title] = content
      }
    }
  }

  return result
}

/**
 * Resolve one or more Wiki file names to their direct image URLs, batching
 * requests as needed to stay within the API's per-request title limit.
 * @param {string[]} fileNames - e.g. ["Arkheron Eternal Dahla.png"] (without the "File:" prefix)
 * @returns {Promise<Record<string, string>>} map of fileName -> direct URL (missing files are omitted)
 */
export async function getImageUrls(fileNames) {
  if (!fileNames.length) return {}

  const batches = chunk(fileNames, MAX_TITLES_PER_REQUEST)
  const result = {}

  for (const batch of batches) {
    const titles = batch.map((name) => `File:${name}`)
    const data = await apiRequest({
      action: 'query',
      titles: titles.join('|'),
      prop: 'imageinfo',
      iiprop: 'url',
    })

    const pages = data?.query?.pages || []
    for (const page of pages) {
      if (page.missing) continue
      const url = page.imageinfo?.[0]?.url
      if (url) {
        const fileName = page.title.replace(/^File:/, '')
        result[fileName] = url
      }
    }
  }

  return result
}

/**
 * Query a Cargo table (a structured data store some Wiki pages populate via
 * templates). Used for the "Items" table, which — unlike Eternals — is
 * exposed as clean structured data rather than requiring wikitext parsing.
 * @param {{ tables: string, fields: string[], where?: string, limit?: number, orderBy?: string }} options
 * @returns {Promise<Record<string, string>[]>} one flat object per row
 */
export async function cargoQuery({ tables, fields, where, limit = 500, orderBy }) {
  const params = {
    action: 'cargoquery',
    tables,
    // Field names are passed as "cargoField=alias" pairs so the response
    // keys stay predictable (Cargo otherwise turns "some_field" into the
    // free-text key "some field").
    fields: fields.join(','),
    limit: String(limit),
  }
  if (where) params.where = where
  if (orderBy) params['order by'] = orderBy

  const data = await apiRequest(params)
  const rows = data?.cargoquery || []
  return rows.map((row) => row.title)
}

export const WIKI_BASE_URL = 'https://arkheron.wiki.gg'
