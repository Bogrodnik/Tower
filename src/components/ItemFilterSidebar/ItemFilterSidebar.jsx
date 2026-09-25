import { useMemo, useState } from 'react'
import ItemTooltip from '../ItemTooltip/ItemTooltip.jsx'
import './ItemFilterSidebar.css'

const CATEGORY_TABS = [
  { value: 'all', label: 'All' },
  { value: 'anchor-ability', label: 'Anchor' },
  { value: 'crown', label: 'Crown' },
  { value: 'amulet', label: 'Amulet' },
  { value: 'weapon', label: 'Weapon' },
  { value: 'consumable', label: 'Consumable' },
]

/**
 * A persistent item-based filter column for the Builds feed (mirrors the
 * real Arkheron Builds site's sidebar). Every category/Eternal/item shown
 * here is sourced live from ArkheronDataService — nothing is hard-coded.
 */
function ItemFilterSidebar({
  items,
  eternals,
  selectedItemIds,
  onToggleItem,
  matchMode,
  onMatchModeChange,
  selectedEternalId,
  onEternalChange,
  onClearAll,
}) {
  const [categoryTab, setCategoryTab] = useState('all')

  // Only categories that actually have items are worth showing tabs for.
  const availableCategoryTabs = useMemo(() => {
    const present = new Set(items.map((item) => item.itemType))
    return CATEGORY_TABS.filter((tab) => tab.value === 'all' || present.has(tab.value))
  }, [items])

  const eternalsWithItems = useMemo(
    () => eternals.filter((eternal) => items.some((item) => item.eternalId === eternal.id)),
    [eternals, items],
  )

  const visibleItems = useMemo(() => {
    let list = items
    if (categoryTab !== 'all') list = list.filter((item) => item.itemType === categoryTab)
    if (selectedEternalId) list = list.filter((item) => item.eternalId === selectedEternalId)
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [items, categoryTab, selectedEternalId])

  const hasActiveFilters = selectedItemIds.size > 0 || Boolean(selectedEternalId)

  return (
    <aside className="item-filter-sidebar">
      <div className="item-filter-sidebar-header">
        <span className="item-filter-sidebar-title">Filter by Item</span>
        {hasActiveFilters && (
          <button type="button" className="item-filter-clear-btn" onClick={onClearAll}>
            Clear
          </button>
        )}
      </div>

      <div className="item-filter-match-mode" role="tablist" aria-label="Match mode">
        <button
          type="button"
          className={`item-filter-match-btn${matchMode === 'all' ? ' active' : ''}`}
          onClick={() => onMatchModeChange('all')}
        >
          Match All
        </button>
        <button
          type="button"
          className={`item-filter-match-btn${matchMode === 'any' ? ' active' : ''}`}
          onClick={() => onMatchModeChange('any')}
        >
          Match Any
        </button>
      </div>

      <div className="item-filter-category-tabs">
        {availableCategoryTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`item-filter-category-tab${categoryTab === tab.value ? ' active' : ''}`}
            onClick={() => setCategoryTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {eternalsWithItems.length > 0 && (
        <div className="item-filter-eternal-row">
          {eternalsWithItems.map((eternal) => (
            <button
              key={eternal.id}
              type="button"
              className={`item-filter-eternal-btn${selectedEternalId === eternal.id ? ' active' : ''}`}
              title={eternal.name}
              onClick={() => onEternalChange(selectedEternalId === eternal.id ? null : eternal.id)}
            >
              {eternal.image ? <img src={eternal.image} alt={eternal.name} /> : <span>{eternal.name[0]}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="item-filter-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`item-filter-item-btn${selectedItemIds.has(item.id) ? ' active' : ''}`}
            title={`${item.name}${item.eternalName ? ` — ${item.eternalName}` : ''}`}
            onClick={() => onToggleItem(item.id)}
          >
            <ItemTooltip item={item}>
              {item.image ? <img src={item.image} alt={item.name} /> : <span className="item-filter-item-fallback">{item.name[0]}</span>}
            </ItemTooltip>
          </button>
        ))}
        {visibleItems.length === 0 && <span className="item-filter-empty">No items in this category.</span>}
      </div>
    </aside>
  )
}

export default ItemFilterSidebar
