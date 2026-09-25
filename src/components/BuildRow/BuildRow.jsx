import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BuildService from '../../data/BuildService.js'
import ItemTooltip from '../ItemTooltip/ItemTooltip.jsx'
import './BuildRow.css'

function relativeTime(isoDate) {
  if (!isoDate) return null
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  return `${Math.floor(months / 12)} yr ago`
}

// Only badge an item once its Eternal's 2-piece set bonus is actually
// active — the icon itself is the real Wiki-sourced badge (one per
// Eternal, e.g. arkheron.wiki.gg/wiki/File:Dahla_set_bonus.png).
function bonusImageFor(item, synergies) {
  if (!item?.eternalId) return undefined
  const synergy = synergies?.find((s) => s.eternalId === item.eternalId)
  return synergy?.twoPieceActive ? synergy.bonusImage : undefined
}

function LoadoutIcon({ label, item, variant, synergies }) {
  if (!item) return <div className="build-row-slot build-row-slot-empty" aria-hidden="true" />

  const bonusImage = bonusImageFor(item, synergies)

  return (
    <Link
      to={`/items/${item.id}`}
      className={`build-row-slot${variant ? ` build-row-slot-${variant}` : ''}`}
      title={`${label}: ${item.name}`}
      onClick={(e) => e.stopPropagation()}
    >
      <ItemTooltip item={item} bonusImage={bonusImage}>
        {item.image ? <img src={item.image} alt={item.name} /> : <span className="build-row-slot-fallback">{label[0]}</span>}
      </ItemTooltip>
      {bonusImage && <img className="build-row-slot-badge" src={bonusImage} alt="Set bonus active" />}
    </Link>
  )
}

/**
 * A wide, horizontal community-build row (Arkheron-Builds-style): info on
 * the left, the full six-slot loadout in the center, rating on the right,
 * and view/comment/update metadata along the bottom. Loadout thumbnails,
 * Eternal composition and set-bonus badges are all resolved live from
 * ArkheronDataService via BuildService — nothing here is stored twice.
 */
function BuildRow({ build, featured = false }) {
  const [loadout, setLoadout] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    BuildService.resolveBuildLoadout(build).then((resolved) => {
      if (!cancelled) setLoadout(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [build])

  const stars = Math.round(build.rating ?? 0)

  return (
    <div
      className={`build-row${featured ? ' build-row-featured' : ''}`}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/builds/${build.slug}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/builds/${build.slug}`)
      }}
    >
      {featured && <span className="build-row-featured-tag">Build of the Week</span>}

      <div className="build-row-main">
        <div className="build-row-info">
          {build.playstyle && <span className="build-row-playstyle">{build.playstyle}</span>}
          <h3 className="build-row-name">{build.name}</h3>
          {build.author && <span className="build-row-author">by {build.author}</span>}
          {build.tags?.length > 0 && (
            <div className="tag-row build-row-tags">
              {build.tags.slice(0, featured ? 6 : 3).map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="build-row-loadout">
          <LoadoutIcon label="Anchor Ability" item={loadout?.anchor} variant="anchor" synergies={loadout?.synergies} />
          <div className="build-row-loadout-core">
            <LoadoutIcon label="Crown" item={loadout?.crown} synergies={loadout?.synergies} />
            <LoadoutIcon label="Amulet" item={loadout?.amulet} synergies={loadout?.synergies} />
            <LoadoutIcon label="Weapon" item={loadout?.weapon1} synergies={loadout?.synergies} />
            <LoadoutIcon label="Weapon" item={loadout?.weapon2} synergies={loadout?.synergies} />
          </div>
          <LoadoutIcon label="Consumable" item={loadout?.consumable} variant="consumable" synergies={loadout?.synergies} />
        </div>

        <div className="build-row-rating">
          <span className="build-row-rating-value">{(build.rating ?? 0).toFixed(1)}</span>
          <span className="build-row-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>
                ★
              </span>
            ))}
          </span>
          <span className="build-row-rating-count">({build.ratingCount ?? 0})</span>
        </div>
      </div>

      <div className="build-row-footer">
        <div className="build-row-composition">
          {loadout?.synergies?.length > 0 ? (
            loadout.synergies.map((synergy, index) => (
              <span key={synergy.eternalId}>
                {index > 0 && <span className="build-row-composition-sep"> × </span>}
                <Link
                  to={`/eternals/${synergy.eternalId}`}
                  className="build-row-eternal-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {synergy.eternalName}
                </Link>
              </span>
            ))
          ) : loadout?.composition?.length > 0 ? (
            <span className="build-row-composition-echo">{loadout.composition.join(' × ')}</span>
          ) : null}
          {loadout?.composition?.includes('Echo') && loadout?.synergies?.length > 0 && (
            <span className="build-row-composition-echo"> × Echo</span>
          )}
        </div>
        <span className="build-row-meta-item">👁 {build.viewCount ?? 0}</span>
        <span className="build-row-meta-item">💬 {build.commentCount ?? 0}</span>
        <span className="build-row-meta-item">Updated {relativeTime(build.updatedAt)}</span>
      </div>
    </div>
  )
}

export default BuildRow
