import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import './Maps.css'

const CATEGORY_ALL = 'All'

function Maps() {
  const [maps, setMaps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(CATEGORY_ALL)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    ArkheronDataService.getMaps()
      .then((data) => {
        if (cancelled) return
        setMaps(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Maps from the Arkheron Wiki:', err)
        setError('Unable to load Arkheron data.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    if (!maps) return [CATEGORY_ALL]
    const unique = Array.from(new Set(maps.map((m) => m.category).filter(Boolean)))
    return [CATEGORY_ALL, ...unique]
  }, [maps])

  const filteredMaps = useMemo(() => {
    if (!maps) return []
    const query = search.trim().toLowerCase()
    return maps.filter((map) => {
      if (category !== CATEGORY_ALL && map.category !== category) return false
      if (!query) return true
      const haystack = `${map.name} ${map.description || ''} ${map.notice || ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [maps, search, category])

  const floors = filteredMaps.filter((m) => m.entityType === 'floor')
  const features = filteredMaps.filter((m) => m.entityType === 'feature')

  return (
    <div className="maps-page">
      <span className="page-eyebrow">Database</span>
      <h1 className="page-title">Maps</h1>
      <p className="page-description">
        Reference information from the Arkheron Wiki&rsquo;s Map Information page — floor previews and the
        map-icon legend. An interactive map is still in development on the Wiki, so this is a reference
        database rather than a navigable map.
      </p>
      <div className="accent-bar" />

      {loading && <div className="monsters-state">Loading Maps from the Arkheron Wiki…</div>}
      {!loading && error && <div className="monsters-state monsters-state-error">{error}</div>}

      {!loading && !error && maps && (
        <div className="maps-explorer">
          <div className="maps-toolbar">
            <div className="monsters-search">
              <span className="monsters-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search maps…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="maps-filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`maps-filter-chip ${category === cat ? 'is-active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {floors.length > 0 && (
            <div className="maps-section">
              <span className="maps-section-title">Floors</span>
              <div className="maps-floor-grid">
                {floors.map((floor) => (
                  <Link key={floor.id} to={`/maps/${floor.id}`} className="maps-floor-card">
                    <div className="maps-floor-art">
                      {floor.image ? (
                        <img src={floor.image} alt={floor.name} />
                      ) : (
                        <span className="maps-art-placeholder" />
                      )}
                    </div>
                    <span className="maps-floor-name">{floor.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {features.length > 0 && (
            <div className="maps-section">
              <span className="maps-section-title">Map Legend</span>
              <div className="maps-table-wrap">
                <table className="monsters-table">
                  <thead>
                    <tr>
                      <th className="monsters-col-art"></th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature) => (
                      <tr key={feature.id}>
                        <td className="monsters-col-art">
                          {feature.image ? (
                            <img src={feature.image} alt={feature.name} />
                          ) : (
                            <span className="monsters-art-placeholder" />
                          )}
                        </td>
                        <td>
                          <Link to={`/maps/${feature.id}`} className="monsters-row-link">
                            {feature.name}
                          </Link>
                        </td>
                        <td className="maps-col-category">{feature.category}</td>
                        <td className="monsters-summary-cell">{feature.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredMaps.length === 0 && (
            <div className="monsters-empty">No map information matches the current search.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Maps
