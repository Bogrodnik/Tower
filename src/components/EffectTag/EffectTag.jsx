import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import { getCategoryColors, getEffectCategory } from '../../data/effectColors.js'
import './EffectTag.css'

const VIEWPORT_MARGIN = 8
const TAG_GAP = 8

// Mirrors ItemTooltip's touch guard: hover tooltips are a desktop
// affordance, so tap/focus on touch devices never opens (and gets stuck
// showing) this portal-rendered tooltip.
const IS_TOUCH_DEVICE =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches

// Module-level cache so every EffectTag instance shares one Glossary fetch
// instead of each tag re-requesting it.
let glossaryCache = null
let glossaryPromise = null

function useGlossaryEntry(label) {
  const key = label?.trim().toLowerCase()
  const [definition, setDefinition] = useState(() => glossaryCache?.[key])

  useEffect(() => {
    if (glossaryCache) {
      setDefinition(glossaryCache[key])
      return
    }
    if (!glossaryPromise) {
      glossaryPromise = ArkheronDataService.getEffectGlossary().then((data) => {
        glossaryCache = data
        return data
      })
    }
    let cancelled = false
    glossaryPromise.then((data) => {
      if (!cancelled) setDefinition(data[key])
    })
    return () => {
      cancelled = true
    }
  }, [key])

  return definition
}

/**
 * A colored effect/tag chip matching the Arkheron Wiki's own tag color
 * language (see src/data/effectColors.js), with a hover tooltip sourced from
 * the Wiki's Glossary page. If the Wiki has no Glossary entry for a tag, the
 * tooltip simply identifies the effect rather than inventing an explanation.
 *
 * The tooltip itself is rendered through a portal at the document root and
 * positioned with `position: fixed`, so it always escapes any ancestor with
 * `overflow: hidden`/`auto` (tables, scrollable panels, cards, etc.) and
 * renders above every other element on the page — it can never be clipped
 * or covered no matter where the tag is used.
 */
function EffectTag({ label, category, greyed = false }) {
  const resolvedCategory = category || getEffectCategory(label)
  const colors = getCategoryColors(resolvedCategory)
  const definition = useGlossaryEntry(label)

  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const tagRef = useRef(null)
  const tooltipRef = useRef(null)

  const handleOpen = useCallback(() => {
    if (IS_TOUCH_DEVICE) return
    setOpen(true)
  }, [])
  const handleClose = useCallback(() => setOpen(false), [])

  useLayoutEffect(() => {
    if (!open) return undefined
    const tag = tagRef.current
    const tooltip = tooltipRef.current
    if (!tag || !tooltip) return undefined

    const update = () => {
      const tagRect = tag.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()

      let left = tagRect.left + tagRect.width / 2 - tooltipRect.width / 2
      left = Math.min(
        Math.max(left, VIEWPORT_MARGIN),
        window.innerWidth - tooltipRect.width - VIEWPORT_MARGIN,
      )

      let top = tagRect.top - tooltipRect.height - TAG_GAP
      if (top < VIEWPORT_MARGIN) {
        top = tagRect.bottom + TAG_GAP
      }
      top = Math.min(Math.max(top, VIEWPORT_MARGIN), window.innerHeight - tooltipRect.height - VIEWPORT_MARGIN)

      setCoords({ top, left })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, definition])

  return (
    <span
      ref={tagRef}
      className={`effect-tag${greyed ? ' effect-tag-greyed' : ''}`}
      style={{
        color: colors.color,
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
    >
      {label}
      {open &&
        createPortal(
          <span
            ref={tooltipRef}
            className="effect-tag-tooltip"
            style={{ top: coords?.top ?? -9999, left: coords?.left ?? -9999, opacity: coords ? 1 : 0 }}
          >
            <strong>{label}</strong>
            <span>{definition || 'No Wiki definition available for this effect yet.'}</span>
          </span>,
          document.body,
        )}
    </span>
  )
}

export default EffectTag
