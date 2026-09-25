import { Link } from 'react-router-dom'
import EffectTag from '../EffectTag/EffectTag.jsx'
import ItemTooltip from '../ItemTooltip/ItemTooltip.jsx'
import './ItemInspectionPanel.css'

function StatList({ stats }) {
  if (!stats || stats.length === 0) return null
  return (
    <div className="inspection-stat-list">
      {stats.map((stat, index) => (
        <div key={`${stat.label}-${index}`} className="inspection-stat-row">
          <span className="inspection-stat-label">{stat.label}</span>
          <span className="inspection-stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}

function AbilityBlock({ eyebrow, section }) {
  if (!section) return null
  const hasContent = section.label || section.description || section.tags?.length || section.stats?.length
  if (!hasContent) return null

  return (
    <div className="inspection-ability-block">
      <span className="inspection-block-eyebrow">{eyebrow}</span>
      {section.label && <h3 className="inspection-ability-name">{section.label}</h3>}
      {section.tags?.length > 0 && (
        <div className="inspection-tag-row">
          {section.tags.map((tag, index) => (
            <EffectTag key={`${tag.label}-${index}`} label={tag.label} category={tag.category} greyed={tag.greyed} />
          ))}
        </div>
      )}
      {section.description && <p className="inspection-ability-description">{section.description}</p>}
      <StatList stats={section.stats} />
    </div>
  )
}

/**
 * A single F1/loadout-style item inspection panel: artwork, name, effect
 * tags, stats, description, upgrades and set bonus — the same dense
 * information language as the in-game inspection screen. Used to render
 * each of an Eternal's four loadout slots (Crown / Amulet / Weapon /
 * Weapon), and reusable anywhere else a full item needs this treatment.
 * Only sections the Wiki actually provided data for are rendered.
 */
function ItemInspectionPanel({ slotLabel, item, variant, bonusImage }) {
  if (!item) return null

  return (
    <Link
      to={item.id ? `/items/${item.id}` : '#'}
      className={`inspection-panel${variant ? ` inspection-panel-${variant}` : ''}`}
    >
      <span className="inspection-slot-label">{slotLabel}</span>

      <ItemTooltip item={item} bonusImage={bonusImage}>
        <div className="inspection-art">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <span className="inspection-art-placeholder">No image</span>
          )}
        </div>

        <h2 className="inspection-item-name">{item.name}</h2>
      </ItemTooltip>
      {item.category && <span className="inspection-item-category">{item.category}</span>}

      <AbilityBlock eyebrow="Attack" section={item.attack} />
      <AbilityBlock eyebrow="Ability" section={item.ability} />

      {item.upgrades?.length > 0 && (
        <div className="inspection-ability-block">
          <span className="inspection-block-eyebrow">Upgrades</span>
          <div className="inspection-upgrades-list">
            {item.upgrades.map((upgrade) => (
              <div key={upgrade.level} className="inspection-upgrade-row">
                <span className="inspection-upgrade-level">Lv. {upgrade.level}</span>
                <span className="inspection-upgrade-description">{upgrade.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {item.bonus && (
        <div className="inspection-bonus">
          <div className="inspection-bonus-heading">
            {bonusImage && <img className="inspection-bonus-icon" src={bonusImage} alt="Set bonus active" />}
            <span className="inspection-bonus-label">Set Bonus</span>
          </div>
          <span className="inspection-bonus-text">{item.bonus}</span>
        </div>
      )}

      {item.flavorText && <p className="inspection-flavor-text">“{item.flavorText}”</p>}
    </Link>
  )
}

export default ItemInspectionPanel
