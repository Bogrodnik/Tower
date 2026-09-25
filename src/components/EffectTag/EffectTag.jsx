import { useEffect, useState } from 'react'
import ArkheronDataService from '../../data/ArkheronDataService.js'
import { getCategoryColors, getEffectCategory } from '../../data/effectColors.js'
import './EffectTag.css'

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
 */
function EffectTag({ label, category, greyed = false }) {
  const resolvedCategory = category || getEffectCategory(label)
  const colors = getCategoryColors(resolvedCategory)
  const definition = useGlossaryEntry(label)

  return (
    <span
      className={`effect-tag${greyed ? ' effect-tag-greyed' : ''}`}
      style={{
        color: colors.color,
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
    >
      {label}
      <span className="effect-tag-tooltip">
        <strong>{label}</strong>
        <span>{definition || 'No Wiki definition available for this effect yet.'}</span>
      </span>
    </span>
  )
}

export default EffectTag
