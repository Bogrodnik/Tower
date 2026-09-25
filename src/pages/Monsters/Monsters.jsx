import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import './Monsters.css'

function Monsters() {
  const [monsters, setMonsters] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    ArkheronDataService.getMonsters()
      .then((data) => {
        if (cancelled) return
        setMonsters(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Monsters from the Arkheron Wiki:', err)
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

  const filteredMonsters = useMemo(() => {
    if (!monsters) return []
    const query = search.trim().toLowerCase()
    if (!query) return monsters
    return monsters.filter((monster) => {
      const haystack = `${monster.name} ${monster.summary || ''} ${monster.description || ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [monsters, search])

  return (
    <div className="monsters-page">
      <span className="page-eyebrow">Database</span>
      <h1 className="page-title">Monsters</h1>
      <p className="page-description">
        Monster categories documented by the Arkheron Wiki, pulled live from its Monsters page and each
        monster&rsquo;s own page.
      </p>
      <div className="accent-bar" />

      {loading && <div className="monsters-state">Loading Monsters from the Arkheron Wiki…</div>}
      {!loading && error && <div className="monsters-state monsters-state-error">{error}</div>}

      {!loading && !error && monsters && (
        <div className="monsters-explorer">
          <div className="monsters-toolbar">
            <div className="monsters-search">
              <span className="monsters-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search monsters…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="monsters-table-wrap">
            <table className="monsters-table">
              <thead>
                <tr>
                  <th className="monsters-col-art"></th>
                  <th>Name</th>
                  <th>Summary</th>
                  <th>Attacks</th>
                  <th>Wiki Page</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonsters.map((monster) => (
                  <tr key={monster.id}>
                    <td className="monsters-col-art">
                      {monster.icon || monster.image ? (
                        <img src={monster.icon || monster.image} alt={monster.name} />
                      ) : (
                        <span className="monsters-art-placeholder" />
                      )}
                    </td>
                    <td>
                      <Link to={`/monsters/${monster.id}`} className="monsters-row-link">
                        {monster.name}
                      </Link>
                    </td>
                    <td className="monsters-summary-cell">{monster.summary || '—'}</td>
                    <td className="monsters-col-count">{monster.attacks?.length || '—'}</td>
                    <td className="monsters-col-status">
                      {monster.hasWikiPage ? (
                        <span className="monsters-status-badge monsters-status-available">Documented</span>
                      ) : (
                        <span className="monsters-status-badge monsters-status-stub">Stub</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMonsters.length === 0 && (
              <div className="monsters-empty">No monsters match the current search.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Monsters
