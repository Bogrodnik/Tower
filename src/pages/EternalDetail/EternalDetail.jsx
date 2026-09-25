import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import BuildService from '../../data/BuildService.js'
import ItemInspectionPanel from '../../components/ItemInspectionPanel/ItemInspectionPanel.jsx'
import BuildRow from '../../components/BuildRow/BuildRow.jsx'
import EffectTag from '../../components/EffectTag/EffectTag.jsx'
import './EternalDetail.css'

function EternalDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [eternal, setEternal] = useState(null)
  const [loadoutItems, setLoadoutItems] = useState([])
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setEternal(null)
    setLoadoutItems([])
    setBuilds([])

    ArkheronDataService.getEternal(id)
      .then(async (data) => {
        if (cancelled) return
        setEternal(data || null)
        if (!data) return

        // Resolve the loadout items from the Wiki's structured Items Cargo
        // table (matched by eternal id + item type) rather than the Eternal
        // infobox's item-name text fields, which can go stale/out of sync
        // with the actual Items data (e.g. an item gets renamed on its own
        // page but the Eternal infobox template isn't updated to match).
        const items = await ArkheronDataService.getItems()
        const eternalItems = items.filter((item) => item.eternalId === data.id)

        const crownItem = eternalItems.find((item) => item.itemType === 'crown')
        const amuletItem = eternalItems.find((item) => item.itemType === 'amulet')
        const weaponItems = eternalItems.filter((item) => item.itemType === 'weapon')

        const resolved = [
          crownItem && { label: 'Crown', item: crownItem },
          amuletItem && { label: 'Amulet', item: amuletItem },
          ...weaponItems.map((item) => ({ label: 'Weapon', item })),
        ].filter(Boolean)

        if (!cancelled) setLoadoutItems(resolved)

        const eternalBuilds = await BuildService.getBuildsForEternal(data.id, { limit: 3 })
        if (!cancelled) setBuilds(eternalBuilds)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Eternal from the Arkheron Wiki:', err)
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

  // React Router does not auto-scroll to #hash anchors on client-side
  // navigation (unlike a full page load), so the directory's quick links
  // (Overview / Relics / Eternal Ability / Community Builds) need a manual
  // scroll-into-view once the Eternal's data has finished loading.
  useEffect(() => {
    if (loading || !eternal || !location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, eternal, location.hash])

  return (
    <div className="eternal-detail-page">
      <Link to="/eternals" className="detail-back-link">
        ← Back to Eternals
      </Link>

      {loading && <div className="eternals-state">Loading Eternal from the Arkheron Wiki…</div>}

      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}

      {!loading && !error && !eternal && (
        <div className="eternals-state">No Eternal found for “{id}”.</div>
      )}

      {!loading && !error && eternal && (
        <div className="loadout-inspect">
          <div className="loadout-header panel" id="overview">
            <div className="loadout-portrait">
              {eternal.image ? (
                <img src={eternal.image} alt={eternal.name} />
              ) : (
                <span className="loadout-slot-placeholder">No image</span>
              )}
            </div>
            <div className="loadout-header-info">
              <span className="page-eyebrow">Eternal</span>
              <h1 className="loadout-name">{eternal.name}</h1>
              {eternal.bonus && (
                <div className="loadout-bonus">
                  {eternal.bonusImage && (
                    <img className="loadout-bonus-icon" src={eternal.bonusImage} alt="Set bonus active" />
                  )}
                  <span className="loadout-bonus-label">Passive</span>
                  <span className="loadout-bonus-text">{eternal.bonus}</span>
                </div>
              )}
              {eternal.description && <p className="loadout-description">{eternal.description}</p>}
              <a className="detail-external-link" href={eternal.wikiUrl} target="_blank" rel="noreferrer">
                View on Arkheron Wiki ↗
              </a>
            </div>
          </div>

          {eternal.eternalAbility && (
            <div className="panel ability-panel" id="ability">
              <span className="panel-eyebrow">Eternal Ability</span>
              <div className="ability-panel-body">
                {eternal.eternalAbility.image && (
                  <div className="ability-art">
                    <img src={eternal.eternalAbility.image} alt={eternal.eternalAbility.name} />
                  </div>
                )}
                <div className="ability-info">
                  {eternal.eternalAbility.name && (
                    <h2 className="ability-name">{eternal.eternalAbility.name}</h2>
                  )}
                  {eternal.eternalAbility.tags?.length > 0 && (
                    <div className="tag-row">
                      {eternal.eternalAbility.tags.map((tag) => (
                        <EffectTag key={tag} label={tag} />
                      ))}
                    </div>
                  )}
                  {eternal.eternalAbility.description && (
                    <p className="ability-description">{eternal.eternalAbility.description}</p>
                  )}
                  {eternal.eternalAbility.stats?.length > 0 && (
                    <div className="stat-list">
                      {eternal.eternalAbility.stats.map((stat, index) => (
                        <div key={`${stat.label}-${index}`} className="stat-row">
                          <span className="stat-label">{stat.label}</span>
                          <span className="stat-value">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="panel loadout-panel" id="relics">
            <span className="panel-eyebrow">Loadout</span>
            <div className="loadout-grid">
              {loadoutItems.map((slot, index) => (
                <ItemInspectionPanel key={slot.item?.id || index} slotLabel={slot.label} item={slot.item} />
              ))}
            </div>
          </div>

          {builds.length > 0 && (
            <div className="panel eternal-builds-panel" id="builds">
              <div className="eternal-builds-panel-header">
                <span className="panel-eyebrow">Community Builds</span>
                <Link to="/builds" className="eternal-entry-see-all">
                  See All Builds →
                </Link>
              </div>
              <div className="eternal-builds-panel-list">
                {builds.map((build) => (
                  <BuildRow key={build.id} build={build} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EternalDetail

