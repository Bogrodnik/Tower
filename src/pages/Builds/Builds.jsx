import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import BuildService from '../../data/BuildService.js'
import BuildRow from '../../components/BuildRow/BuildRow.jsx'
import ItemFilterSidebar from '../../components/ItemFilterSidebar/ItemFilterSidebar.jsx'
import './Builds.css'

function buildItemIdSet(loadout) {
  if (!loadout) return new Set()
  return new Set(
    [loadout.anchor, loadout.crown, loadout.amulet, loadout.weapon1, loadout.weapon2, loadout.consumable]
      .filter(Boolean)
      .map((item) => item.id),
  )
}

function Builds() {
  const [builds] = useState(() => BuildService.getBuilds())
  const [items, setItems] = useState([])
  const [eternals, setEternals] = useState([])
  const [resolvedById, setResolvedById] = useState({})

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('trending')
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set())
  const [matchMode, setMatchMode] = useState('all')
  const [selectedEternalId, setSelectedEternalId] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([ArkheronDataService.getItems(), ArkheronDataService.getEternals()])
      .then(([itemData, eternalData]) => {
        if (cancelled) return
        setItems(itemData)
        setEternals(eternalData)
      })
      .catch((err) => console.error('Failed to load Items/Eternals for the Builds page:', err))
    return () => {
      cancelled = true
    }
  }, [])

  // Every build's Eternal/Echo composition and item ids are derived live
  // from its actual selected items (never stored), so filtering requires
  // resolving each build's loadout once up front.
  useEffect(() => {
    let cancelled = false
    Promise.all(builds.map((build) => BuildService.resolveBuildLoadout(build).then((resolved) => [build.id, resolved])))
      .then((entries) => {
        if (cancelled) return
        setResolvedById(Object.fromEntries(entries))
      })
      .catch((err) => console.error('Failed to resolve build loadouts:', err))
    return () => {
      cancelled = true
    }
  }, [builds])

  const toggleItem = (itemId) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedItemIds(new Set())
    setSelectedEternalId(null)
  }

  const selectedItems = useMemo(
    () => Array.from(selectedItemIds).map((id) => items.find((item) => item.id === id)).filter(Boolean),
    [selectedItemIds, items],
  )

  const filteredBuilds = useMemo(() => {
    const query = search.trim().toLowerCase()
    return builds.filter((build) => {
      if (query) {
        const haystack = `${build.name} ${build.author || ''} ${(build.tags || []).join(' ')}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }

      const resolved = resolvedById[build.id]

      if (selectedEternalId) {
        const matches = resolved?.synergies?.some((synergy) => synergy.eternalId === selectedEternalId)
        if (!matches) return false
      }

      if (selectedItemIds.size > 0) {
        const buildItemIds = buildItemIdSet(resolved)
        const ids = Array.from(selectedItemIds)
        const matches =
          matchMode === 'all' ? ids.every((id) => buildItemIds.has(id)) : ids.some((id) => buildItemIds.has(id))
        if (!matches) return false
      }

      return true
    })
  }, [builds, search, resolvedById, selectedEternalId, selectedItemIds, matchMode])

  const sortedBuilds = useMemo(() => {
    const sorter = BuildService.BUILD_SORTERS[sortKey]?.sort || BuildService.sortByTrending
    return sorter(filteredBuilds)
  }, [filteredBuilds, sortKey])

  const hasActiveFilters = selectedItemIds.size > 0 || Boolean(selectedEternalId)

  return (
    <div className="builds-page">
      <span className="page-eyebrow">Community</span>
      <h1 className="page-title">Community Builds</h1>
      <p className="page-description">
        Mix and match Eternal and Echo items to create your build — combine items freely and find your own
        synergies. The database is your toolbox.
      </p>
      <div className="accent-bar" />

      <div className="builds-toolbar">
        <div className="items-search builds-search">
          <span className="items-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search builds, authors, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Link to="/builds/create" className="builds-create-btn">
          + Create Build
        </Link>

        <div className="builds-sort-tabs" role="tablist" aria-label="Sort builds">
          {Object.entries(BuildService.BUILD_SORTERS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={sortKey === key}
              className={`builds-sort-tab${sortKey === key ? ' active' : ''}`}
              onClick={() => setSortKey(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="builds-filters-toggle" onClick={() => setFiltersOpen((open) => !open)}>
        {filtersOpen ? '✕ Close Filters' : '☰ Filters'}
        {hasActiveFilters && !filtersOpen && (
          <span className="builds-filters-badge">{selectedItemIds.size + (selectedEternalId ? 1 : 0)}</span>
        )}
      </button>

      <div className="builds-layout">
        <div className={`item-filter-sidebar-wrap${filtersOpen ? ' open' : ''}`}>
          <ItemFilterSidebar
            items={items}
            eternals={eternals}
            selectedItemIds={selectedItemIds}
            onToggleItem={toggleItem}
            matchMode={matchMode}
            onMatchModeChange={setMatchMode}
            selectedEternalId={selectedEternalId}
            onEternalChange={setSelectedEternalId}
            onClearAll={clearAllFilters}
          />
        </div>

        <div className="builds-feed">
          {hasActiveFilters && (
            <div className="builds-active-filters">
              <span className="builds-active-filter-label">
                Filters ({matchMode === 'all' ? 'Match All' : 'Match Any'}):
              </span>
              {selectedEternalId && (
                <span className="builds-active-filter-chip">
                  {eternals.find((e) => e.id === selectedEternalId)?.name || selectedEternalId}
                  <button type="button" onClick={() => setSelectedEternalId(null)}>
                    ✕
                  </button>
                </span>
              )}
              {selectedItems.map((item) => (
                <span key={item.id} className="builds-active-filter-chip">
                  {item.image && <img src={item.image} alt="" />}
                  {item.name}
                  <button type="button" onClick={() => toggleItem(item.id)}>
                    ✕
                  </button>
                </span>
              ))}
              <button type="button" className="builds-clear-filters-btn" onClick={clearAllFilters}>
                Clear Filters
              </button>
            </div>
          )}

          <span className="panel-eyebrow builds-section-eyebrow">
            Build Results <span className="builds-result-count">({sortedBuilds.length})</span>
          </span>

          {sortedBuilds.length === 0 ? (
            <div className="eternals-state">No builds found for the current filters. Try clearing a filter above.</div>
          ) : (
            <div className="builds-row-stack">
              {sortedBuilds.map((build) => (
                <BuildRow key={build.id} build={build} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Builds
