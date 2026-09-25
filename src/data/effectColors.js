// effectColors
//
// Centralized effect (item tag) -> color/category mapping.
//
// This is NOT invented styling. It is a direct reproduction of the Arkheron
// Wiki's own color language for these effects, discovered from:
//   1. Template:Item_tag/render — the exact tag-name -> category switch the
//      Wiki itself uses to classify every known effect keyword.
//   2. The Wiki's live rendered CSS for each ".item-tag-<category>" class,
//      read via computed styles on a real Wiki page.
//
// If the Wiki ever renders a tag we don't recognize, it falls back to the
// Wiki's own "default" category/colors rather than inventing something new.

// tag name (lowercase) -> category, copied 1:1 from Template:Item_tag/render
const TAG_CATEGORY_MAP = {
  heal: 'heal',
  lifesteal: 'heal',

  build: 'summon',
  summon: 'summon',

  block: 'armor',
  'pass through': 'armor',
  armor: 'armor',
  'negates piercing': 'armor',
  'negates crushing': 'armor',
  'damage mitigation': 'armor',
  invulnerable: 'armor',

  phased: 'phased',
  teleport: 'phased',

  'movement increase': 'movement',
  invisible: 'movement',
  steadfast: 'movement',
  stealthed: 'movement',
  'cooldown reduction': 'movement',
  'reset on kill': 'movement',

  stun: 'status',
  grab: 'status',
  throw: 'status',
  exhaust: 'status',
  displacement: 'status',
  slow: 'status',
  root: 'status',
  vulnerable: 'status',
  knockback: 'status',
  blind: 'status',
  bind: 'status',
  weaken: 'status',
  tether: 'status',

  crushing: 'damage',
  piercing: 'damage',
  exploding: 'damage',
  'damage over time': 'damage',
  'damage reflect': 'damage',
  'damage return': 'damage',
  embed: 'damage',

  'damage increase': 'damage-increase',
}

// category -> { background, color, border }, sampled directly from the
// Wiki's own rendered `.item-tag-<category>` computed styles (view-dark theme).
const CATEGORY_COLORS = {
  heal: { background: 'rgb(24, 22, 5)', color: 'rgb(193, 193, 138)', border: 'rgb(50, 48, 48)' },
  summon: { background: 'rgb(10, 18, 12)', color: 'rgb(94, 114, 78)', border: 'rgb(50, 48, 48)' },
  armor: { background: 'rgb(11, 17, 21)', color: 'rgb(78, 112, 136)', border: 'rgb(50, 48, 48)' },
  phased: { background: 'rgb(10, 20, 19)', color: 'rgb(71, 113, 107)', border: 'rgb(50, 48, 48)' },
  movement: { background: 'rgb(20, 16, 7)', color: 'rgb(148, 127, 68)', border: 'rgb(50, 48, 48)' },
  status: { background: 'rgb(15, 10, 18)', color: 'rgb(128, 103, 139)', border: 'rgb(50, 48, 48)' },
  damage: { background: 'rgb(21, 8, 8)', color: 'rgb(167, 85, 77)', border: 'rgb(50, 48, 48)' },
  'damage-increase': { background: 'rgb(26, 17, 8)', color: 'rgb(141, 87, 49)', border: 'rgb(50, 48, 48)' },
  default: { background: 'rgb(21, 21, 21)', color: 'rgb(184, 181, 172)', border: 'rgb(50, 48, 48)' },
}

/**
 * Resolve the Wiki-defined category for an effect/tag label.
 * Falls back to "default" (the Wiki's own fallback styling) for unknown tags.
 * @param {string} label
 * @returns {string}
 */
export function getEffectCategory(label) {
  if (!label) return 'default'
  return TAG_CATEGORY_MAP[label.trim().toLowerCase()] || 'default'
}

/**
 * Resolve the { background, color, border } colorway for a category.
 * @param {string} category
 */
export function getCategoryColors(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
}

export default {
  getEffectCategory,
  getCategoryColors,
}
