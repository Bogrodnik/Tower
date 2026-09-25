import { Link } from 'react-router-dom'
import './BuildSynergyPanel.css'

/**
 * The real Wiki-sourced "set bonus" badge icon (one per Eternal, e.g.
 * arkheron.wiki.gg/wiki/File:Dahla_set_bonus.png) — only surfaced on an
 * item once its Eternal's 2-piece threshold is actually active. Shared by
 * the Build Detail page and the live Build Create preview so both render
 * identical set-bonus badges from the same `BuildService`-derived data.
 */
export function synergyBonusImage(loadout, item) {
  if (!item?.eternalId) return undefined
  const synergy = loadout?.synergies?.find((s) => s.eternalId === item.eternalId)
  return synergy?.twoPieceActive ? synergy.bonusImage : undefined
}

function SetBonusBlock({ label, active, synergy }) {
  return (
    <div className={`set-bonus-block${active ? '' : ' set-bonus-inactive'}`}>
      <span className="set-bonus-label">{label}</span>
      {active ? (
        <span className="set-bonus-text">{synergy.bonusText}</span>
      ) : (
        <span className="set-bonus-text">
          Not active — equip {label === '2-Piece Set Bonus' ? 2 : 4} {synergy.eternalName} items to unlock.
        </span>
      )}
    </div>
  )
}

function SynergyRow({ synergy }) {
  return (
    <div className="build-synergy-row">
      <div className="build-synergy-row-top">
        <Link to={`/eternals/${synergy.eternalId}`} className="build-synergy-eternal-link">
          {synergy.eternalName}
        </Link>
        <span className="build-synergy-count">
          {synergy.matchedCount}/{synergy.totalSlots} items
        </span>
      </div>
      {synergy.bonusText ? (
        <div className="set-bonus-grid">
          <SetBonusBlock label="2-Piece Set Bonus" active={synergy.twoPieceActive} synergy={synergy} />
          <SetBonusBlock label="4-Piece Set Bonus" active={synergy.fourPieceActive} synergy={synergy} />
        </div>
      ) : (
        <p className="build-synergy-summary">No documented set bonus for {synergy.eternalName} yet.</p>
      )}
    </div>
  )
}

/**
 * Renders the derived Eternal set-synergy breakdown for a loadout — used
 * identically on the published Build Detail page and inside the live
 * Build Create preview so the two never drift. `synergies` must come from
 * `BuildService.computeBuildSynergies()`; this component never invents
 * bonus text or thresholds of its own.
 */
function BuildSynergyPanel({ synergies, emptyMessage }) {
  if (!synergies || synergies.length === 0) {
    return (
      <p className="build-synergy-summary">
        {emptyMessage || 'No Eternal set overlap yet — a valid build can exist with zero set bonuses.'}
      </p>
    )
  }

  return (
    <>
      {synergies.map((synergy) => (
        <SynergyRow key={synergy.eternalId} synergy={synergy} />
      ))}
    </>
  )
}

export default BuildSynergyPanel
