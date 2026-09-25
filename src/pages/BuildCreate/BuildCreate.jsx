import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import BuildService from '../../data/BuildService.js'
import ItemInspectionPanel from '../../components/ItemInspectionPanel/ItemInspectionPanel.jsx'
import ItemPicker from '../../components/ItemPicker/ItemPicker.jsx'
import EffectTag from '../../components/EffectTag/EffectTag.jsx'
import ItemTooltip from '../../components/ItemTooltip/ItemTooltip.jsx'
import BuildSynergyPanel, { synergyBonusImage } from '../../components/BuildSynergyPanel/BuildSynergyPanel.jsx'
import './BuildCreate.css'

// Tower's fixed loadout order — matches ArkheronBuilds and the existing
// BuildDetail/loadout-panel layout: Anchor, Crown, Amulet, two Weapons,
// then Consumable.
const SLOTS = [
  { key: 'anchor', label: 'Anchor', itemType: 'anchor-ability', variant: 'anchor' },
  { key: 'crown', label: 'Crown', itemType: 'crown' },
  { key: 'amulet', label: 'Amulet', itemType: 'amulet' },
  { key: 'weapon1', label: 'Weapon 1', itemType: 'weapon' },
  { key: 'weapon2', label: 'Weapon 2', itemType: 'weapon' },
  { key: 'consumable', label: 'Consumable', itemType: 'consumable', variant: 'consumable' },
]

const PLAYSTYLE_TAGS = [
  'DPS',
  'Burst',
  'Melee',
  'Ranged',
  'Mobility',
  'Bruiser',
  'Control',
  'Tank',
  'Solo Carry',
  'Team Play',
  'Beginner Friendly',
  'Early Game',
  'Late Game',
  'Off-Meta',
]

/**
 * One editable loadout slot: a dense, F1-inspired database picker button
 * (kept separate from the full ItemInspectionPanel so it can stay a
 * clickable "change item" control) plus a small link straight to the
 * item's own page. The full inspection detail still renders live in the
 * Build Preview panel below via ItemInspectionPanel.
 */
