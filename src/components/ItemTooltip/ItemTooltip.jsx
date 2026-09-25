import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import EffectTag from '../EffectTag/EffectTag.jsx'
import './ItemTooltip.css'

const OPEN_DELAY_MS = 160
const CLOSE_DELAY_MS = 120
const VIEWPORT_MARGIN = 12
const TRIGGER_GAP = 10

// Hover tooltips are a desktop affordance. Touch/coarse-pointer devices
// keep whatever tap/navigation behavior the wrapped element already has —
// we never intercept touch input here, so normal mobile navigation can't
// be broken by this component.
const IS_TOUCH_DEVICE =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches

/**
 * Compact, F1-inspection-style hover card for a single Tower item. Mirrors
 * ItemInspectionPanel's information hierarchy (art/name, effect tags,
 * stats, description, upgrades, set bonus, flavor text) but only renders
 * the sections the Wiki actually provided data for — nothing is invented.
 */
function ItemTooltipCard({ item, bonusImage }) {
  const stats = [...(item.attack?.stats || []), ...(item.ability?.stats || [])]
  const description = [item.attack?.description, item.ability?.description].filter(Boolean).join(' ')
  const sourceLabel = item.eternalName || item.source

  return (
    <div className="item-tooltip-card">
      <div className="item-tooltip-header">
        <div className="item-tooltip-art">
          {item.image ? <img src={item.image} alt="" /> : <span className="item-tooltip-art-placeholder" />}
        </div>
        <div className="item-tooltip-heading">
          <span className="item-tooltip-name">{item.name}</span>
          {(item.category || sourceLabel) && (
            <span className="item-tooltip-meta">
              {[item.category, sourceLabel].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
      </div>

      {item.effects?.length > 0 && (
        <div className="item-tooltip-tags">
          {item.effects.map((tag, index) => (
            <EffectTag key={`${tag.label}-${index}`} label={tag.label} category={tag.category} />
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div className="item-tooltip-stats">
          {stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="item-tooltip-stat-row">
              <span className="item-tooltip-stat-label">{stat.label}</span>
              <span className="item-tooltip-stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {description && <p className="item-tooltip-description">{description}</p>}

      {item.upgrades?.length > 0 && (
        <div className="item-tooltip-section">
          <span className="item-tooltip-section-label">Upgrades</span>
          {item.upgrades.map((upgrade) => (
            <div key={upgrade.level} className="item-tooltip-upgrade-row">
              <span className="item-tooltip-upgrade-level">Lv. {upgrade.level}</span>
              <span>{upgrade.description}</span>
            </div>
          ))}
        </div>
      )}

      {item.bonus && (
        <div className="item-tooltip-bonus">
          <div className="item-tooltip-bonus-heading">
            {bonusImage && <img className="item-tooltip-bonus-icon" src={bonusImage} alt="" />}
            <span className="item-tooltip-bonus-label">Set Bonus</span>
          </div>
          <span className="item-tooltip-bonus-text">{item.bonus}</span>
        </div>
      )}

      {item.flavorText && <p className="item-tooltip-flavor">“{item.flavorText}”</p>}
    </div>
  )
}

/**
 * Global hover-tooltip wrapper for any item icon/name shown around Tower.
 * Wrap the existing clickable element (icon, name, or both) — this never
 * adds its own link/click behavior, so navigation on the wrapped element
 * keeps working exactly as before. Hover shows a compact read-only
 * inspection card resolved from the shared ArkheronDataService item cache
 * (or straight from an already-resolved `item` prop, when the caller has
 * one in scope, to avoid any redundant fetch).
 */
function ItemTooltip({ itemId, item: itemProp, bonusImage, children, className }) {
  const [open, setOpen] = useState(false)
  const [resolvedItem, setResolvedItem] = useState(itemProp || null)
  const [coords, setCoords] = useState(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const openTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const hoverCountRef = useRef(0)
  // The trigger <span> is `display: contents` so it never generates its own
  // box (its getBoundingClientRect() is always zero) — track the real
  // cursor position instead, so the tooltip appears wherever the user is
  // actually hovering rather than collapsing to the viewport corner.
  const pointerRef = useRef(null)
  const anchorRef = useRef(null)

  const resolveId = itemProp?.id || itemId

  useEffect(() => {
    if (itemProp) {
      setResolvedItem(itemProp)
      return undefined
    }
    if (!open || !itemId) return undefined

    let cancelled = false
    ArkheronDataService.getItem(itemId).then((data) => {
      if (!cancelled) setResolvedItem(data || null)
    })
    return () => {
      cancelled = true
    }
  }, [itemProp, itemId, open])

  useEffect(
    () => () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    },
    [],
  )

  const scheduleOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (openTimerRef.current) return
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null
      // Freeze the anchor at the moment the tooltip actually opens (using
      // the most recent cursor position) so it appears right where the
      // user is hovering, then holds still while they read it/move into it
      // — it never keeps chasing the mouse once visible.
      anchorRef.current = pointerRef.current
      setOpen(true)
    }, OPEN_DELAY_MS)
  }, [])

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) return
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, CLOSE_DELAY_MS)
  }, [])

  const handlePointerMove = useCallback((event) => {
    pointerRef.current = { x: event.clientX, y: event.clientY }
  }, [])

  const handleEnter = useCallback(
    (event) => {
      if (IS_TOUCH_DEVICE || !resolveId) return
      if (typeof event?.clientX === 'number') {
        pointerRef.current = { x: event.clientX, y: event.clientY }
      }
      hoverCountRef.current += 1
      scheduleOpen()
    },
    [resolveId, scheduleOpen],
  )

  const handleFocus = useCallback(() => {
    if (IS_TOUCH_DEVICE || !resolveId) return
    // Keyboard focus has no cursor position to read — the trigger itself
    // is `display: contents` (no box of its own), so anchor near its
    // first real rendered child instead.
    const fallback = triggerRef.current?.firstElementChild?.getBoundingClientRect()
    if (fallback) pointerRef.current = { x: fallback.left, y: fallback.top }
    hoverCountRef.current += 1
    scheduleOpen()
  }, [resolveId, scheduleOpen])

  const handleLeave = useCallback(() => {
    if (IS_TOUCH_DEVICE || !resolveId) return
    hoverCountRef.current = Math.max(0, hoverCountRef.current - 1)
    if (hoverCountRef.current === 0) scheduleClose()
  }, [resolveId, scheduleClose])

  // Position the portal-rendered card relative to the cursor (the trigger
  // is `display: contents`, so its own getBoundingClientRect() is always
  // zero and can't be used for positioning). Prefers appearing above/right
  // of the cursor, flips to below when there isn't room above, and clamps
  // to both viewport edges so it never clips off-screen.
  useLayoutEffect(() => {
    if (!open) return undefined
    const tooltip = tooltipRef.current
    if (!tooltip) return undefined

    const update = () => {
      const anchor = anchorRef.current || { x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN }
      const tooltipRect = tooltip.getBoundingClientRect()

      let left = anchor.x + TRIGGER_GAP
      if (left + tooltipRect.width > window.innerWidth - VIEWPORT_MARGIN) {
        left = anchor.x - tooltipRect.width - TRIGGER_GAP
      }
      if (left + tooltipRect.width > window.innerWidth - VIEWPORT_MARGIN) {
        left = window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN
      }
      if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN

      let top = anchor.y - tooltipRect.height - TRIGGER_GAP
      let placement = 'above'
      if (top < VIEWPORT_MARGIN) {
        top = anchor.y + TRIGGER_GAP
        placement = 'below'
        if (top + tooltipRect.height > window.innerHeight - VIEWPORT_MARGIN) {
          top = Math.max(VIEWPORT_MARGIN, window.innerHeight - tooltipRect.height - VIEWPORT_MARGIN)
        }
      }

      setCoords({ top, left, placement })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, resolvedItem])

  if (!resolveId) {
    return children
  }

  return (
    <span
      ref={triggerRef}
      className={`item-tooltip-trigger${className ? ` ${className}` : ''}`}
      onMouseEnter={handleEnter}
      onMouseMove={handlePointerMove}
      onMouseLeave={handleLeave}
      onFocus={handleFocus}
      onBlur={handleLeave}
    >
      {children}
      {open &&
        resolvedItem &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`item-tooltip${coords ? ` item-tooltip-visible item-tooltip-${coords.placement}` : ''}`}
            style={{ top: coords?.top ?? -9999, left: coords?.left ?? -9999 }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <ItemTooltipCard item={resolvedItem} bonusImage={bonusImage} />
          </div>,
          document.body,
        )}
    </span>
  )
}

export default ItemTooltip
