import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import './MonsterDetail.css'

function MonsterDetail() {
  const { id } = useParams()
  const [monster, setMonster] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setMonster(null)

    ArkheronDataService.getMonster(id)
      .then((data) => {
        if (cancelled) return
        setMonster(data || null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Monster from the Arkheron Wiki:', err)
        setError('Unable to load Arkheron data.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="monster-detail-page">
      <Link to="/monsters" className="monster-back-link">
        ← Back to Monsters
      </Link>

      {loading && <div className="monsters-state">Loading Monster from the Arkheron Wiki…</div>}
      {!loading && error && <div className="monsters-state monsters-state-error">{error}</div>}
      {!loading && !error && !monster && (
        <div className="monsters-state">No Monster found for &ldquo;{id}&rdquo;.</div>
      )}

      {!loading && !error && monster && (
        <div className="monster-inspect">
          <div className="panel monster-header">
            <div className="monster-portrait">
              {monster.image || monster.icon ? (
                <img src={monster.image || monster.icon} alt={monster.name} />
              ) : (
                <span className="monster-portrait-placeholder">No image</span>
              )}
            </div>
            <div className="monster-header-info">
              <span className="page-eyebrow">Monster</span>
              <h1 className="monster-name">{monster.name}</h1>
              {!monster.hasWikiPage && (
                <span className="monsters-status-badge monsters-status-stub">
                  No dedicated Wiki page yet
                </span>
              )}
              {monster.summary && <p className="monster-flavor-text">{monster.summary}</p>}
              <a className="monster-external-link" href={monster.wikiUrl} target="_blank" rel="noreferrer">
                View on Arkheron Wiki ↗
              </a>
            </div>
          </div>

          {monster.description && (
            <div className="panel monster-section">
              <span className="panel-eyebrow">Description</span>
              <p className="monster-section-description">{monster.description}</p>
            </div>
          )}

          {monster.attacks?.length > 0 && (
            <div className="panel monster-section">
              <span className="panel-eyebrow">Combat</span>
              <h2 className="monster-section-name">Attacks</h2>
              {monster.attacksIntro && <p className="monster-section-description">{monster.attacksIntro}</p>}
              <div className="monster-attacks-grid">
                {monster.attacks.map((attack, index) => (
                  <div key={`${attack.name}-${index}`} className="monster-attack-card">
                    {attack.image && (
                      <div className="monster-attack-art">
                        <img src={attack.image} alt={attack.name} />
                      </div>
                    )}
                    <h3 className="monster-attack-name">{attack.name}</h3>
                    {attack.description && (
                      <p className="monster-attack-description">{attack.description}</p>
                    )}
                    {attack.stats?.length > 0 && (
                      <div className="monster-attack-stats">
                        {attack.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="monster-attack-stat-row">
                            <span>{stat.label}</span>
                            <span>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {monster.strategy?.length > 0 && (
            <div className="panel monster-section">
              <span className="panel-eyebrow">Strategy</span>
              <ul className="monster-strategy-list">
                {monster.strategy.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MonsterDetail
