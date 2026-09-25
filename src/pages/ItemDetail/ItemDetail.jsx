import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import BuildService from '../../data/BuildService.js'
import EffectTag from '../../components/EffectTag/EffectTag.jsx'
import BuildRow from '../../components/BuildRow/BuildRow.jsx'
import ItemTooltip from '../../components/ItemTooltip/ItemTooltip.jsx'
import './ItemDetail.css'

// "Anchor Ability" contains a space, which isn't safe to drop straight into
// a CSS class name — slugify it the same way everywhere it's used.
function slugifySource(source) {
  return source.trim().toLowerCase().replace(/\s+/g, '-')
}

function TagRow({ tags }) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="item-tag-row">
      {tags.map((tag, index) => (
        <EffectTag key={`${tag.label}-${index}`} label={tag.label} category={tag.category} greyed={tag.greyed} />
      ))}
    </div>
  )
}

function StatList({ stats }) {
  if (!stats || stats.length === 0) return null
  return (
    <div className="stat-list">
      {stats.map((stat, index) => (
        <div key={`${stat.label}-${index}`} className="stat-row">
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}

function AbilitySection({ eyebrow, section }) {
  if (!section) return null
  const hasContent = section.label || section.description || section.tags?.length || section.stats?.length
  if (!hasContent) return null

  return (
    <div className="panel item-section">
      <span className="panel-eyebrow">{eyebrow}</span>
      {section.label && <h2 className="item-section-name">{section.label}</h2>}
      <TagRow tags={section.tags} />
      {section.description && <p className="item-section-description">{section.description}</p>}
      <StatList stats={section.stats} />
    </div>
  )
}

function RelatedItemChip({ item }) {
  if (!item || !item.name) return null
  return (
    <Link to={`/items/${item.id}`} className="related-item-chip">
      <ItemTooltip item={item}>
        <div className="related-item-art">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <span className="loadout-slot-placeholder">No image</span>
          )}
        </div>
        <span className="related-item-name">{item.name}</span>
      </ItemTooltip>
    </Link>
  )
}

function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [eternal, setEternal] = useState(null)
  const [relatedItems, setRelatedItems] = useState([])
  const [communityBuilds, setCommunityBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setItem(null)
    setEternal(null)
    setRelatedItems([])
    setCommunityBuilds([])

    ArkheronDataService.getItem(id)
      .then(async (data) => {
        if (cancelled) return
        setItem(data || null)
        if (data?.eternalId) {
          const [relatedEternal, allItems] = await Promise.all([
            ArkheronDataService.getEternal(data.eternalId),
            ArkheronDataService.getItems(),
          ])
          if (cancelled) return
          setEternal(relatedEternal || null)

          // Related Items are resolved from the same structured Items Cargo
          // table used for the Items page, matched by eternal id — not from
          // the Eternal infobox's item-name text, which can go stale/out of
          // sync with the actual Items data.
          setRelatedItems(allItems.filter((related) => related.eternalId === data.eternalId && related.id !== data.id))
        }
        if (data?.id) {
          // Reuses the same BuildService records shown on /builds — no
          // separate "item usage" index is maintained.
          const usingBuilds = BuildService.getBuilds().filter((build) =>
            [build.crownItemId, build.amuletItemId, build.weapon1ItemId, build.weapon2ItemId, build.consumableId].includes(
              data.id
            )
          )
          if (!cancelled) setCommunityBuilds(usingBuilds)
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Item from the Arkheron Wiki:', err)
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
    <div className="item-detail-page">
      <Link to="/items" className="detail-back-link">
        ← Back to Items
      </Link>

      {loading && <div className="eternals-state">Loading Item from the Arkheron Wiki…</div>}
      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}
      {!loading && !error && !item && (
        <div className="eternals-state">No Item found for “{id}”.</div>
      )}

      {!loading && !error && item && (
        <div className="item-inspect">
          <div className="panel item-header">
            <div className="item-portrait">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <span className="loadout-slot-placeholder">No image</span>
              )}
            </div>
            <div className="item-header-info">
              <span className="page-eyebrow">{item.category}</span>
              <h1 className="item-name">{item.name}</h1>
              <div className="item-badges">
                <span className={`items-source-badge items-source-${slugifySource(item.source)}`}>
                  {item.source}
                </span>
                {eternal && (
                  <Link to={`/eternals/${eternal.id}`} className="item-eternal-link">
                    {eternal.name}
                  </Link>
                )}
              </div>
              {item.bonus && (
                <div className="loadout-bonus">
                  {eternal?.bonusImage && (
                    <img className="loadout-bonus-icon" src={eternal.bonusImage} alt="Set bonus active" />
                  )}
                  <span className="loadout-bonus-label">Set Bonus</span>
                  <span className="loadout-bonus-text">{item.bonus}</span>
                </div>
              )}
              {item.flavorText && <p className="item-flavor-text">“{item.flavorText}”</p>}
              <a className="detail-external-link" href={item.wikiUrl} target="_blank" rel="noreferrer">
                View on Arkheron Wiki ↗
              </a>
            </div>
          </div>

          <AbilitySection eyebrow="Attack" section={item.attack} />
          <AbilitySection eyebrow="Ability" section={item.ability} />

          {item.upgrades?.length > 0 && (
            <div className="panel item-section">
              <span className="panel-eyebrow">Upgrades</span>
              <div className="upgrades-list">
                {item.upgrades.map((upgrade) => (
                  <div key={upgrade.level} className="upgrade-row">
                    <span className="upgrade-level">Lv. {upgrade.level}</span>
                    <span className="upgrade-description">{upgrade.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedItems.length > 0 && (
            <div className="panel item-section">
              <span className="panel-eyebrow">Related Items</span>
              <div className="related-items-grid">
                {relatedItems.map((related) => (
                  <RelatedItemChip key={related.id} item={related} />
                ))}
              </div>
            </div>
          )}

          {communityBuilds.length > 0 && (
            <div className="panel item-section">
              <span className="panel-eyebrow">Community Builds Using This Item</span>
              <div className="item-community-builds">
                {communityBuilds.map((build) => (
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

export default ItemDetail
