import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import './MapDetail.css'

function MapDetail() {
  const { id } = useParams()
  const [map, setMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setMap(null)

    ArkheronDataService.getMap(id)
      .then((data) => {
        if (cancelled) return
        setMap(data || null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Map data from the Arkheron Wiki:', err)
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
    <div className="map-detail-page">
      <Link to="/maps" className="monster-back-link">
        ← Back to Maps
      </Link>

      {loading && <div className="monsters-state">Loading Map data from the Arkheron Wiki…</div>}
      {!loading && error && <div className="monsters-state monsters-state-error">{error}</div>}
      {!loading && !error && !map && (
        <div className="monsters-state">No Map entry found for &ldquo;{id}&rdquo;.</div>
      )}

      {!loading && !error && map && (
        <div className="monster-inspect">
          {map.entityType === 'floor' ? (
            <div className="panel monster-section">
              <span className="page-eyebrow">{map.category}</span>
              <h1 className="monster-name">{map.name}</h1>
              {map.description && <p className="monster-flavor-text">{map.description}</p>}
              {map.image ? (
                <div className="map-floor-image">
                  <img src={map.image} alt={map.name} />
                </div>
              ) : (
                <div className="map-floor-image map-floor-image-empty">No image available</div>
              )}
              <a className="monster-external-link" href={map.wikiUrl} target="_blank" rel="noreferrer">
                View on Arkheron Wiki ↗
              </a>
            </div>
          ) : (
            <div className="panel monster-header">
              <div className="monster-portrait">
                {map.image ? (
                  <img src={map.image} alt={map.name} />
                ) : (
                  <span className="monster-portrait-placeholder">No image</span>
                )}
              </div>
              <div className="monster-header-info">
                <span className="page-eyebrow">{map.category}</span>
                <h1 className="monster-name">{map.name}</h1>
                {map.description && <p className="monster-flavor-text">{map.description}</p>}
                <a className="monster-external-link" href={map.wikiUrl} target="_blank" rel="noreferrer">
                  View on Arkheron Wiki ↗
                </a>
              </div>
            </div>
          )}

          {map.images?.length > 1 && (
            <div className="panel monster-section">
              <span className="panel-eyebrow">Icons</span>
              <div className="map-detail-icons">
                {map.images.map((src, index) => (
                  <div key={index} className="map-detail-icon">
                    <img src={src} alt={`${map.name} icon ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {map.notice && (
            <div className="panel monster-section">
              <span className="panel-eyebrow">Wiki Notice</span>
              <p className="monster-section-description">{map.notice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MapDetail