function SlotEditor({ slot, item, onOpen, onClear }) {
  return (
    <div className={`build-slot-panel${item ? ' filled' : ''}`}>
      <div className="build-slot-panel-top">
        <span className="build-slot-panel-label">{slot.label}</span>
        {item && (
          <div className="build-slot-panel-actions">
            <Link to={`/items/${item.id}`} className="build-slot-view-link" title="Open item page">
              View ↗
            </Link>
            <button
              type="button"
              className="build-slot-clear-btn"
              onClick={(event) => {
                event.stopPropagation()
                onClear(slot.key)
              }}
              title="Remove item"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <button type="button" className="build-slot-main" onClick={() => onOpen(slot.key)}>
        <span className="build-slot-art">
          <ItemTooltip item={item}>
            {item?.image ? <img src={item.image} alt={item.name} /> : <span className="build-slot-empty">+</span>}
          </ItemTooltip>
        </span>
        <span className="build-slot-info">
          <ItemTooltip item={item}>
            <span className="build-slot-value">{item ? item.name : 'Select item…'}</span>
          </ItemTooltip>
          {item && (
            <span className="build-slot-source">
              {item.eternalId ? item.eternalName || item.eternalId : 'Echo'}
              {item.category ? ` · ${item.category}` : ''}
            </span>
          )}
          {item?.effects?.length > 0 && (
            <span className="build-slot-tags">
              {item.effects.slice(0, 3).map((effect, index) => (
                <EffectTag key={`${effect.label}-${index}`} label={effect.label} category={effect.category} />
              ))}
            </span>
          )}
        </span>
      </button>
    </div>
  )
}

function BuildCreate() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const isEditing = Boolean(editId)

  const [items, setItems] = useState([])
  const [eternals, setEternals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSlot, setActiveSlot] = useState(null)
  const [saving, setSaving] = useState(false)

  const [editState, setEditState] = useState({ status: isEditing ? 'loading' : 'none', build: null })

  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [playstyle, setPlaystyle] = useState('')
  const [tags, setTags] = useState([])
  const [bigIdea, setBigIdea] = useState('')
  const [rotation, setRotation] = useState('')
  const [tips, setTips] = useState('')
  const [recommendedUse, setRecommendedUse] = useState('')
  const [status, setStatus] = useState('published')
  const [selected, setSelected] = useState({
    anchor: null,
    consumable: null,
    crown: null,
    amulet: null,
    weapon1: null,
    weapon2: null,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([ArkheronDataService.getItems(), ArkheronDataService.getEternals()])
      .then(([itemData, eternalData]) => {
        if (cancelled) return
        setItems(itemData)
        setEternals(eternalData)
      })
      .catch((err) => {
        console.error('Failed to load Tower database for the Build creator:', err)
        if (!cancelled) setError('Unable to load Arkheron data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Load an existing build to edit once both the build and the item
  // database are available. Only locally-saved builds (id starting with
  // "local-") are editable — the bundled seed builds are read-only sample
  // data, matching BuildService's own read-only-seed contract.
  useEffect(() => {
    if (!isEditing || loading || items.length === 0) return
    const found = BuildService.getBuild(editId)
    if (!found) {
      setEditState({ status: 'not-found', build: null })
      return
    }
    if (!found.id.startsWith('local-')) {
      setEditState({ status: 'locked', build: found })
      return
    }

    const findItem = (id) => (id ? items.find((item) => item.id === id) || null : null)

    setName(found.name || '')
    setAuthor(found.author || '')
    setPlaystyle(found.playstyle || '')
    setTags(found.tags || [])
    setBigIdea(found.bigIdea || '')
    setRotation(found.rotation || '')
    setTips(found.tips || '')
    setRecommendedUse(found.recommendedUse || '')
    setStatus(found.status || 'published')
    setSelected({
      anchor: findItem(found.anchorItemId),
      crown: findItem(found.crownItemId),
      amulet: findItem(found.amuletItemId),
      weapon1: findItem(found.weapon1ItemId),
      weapon2: findItem(found.weapon2ItemId),
      consumable: findItem(found.consumableId),
    })
    setEditState({ status: 'ready', build: found })
    // Only re-run when the target build or the loaded item list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, editId, loading, items])

  const loadoutItems = useMemo(
    () => [selected.crown, selected.amulet, selected.weapon1, selected.weapon2].filter(Boolean),
    [selected],
  )

  const synergies = useMemo(
    () => BuildService.computeBuildSynergies(loadoutItems, eternals),
    [loadoutItems, eternals],
  )

  const composition = useMemo(() => BuildService.getLoadoutComposition(loadoutItems), [loadoutItems])

  // Feeds ItemInspectionPanel's optional bonusImage prop in the live
  // preview, exactly like BuildDetail — the Wiki-sourced set-bonus badge
  // only appears once its Eternal's 2-piece threshold is actually met.
  const previewLoadout = { synergies }

  const hasAnySelection = Object.values(selected).some(Boolean)

  const toggleTag = (tag) => {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
  }

  const handleSelectItem = (item) => {
    setSelected((current) => ({ ...current, [activeSlot]: item }))
    setActiveSlot(null)
  }

  const handleClearSlot = (slotKey) => {
    setSelected((current) => ({ ...current, [slotKey]: null }))
  }

  const activeSlotDef = SLOTS.find((slot) => slot.key === activeSlot)

  const canSave = name.trim().length > 0
  const editLocked = isEditing && editState.status === 'locked'

  const handleSave = (nextStatus) => {
    if (!canSave || saving || editLocked) return
    setSaving(true)
    try {
      const build = BuildService.saveBuild({
        id: isEditing && editState.status === 'ready' ? editState.build.id : undefined,
        name: name.trim(),
        author: author.trim() || undefined,
        playstyle: playstyle || undefined,
        tags,
        bigIdea: bigIdea.trim() || undefined,
        rotation: rotation.trim() || undefined,
        tips: tips.trim() || undefined,
        recommendedUse: recommendedUse.trim() || undefined,
        anchorItemId: selected.anchor?.id,
        crownItemId: selected.crown?.id,
        amuletItemId: selected.amulet?.id,
        weapon1ItemId: selected.weapon1?.id,
        weapon2ItemId: selected.weapon2?.id,
        consumableId: selected.consumable?.id,
        status: nextStatus,
      })
      setStatus(nextStatus)
      navigate(`/builds/${build.slug}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEditing && editState.build) {
      navigate(`/builds/${editState.build.slug}`)
    } else {
      navigate('/builds')
    }
  }

  return (
    <div className="build-create-page">
      <span className="page-eyebrow">Community</span>
      <h1 className="page-title">{isEditing ? 'Edit Build' : 'Create a Build'}</h1>
      <p className="page-description">
        Mix and match items to create your build. Combine Eternal and Echo items — find your own synergies. An
        Eternal is not required.
      </p>
      <div className="accent-bar" />

      {loading && <div className="eternals-state">Loading Arkheron database…</div>}
      {error && <div className="eternals-state">{error}</div>}

      {!loading && !error && isEditing && editState.status === 'loading' && (
        <div className="eternals-state">Loading build…</div>
      )}
      {!loading && !error && isEditing && editState.status === 'not-found' && (
        <div className="eternals-state">No build found for “{editId}”.</div>
      )}
      {!loading && !error && editLocked && (
        <div className="eternals-state">
          “{editState.build.name}” is a bundled sample build and can’t be edited.{' '}
          <Link to={`/builds/${editState.build.slug}`}>Back to build</Link>
        </div>
      )}

      {!loading && !error && (!isEditing || editState.status === 'ready') && (
        <div className="build-create-layout">
          <div className="panel build-create-form">
            <span className="panel-eyebrow">Build Information</span>
            <div className="build-create-field">
              <span className="build-create-field-label">Build Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bleed Rush"
              />
            </div>
            <div className="build-create-field">
              <span className="build-create-field-label">Author</span>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="build-create-field">
              <span className="build-create-field-label">Primary Playstyle</span>
              <select value={playstyle} onChange={(e) => setPlaystyle(e.target.value)}>
                <option value="">None selected</option>
                {['Aggressive', 'Defensive', 'Support', 'Balanced'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="build-create-field">
              <span className="build-create-field-label">Tags</span>
              <div className="build-tag-picker">
                {PLAYSTYLE_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={`build-tag-option${tags.includes(tag) ? ' selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <span className="panel-eyebrow build-create-section-spacer">The Big Idea</span>
            <div className="build-create-field">
              <textarea
                rows={3}
                value={bigIdea}
                onChange={(e) => setBigIdea(e.target.value)}
                placeholder="How does this build work?"
              />
            </div>

            <span className="panel-eyebrow build-create-section-spacer">Rotation / Gameplan</span>
            <div className="build-create-field">
              <textarea
                rows={3}
                value={rotation}
                onChange={(e) => setRotation(e.target.value)}
                placeholder="Optional ordered instructions for how the player uses the build."
              />
            </div>

            <span className="panel-eyebrow build-create-section-spacer">Tips</span>
            <div className="build-create-field">
              <textarea
                rows={2}
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="Optional practical tips."
              />
            </div>

            <span className="panel-eyebrow build-create-section-spacer">Recommended Use</span>
            <div className="build-create-field">
              <textarea
                rows={2}
                value={recommendedUse}
                onChange={(e) => setRecommendedUse(e.target.value)}
                placeholder="When/where is this build useful?"
              />
            </div>

            <div className="build-create-actions">
              <button type="button" className="build-create-btn-secondary" onClick={handleCancel}>
                {isEditing ? 'Cancel' : 'Back to Builds'}
              </button>
              <button
                type="button"
                className="build-create-btn-secondary"
                disabled={!canSave || saving}
                onClick={() => handleSave('draft')}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="build-create-btn-primary"
                disabled={!canSave || saving}
                onClick={() => handleSave('published')}
              >
                {isEditing ? 'Save Changes' : 'Publish'}
              </button>
            </div>
            {!canSave && <p className="build-create-hint">Give your build a name to save it.</p>}
          </div>

          <div className="build-create-loadout panel">
            <span className="panel-eyebrow">Loadout</span>
            <p className="build-create-hint">
              Select any item from the database for each slot — filtering by Eternal is optional.
            </p>
            <div className="build-slot-grid">
              {SLOTS.map((slot) => (
                <SlotEditor
                  key={slot.key}
                  slot={slot}
                  item={selected[slot.key]}
                  onOpen={setActiveSlot}
                  onClear={handleClearSlot}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (!isEditing || editState.status === 'ready') && (
        <div className="build-create-preview-section">
          <span className="page-eyebrow build-create-section-spacer">Build Preview</span>
          <p className="page-description build-create-preview-note">
            This is exactly how the build will appear once {isEditing ? 'saved' : 'published'}.
          </p>

          <div className="loadout-inspect">
            <div className="panel build-header">
              <div className="build-header-top">
                {status === 'draft' && <span className="build-draft-badge">Draft</span>}
                <span className="page-eyebrow">{composition.length ? composition.join(' × ') : 'Loadout'}</span>
              </div>
              <h1 className="loadout-name">{name.trim() || 'Untitled Build'}</h1>
              {author.trim() && <span className="build-author">by {author.trim()}</span>}
              {tags.length > 0 && (
                <div className="tag-row build-tag-row">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="panel loadout-panel">
              <span className="panel-eyebrow">Loadout</span>
              {!hasAnySelection ? (
                <p className="build-preview-empty">Select items above to build your loadout preview.</p>
              ) : (
                <div className="loadout-grid build-loadout-grid">
                  <ItemInspectionPanel slotLabel="Anchor Ability" item={selected.anchor} variant="anchor" />
                  <ItemInspectionPanel
                    slotLabel="Crown"
                    item={selected.crown}
                    bonusImage={synergyBonusImage(previewLoadout, selected.crown)}
                  />
                  <ItemInspectionPanel
                    slotLabel="Amulet"
                    item={selected.amulet}
                    bonusImage={synergyBonusImage(previewLoadout, selected.amulet)}
                  />
                  <ItemInspectionPanel
                    slotLabel="Weapon"
                    item={selected.weapon1}
                    bonusImage={synergyBonusImage(previewLoadout, selected.weapon1)}
                  />
                  <ItemInspectionPanel
                    slotLabel="Weapon"
                    item={selected.weapon2}
                    bonusImage={synergyBonusImage(previewLoadout, selected.weapon2)}
                  />
                  <ItemInspectionPanel slotLabel="Consumable" item={selected.consumable} variant="consumable" />
                </div>
              )}
            </div>

            <div className="panel build-section">
              <span className="panel-eyebrow">Set Bonuses</span>
              <p className="build-synergy-summary">
                Derived live from the loadout above — a valid build can have zero active set bonuses.
              </p>
              <BuildSynergyPanel synergies={synergies} />
            </div>

            {(bigIdea || rotation || tips || playstyle || recommendedUse) && (
              <div className="panel build-section build-description-panel">
                <span className="panel-eyebrow">Build Details</span>
                {bigIdea && (
                  <div className="build-detail-field">
                    <span className="build-detail-field-label">The Big Idea</span>
                    <p className="build-detail-field-text">{bigIdea}</p>
                  </div>
                )}
                {playstyle && (
                  <div className="build-detail-field">
                    <span className="build-detail-field-label">Playstyle</span>
                    <p className="build-detail-field-text">{playstyle}</p>
                  </div>
                )}
                {rotation && (
                  <div className="build-detail-field">
                    <span className="build-detail-field-label">Rotation / Gameplan</span>
                    <p className="build-detail-field-text">{rotation}</p>
                  </div>
                )}
                {tips && (
                  <div className="build-detail-field">
                    <span className="build-detail-field-label">Tips</span>
                    <p className="build-detail-field-text">{tips}</p>
                  </div>
                )}
                {recommendedUse && (
                  <div className="build-detail-field">
                    <span className="build-detail-field-label">Recommended Use</span>
                    <p className="build-detail-field-text">{recommendedUse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSlotDef && (
        <ItemPicker
          itemType={activeSlotDef.itemType}
          items={items}
          eternals={eternals}
          onSelect={handleSelectItem}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </div>
  )
}

export default BuildCreate
