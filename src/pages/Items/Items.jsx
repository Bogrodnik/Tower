import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import EffectTag from '../../components/EffectTag/EffectTag.jsx'
import ItemTooltip from '../../components/ItemTooltip/ItemTooltip.jsx'
import './Items.css'

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'eternal', label: 'Eternal' },
  { value: 'echo', label: 'Echo' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'anchor-ability', label: 'Anchor Ability' },
]

// "Anchor Ability" contains a space, which isn't safe to drop straight into
// a CSS class name or <select> value — slugify it the same way everywhere.
function slugifySource(source) {
  return source.trim().toLowerCase().replace(/\s+/g, '-')
}

function Items() {
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [effectFilter, setEffectFilter] = useState('all')

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    ArkheronDataService.getItems()
      .then((data) => {
        if (cancelled) return
        setItems(data)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Items from the Arkheron Wiki:', err)
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

  // Filter vocabularies are derived only from what the Wiki data actually
  // contains — nothing here is hard-coded or invented.
  const categoryOptions = useMemo(() => {
    if (!items) return []
    const labelsByType = new Map()
    items.forEach((item) => {
      if (item.itemType && !labelsByType.has(item.itemType)) {
        labelsByType.set(item.itemType, item.category || item.itemType)
      }
    })
    return Array.from(labelsByType.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items])

  const effectOptions = useMemo(() => {
    if (!items) return []
    const set = new Set()
    items.forEach((item) => item.effects.forEach((effect) => set.add(effect.label)))
    return Array.from(set).sort()
  }, [items])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const query = search.trim().toLowerCase()

    return items.filter((item) => {
      if (query) {
        const haystack = `${item.name} ${item.pageId ?? ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (sourceFilter !== 'all' && slugifySource(item.source) !== sourceFilter) return false
      if (categoryFilter !== 'all' && item.itemType !== categoryFilter) return false
      if (effectFilter !== 'all' && !item.effects.some((effect) => effect.label === effectFilter)) return false
      return true
    })
  }, [items, search, sourceFilter, categoryFilter, effectFilter])

  return (
    <div className="items-page">
      <span className="page-eyebrow">Database</span>
      <h1 className="page-title">Items</h1>
      <p className="page-description">
        Crowns, amulets and weapons, pulled live from the Arkheron Wiki.
      </p>
      <div className="accent-bar" />

      {loading && <div className="eternals-state">Loading Items from the Arkheron Wiki…</div>}
      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}

      {!loading && !error && items && (
        <div className="items-explorer">
          <div className="items-toolbar">
            <div className="items-search">
              <span className="items-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="items-filter-group">
              <span className="items-filter-label">Source</span>
              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="items-filter-group">
              <span className="items-filter-label">Category</span>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="items-filter-group">
              <span className="items-filter-label">Effect</span>
              <select value={effectFilter} onChange={(e) => setEffectFilter(e.target.value)}>
                <option value="all">All</option>
                {effectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="items-table-wrap">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="items-col-art"></th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Effects</th>
                  <th className="items-col-id">ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="items-col-art">
                      <ItemTooltip item={item}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span className="items-art-placeholder" />
                        )}
                      </ItemTooltip>
                    </td>
                    <td>
                      <ItemTooltip item={item}>
                        <Link to={`/items/${item.id}`} className="items-row-link">
                          {item.name}
                        </Link>
                      </ItemTooltip>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`items-source-badge items-source-${slugifySource(item.source)}`}>
                        {item.source}
                      </span>
                    </td>
                    <td className="items-effects-cell">
                      {item.effects.length > 0 ? (
                        item.effects.map((effect) => (
                          <EffectTag key={effect.label} label={effect.label} category={effect.category} />
                        ))
                      ) : (
                        <span className="items-effects-empty">—</span>
                      )}
                    </td>
                    <td className="items-col-id">{item.pageId ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="items-empty">No items match the current filters.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Items
