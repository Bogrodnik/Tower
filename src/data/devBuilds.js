// devBuilds
//
// TEMPORARY, LOCAL prototype data for the Tower Builds system.
//
// These are NOT real community submissions — they are hand-authored dev
// fixtures used only so the Build browser/detail/creator UI has something
// to render before Tower has a real backend. Every `*ItemId` below
// references a REAL id from the live Arkheron Wiki Items data (via
// ArkheronDataService) — only the build metadata itself
// (name/author/bigIdea/rating/etc.) is invented placeholder content.
//
// Builds are free-form loadouts: there is no `eternalId` field. Eternal
// affiliation/set synergy is always derived from the selected item ids at
// read time (see BuildService.computeBuildSynergies). A couple of the
// builds below intentionally mix items from more than one Eternal to
// demonstrate that a build does not need to "belong" to a single Eternal.
//
// Do not treat this file as ground truth for Arkheron game data, and do not
// grow it into a real data layer — it exists purely to seed the prototype.

export const SEED_BUILDS = [
  {
    id: 'seed-dahla-bleed-rush',
    slug: 'dahla-bleed-rush',
    name: 'Bleed Rush',
    author: 'Tower Team',
    bigIdea:
      'An aggressive Dahla loadout built around fast blade swaps and repositioning to keep pressure on a single target.',
    rotation:
      "Open with Throwing Knives to soften a target, close the gap with Dancing Blade's swap, then chain melee hits before resetting distance.",
    tips: 'Swap items freely — this is only a placeholder loadout. Prioritize repositioning over trading blows head-on.',
    playstyle: 'Aggressive',
    recommendedUse: 'Dive backlines and reset with mobility tools before committing again.',
    anchorItemId: 'Last Wish',
    crownItemId: "Dahla's Vanish Crown",
    amuletItemId: "Dahla's Petal Dance Amulet",
    weapon1ItemId: "Dahla's Dancing Blade",
    weapon2ItemId: "Dahla's Throwing Knives",
    consumableId: 'Health Potion',
    tags: ['Mobility', 'Duelist', 'Solo Carry'],
    rating: 4.4,
    ratingCount: 27,
    viewCount: 512,
    commentCount: 6,
    status: 'published',
    createdAt: '2024-11-02T10:00:00.000Z',
    updatedAt: '2025-01-18T09:30:00.000Z',
  },
  {
    id: 'seed-vaton-payback-tank',
    slug: 'vaton-payback-tank',
    name: 'Payback Frontline',
    author: 'Tower Team',
    bigIdea:
      'A durable Vaton setup that leans on the Payback Crown and Audacity Amulet to punish attackers while holding a lane.',
    rotation:
      'Hold position with Payback active, bait an engage, then trigger Audacity once the trade is already in your favor.',
    tips: 'Placeholder tips — until real community authoring exists.',
    playstyle: 'Defensive',
    recommendedUse: 'Hold objectives and bait attacks rather than initiating them.',
    anchorItemId: 'Self Revive',
    crownItemId: "Vaton's Payback Crown",
    amuletItemId: "Vaton's Audacity Amulet",
    weapon1ItemId: "Vaton's Seeing Eye",
    weapon2ItemId: "Vaton's Serpent Staff",
    consumableId: 'Fortitude Shard',
    tags: ['Frontline', 'Sustain', 'Tank'],
    rating: 4.8,
    ratingCount: 41,
    viewCount: 890,
    commentCount: 11,
    status: 'published',
    createdAt: '2024-12-14T14:20:00.000Z',
    updatedAt: '2025-02-02T17:45:00.000Z',
  },
  {
    id: 'seed-grimwold-tech-support',
    slug: 'grimwold-tech-support',
    name: 'Voltaic Support',
    author: 'Tower Team',
    bigIdea: 'A utility-first Grimwold build that leans on his device kit to protect allies and control space.',
    rotation: 'Deploy devices ahead of an engage, then reposition to keep the barrier between allies and threats.',
    tips: 'Placeholder tips.',
    playstyle: 'Support',
    recommendedUse: 'Stay near allies and use devices to shape the fight rather than dealing direct damage.',
    crownItemId: "Grimwold's Oscillating Regeneration Crown",
    amuletItemId: "Grimwold's Voltaic Barrier Amulet",
    weapon1ItemId: "Grimwold's Strange Device",
    weapon2ItemId: "Grimwold's Charged Rings",
    consumableId: 'Healing Ward',
    tags: ['Support', 'Utility', 'Team Play'],
    rating: 4.1,
    ratingCount: 15,
    viewCount: 244,
    commentCount: 3,
    status: 'published',
    createdAt: '2025-01-05T08:00:00.000Z',
    updatedAt: '2025-01-30T12:10:00.000Z',
  },
  {
    id: 'seed-ravah-shadow-pick',
    slug: 'ravah-shadow-pick',
    name: 'Shadowsmoke Pick',
    author: 'Tower Team',
    bigIdea:
      'A pick-oriented Ravah build using Shadowsmoke Crown mobility to isolate a target before the rest of the team arrives.',
    rotation: 'Slip in from an angle with Shadowsmoke, land the pick, then disengage before a response arrives.',
    tips: 'Placeholder tips.',
    playstyle: 'Aggressive',
    recommendedUse: 'Look for isolated targets on the edge of a fight rather than diving the whole group.',
    crownItemId: "Ravah's Shadowsmoke Crown",
    amuletItemId: "Ravah's Stalking Amulet",
    weapon1ItemId: "Ravah's Talonflight Crossbow",
    weapon2ItemId: "Ravah's Ringblade",
    consumableId: 'Health Potion',
    tags: ['Pick', 'Mobility', 'Off-Meta'],
    rating: 4.6,
    ratingCount: 33,
    viewCount: 701,
    commentCount: 9,
    status: 'published',
    createdAt: '2025-01-22T19:00:00.000Z',
    updatedAt: '2025-02-08T11:05:00.000Z',
  },
  {
    id: 'seed-mixed-echo-experiment',
    slug: 'crossover-echo-experiment',
    name: 'Crossover Echo Experiment',
    author: 'Tower Team',
    bigIdea:
      "A theorycraft loadout that deliberately mixes Dahla's mobility crown with Tsu'bo's amulet and a Hollow weapon — demonstrating that Tower builds don't need to stay within a single Eternal's kit.",
    rotation: 'Use Vanish to reposition, then lean on off-Eternal weapon damage rather than a matching Eternal set.',
    tips: 'A great example build for testing cross-Eternal synergy detection — none of these items share a full set here.',
    playstyle: 'Off-Meta',
    recommendedUse: 'Experimentation and theorycrafting rather than competitive play.',
    crownItemId: "Dahla's Vanish Crown",
    amuletItemId: "Tsu'bo's Run Free Amulet",
    weapon1ItemId: "Hollow's Sneklan",
    weapon2ItemId: "Dahla's Throwing Knives",
    consumableId: 'Health Potion',
    tags: ['Off-Meta', 'Beginner Friendly'],
    rating: 3.9,
    ratingCount: 8,
    viewCount: 133,
    commentCount: 2,
    status: 'published',
    createdAt: '2025-02-10T12:00:00.000Z',
    updatedAt: '2025-02-14T08:00:00.000Z',
  },
]
