import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import BuildService from '../../data/BuildService.js'
import ItemTooltip from '../../components/ItemTooltip/ItemTooltip.jsx'
import EffectTag from '../../components/EffectTag/EffectTag.jsx'
import './Eternals.css'

// Resolve an Eternal's four relics (Crown / Amulet / Weapon / Weapon) from
// the Wiki's structured Items data (matched by eternalId + itemType), the
// same approach EternalDetail uses — this keeps the directory in sync with
// the actual Items table instead of the Eternal infobox's item-name text,
// which can drift out of date.
function relicsFor(eternalId, items) {
  const eternalItems = items.filter((item) => item.eternalId === eternalId)
  const crown = eternalItems.find((item) => item.itemType === 'crown')
  const amulet = eternalItems.find((item) => item.itemType === 'amulet')
  const weapons = eternalItems.filter((item) => item.itemType === 'weapon')

  return [
    crown && { label: 'Crown', item: crown },
    amulet && { label: 'Amulet', item: amulet },
    ...weapons.map((item) => ({ label: 'Weapon', item })),
  ].filter(Boolean)
}

function EternalEntry({ eternal, items, builds }) {
  const relics = useMemo(() => relicsFor(eternal.id, items), [eternal.id, items])

  return (
    <section className="eternal-entry panel">
      <div className="eternal-entry-art">
        {eternal.image ? (
          <img src={eternal.image} alt={eternal.name} />
        ) : (
          <span className="eternal-entry-art-placeholder">No image</span>
        )}
      </div>

      <div className="eternal-entry-body">
        <h2 className="eternal-entry-name">{eternal.name}</h2>

        {eternal.description && <p className="eternal-entry-description">{eternal.description}</p>}

        <div className="eternal-entry-facts">
          {eternal.bonus && (
            <div className="eternal-entry-fact">
              <span className="eternal-entry-fact-label">Set Bonus</span>
              <div className="eternal-entry-fact-value">
                {eternal.bonusImage && (
                  <img className="eternal-entry-fact-icon" src={eternal.bonusImage} alt="" />
                )}
                <span>{eternal.bonus}</span>
              </div>
            </div>
          )}

          {eternal.eternalAbility?.name && (
            <div className="eternal-entry-fact">
              <span className="eternal-entry-fact-label">Eternal Ability</span>
              <div className="eternal-entry-fact-value">
                {eternal.eternalAbility.image && (
                  <img className="eternal-entry-fact-icon" src={eternal.eternalAbility.image} alt="" />
                )}
                <span>{eternal.eternalAbility.name}</span>
              </div>
              {eternal.eternalAbility.tags?.length > 0 && (
                <div className="tag-row eternal-entry-fact-tags">
                  {eternal.eternalAbility.tags.map((tag) => (
                    <EffectTag key={tag} label={tag} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {relics.length > 0 && (
          <div className="eternal-entry-relics">
            <span className="eternal-entry-relics-label">Relics</span>
            <div className="eternal-entry-relics-row">
              {relics.map(({ label, item }, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  to={`/items/${item.id}`}
                  className="eternal-entry-relic"
                  title={`${label}: ${item.name}`}
                >
                  <ItemTooltip item={item}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span className="eternal-entry-relic-fallback">{label[0]}</span>
                    )}
                  </ItemTooltip>
                  <span className="eternal-entry-relic-label">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {builds?.length > 0 && (
          <div className="eternal-entry-builds">
            <span className="eternal-entry-builds-label">Community Builds</span>
            <div className="eternal-entry-builds-row">
              {builds.map((build) => (
                <Link key={build.id} to={`/builds/${build.slug}`} className="eternal-entry-build-chip">
                  {build.name}
                </Link>
              ))}
              <Link to="/builds" className="eternal-entry-see-all">
                See All Builds →
              </Link>
            </div>
          </div>
        )}

        <div className="eternal-entry-footer">
          <div className="eternal-entry-quicklinks">
            <Link to={`/eternals/${eternal.id}#overview`}>Overview</Link>
            <Link to={`/eternals/${eternal.id}#relics`}>Relics</Link>
            <Link to={`/eternals/${eternal.id}#ability`}>Eternal Ability</Link>
            <Link to={`/eternals/${eternal.id}#builds`}>Community Builds</Link>
          </div>
          <Link to={`/eternals/${eternal.id}`} className="eternal-entry-view-btn">
            View Eternal →
          </Link>
        </div>
      </div>
    </section>
  )
}

function Eternals() {
  const [eternals, setEternals] = useState(null)
  const [items, setItems] = useState([])
  const [buildsByEternal, setBuildsByEternal] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    Promise.all([ArkheronDataService.getEternals(), ArkheronDataService.getItems()])
      .then(([eternalData, itemData]) => {
        if (cancelled) return
        setEternals(eternalData)
        setItems(itemData)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Eternals from the Arkheron Wiki:', err)
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

  // Community Builds previews are resolved once the Eternal list is in, one
  // lookup per Eternal — small dataset in this prototype, so this stays a
  // simple parallel fetch rather than a bulk endpoint.
  useEffect(() => {
    if (!eternals || eternals.length === 0) return
    let cancelled = false

    Promise.all(
      eternals.map((eternal) =>
        BuildService.getBuildsForEternal(eternal.id, { limit: 3 }).then((builds) => [eternal.id, builds]),
      ),
    )
      .then((entries) => {
        if (cancelled) return
        setBuildsByEternal(Object.fromEntries(entries))
      })
      .catch((err) => console.error('Failed to resolve Community Builds for Eternals:', err))

    return () => {
      cancelled = true
    }
  }, [eternals])

  const filteredEternals = useMemo(() => {
    if (!eternals) return null
    const query = search.trim().toLowerCase()
    if (!query) return eternals
    return eternals.filter((eternal) => {
      const ability = eternal.eternalAbility
      const haystack = [
        eternal.name,
        eternal.description,
        ability?.name,
        ability?.description,
        ...(ability?.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [eternals, search])

  return (
    <div className="eternals-page">
      <span className="page-eyebrow">Database</span>
      <h1 className="page-title">Eternals</h1>
      <p className="page-description">
        Eternals are Arkheron's playable characters. Each one has a unique Eternal Ability, a dedicated Crown,
        Amulet and pair of Weapons, and a Set Bonus that activates as more of their items are equipped.
      </p>
      <div className="accent-bar" />

      {loading && <div className="eternals-state">Loading Eternals from the Arkheron Wiki…</div>}

      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}

      {!loading && !error && eternals && eternals.length === 0 && (
        <div className="eternals-state">No Eternals were found on the Arkheron Wiki.</div>
      )}

      {!loading && !error && eternals && eternals.length > 0 && (
        <>
          <div className="eternals-toolbar">
            <div className="eternals-search">
              <span className="eternals-search-icon">⌕</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Eternals by name or description…"
              />
            </div>
            <span className="eternals-count">
              {filteredEternals.length} of {eternals.length} Eternal{eternals.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredEternals.length === 0 ? (
            <div className="eternals-state">No Eternals match “{search}”.</div>
          ) : (
            <div className="eternals-directory">
              {filteredEternals.map((eternal) => (
                <EternalEntry
                  key={eternal.id}
                  eternal={eternal}
                  items={items}
                  builds={buildsByEternal[eternal.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Eternals
