import { useMemo, useState } from 'react'
import EffectTag from '../EffectTag/EffectTag.jsx'
import './ItemPicker.css'

/**
 * A dense, database-style item picker used to fill a single build loadout
 * slot (Crown / Amulet / Weapon / Consumable). Shows every real item of the
 * requested `itemType`, with search + source (Eternal/Echo) + specific
 * Eternal filters — nothing here is invented, it's the same Item records
 * ArkheronDataService already exposes to /items.
 */
function ItemPicker({ itemType, items, eternals, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [eternalFilter, setEternalFilter] = useState('all')

  const candidateItems = useMemo(() => items.filter((item) => item.itemType === itemType), [items, itemType])

  const eternalOptions = useMemo(() => {
    const ids = new Set(candidateItems.filter((item) => item.eternalId).map((item) => item.eternalId))
    return eternals.filter((eternal) => ids.has(eternal.id)).sort((a, b) => a.name.localeCompare(b.name))
  }, [candidateItems, eternals])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return candidateItems.filter((item) => {
      if (term && !item.name.toLowerCase().includes(term)) return false
      if (sourceFilter === 'eternal' && !item.eternalId) return false
      if (sourceFilter === 'echo' && (item.eternalId || item.source !== 'Echo')) return false
      if (eternalFilter !== 'all' && item.eternalId !== eternalFilter) return false
      return true
    })
  }, [candidateItems, search, sourceFilter, eternalFilter])

  return (
    <div className="item-picker-backdrop" onClick={onClose}>
      <div className="item-picker" onClick={(event) => event.stopPropagation()}>
        <div className="item-picker-header">
          <h3>Select {itemType === 'anchor-ability' ? 'Anchor Ability' : itemType}</h3>
          <button type="button" className="item-picker-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="item-picker-controls">
          <input
            type="text"
            placeholder="Search item name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoFocus
          />
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="all">All Sources</option>
            <option value="eternal">Eternal Items</option>
            <option value="echo">Echo Items</option>
          </select>
          {eternalOptions.length > 0 && (
            <select value={eternalFilter} onChange={(event) => setEternalFilter(event.target.value)}>
              <option value="all">Any Eternal</option>
              {eternalOptions.map((eternal) => (
                <option key={eternal.id} value={eternal.id}>
                  {eternal.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="item-picker-list">
          {filteredItems.length === 0 && <p className="item-picker-empty">No items match this filter.</p>}
          {filteredItems.map((item) => (
            <button type="button" key={item.id} className="item-picker-row" onClick={() => onSelect(item)}>
              <span className="item-picker-art">
                {item.image ? <img src={item.image} alt={item.name} /> : null}
              </span>
              <span className="item-picker-info">
                <span className="item-picker-name">{item.name}</span>
                <span className="item-picker-meta">
                  {item.eternalId ? item.eternalName || item.eternalId : 'Echo'}
                  {item.category ? ` · ${item.category}` : ''}
                </span>
                {item.effects?.length > 0 && (
                  <span className="item-picker-tags">
                    {item.effects.slice(0, 4).map((effect, index) => (
                      <EffectTag key={`${effect.label}-${index}`} label={effect.label} category={effect.category} />
                    ))}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ItemPicker
