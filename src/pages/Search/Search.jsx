import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SearchService from '../../services/SearchService.js'
import './Search.css'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'items', label: 'Items' },
  { key: 'eternals', label: 'Eternals' },
  { key: 'builds', label: 'Builds' },
  { key: 'guides', label: 'Guides' },
  { key: 'news', label: 'News' },
]

const GROUP_LABELS = {
  eternals: 'Eternals',
  items: 'Items',
  builds: 'Builds',
  guides: 'Guides',
  news: 'News',
}

function Search() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim()
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    setActiveTab('all')
    if (!query) {
      setResults(null)
      return
    }
    let cancelled = false
    SearchService.search(query).then((data) => {
      if (!cancelled) setResults(data)
    })
    return () => {
      cancelled = true
    }
  }, [query])

  const totalCount = useMemo(
    () => (results ? Object.values(results).reduce((n, list) => n + list.length, 0) : 0),
    [results],
  )

  const groupsToShow = useMemo(() => {
    if (!results) return []
    const keys = activeTab === 'all' ? Object.keys(GROUP_LABELS) : [activeTab]
    return keys.filter((key) => results[key]?.length)
  }, [results, activeTab])

  return (
    <div className="page search-page">
      <span className="page-eyebrow">Search</span>
      <h1 className="page-title">
        {query ? (
          <>
            Search results for <span className="search-page-query">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          'Search Tower'
        )}
      </h1>

      {!query && (
        <p className="page-description">Search Tower&rsquo;s Arkheron database.</p>
      )}

      {query && (
        <>
          <div className="search-page-tabs">
            {TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? totalCount
                  : results?.[tab.key]?.length ?? 0
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={activeTab === tab.key ? 'search-page-tab search-page-tab-active' : 'search-page-tab'}
                  onClick={() => setActiveTab(tab.key)}
                  disabled={!results}
                >
                  {tab.label}
                  {results ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>

          {!results && <p className="page-description">Searching…</p>}

          {results && totalCount === 0 && (
            <div className="search-page-empty">
              <p className="page-description">No results found for &ldquo;{query}&rdquo;.</p>
              <div className="search-page-empty-links">
                <Link to="/items" className="search-page-empty-link">Browse Items</Link>
                <Link to="/eternals" className="search-page-empty-link">Browse Eternals</Link>
                <Link to="/builds" className="search-page-empty-link">Browse Builds</Link>
                <Link to="/news" className="search-page-empty-link">Browse News</Link>
              </div>
            </div>
          )}

          {results && totalCount > 0 && (
            <div className="search-page-results">
              {groupsToShow.map((key) => (
                <section className="search-page-group" key={key}>
                  <h2 className="search-page-group-title">{GROUP_LABELS[key]}</h2>
                  <div className="search-page-group-list">
                    {results[key].map((item) => (
                      <Link to={item.href} className="search-page-result" key={`${item.type}-${item.id}`}>
                        {item.image ? (
                          <img src={item.image} alt="" className="search-page-result-image" />
                        ) : (
                          <span className="search-page-result-image search-page-result-image-empty" />
                        )}
                        <span className="search-page-result-text">
                          <span className="search-page-result-title">{item.title}</span>
                          <span className="search-page-result-subtitle">{item.subtitle}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <div className="accent-bar" />
    </div>
  )
}

export default Search
