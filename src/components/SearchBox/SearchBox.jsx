import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchService from '../../services/SearchService.js'
import './SearchBox.css'

const DEBOUNCE_MS = 200

const GROUP_ORDER = [
  { key: 'eternals', label: 'Eternals' },
  { key: 'items', label: 'Items' },
  { key: 'builds', label: 'Builds' },
  { key: 'guides', label: 'Guides' },
  { key: 'news', label: 'News' },
]

/**
 * Global header search: a text input backed by a live results dropdown.
 * Reads from SearchService only — no fake/local results, no backend calls.
 */
function SearchBox({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // null = not searched yet
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  // Flat list of results in display order, so Arrow keys can move through
  // every group's items with a single index.
  const flatResults = results
    ? GROUP_ORDER.flatMap((group) => results[group.key].map((item) => item))
    : []

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return undefined
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      SearchService.search(query).then((data) => {
        setResults(data)
        setActiveIndex(-1)
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goToResult(result) {
    setIsOpen(false)
    setQuery('')
    setResults(null)
    onNavigate?.()
    navigate(result.href)
  }

  function goToSearchPage() {
    const trimmed = query.trim()
    if (!trimmed) return
    setIsOpen(false)
    onNavigate?.()
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false)
      event.currentTarget.blur()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        goToResult(flatResults[activeIndex])
      } else {
        goToSearchPage()
      }
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (flatResults.length) setActiveIndex((i) => (i + 1) % flatResults.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (flatResults.length) setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length)
    }
  }

  const totalCount = results ? Object.values(results).reduce((n, list) => n + list.length, 0) : 0
  const hasQuery = query.trim().length > 0

  return (
    <div className="search-box" ref={containerRef}>
      <div className="search-box-field">
        <span className="search-box-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="text"
          className="search-box-input"
          placeholder="Search Eternals, Items, Builds, Guides..."
          aria-label="Search Tower"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {isOpen && (
        <div className="search-box-dropdown">
          {!hasQuery && (
            <div className="search-box-empty">Search Tower&rsquo;s Arkheron database</div>
          )}

          {hasQuery && !results && <div className="search-box-empty">Searching…</div>}

          {hasQuery && results && totalCount === 0 && (
            <div className="search-box-empty">
              <p>No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {hasQuery && results && totalCount > 0 && (
            <>
              {GROUP_ORDER.map((group) => {
                const items = results[group.key]
                if (!items.length) return null
                return (
                  <div className="search-box-group" key={group.key}>
                    <span className="search-box-group-label">{group.label}</span>
                    {items.map((item) => {
                      const flatIndex = flatResults.indexOf(item)
                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          type="button"
                          className={
                            flatIndex === activeIndex
                              ? 'search-box-result search-box-result-active'
                              : 'search-box-result'
                          }
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => goToResult(item)}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="search-box-result-image" />
                          ) : (
                            <span className="search-box-result-image search-box-result-image-empty" />
                          )}
                          <span className="search-box-result-text">
                            <span className="search-box-result-title">{item.title}</span>
                            <span className="search-box-result-subtitle">{item.subtitle}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
              <button
                type="button"
                className="search-box-viewall"
                onMouseDown={(event) => event.preventDefault()}
                onClick={goToSearchPage}
              >
                View All Search Results
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
