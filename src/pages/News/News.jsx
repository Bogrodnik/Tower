import { useEffect, useMemo, useState } from 'react'
import NewsService from '../../data/NewsService.js'
import NewsCard from '../../components/NewsCard/NewsCard.jsx'
import './News.css'

const PAGE_SIZE = 6

function News() {
  const [articles, setArticles] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    NewsService.getArticles()
      .then((data) => {
        if (cancelled) return
        setArticles(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Arkheron news:', err)
        setError('Unable to load news right now.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const categoryOptions = useMemo(() => {
    if (!articles) return []
    return Array.from(new Set(articles.map((article) => article.category))).sort()
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (!articles) return []
    const query = search.trim().toLowerCase()

    return articles.filter((article) => {
      if (categoryFilter !== 'all' && article.category !== categoryFilter) return false
      if (query) {
        const haystack = `${article.title} ${article.excerpt}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [articles, search, categoryFilter])

  const featured = filteredArticles[0]
  const rest = filteredArticles.slice(1)
  const visibleRest = rest.slice(0, visibleCount)

  return (
    <div className="news-page">
      <span className="page-eyebrow">Content</span>
      <h1 className="page-title">News</h1>
      <p className="page-description">
        Official Arkheron announcements, patch notes and Tower Hour recaps, brought into Tower's format.
      </p>
      <div className="accent-bar" />

      {loading && <div className="eternals-state">Loading news…</div>}
      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}

      {!loading && !error && articles && (
        <div className="news-explorer">
          <div className="news-toolbar">
            <div className="news-search">
              <span className="news-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search news…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setVisibleCount(PAGE_SIZE)
                }}
              />
            </div>

            <div className="news-category-chips">
              <button
                type="button"
                className={categoryFilter === 'all' ? 'news-chip news-chip-active' : 'news-chip'}
                onClick={() => {
                  setCategoryFilter('all')
                  setVisibleCount(PAGE_SIZE)
                }}
              >
                All
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={categoryFilter === category ? 'news-chip news-chip-active' : 'news-chip'}
                  onClick={() => {
                    setCategoryFilter(category)
                    setVisibleCount(PAGE_SIZE)
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredArticles.length === 0 && (
            <div className="news-empty">No articles match the current filters.</div>
          )}

          {featured && (
            <div className="news-featured-slot">
              <NewsCard article={featured} featured />
            </div>
          )}

          {visibleRest.length > 0 && (
            <div className="news-grid">
              {visibleRest.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {rest.length > visibleCount && (
            <div className="news-load-more">
              <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default News
