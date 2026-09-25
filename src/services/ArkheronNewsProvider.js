// ArkheronNewsProvider
//
// The single source of official Arkheron news content, sitting at the very
// bottom of the News pipeline:
//
//   Official Arkheron Website (arkheron.com/en_US/news)
//     -> ArkheronNewsProvider   (this file)
//     -> NewsService
//     -> Tower News UI
//
// IMPORTANT — why this is a static dataset rather than a live fetch:
// arkheron.com does not send CORS headers, so a browser running Tower cannot
// call it directly with `fetch()` (verified: the request is blocked with
// "No 'Access-Control-Allow-Origin' header is present on the requested
// resource"). Standing up a proxy/backend to work around that is explicitly
// out of scope for this prototype (no Express, no backend). Instead, this
// module ships a small, hand-curated set of articles whose facts were
// transcribed directly from the live official pages — nothing here is
// invented or paraphrased into new claims.
//
// Every article keeps a `sourceUrl` pointing at the exact official page it
// came from, so it can always be checked against the original.
//
// The exported shape (`fetchOfficialArticles`) is intentionally async and
// independent of how the data is produced, so a future version of this file
// could replace the static array with a real network call (e.g. through a
// same-origin proxy) without NewsService or the UI needing to change.

const OFFICIAL_SOURCE = 'Official Arkheron'
const OFFICIAL_BASE_URL = 'https://www.arkheron.com/en_US/news'
// Official article hero images are served from the same origin (confirmed via
// each article's og:image meta tag), so they load fine as plain <img> tags —
// only cross-origin `fetch()` calls are blocked by arkheron.com's missing CORS
// headers, not <img> requests.
const OFFICIAL_MEDIA_BASE = 'https://www.arkheron.com'

// `mentions` records Tower database entities an article names explicitly.
// These are plain name strings, not ids — NewsService is responsible for
// resolving each one against the live ArkheronDataService and only keeping
// the ones it can confidently match. Nothing here assumes an id exists.
const ARTICLES = [
  {
    id: '23a-patchnotes',
    slug: '23a_patchnotes',
    title: 'Arkheron 0.23.0a Hotfix — Patch Notes',
    date: '2026-09-21',
    category: 'Hotfix',
    source: OFFICIAL_SOURCE,
    sourceUrl: `${OFFICIAL_BASE_URL}/23a_patchnotes/`,
    heroImage: `${OFFICIAL_MEDIA_BASE}/160850/1789500682-ark_patchreports_0-23-0_16x9-1.jpg?auto=format&fit=max&w=1200`,
    excerpt:
      "A quick hotfix ahead of Crossplay Beta adjusts Rynshi's and Dahla's Eternal abilities, reworks Bashing Shield's Block & Bash, and fixes chat and teleport-exploit bugs.",
    videoUrl: null,
    content: [
      { type: 'paragraph', text: 'We deployed a quick Hotfix for Patch 0.23.0 ahead of Crossplay Beta. Here is everything that changed.' },
      { type: 'heading', text: 'Eternal Ability Adjustments' },
      {
        type: 'list',
        items: [
          "Steadfast and cooldown reduction are removed from Rynshi's Eternal ability, Rampage. Movement speed duration is reduced from 6 seconds to 5 seconds.",
          "Stun from Dahla's Eternal ability, Curtain Call, is reduced from 1.5 seconds to 1 second.",
        ],
      },
      { type: 'heading', text: 'Item Changes' },
      {
        type: 'list',
        items: [
          'The Arrival banner has been removed from the frame collection.',
          "Bashing Shield's secondary attack (Block & Bash) durability now ignores the blocker's damage reduction, and no longer benefits from damage reduction from Set Bonuses or becoming Empowered.",
          "Bashing Shield's secondary attack (Block & Bash) now only blocks from the front.",
        ],
      },
      { type: 'heading', text: 'Bug Fixes' },
      {
        type: 'list',
        items: [
          'Fixed a bug where text chat was disappearing between matches.',
          'Fixed a bug where text chat would break when you requeue for a game mode.',
          'Fixed a bug where players could use teleport abilities between Spires rounds to jump over the arena wall during the countdown.',
        ],
      },
    ],
    mentions: [
      { type: 'eternal', name: 'Rynshi' },
      { type: 'eternal', name: 'Dahla' },
      { type: 'item', name: 'Bashing Shield' },
    ],
  },
  {
    id: 'crossplay-beta-announced',
    slug: 'crossplay_beta',
    title: 'Crossplay Beta Announced at Gamescom',
    date: '2026-08-27',
    category: 'Announcement',
    source: OFFICIAL_SOURCE,
    sourceUrl: `${OFFICIAL_BASE_URL}/crossplay_beta/`,
    heroImage: `${OFFICIAL_MEDIA_BASE}/160850/1787842167-image-68.png?auto=format&fit=max&w=1200`,
    excerpt:
      "Arkheron's Crossplay Beta Test was announced live at Gamescom — cross-platform play across Xbox, PlayStation, and PC begins September 25.",
    videoUrl: null,
    content: [
      {
        type: 'paragraph',
        text: "Arkheron's Crossplay Beta Test was announced at Gamescom. Starting September 25, you'll be able to play cross-platform on Xbox, PlayStation, and PC — jumping into Spires, Ascension, and more.",
      },
      {
        type: 'paragraph',
        text: "During the broadcast, Co-Founder Min Kim, Game Director Jeremy Craig, and Sr. Character Artist Elliot Betancourt talked through Arkheron's combat and how console controls are tailored to the game's fast-paced gameplay. A new trailer was also revealed.",
      },
      {
        type: 'paragraph',
        text: 'Players who joined Closed Beta should look out for an invite to Crossplay Beta. New players can join the waitlist to be considered for an invite, and accepted players receive extra invites to bring friends along.',
      },
      { type: 'heading', text: 'FAQ' },
      {
        type: 'list',
        items: [
          'How do I sign up? — Join the waitlist from the official Arkheron website.',
          "How do I get access? — Invites go out in waves after signup; you'll get an email when yours is ready and can then choose your platform.",
          "Why can't I pick my platform when I sign up? — Platform keys are assigned once an invite is accepted, so the correct platform and region key can be matched.",
          'Do I need to connect my Steam/Xbox/PlayStation account? — Yes, to confirm platform choice and store region (important for region-locked PlayStation keys) and to prevent key farming.',
          'Can I invite friends? — Yes, accepted players receive additional invites to send to friends.',
          'Is this beta under NDA? — No, players are encouraged to share footage and gameplay from the playtest.',
        ],
      },
    ],
    mentions: [],
  },
  {
    id: 'twia-sept21-crossplay-beta',
    slug: 'twia_sept21',
    title: 'Arkheron Crossplay Beta — Everything You Need to Know',
    date: '2026-09-21',
    category: 'Events',
    source: OFFICIAL_SOURCE,
    sourceUrl: `${OFFICIAL_BASE_URL}/twia_sept21/`,
    heroImage: `${OFFICIAL_MEDIA_BASE}/160850/1790041457-ark_social_community_banner_twiacrossplaybeta_1920x1080.png?auto=format&fit=max&w=1200`,
    excerpt:
      "This week's rundown: a Hotfix for Patch 0.23.0, a Tower Hour reveal of the Crossplay trailer, and everything you need to know about the September 25–27 Crossplay Beta weekend.",
    videoUrl: 'https://youtu.be/xvMOGLJBbYQ',
    content: [
      {
        type: 'paragraph',
        text: "Crossplay Beta is almost here. Before the gates open, here's what's happening this week in Arkheron.",
      },
      { type: 'heading', text: 'This Week' },
      {
        type: 'list',
        items: [
          'Monday, September 21 — A Hotfix for Patch 0.23.0 deployed ahead of Crossplay Beta.',
          'Tuesday, September 22 — Tower Hour livestream at 7pm PST on YouTube. The dev team breaks down Crossplay Beta and reveals the new Crossplay trailer.',
          'Friday, September 25 – Sunday, September 27 — Crossplay Beta is live all weekend.',
        ],
      },
      { type: 'heading', text: 'Beta Dates' },
      {
        type: 'paragraph',
        text: 'Crossplay Beta runs Friday, September 25 through Sunday, September 27, ending at 11:59pm PDT on Sunday across all regions.',
      },
      { type: 'heading', text: 'Regional Times' },
      {
        type: 'list',
        items: [
          'Europe: 5:00pm BST | 6:00pm CEST',
          'South America: 5:00pm AST | 6:00pm BRT',
          'North America: 3:00pm PDT | 6:00pm EDT',
        ],
      },
      { type: 'heading', text: 'How It Works' },
      {
        type: 'paragraph',
        text: 'Endless Spires runs 24 hours a day for the duration of the Crossplay window. Ascension opens every night for a minimum of three hours, with queues staying open and rolling as long as players are online and ready to climb.',
      },
      { type: 'heading', text: 'Ascension Windows' },
      {
        type: 'list',
        items: [
          'Europe: 6:00pm BST | 7:00pm CEST',
          'South America: 7:00pm AST | 8:00pm BRT',
          'North America: 4:00pm PDT | 7:00pm EDT',
        ],
      },
      {
        type: 'paragraph',
        text: 'This Crossplay Beta runs in Europe, South America, and North America so the team can stay online and fix issues while queues are live. Players in other regions can switch their queue to a participating region and still log in to claim beta rewards.',
      },
      { type: 'heading', text: 'Rewards' },
      {
        type: 'paragraph',
        text: 'Rewards are planned for the Crossplay Beta weekend — full details were saved for the Tower Hour reveal.',
      },
      { type: 'heading', text: 'Get Involved' },
      {
        type: 'paragraph',
        text: 'Share your best plays and clips on Discord this weekend, or tag @playarkheron on socials for a chance to be featured.',
      },
    ],
    mentions: [],
  },
  {
    id: 'towerhour-recap-sept23',
    slug: 'towerhour_recap_sept23',
    title: 'Tower Hour Recap: Crossplay Takeover',
    date: '2026-09-23',
    category: 'Tower Hour',
    source: OFFICIAL_SOURCE,
    sourceUrl: `${OFFICIAL_BASE_URL}/towerhour_recap_sept23/`,
    heroImage: `${OFFICIAL_MEDIA_BASE}/160850/1787783743-ark_social_community_banner_towerhour-1920x1080.png?auto=format&fit=max&w=1200`,
    excerpt:
      'A recap of the Tower Hour livestream covering the Crossplay Beta reveal, the new build, and why console support matters for Arkheron.',
    videoUrl: 'https://youtu.be/xvMOGLJBbYQ',
    content: [
      {
        type: 'paragraph',
        text: 'Tower Hour was focused entirely on Crossplay Beta and the new build, featuring familiar and new faces from the dev team.',
      },
      {
        type: 'paragraph',
        text: 'After a community round-up and a reveal of the new Crossplay trailer, the stream covered what the Crossplay Beta weekend entails, what to expect in the new build, and why console support is such an important addition to the Arkheron experience.',
      },
      { type: 'paragraph', text: 'Watch the full recording above if you missed the live stream.' },
    ],
    mentions: [],
  },  {
    "id": "23-patchnotes",
    "slug": "23_patchnotes",
    "title": "0.23.0 Patch Notes",
    "date": "2026-09-15",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/23_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1789500682-ark_patchreports_0-23-0_16x9-1.jpg?auto=format&fit=max&w=1200",
    "excerpt": "The 0.23 build prepares Arkheron for Crossplay Beta with a reworked new-player experience, Spires economy changes, Bot Spires, combat updates, and performance improvements.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The 0.23 build includes fixes and improvements based on player feedback and will be playable during Crossplay Beta."
      },
      {
        "type": "heading",
        "text": "Eternal Rotation"
      },
      {
        "type": "list",
        "items": [
          "Tsu’bo is inactive.",
          "Irenna is active."
        ]
      },
      {
        "type": "heading",
        "text": "New Player Experience"
      },
      {
        "type": "list",
        "items": [
          "The tutorial adds checklists, reminders, locked progression doors, checkpoint respawns, more enemy types, and environmental variations.",
          "Learning Spires now has 5 floors; bot difficulty ramps across floors and an endless bot run follows completion."
        ]
      },
      {
        "type": "heading",
        "text": "Spires and Combat"
      },
      {
        "type": "list",
        "items": [
          "Eternal items start at 150 Fragments; later purchases increase by 50, Level 2 costs 300 and Level 3 costs 500.",
          "Endless Spires economy resets every 20 floors.",
          "Bot Spires is an endless bot mode with a store reset each round, no Pages, 5,000 starting essence, and same-loadout continuation.",
          "Refill Consumables was added as an Anchor Ability; evade recharge is 5 seconds; lob projectiles can no longer be reflected."
        ]
      },
      {
        "type": "heading",
        "text": "Performance"
      },
      {
        "type": "list",
        "items": [
          "Updates include PS5 and DX12 stability, AMD crash investigation, Adaptive VSync on Xbox and PS5, shader/material warmup, line-of-sight rendering, audio loading, texture streaming, and shadow improvements."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Tsu’bo"
      },
      {
        "type": "eternal",
        "name": "Irenna"
      },
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Karriv"
      }
    ]
  },
  {
    "id": "23-bugfixes",
    "slug": "23_bugfixes",
    "title": "0.23.0 Bug Fixes",
    "date": "2026-09-15",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/23_bugfixes/",
    "heroImage": "https://www.arkheron.com/160850/1789526934-ark_social_community_bugfix-23_banner-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The 0.23.0 bug-fix update addresses a client crash, custom-lobby relaunch behavior, and Spires face-off screen visuals.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed a client crash during Spires matches.",
          "Fixed relaunching in a custom lobby returning players before loading finished.",
          "Fixed environmental background art issues on Spires face-off screens.",
          "Fixed arena-specific backgrounds missing from console face-off screens."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "twia-september14",
    "slug": "twia_september14",
    "title": "September 14 - 20",
    "date": "2026-09-14",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/twia_september14/",
    "heroImage": "https://www.arkheron.com/160850/1787619357-ark_social_community_banner_twia-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The week includes the 0.23 patch, custom Ascension matches, and the final Endless Spires tech test before Crossplay Beta.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "September 15: 0.23 patch notes go live for the Crossplay Beta build, including a new-player rework, Spires economy changes, Bot Spires, and performance fixes.",
          "September 17: Game Director Jeremy “SunsetLion” hosts custom Ascension matches in North America and Europe.",
          "September 18–19: the final limited Endless Spires tech test runs in North America and Europe before September 25 Crossplay Beta."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "september9",
    "slug": "september9",
    "title": "September 7 - 11",
    "date": "2026-09-09",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/september9/",
    "heroImage": "https://www.arkheron.com/160850/1787619357-ark_social_community_banner_twia-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "Tower Hour returns and Endless Spires runs September 11–12, with testing focused on North America and Europe.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "September 8 Tower Hour recaps Gamescom, the .22 Tech Test, and community updates.",
          "September 11–12 Endless Spires returns as a 3v3 mode with no floor limit.",
          "Testing focuses on performance and stability, including issues affecting some AMD cards; Bots and Custom Games remain available."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "september1",
    "slug": "september1",
    "title": "August 31 - September 5",
    "date": "2026-08-31",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/september1/",
    "heroImage": "https://www.arkheron.com/160850/1787619357-ark_social_community_banner_twia-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "Endless Spires tech tests continue September 4–5, focused on North America and Europe ahead of Crossplay Beta.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Endless Spires is a 3v3 arena mode with no floor cap.",
          "Tests continue every weekend until Crossplay Beta and are limited to North America and Europe because other regions did not reach the desired matchmaking population threshold.",
          "Asia-Pacific and South America may change region or use Bots and Custom Games."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "towerhour25-recap",
    "slug": "towerhour25_recap",
    "title": "Tower Hour Recap",
    "date": "2026-08-26",
    "category": "Tower Hour",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/towerhour25_recap/",
    "heroImage": "https://www.arkheron.com/160850/1787783743-ark_social_community_banner_towerhour-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "Tower Hour covered a community roundup, development priorities, Gamescom news, and lessons from Closed Beta and upcoming tech tests.",
    "videoUrl": "https://www.youtube.com/watch?v=91gTI8zu9o0",
    "content": [
      {
        "type": "paragraph",
        "text": "The broadcast covered player pets and tier lists, custom-game highlights, Arkheron’s Xbox Showcase inclusion, the Development Priorities post, Closed Beta lessons, and a performance, stability, and combat-focused tech test."
      }
    ],
    "mentions": []
  },
  {
    "id": "22-patchnotes",
    "slug": "22_patchnotes",
    "title": "Arkheron 0.22.0 Patch Notes",
    "date": "2026-08-25",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/22_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1787683912-ark_social_community_banner-1920x1080-1.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.22 adds ranked and Spires improvements, UI, audio, accessibility, customization, and Eternal updates based on Closed Beta feedback.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Irenna is inactive and Ravah is active.",
          "Karriv, Penelope, Tsu’bo, Dahla, Rynshi, Ravah, Edani, and Hollow receive item, animation, visual, or texture updates.",
          "Major Eliminations add +2 personal Ascension Rating; ranked tracker, placement, and UI issues are fixed.",
          "Spires gains store, loadout, Pages, reset-run, Endless Spire, roster-refund, audio, and music improvements.",
          "Ascension gains an Abyss-collapse warning, clearer Line of Sight, and more prominent enemy footsteps.",
          "Oracle laser range increases to 12m from 10m; settings, subtitles, comms wheel, audio, and customization are updated."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Karriv"
      },
      {
        "type": "eternal",
        "name": "Penelope"
      },
      {
        "type": "eternal",
        "name": "Tsu’bo"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Edani"
      },
      {
        "type": "eternal",
        "name": "Hollow"
      }
    ]
  },
  {
    "id": "development-priorities",
    "slug": "development_priorities",
    "title": "The Road Ahead: Development Priorities",
    "date": "2026-08-25",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/development_priorities/",
    "heroImage": "https://www.arkheron.com/160850/1787695065-ark_social_community_banner_devpriorities-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The development team outlines priorities for stability, team coordination, the new-player experience, Spires, combat, and progression.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Key Focus Areas"
      },
      {
        "type": "list",
        "items": [
          "Stability work targets crashes, especially for AMD cards, with additional logging.",
          "Team coordination work improves voice chat, the comms wheel, and leaver notifications.",
          "The new-player experience, Spires, combat input and readability, and progression systems are being refined."
        ]
      },
      {
        "type": "heading",
        "text": "Shipping Soon"
      },
      {
        "type": "list",
        "items": [
          "Ranked Ascension tests, Endless Spires, communication clarity, improved leaver notifications, and crash tracking."
        ]
      },
      {
        "type": "heading",
        "text": "Common Questions"
      },
      {
        "type": "list",
        "items": [
          "Multiple Eternal Item Sets are in development.",
          "A PvE-only mode is not currently planned; the current plan is pay-to-play.",
          "The current launch plan is before the end of 2026, without a set date."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "august24-events",
    "slug": "august24_events",
    "title": "This Week in Arkheron - August 24 - 30",
    "date": "2026-08-24",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/august24_events/",
    "heroImage": "https://www.arkheron.com/160850/1787619357-ark_social_community_banner_twia-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The week features the 0.22 patch, a Development Priorities roadmap, Gamescom’s Xbox Showcase, and a limited Endless Spires tech test.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "August 25: Development Priorities and 0.22 Patch Notes publish, followed by a 7pm PT Tower Hour.",
          "August 26: patch 0.22 drops on Steam. August 27: Arkheron joins the Xbox Gamescom Showcase.",
          "August 28–29: Endless Spires runs as a limited 3v3 tech test with no floor limit, focused on performance and stability."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "august18-events",
    "slug": "august18_events",
    "title": "This Week in Arkheron - August 17 - 23",
    "date": "2026-08-18",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/august18_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "There is no weekend playtest while the team works through solo-queue Ranked feedback and prepares for Gamescom.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "The team thanked players for testing solo-queue Ranked Ascension and described long queues, unbalanced teams, and bugs.",
          "No weekend playtest is scheduled while Ranked feedback is reviewed and Gamescom is prepared.",
          "Work continues on 0.22; Customs, Bots, and Learning Spires remain available."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "ranked-faq",
    "slug": "ranked_faq",
    "title": "Ranked FAQ",
    "date": "2026-08-13",
    "category": "News",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/ranked_faq/",
    "heroImage": "https://www.arkheron.com/160850/1786755619-ark_social_community_banner_rankedfaq_1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The Ranked FAQ explains the limited 0.21 test, solo queue rules, ranks, Ascension Rating, entry costs, scoring, and known issues.",
    "videoUrl": "https://www.youtube.com/watch?v=jRRl86dDVa4",
    "content": [
      {
        "type": "list",
        "items": [
          "The limited Ranked Progression System runs on build 0.21 during scheduled Friday and Saturday windows; the first test is solo queue only.",
          "Players complete five matches before placement. Six divisions run from Iron through Titanium, each with III, II, and I subdivisions.",
          "Entry costs are -75 AR Favored, -50 Balanced, and -25 Underdog. Shared eliminations award +5 AR, Floor Ascension +25, and Victory +20; the first two are capped at 50 AR per match.",
          "Known issues include AR display, placement counters, rank-decay warnings, and Challenge Rift timing; ranked tracker, placement, and UI fixes are documented."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "ranked-playtest",
    "slug": "ranked_playtest",
    "title": "Limited Ranked Test",
    "date": "2026-08-12",
    "category": "News",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/ranked_playtest/",
    "heroImage": "https://www.arkheron.com/160850/1786755547-ark_social_community_banner_rankedplaytestthisweekend_1920x1080-1.png?auto=format&fit=max&w=1200",
    "excerpt": "A limited Ranked Mode test adds solo-queue Ranked Ascension to weekend playtests and explains Ascension Rating, classifications, entry costs, and known issues.",
    "videoUrl": "https://www.youtube.com/watch?v=jRRl86dDVa4",
    "content": [
      {
        "type": "list",
        "items": [
          "Ranked Ascension queues open Friday and Saturday at region-specific times; players are asked to solo queue.",
          "Five matches establish starting position; teams are Favoured, Balanced, or Underdog based on expected win odds and pay different AR entry costs.",
          "Placement counts may differ between client and end-of-game screen; AR breakdown and promotion/demotion feedback were planned for 0.22.",
          "Matchmaking uses a wider skill band and high-MMR players may wait longer."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "fanart-winners",
    "slug": "fanart_winners",
    "title": "Arkheron Fan Art Competition Results",
    "date": "2026-08-10",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fanart_winners/",
    "heroImage": "https://www.arkheron.com/160850/1786392857-ark_social_community_banner_fanartcompetitionwinners-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The first Arkheron Fan Art Competition results recognize winners in Premium Art and MS Paint categories, plus a community-selected Fan Favorite.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Premium Art: first Hollow’s Darkling Staff by ricklesauceur; second Dahla Art Nouveau by Sineater; third Beacon Fight 3D by Jacsad; fourth Edani by Anil3000; fifth Eternal Movie Cover Vibe by Bondsmith.",
          "MS Paint: first Character Select Screen by GH057ayame; second Charon Cup by ItanoCircus; third Nyquist Incident by Bolbi; fourth Hollow Commissioner by wire; fifth Rift Cup by Jacsad.",
          "Fan Favorite was Sineater’s Dahla Art Nouveau artwork."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Hollow"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Edani"
      }
    ]
  },
  {
    "id": "august10-events",
    "slug": "august10_events",
    "title": "This Week in Arkheron - August 10 - 16",
    "date": "2026-08-10",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/august10_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Weekly playtests return with Spires and Ascension queues, a Tower Hour, and updates to Closed Beta Collection progression.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Unspent Closed Beta Pages can still unlock Collection items and Book Rewards; Prestige Items remain permanently owned while other cosmetics will reset later.",
          "Thursday has Spires; Friday and Saturday have Spires and solo-queue Ranked Ascension; Sunday has Spires and unranked Ascension with premades.",
          "Regional uptimes are listed for Asia, Europe, South America, and North America."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Rynshi"
      }
    ]
  },
  {
    "id": "21g-patch",
    "slug": "21g_patch",
    "title": "Arkheron 0.21.0g (Hotfix) Patch Notes",
    "date": "2026-08-05",
    "category": "Hotfix",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/21g_patch/",
    "heroImage": "https://www.arkheron.com/160850/1785956846-patch_21g.png?auto=format&fit=max&w=1200",
    "excerpt": "Hotfix 0.21.0g fixes Custom Game voice and text channels failing to reconnect after Custom Ascension matches.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Fixed Custom Game voice and text channels not reconnecting after a Custom Ascension match ended and players returned to the main menu.",
          "The same issue could still occur after Custom Spires matches while a fix was in progress."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "aug3-events",
    "slug": "aug3_events",
    "title": "This Week in Arkheron - August 3 - 9",
    "date": "2026-08-03",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/aug3_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The team pauses Playtest servers to review Closed Beta learnings while keeping tutorial, bot, Learning Spires, and Custom Games available.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "A Closed Beta Community Achievements video highlights Pages Gathered, Executes, community clips, and gameplay data.",
          "The Fan Art Competition accepts submissions until August 5 at 1PM PT and highlights Hollow’s Darkling Staff by ricklesauceur.",
          "No Playtest servers are active this week; Weekly Playtests resume the following week and Tower Hour is planned for August 11.",
          "Tutorial, Bot Games, Learning Spires, and Custom Games remain available."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Hollow"
      }
    ]
  },
  {
    "id": "21f-patchnotes",
    "slug": "21f_patchnotes",
    "title": "Arkheron 0.21.0f (Hotfix) Patch Notes",
    "date": "2026-07-29",
    "category": "Hotfix",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/21f_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1785364085-21f_patchnotes_cover.png?auto=format&fit=max&w=1200",
    "excerpt": "Hotfix 0.21.0f fixes the Custom Spires store loot pool, comma-decimal sensitivity behavior, and start-of-match stuttering.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Fixed the Custom Spires store showing an incorrect loot pool mid-match.",
          "Fixed incorrect sensitivity settings making menu selection difficult in languages using comma-decimal notation.",
          "Fixed players and enemies stuttering at the start of a match."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "closedbeta-encore",
    "slug": "closedbeta_encore",
    "title": "Arkheron Closed Beta Encore",
    "date": "2026-07-28",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closedbeta_encore/",
    "heroImage": "https://www.arkheron.com/160850/1785287087-encore_cover.png?auto=format&fit=max&w=1200",
    "excerpt": "A Closed Beta Encore runs July 30–August 2 with evening Spires and Ascension windows, Steam access for all, and extended Collection progress.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "The Closed Beta Encore runs July 30–August 2 and preserves Collection progress.",
          "The Steam test opens to everyone through Request Access on the Arkheron Steam Store page.",
          "Custom Games, Bots, the Tutorial, and Learning Spires remain available 24/7 outside server windows.",
          "The Collection remains available longer for Pages and Prestige Track items; about 1% of the total Closed Beta playerbase claimed all three Prestige Items, which remain forever."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "july28-events",
    "slug": "july28_events",
    "title": "This Week in Arkheron - July 27 - August 2",
    "date": "2026-07-28",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/july28_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The week announces the Closed Beta Encore, an extended Fan Art Competition, Tower Hour, and regional Encore queue windows.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Limited Spires and Ascension queues return July 30–August 2, and the Closed Beta Collection remains open longer.",
          "July 28 Tower Hour includes Community Roundup coverage of Charon Cup #2 and the Irenna Cup, followed by post-Closed Beta highlights.",
          "The Fan Art Competition remains open until August 5 at 1PM PT; regional Encore windows are listed for Europe, South America, and North America."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Hollow"
      }
    ]
  },
  {
    "id": "closedbeta-end",
    "slug": "closedbeta_end",
    "title": "Closed Beta: Thank you! What's Next?",
    "date": "2026-07-26",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closedbeta_end/",
    "heroImage": "https://www.arkheron.com/160850/1784941579-ark_social_community_banner_tywn-800x450.png?auto=format&fit=max&w=1200",
    "excerpt": "The Closed Beta concludes overnight July 26–27, followed by weekly playtests, a returning Tower Hour, and a thank-you to participants.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Queues close overnight: Europe 8AM July 27 CEST; South America 3AM BRT/ADT; North America midnight PT; Asia/Pacific 3PM KRT/JPT.",
          "Weekly playtest nights return the following week, Thursday through Saturday, and Tower Hour returns Tuesday for a wrap-up and Q&A.",
          "The test evaluated performance across more PCs, the new-player learning curve, and the first Xbox test."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "closedbeta-changes",
    "slug": "closedbeta_changes",
    "title": "More Ascension Times, Eternal Rotation and Extra Spires Levels!",
    "date": "2026-07-23",
    "category": "Updates",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closedbeta_changes/",
    "heroImage": "https://www.arkheron.com/160850/1784830410-ark_social_community_banner-800x450.png?auto=format&fit=max&w=1200",
    "excerpt": "Closed Beta adds an Ascension day, five Spires floors, and a new Eternal Item Set rotation before ending at midnight PT July 27.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Europe, South America, and North America receive Friday–Sunday Ascension windows July 24–26; Asia/Pacific receives July 25–26 windows.",
          "Leodin and Ravah leave the rotation; Grimwold and Tsu’bo return.",
          "Spires expands from Floor 5 to Floor 10. Pages per floor are 50, 75, 100, 125, 150, 175, 200, 225, 250, and 500, totaling 1,850 pages.",
          "Xbox Presence, matchmaking-region persistence, and regional queue refresh behavior are fixed or updated."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Leodin"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Tsu’bo"
      }
    ]
  },
  {
    "id": "july20-events",
    "slug": "july20_events",
    "title": "This Week in Arkheron - July 20 - 26",
    "date": "2026-07-20",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/july20_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Closed Beta enters its second week with an extended Fan Art Competition, community feedback activities, custom games, Ascension queues, and the Irenna Cup.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "The Fan Art Competition deadline moves to August 5 at 1PM PT and players are encouraged to share feedback in the forums.",
          "Bonfire-hosted Custom Ascension Games run July 21; the Reset Crown Community Mini Challenge runs July 23–26.",
          "The article lists regional Ascension windows July 24–26 and announces the Irenna Cup, a pick/ban double-elimination tournament with individual signups and MMR-balanced teams.",
          "Closed Beta queues close at midnight PT July 27."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "ascension-returns",
    "slug": "ascension_returns",
    "title": "Ascension Returns Each Weekend during Closed Beta!",
    "date": "2026-07-17",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/ascension_returns/",
    "heroImage": "https://www.arkheron.com/160850/1784128033-ark_social_community_banner_closedbetaisherev2-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "Ascension, a 45-player last-team-standing mode, returns during selected Closed Beta windows on July 17–20 and July 24–26.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Ascension weekend events run during listed regional windows while Spires, Custom Games, and training remain available at other times."
      },
      {
        "type": "list",
        "items": [
          "Europe, South America, and North America have windows on July 17, 18, 24, and 25.",
          "Asia/Pacific has windows on July 18, 19, 20, 25, and 26."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "21b-patchnotes",
    "slug": "21b_patchnotes",
    "title": "Arkheron 0.21.0b (Hotfix) Patch Notes",
    "date": "2026-07-17",
    "category": "Hotfix",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/21b_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1784331243-21-9_patchnotes_cover.png?auto=format&fit=max&w=1200",
    "excerpt": "Hotfix 0.21.0b fixes queue availability and matchmaking UI issues, Spires gear carryover, and localization coverage.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Fixed queues appearing unavailable at launch; a dimmed Start button remains functional.",
          "Fixed the matchmaking view and Start button disappearing for some players.",
          "Fixed gear carrying over from previous Spires games.",
          "Added localization and fixed existing localization issues."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "closedbeta-start",
    "slug": "closedbeta_start",
    "title": "Arkheron's Closed Beta Starts Today",
    "date": "2026-07-15",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closedbeta_start/",
    "heroImage": "https://www.arkheron.com/160850/1784128049-ark_social_community_banner_closedbetaisherev2-800x450.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron Closed Beta runs July 15-26 with Spires as the primary queue and Ascension in dedicated regional weekend windows. Invites are sent in waves, and players can earn Pages and permanent Book Rewards collectibles.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Closed Beta runs from July 15 through July 26. The test includes updates to gameplay clarity, UI, performance, a new game mode, and the first test of cosmetic progression."
      },
      {
        "type": "heading",
        "text": "Start Times by Region"
      },
      {
        "type": "list",
        "items": [
          "Europe: July 15 at 6PM BST / 7PM CEST",
          "South America: July 15 at 6PM BRT and ADT",
          "North America: July 15 at 4PM PDT / 7PM EDT",
          "Asia / Pacific: July 16 at 10AM JST and KST"
        ]
      },
      {
        "type": "paragraph",
        "text": "Spires is initially available as the 3v3 queue. Ascension, the 15-team mode, runs during dedicated weekend windows."
      },
      {
        "type": "heading",
        "text": "How to Get Access"
      },
      {
        "type": "list",
        "items": [
          "Existing FirstLook or Steam signups may receive invites during the test.",
          "Each invited player automatically receives three additional Steam friend keys.",
          "New players can request access on the Arkheron website.",
          "Weekly playtesters receive the Closed Beta through the Arkheron Playtest Steam app."
        ]
      },
      {
        "type": "heading",
        "text": "What's New to Check Out?"
      },
      {
        "type": "list",
        "items": [
          "Spires is a 3v3 fight-to-the-death mode with customizable builds.",
          "Players earn Pages and unlock items in the Closed Beta cosmetic collection.",
          "Collection progress resets after the test, while Book Rewards grant a permanent title, banner, and skin."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "cosmetic-collection",
    "slug": "cosmetic_collection",
    "title": "Arkheron's Cosmetic Collection System",
    "date": "2026-07-15",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/cosmetic_collection/",
    "heroImage": "https://www.arkheron.com/160850/1784138777-ark_social_community_banner_cosmeticcollectionsystem-800x450.png?auto=format&fit=max&w=1200",
    "excerpt": "The Closed Beta tests a cosmetic collection system where matches earn Pages used to unlock items in a Book. Most collection progress resets, while Book Rewards are permanent.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Cosmetics include skins, emotes, executes, anchors, titles, and banners. They are intended to let players express themselves and explore the stories of Arkheron echoes."
      },
      {
        "type": "heading",
        "text": "Closed Beta Collection"
      },
      {
        "type": "paragraph",
        "text": "Every match earns Pages that unlock collection items in the Book. The collection contains up to 25 cosmetics, plus a title, banner, and skin on the exclusive Book Rewards track. Book Rewards are permanent in Closed Beta; other cosmetics reset after the test."
      },
      {
        "type": "heading",
        "text": "How to Earn Pages"
      },
      {
        "type": "list",
        "items": [
          "Spires awards Pages at checkpoints and a shared pool of 20 Pages per kill, split by damage share.",
          "Spires checkpoint rewards are Floor 1: 50, Floor 2: 75, Floor 3: 100, Floor 4: 125, and Floor 5: 300.",
          "Ascension awards Pages for kills, chests, quests, and Tormentors, with floor, Challenge Rift, and match-win multipliers.",
          "Custom Games, Tutorials, Learning Spires, Bot matches, and Training do not grant Pages."
        ]
      },
      {
        "type": "heading",
        "text": "Book Reward Milestones"
      },
      {
        "type": "list",
        "items": [
          "2 items unlocked: exclusive Title",
          "5 items unlocked: exclusive Banner",
          "10 items unlocked: exclusive Rare Skin"
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "21a-patchnotes",
    "slug": "21a_patchnotes",
    "title": "Arkheron 0.21.0a (Hotfix)",
    "date": "2026-07-15",
    "category": "Hotfix",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/21a_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1784161646-21-7_hotfix_cover.png",
    "excerpt": "This hotfix addresses account-link login errors, inactivity logout, Custom Games item state, missing Spires items, and mouse camera controls on comma-decimal locales.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Update 0.21.0a is a quick hotfix deployed during Closed Beta."
      },
      {
        "type": "heading",
        "text": "FTUF"
      },
      {
        "type": "list",
        "items": [
          "Fixed a false “Unable to Login” error after a slow account link.",
          "Fixed inactivity triggering auth logout while the user was still on-screen."
        ]
      },
      {
        "type": "heading",
        "text": "Custom Games"
      },
      {
        "type": "list",
        "items": [
          "Fixed item costs carrying over instead of resetting for the next Custom Game match.",
          "Fixed players who had entered a Custom Game appearing in Spires with no items."
        ]
      },
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed mouse camera controls stopping on comma-decimal locales."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "21-patchnotes",
    "slug": "21_patchnotes",
    "title": "Arkheron 0.21.0 Patch Notes",
    "date": "2026-07-14",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/21_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1784055156-ark_21_patchnote_cover.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.21 is the Closed Beta build and includes new-player Learning Spires, combat and UI changes, cosmetic progression, and broad balance and bug fixes.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Patch 0.21 is playable during the July 15-26 Closed Beta. Spires is the primary queue and Ascension runs during regional windows."
      },
      {
        "type": "heading",
        "text": "Closed Beta Features"
      },
      {
        "type": "list",
        "items": [
          "Learning Spires introduces new players to items and Eternals against bots in a shorter version of Spires.",
          "The cosmetic progression test lets players earn Pages and unlock collection rewards.",
          "Account data and MMR reset as the game moves from the testing environment to production."
        ]
      },
      {
        "type": "heading",
        "text": "Gameplay and Systems"
      },
      {
        "type": "list",
        "items": [
          "Spires is a 3v3 best-of-three mode focused on builds and combat.",
          "Ascension is available in scheduled regional windows during Closed Beta.",
          "Bots, matchmaking, regional support, performance, UI, and gameplay clarity received updates."
        ]
      },
      {
        "type": "paragraph",
        "text": "The article also documents balance changes, bug fixes, and improvements to the Closed Beta build."
      }
    ],
    "mentions": []
  },
  {
    "id": "closedbeta-tech",
    "slug": "closedbeta_tech",
    "title": "Arkheron Closed Beta - Tech Details",
    "date": "2026-07-13",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closedbeta_tech/",
    "heroImage": "https://www.arkheron.com/160850/1783968663-ark_social_community_banner_closedbetatechdetail-1920x1080.png?auto=format&fit=max&w=1200",
    "excerpt": "The technical guide explains Closed Beta queues, regional scheduling, matchmaking calibration, bot opponents, and performance expectations.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Closed Beta Start Times"
      },
      {
        "type": "paragraph",
        "text": "Spires is available most of the time, while Ascension replaces it during scheduled regional windows. Tutorial, Training, Bot-Ascension, and Custom Games are available at any time."
      },
      {
        "type": "list",
        "items": [
          "Europe: July 15 at 6PM BST / 7PM CEST / 5PM UTC",
          "South America: July 15 at 6PM BRT / 6PM ADT / 9PM UTC",
          "North America: July 15 at 4PM PDT / 7PM EDT / 11PM UTC",
          "Asia / Pacific: July 16 at 10AM JST and KST / 1AM UTC"
        ]
      },
      {
        "type": "heading",
        "text": "Matchmaking, Regions, and Bots"
      },
      {
        "type": "paragraph",
        "text": "All accounts start with calibrating MMR. Arkheron uses narrow skill bands and may wait rather than force a poor match. Four base regions are supported: North America, South America, Europe, and Asia/Pacific. Bots help with learning, matchmaking, and early Ascension matches; they have MMR and multiple difficulty levels."
      },
      {
        "type": "heading",
        "text": "Performance"
      },
      {
        "type": "paragraph",
        "text": "Minimum and recommended specifications were updated after Steam Next Fest. The team says performance work continues and asks players to share feedback."
      }
    ],
    "mentions": []
  },
  {
    "id": "july13-events",
    "slug": "july13_events",
    "title": "This Week in Arkheron - July 13-18",
    "date": "2026-07-13",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/july13_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "This week includes the Closed Beta launch, Tower Hour, a Dodges & Jukes mini challenge, regional Ascension windows, and Charon Cup #2.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Closed Beta Arrives This Week"
      },
      {
        "type": "paragraph",
        "text": "Closed Beta begins Wednesday, July 15. The week also includes a Fan Art Competition, updated PC specs, and a behind-the-scenes PC Gamer documentary."
      },
      {
        "type": "list",
        "items": [
          "July 15: Tower Hour moves to 9AM PT, followed by the Closed Beta launch.",
          "July 16: The Dodges & Jukes Community Mini Challenge runs from 10AM PT July 16 through 10AM PT July 20.",
          "July 17-18: Europe, South America, and North America have scheduled Ascension queue windows.",
          "July 18: Asia / Pacific has an Ascension window and Charon Cup #2 is hosted by ItanoCircus."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "closed-beta-announcement",
    "slug": "closed-beta-announcement",
    "title": "Closed Beta is Live - Everything You Need to Know",
    "date": "2026-07-08",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/closed-beta-announcement/",
    "heroImage": "https://www.arkheron.com/160850/1784128049-ark_social_community_banner_closedbetaisherev2-800x450.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron Closed Beta runs July 15-26 with 24/7 queues, Spires as the primary mode, and Ascension in region-specific windows.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The two-week Closed Beta tests updates made after Steam Next Fest with a larger player group. Spires is the primary queue and Ascension runs Friday through Sunday according to region."
      },
      {
        "type": "heading",
        "text": "Access and Schedule"
      },
      {
        "type": "list",
        "items": [
          "Steam and FirstLook waitlists provide invites, and invited players receive three Steam friend invites.",
          "Europe, South America, and North America begin July 15; Asia / Pacific begins July 16.",
          "Ascension uses scheduled windows so new players can learn Spires and queues remain healthy."
        ]
      },
      {
        "type": "heading",
        "text": "What’s New"
      },
      {
        "type": "list",
        "items": [
          "Spires is a 3v3 best-of-three mode for build experimentation and combat practice.",
          "Learning Spires teaches items and Eternals against bots.",
          "The cosmetic progression test uses Pages, with a permanent title, banner, and skin on the Prestige track.",
          "The production migration resets accounts, in-game friends, and MMR; Steam friends are unaffected."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "june7-events",
    "slug": "june7_events",
    "title": "This Week in Arkheron - July 6-11",
    "date": "2026-07-07",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/june7_events/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Weekly playtests and Developer Custom Games are paused while Arkheron prepares an extended-playtest announcement, with Tower Hour moved to July 8.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The team announced that an extended playtest update would arrive Wednesday, July 8. Developer Custom Games and Weekly Playtests were paused across all regions for the week, Tower Hour moved to July 8 at 7PM PT, and the Fan Art Competition remained open."
      }
    ],
    "mentions": []
  },
  {
    "id": "fanart-competition",
    "slug": "fanart_competition",
    "title": "Arkheron Fan Art Competition",
    "date": "2026-07-01",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fanart_competition/",
    "heroImage": "https://www.arkheron.com/160850/1782941825-fanart_compet_cover.png?auto=format&fit=max&w=1200",
    "excerpt": "The Arkheron Fan Art Competition accepts Premium Art and MS Paint entries from July 1 through July 22, with winners announced around July 27.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The competition has Premium Art and MS Paint categories. Entries are judged on creativity, skill, and how well they capture Arkheron’s spirit; a community Fan Favorite is selected from nominations."
      },
      {
        "type": "heading",
        "text": "Rules and Prizes"
      },
      {
        "type": "list",
        "items": [
          "Submissions close July 22 at 1PM PT; winners are expected around July 27, 2026.",
          "Premium Art prizes range from an Arkheron Loot Box and Hoodie to Desk Pads.",
          "The Fan Favorite prize is one Arkheron Loot Box; MS Paint prizes include a Hoodie, Desk Pad, or both.",
          "Entries must be original, community-friendly, and not AI-generated. Participants must be at least 13 and eligible in their location."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "20-10-patchnotes",
    "slug": "20-10_patchnotes",
    "title": "Arkheron 0.20.10 Patch Notes",
    "date": "2026-06-30",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20-10_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1782844505-ark_communitynight_16x9_template-recovered.png?auto=format&fit=max&w=1200",
    "excerpt": "This 0.20 hotfix fixes returning-player login failures and restores Vision Pulse and Fish Amulet in Ascension Custom Games.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The hotfix addresses an ongoing issue in Update 0.20. The release notes say 0.21 remains the next major update and fix versions now use their numeric version names."
      },
      {
        "type": "heading",
        "text": "Bug Fix"
      },
      {
        "type": "list",
        "items": [
          "Fixed returning players’ inventory data preventing login."
        ]
      },
      {
        "type": "heading",
        "text": "Back on the Menu"
      },
      {
        "type": "list",
        "items": [
          "Vision Pulse and the Fish Amulet are back on in Ascension, available through Custom Games."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Vision Pulse"
      },
      {
        "type": "item",
        "name": "Fish Amulet"
      }
    ]
  },
  {
    "id": "june30-weeklyevents",
    "slug": "june30_weeklyevents",
    "title": "This Week in Arkheron - June 29-July 4",
    "date": "2026-06-30",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/june30_weeklyevents/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The week includes a Tower Half-Hour, developer Custom Games, Spires playtest windows, and community creator streams.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The team recapped the 0.20 Spires patch, community customs, and the Dahla Cup. On June 30, Tower Half-Hour and developer customs featured the Dahla Cup organizers, with Fishing Amulet and Vision Pulse enabled."
      },
      {
        "type": "list",
        "items": [
          "July 3-4: regional Arkheron playtest windows run on Spires.",
          "Community channels include Discord, Twitch, and YouTube for play and spectating."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Fishing Amulet"
      },
      {
        "type": "item",
        "name": "Vision Pulse"
      }
    ]
  },
  {
    "id": "events-june23",
    "slug": "events_june23",
    "title": "This Week in Arkheron - June 23-28",
    "date": "2026-06-23",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/events_june23/",
    "heroImage": "https://www.arkheron.com/160850/1782239676-ark_weeklyevents_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "This week features developer-hosted Customs, Dahla Cup signups and tournament play, and Spires playtest windows.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The team recapped the Friday-Saturday schedule change, the 0.20 Spires patch, alternating-Tuesday Tower Hour, and the Charon Cup before previewing the Dahla Cup."
      },
      {
        "type": "list",
        "items": [
          "June 23: developers host Custom Games for EU and NA servers; Dahla Cup signups close.",
          "June 26-27: Spires playtest windows and creator streams take place.",
          "June 28: the first Arkheron League Dahla Cup is hosted by Hawks and Nethy at 2PM PDT."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "new-playtest-times",
    "slug": "new_playtest-times",
    "title": "Arkheron Playtest Schedule Change - Play Friday & Saturday",
    "date": "2026-06-16",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/new_playtest-times/",
    "heroImage": "https://www.arkheron.com/160850/1781636787-playtestupdate_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron moved weekly open queues to Friday and Saturday nights, extended Europe and North America windows, and continued Tower Hour on selected Tuesdays.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Weekly playtest windows were merged under one banner and moved to Friday and Saturday to better match player availability. Saturday is open to Europe and North America because of current populations."
      },
      {
        "type": "list",
        "items": [
          "Asia / Pacific: 12PM-2PM UTC on Friday only.",
          "Europe: 6PM-9PM UTC on Friday and Saturday.",
          "North America: 1AM-4AM UTC on Friday and Saturday.",
          "Tower Hour continues as a one-hour livestream on selected Tuesdays; developer Custom Games were planned for selected Tuesdays."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "205-patchnotes",
    "slug": "205_patchnotes",
    "title": "Arkheron 0.20.5-0.20.9 Patch Notes",
    "date": "2026-06-16",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/205_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1781638816-patch_20-5.png?auto=format&fit=max&w=1200",
    "excerpt": "This 0.20 hotfix series fixes packaging issues that inflated downloads and a UI memory leak that could degrade performance.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The hotfix addresses issues in Update 0.20. The article notes that 0.21 remains the next major update and release naming now follows fix versions."
      },
      {
        "type": "heading",
        "text": "File Optimizations"
      },
      {
        "type": "list",
        "items": [
          "Fixed packaging issues causing larger-than-expected download sizes."
        ]
      },
      {
        "type": "heading",
        "text": "Performance"
      },
      {
        "type": "list",
        "items": [
          "Fixed a UI memory leak that could degrade performance over time, especially when repeatedly opening and closing screens such as the Social Menu."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Social Menu"
      }
    ]
  },
  {
    "id": "fnf-june12",
    "slug": "fnf_june12",
    "title": "Community Nights + Friday Night Fights - June 11-12",
    "date": "2026-06-11",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_june12/",
    "heroImage": "https://www.arkheron.com/160850/1778698623-ark_blog_header_fnf_051226.png?auto=format&fit=max&w=1200",
    "excerpt": "This week’s queues use the Spires 0.20 feature mode, with Tower Hour, a community stream, and a spotlight on the Charon Cup.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Arkheron was playable through weekly open queues and Custom Games. Queues ran Thursday and Friday on Spires, the arena-style mode focused on combat."
      },
      {
        "type": "list",
        "items": [
          "Tower Hour was scheduled Thursday at 6PM PT to discuss updates, Forums, playtest windows, and the Charon Cup.",
          "A community stream was scheduled Friday on Arkheron channels.",
          "Players could get a playtest key through a FirstLook invite or signup and join the Discord for Q&As and team finding."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "203-patchnotes",
    "slug": "203_patchnotes",
    "title": "Arkheron 0.20.3 Patch Notes",
    "date": "2026-06-11",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/203_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1781224393-ark_communitynight_16x9_template-recovered.png?auto=format&fit=max&w=1200",
    "excerpt": "This hotfix fixes Custom Games queue and lobby issues, a UI state leak affecting frame rate, and Training Room bots carried over from Customs.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Custom Games"
      },
      {
        "type": "list",
        "items": [
          "Fixed clicking out of the Custom Game popup and launching into a bad queue state.",
          "Fixed Spires Custom Games queues not being contained to their own lobby."
        ]
      },
      {
        "type": "heading",
        "text": "Performance"
      },
      {
        "type": "list",
        "items": [
          "Fixed a UI issue leaking state every frame and impacting frame rate when entering or leaving Training or when many friends had long names."
        ]
      },
      {
        "type": "heading",
        "text": "Other"
      },
      {
        "type": "list",
        "items": [
          "Fixed Training Room bots carried over from Customs."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "20-patchnotes",
    "slug": "20_patchnotes",
    "title": "Arkheron 0.20 Patch Notes",
    "date": "2026-06-10",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1781135189-ark_patch_20release.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.20 delivers performance and stability work, a dynamic Spires economy, Spires Custom Games, friend codes, Searing damage, and the Breakout mechanic.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Performance and Stability"
      },
      {
        "type": "paragraph",
        "text": "The patch includes CPU and GPU improvements, lower loading times, crash and ping work, and better performance tracking."
      },
      {
        "type": "heading",
        "text": "Eternal Rotation"
      },
      {
        "type": "list",
        "items": [
          "Grimwold and Vaton are out.",
          "Irenna and Leodin are in."
        ]
      },
      {
        "type": "heading",
        "text": "Spires Game Mode"
      },
      {
        "type": "list",
        "items": [
          "Chests are replaced by a Shrine economy that scales with purchasing history and run progress.",
          "Eternal Items start at 250 fragments and increase by 250 per purchase; Abyssal Items and Anchor Abilities start at 100 and increase by 25.",
          "Runs end after 10 Floors, with a 2,000-fragment cap per checkpoint room.",
          "Spires Custom Games support selectable mode, region, team count, team size, matches, rounds, chests, and store settings."
        ]
      },
      {
        "type": "heading",
        "text": "Combat and Social Systems"
      },
      {
        "type": "list",
        "items": [
          "Friend Codes allow players to send friend requests without appearing in the social panel.",
          "Searing Damage deals 50% damage to Fortitude and 150% to Health.",
          "Breakout lets selected abilities immediately escape certain stuns while consuming their cooldown."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Vaton"
      },
      {
        "type": "eternal",
        "name": "Irenna"
      },
      {
        "type": "eternal",
        "name": "Leodin"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Edani"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "item",
        "name": "Elusive Crown"
      },
      {
        "type": "item",
        "name": "Fishing Amulet"
      }
    ]
  },
  {
    "id": "performance-and-stability-update",
    "slug": "performance-and-stability-update",
    "title": "Performance and Stability Update",
    "date": "2026-06-10",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/performance-and-stability-update/",
    "heroImage": "https://www.arkheron.com/160850/1759171064-archivist003-1-1.webp?auto=format&fit=max&w=1200",
    "excerpt": "Bonfire describes eight weeks of performance work covering visibility, FPS, loading, networking, and crashes, including a rewritten VFX system and render-frame changes.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Engineer Szymon explains that Steam Next Fest exposed poor FPS, especially during heavy combat. The team focused on visibility, FPS, loading times, and gameplay blockers."
      },
      {
        "type": "heading",
        "text": "Work Completed"
      },
      {
        "type": "list",
        "items": [
          "A rewritten VFX system reduced memory use by around 4GB and improves multi-core CPU efficiency.",
          "Render work was reworked to overlap with game simulation.",
          "Environmental effects, terrain dissolves, lighting, and HLODs were optimized.",
          "A packing algorithm reduced file count from 40k to around 8k files.",
          "Lag compensation and crash diagnostics were improved."
        ]
      },
      {
        "type": "heading",
        "text": "Updated Specifications"
      },
      {
        "type": "list",
        "items": [
          "Recommended: Windows 10 or later, Intel Core i7-9700K or equivalent 8-core, Nvidia RTX 2070 8GB VRAM, 16GB RAM, SSD 35GB.",
          "Minimum: Windows 10 or later, Intel Core i5-9600K or equivalent 6-core, Nvidia GTX 1060 6GB VRAM, 12GB RAM, SSD 35GB."
        ]
      },
      {
        "type": "paragraph",
        "text": "The team says more work remains on heavy-combat FPS, crashes, AMD hangs, and future frame-generation support."
      }
    ],
    "mentions": []
  },
  {
    "id": "pre-closed-beta-faq",
    "slug": "pre-closed-beta-faq",
    "title": "Arkheron Pre-Closed Beta FAQ",
    "date": "2026-06-05",
    "category": "News",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/pre-closed-beta-faq/",
    "heroImage": "https://www.arkheron.com/160850/1780701589-ark_faq_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The FAQ explains Arkheron’s three-player teams, Ascension and Spires, Closed Beta signup, planned platforms, monetization, and pre-Beta testing.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Arkheron is an in-development PVP game where teams of three gather items and combine abilities."
      },
      {
        "type": "list",
        "items": [
          "Ascension has 15 teams competing to ascend the Tower and be the last team standing.",
          "Spires is a best-of-three arena deathmatch against one other team.",
          "Closed Beta signup is available through FirstLook; an exact start date was not yet announced in this FAQ.",
          "The plan was PC-first testing with console expansion during Closed Beta and PC, PlayStation, and Xbox at launch.",
          "The game will not be free to play, though further details were deferred."
        ]
      },
      {
        "type": "heading",
        "text": "Pre-Beta Testing"
      },
      {
        "type": "paragraph",
        "text": "Weekly testers could play limited Spires queues in Europe, North America, and Asia on Friday and Saturday nights, with Custom Games available 24/7. The team was moving from small rapid patches toward a monthly cadence, while retaining critical fixes as needed."
      }
    ],
    "mentions": []
  },
  {
    "id": "creator-program-announcement",
    "slug": "creator-program-announcement",
    "title": "Introducing Arkheron's Creator Program",
    "date": "2026-06-05",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/creator-program-announcement/",
    "heroImage": "https://www.arkheron.com/160850/1780706569-ark_creatorprogram_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron announced the Builders’ Guild, an official creator partnership program open to creators, guide-writers, tool-makers, tournament organizers, and lore-keepers.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The Builders’ Guild is Arkheron’s official creator partnership program. It welcomes creators of many kinds, including community guide-writers, tool-makers, tournament organizers, and lore-keepers."
      },
      {
        "type": "paragraph",
        "text": "Bonfire plans to grow the program’s resources and reach as Arkheron grows and invited interested creators to read the program details and join."
      }
    ],
    "mentions": []
  },
  {
    "id": "forums",
    "slug": "forums",
    "title": "Welcome to Arkheron's Forums - Our New Home for Feedback",
    "date": "2026-06-04",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/forums/",
    "heroImage": "https://www.arkheron.com/160850/1780609646-ark_forums.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron introduced its Forums as a more organized home for feedback, direct developer questions, and long-form game discussion.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The Forums move feedback threads away from Discord into a space designed for deeper conversation and developer engagement. Discord remains available for live chat, groups, Custom Games, and general questions."
      },
      {
        "type": "heading",
        "text": "What to Expect"
      },
      {
        "type": "list",
        "items": [
          "Feedback Section: a place for general feedback that the team will read closely.",
          "Dev Corner Section: a place for team updates and focused requests for feedback."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "fnf-june5",
    "slug": "fnf_june5",
    "title": "Community Nights + Friday Night Fights - June 4-5",
    "date": "2026-06-03",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_june5/",
    "heroImage": "https://www.arkheron.com/160850/1780519170-ark_communitynight_16x9_template.png?auto=format&fit=max&w=1200",
    "excerpt": "This week’s queues use Spires, while Community Night and Friday Night Fights live content takes a short break for planning.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Arkheron was playable through weekly open queues and Custom Games. Queues this week used Spires, the arena-style mode focused on combat."
      },
      {
        "type": "paragraph",
        "text": "The team paused Community Night and Friday Night Fights live content for the week while planning what comes next, with more details promised soon."
      }
    ],
    "mentions": []
  },
  {
    "id": "fnf-may28",
    "slug": "fnf_may28",
    "title": "Community Nights + Friday Night Fights - May 28 & 29",
    "date": "2026-05-27",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_may28/",
    "heroImage": "https://www.arkheron.com/160850/1778698623-ark_blog_header_fnf_051226.png?auto=format&fit=max&w=1200",
    "excerpt": "The May 28-29 schedule includes Spires queues, Tower Hour, Ascension Custom Games, After Hours Customs, and featured co-streamers.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Community Night - May 28"
      },
      {
        "type": "list",
        "items": [
          "Tower Hour begins at 6PM PT with community-made content and development discussion.",
          "After Spires queues end at 9PM PT, Custom Ascension Games open for all skill levels."
        ]
      },
      {
        "type": "heading",
        "text": "Friday Night Fights - May 29"
      },
      {
        "type": "list",
        "items": [
          "Spires queues open in Asia, Europe, and North America.",
          "After Hours Custom Games follow the North American queues.",
          "Featured co-streamers are available on Discord, Twitch, and YouTube."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "newplaytesters",
    "slug": "newplaytesters",
    "title": "Welcome to the Arkheron Playtest!",
    "date": "2026-05-20",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/newplaytesters/",
    "heroImage": "https://www.arkheron.com/160850/1779319789-playtestinvite_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron welcomed new Steam Playtest invitees and explained weekly queues, Custom Games, and the early Spires-focused development phase.",
    "videoUrl": "https://www.youtube.com/watch?v=uWEB7gtgQj4",
    "content": [
      {
        "type": "paragraph",
        "text": "Arkheron is in a pre-launch development state with open queues during weekly events and Custom Games available at any time. The team expects quick changes, regular patches, and an imperfect experience while it iterates."
      },
      {
        "type": "heading",
        "text": "How to Play"
      },
      {
        "type": "list",
        "items": [
          "Selected players receive an official Steam email and the Arkheron Playtest appears in their library.",
          "Weekly playtests run on Fridays and Saturdays; regional queue times are listed in the linked schedule.",
          "Custom Games are available 24/7 with fellow playtesters or bots."
        ]
      },
      {
        "type": "paragraph",
        "text": "The next few weeks focus on Spires, an arena-style mode centered on combat. As player numbers grow, Ascension is expected to return to the queue rotation."
      }
    ],
    "mentions": []
  },
  {
    "id": "fnfmay22",
    "slug": "fnfmay22",
    "title": "Community Nights + Friday Night Fights | May 21 & 22",
    "date": "2026-05-19",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnfmay22/",
    "heroImage": "https://www.arkheron.com/160850/1778101162-ark_communitynight_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Spires is featured for Community Night in NA and EU and Friday Night Fights in NA, EU, and Asia.",
    "videoUrl": "https://www.youtube.com/watch?v=uWEB7gtgQj4",
    "content": [
      {
        "type": "paragraph",
        "text": "Spires returns as the featured mode. Community Night includes NA and EU queues, Tower Hour, and leaderboards off; Friday Night Fights runs in NA, EU, and Asia."
      },
      {
        "type": "list",
        "items": [
          "Europe Community Night queues run 7PM–9PM UTC.",
          "After Hours Custom Games follow NA queues."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "fnf-may15",
    "slug": "fnf_may15",
    "title": "Community Nights + Friday Night Fights",
    "date": "2026-05-13",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_may15/",
    "heroImage": "https://www.arkheron.com/160850/1778698623-ark_blog_header_fnf_051226.png?auto=format&fit=max&w=1200",
    "excerpt": "Spires returns for Community Night in NA and Friday Night Fights in NA, EU, and Asia.",
    "videoUrl": "https://www.youtube.com/watch?v=uWEB7gtgQj4",
    "content": [
      {
        "type": "paragraph",
        "text": "Community Night is a slower-paced Spires event with leaderboards off. Tower Hour begins at 6 pm PT and queues run 7–9 pm PT."
      },
      {
        "type": "list",
        "items": [
          "Keyaledis, Arcala, Lam, and Pugtayto lead the community takeover.",
          "Arcala hosts After Hours Customs and Keyaledis spectates and shoutcasts."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "20e-patchnotes",
    "slug": "20e_patchnotes",
    "title": "Arkheron 0.20e Patch Notes",
    "date": "2026-05-13",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20e_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1778716752-ark_patchreports_16x9_patch_020e.png?auto=format&fit=max&w=1200",
    "excerpt": "Karriv and Rynshi return to rotation, Healing Mists are removed, Healing Potion cast time is reduced, and Spires issues are fixed.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Eternal Rotation"
      },
      {
        "type": "list",
        "items": [
          "Karriv and Rynshi rotated in.",
          "Irenna and Leodin rotated out."
        ]
      },
      {
        "type": "heading",
        "text": "Healing and Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Healing Mists were removed; a future Eternal Ability return is unconfirmed and untimed.",
          "Healing Potions cast in 1 second, down from 1.5.",
          "Fixed first-login crashes, a dim Spires loot chest room, and frozen or stuck Spires queues."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Karriv"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Irenna"
      },
      {
        "type": "eternal",
        "name": "Leodin"
      }
    ]
  },
  {
    "id": "20d-patchnotes",
    "slug": "20d_patchnotes",
    "title": "Arkheron 0.20d Patch Notes",
    "date": "2026-05-07",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20d_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1778177391-ark_patchreports_16x9_patch_020d.png?auto=format&fit=max&w=1200",
    "excerpt": "Penelope’s Lock the Door tether is adjusted and Spires matchmaking, bot ranges, end-of-match text, VFX, and VO are fixed.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Penelope"
      },
      {
        "type": "list",
        "items": [
          "Correction Amulet tether durability is uniform and takes 3 evades to break.",
          "Level 3 tether is shorter; all levels have less stretch on evades."
        ]
      },
      {
        "type": "heading",
        "text": "Gameplay and Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Spires matchmaking improved.",
          "Bots no longer misjudge attack ranges.",
          "End-match text says Placement instead of Elimination.",
          "Updated Penelope and Dual Axes VFX; fixed Spires endgame UI and Ascension beacon-claimed VO."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Penelope"
      },
      {
        "type": "item",
        "name": "Penelope’s Correction Amulet"
      },
      {
        "type": "item",
        "name": "Dual Axes"
      }
    ]
  },
  {
    "id": "spires",
    "slug": "spires",
    "title": "Developer Overview | New Spires Game Mode",
    "date": "2026-05-07",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/spires/",
    "heroImage": "https://www.arkheron.com/160850/1778186212-ark_thumb_devupdate_spires.png?auto=format&fit=max&w=1200",
    "excerpt": "Gameplay Engineer Case introduces Spires, a new 3v3 combat arena mode in playtest.",
    "videoUrl": "https://youtu.be/uWEB7gtgQj4",
    "content": [
      {
        "type": "paragraph",
        "text": "Spires is a 3v3 arena. Teams equip items and buy an Anchor Ability and Consumables in a checkpoint room, then fight another team in a best-of-three match."
      },
      {
        "type": "paragraph",
        "text": "Each run starts with three lives; stats continue across matches until three losses, while damage and levels contribute to the final score."
      }
    ],
    "mentions": []
  },
  {
    "id": "communitynights",
    "slug": "communitynights",
    "title": "Community Nights + Friday Night Fights",
    "date": "2026-05-06",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/communitynights/",
    "heroImage": "https://www.arkheron.com/160850/1778101162-ark_communitynight_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Community Nights debut in North America with Spires, developer play, a pre-show, queues, and custom games.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Community Nights are lower-pressure Thursday playtests where developers and high-skill players share tips. The first event is May 7 in North America."
      },
      {
        "type": "heading",
        "text": "Spires"
      },
      {
        "type": "paragraph",
        "text": "Spires is an Arena mode focused on Beacon fights. A run begins with three lives and ends after three losses."
      },
      {
        "type": "list",
        "items": [
          "Pre-show at 6 pm PT; queues 7–9 pm PT.",
          "Friday Night Fights on May 8 runs in Asia, Europe, and North America.",
          "Leaderboards are off for Community Night; custom games follow queues."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "20c-patchnotes",
    "slug": "20c_patchnotes",
    "title": "Arkheron 0.20c Patch Notes",
    "date": "2026-05-06",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20c_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1778101285-ark_patchreports_16x9_patch_020c-2.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.20c tunes damage around armor break and changes healing, Eternal Items, audio, settings, and bugs.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Healing and Armour Break"
      },
      {
        "type": "list",
        "items": [
          "Full Eternal transformation heals 150.",
          "Healing Mist: 0.5s cast, 60 AoE, carry 4, cost 50.",
          "Healing Ward: 1s cast plus 3s heal over time, 100 AoE, carry 3, cost 75.",
          "Fortitude: 0.75s cast, 50 fortitude / 2 pips, carry 5, cost 50.",
          "Health Potion: 1.5s cast, 125 heal, carry 4, cost 100."
        ]
      },
      {
        "type": "heading",
        "text": "Eternal Items"
      },
      {
        "type": "list",
        "items": [
          "Dahla, Edani, Grimwold, Hollow, Irenna, Karriv, Leodin, Penelope, Ravah, Rynshi, and Vaton item damage, timing, range, or ability behavior were adjusted as detailed in the patch.",
          "Ravah’s level 3 Shadowsmoke now grants a 1.5s invisibility buff on exit instead of damage."
        ]
      },
      {
        "type": "heading",
        "text": "Other Changes"
      },
      {
        "type": "list",
        "items": [
          "Added evade sound and adjusted hitmarkers.",
          "Added party/team voice sliders, Push to Talk settings, and configurable Noise Suppression and Echo Cancellation.",
          "Fixed cooldown HUD, Eternal ability, environment, potion, audio, and UI bugs."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Healing Mist"
      },
      {
        "type": "item",
        "name": "Healing Ward"
      },
      {
        "type": "item",
        "name": "Fortitude"
      },
      {
        "type": "item",
        "name": "Health Potion"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Edani"
      },
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Hollow"
      },
      {
        "type": "eternal",
        "name": "Irenna"
      },
      {
        "type": "eternal",
        "name": "Karriv"
      },
      {
        "type": "eternal",
        "name": "Leodin"
      },
      {
        "type": "eternal",
        "name": "Penelope"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Vaton"
      }
    ]
  },
  {
    "id": "fnf-may1",
    "slug": "fnf_may1",
    "title": "Friday Night Fights | May 1st - Turbo Returns!",
    "date": "2026-04-30",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_may1/",
    "heroImage": "https://www.arkheron.com/160850/1777579043-ark_blog_header_fnf_050126.png?auto=format&fit=max&w=1200",
    "excerpt": "Turbo Ascension returns with a Floor 2 start, extra looting time, and the Destroyer Crown.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Spires needed more time, so Turbo returned. Turbo starts on Floor 2 with 7 teams of 3 and an extra minute before beacons."
      },
      {
        "type": "heading",
        "text": "Destroyer Crown"
      },
      {
        "type": "list",
        "items": [
          "It spawns in a mythic chest in a highlighted Floor 2 area.",
          "Doppelganger summons a doppelganger and grants Invisibility until an action dismisses it.",
          "The passive unlocks carried Eternal Relic set bonuses, up to three."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Destroyer Crown"
      }
    ]
  },
  {
    "id": "20b-patchnews",
    "slug": "20b_patchnews",
    "title": "Arkheron 0.20b Patch Notes",
    "date": "2026-04-30",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20b_patchnews/",
    "heroImage": "https://www.arkheron.com/160850/1777584173-ark_patchreports_16x9_patch_020b.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.20b fixes revival UI, Eternal audio and VFX, Floor 3 crashes, environment assets, chests, and collisions.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed greyed-out ally revival shop UI, Grimwold’s Charged Rings reverb, and Ravah’s Shadowsmoke Crown VFX.",
          "Updated Ravah, Penelope, and Tsu’bo SFX.",
          "Fixed Floor 3 crashes, environment assets that failed to dissolve, a Floor 4 collision, chest stacking and hidden chests, throne flicker, and Key Tower projectile collision.",
          "Fixed item pickup sounds, Training loading sounds, various crashes, and other audio/UI issues."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Penelope"
      },
      {
        "type": "eternal",
        "name": "Tsu’bo"
      },
      {
        "type": "item",
        "name": "Charged Rings"
      },
      {
        "type": "item",
        "name": "Shadowsmoke Crown"
      }
    ]
  },
  {
    "id": "20a-patchnotes",
    "slug": "20a_patchnotes",
    "title": "Arkheron 0.20a Patch Notes",
    "date": "2026-04-29",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/20a_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1777509167-ark_patchreports_16x9_patch_020a.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.20a rotates Eternals, adjusts Tsu’bo, changes large projectiles, and fixes voice, UI, portal, and crash issues.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Rotation and Tsu’bo"
      },
      {
        "type": "list",
        "items": [
          "Rynshi and Karriv rotated out; Grimwold and Dahla rotated in.",
          "Boom Chaka damage is 15 with exploding shots at 10. Make Them Prey moves farther, applies longer Weakened, and has revised cooldowns."
        ]
      },
      {
        "type": "heading",
        "text": "Gameplay and Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Large projectiles split into three so terrain may block only part.",
          "Taskbar flashes for match found or revival, with an option to foreground the game.",
          "Fixed voice comms, warnings, off-screen icons, Shrine pings, UI art, Theatre of Blades portals, controller prompts, Training mannequins, and VFX crashes."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Tsu’bo"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Karriv"
      },
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Yah’Towa"
      }
    ]
  },
  {
    "id": "devupdate-qa",
    "slug": "devupdate_qa",
    "title": "Friday Night Fights Q&A | What’s Next for Arkheron?",
    "date": "2026-04-29",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/devupdate_qa/",
    "heroImage": "https://www.arkheron.com/160850/1777503295-ark_thumb_robchat_vfinal.png?auto=format&fit=max&w=1200",
    "excerpt": "Founder Rob Pardo discusses evolving playtesting, Closed Beta, new modes, new features, and Community Night.",
    "videoUrl": "https://youtu.be/XofpF8T748Q",
    "content": [
      {
        "type": "paragraph",
        "text": "The Q&A covers Arkheron’s next phase of development, how playtesting is evolving, what Closed Beta will look like, and upcoming modes and features."
      }
    ],
    "mentions": []
  },
  {
    "id": "blitz-recap",
    "slug": "blitz_recap",
    "title": "Friday Night Fights Recap - Blitz",
    "date": "2026-04-27",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/blitz_recap/",
    "heroImage": "https://www.arkheron.com/160850/1777321629-ark_blog_header_fnf_042426_recap.png?auto=format&fit=max&w=1200",
    "excerpt": "The Blitz recap covers Floor 3 starts, four teams of three, extra loot, streams, and highlights from patches 0.19i and 0.19j.",
    "videoUrl": "https://www.youtube.com/watch?v=TilZJ5SKNZA",
    "content": [
      {
        "type": "paragraph",
        "text": "Blitz used Floor 3 starts, four teams of three, and extra loot. Vision Pulse rotated out and Refill Consumables rotated in."
      },
      {
        "type": "heading",
        "text": "Patch Highlights"
      },
      {
        "type": "list",
        "items": [
          "Great Sword Heavy Combo gained crushing damage.",
          "Health Potion healing duration increased to 2 seconds.",
          "Added nearest Beacon and fragment indicators and updated status icons.",
          "Self Revive rotated in."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Great Sword"
      },
      {
        "type": "item",
        "name": "Health Potion"
      }
    ]
  },
  {
    "id": "client-migration",
    "slug": "client_migration",
    "title": "Friday Night Fights: Client Migration and Arkheron’s Next Phase",
    "date": "2026-04-23",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/client_migration/",
    "heroImage": "https://www.arkheron.com/160850/1776968118-ark_blog_clientmit_nextphase_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron is moving playtests from Arkheron Experimental to the visible Arkheron Playtest client while preparing more play windows and improved onboarding.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "After six weeks of rapid iteration following Steam Next Fest, Arkheron is preparing more ways to play, improved onboarding, and a smoother experience."
      },
      {
        "type": "heading",
        "text": "Client Migration"
      },
      {
        "type": "list",
        "items": [
          "Players are moving from Arkheron Experimental to Arkheron Playtest on Steam.",
          "Existing players receive First Look instructions; new players can use a friend invite or sign up through FirstLook.",
          "Both clients remain usable for a few weeks before Experimental shuts down."
        ]
      },
      {
        "type": "heading",
        "text": "Regional Updates"
      },
      {
        "type": "list",
        "items": [
          "South American FNF queues are temporarily paused for performance and Brazilian Portuguese localization work.",
          "EU servers now run 7PM–9PM UTC.",
          "Forums are planned for news, discussions, feedback, and a Dev Corner."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "howto-playtest",
    "slug": "howto_playtest",
    "title": "FNF is Moving! How to Access Arkheron Playtest",
    "date": "2026-04-23",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/howto_playtest/",
    "heroImage": "https://www.arkheron.com/160850/1776968302-ark_blog_download_playtest_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The guide explains how to redeem an Arkheron Playtest Steam key through the web or Steam client.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Use “Redeem Your Key on Steam” on the web, or copy the key and open Steam.",
          "In Steam select Games, “Activate a Product on Steam...”, paste the key, and confirm.",
          "“Product Already Owned” means the account already has Playtest access."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "southamerica-servers",
    "slug": "southamerica_servers",
    "title": "Regional Update: South America Friday Night Fights Queues",
    "date": "2026-04-23",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/southamerica_servers/",
    "heroImage": "https://www.arkheron.com/160850/1776968588-ark_blog_regional_update_samerica_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "South American FNF queues are paused while the team works on performance and Brazilian Portuguese localization.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "South American Friday Night Fights queues are taking a short break because current performance issues disproportionately affect the region."
      },
      {
        "type": "list",
        "items": [
          "Players may join Europe, Asia/Pacific, or North America queues.",
          "Custom Games run all week and can use South American servers.",
          "Brazilian-Portuguese localization will accompany the return of South American queues."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "queue-times",
    "slug": "queue_times",
    "title": "Arkheron Queue Availability",
    "date": "2026-04-23",
    "category": "News",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/queue_times/",
    "heroImage": "https://www.arkheron.com/160850/1776968800-ark_blog_queuetimes_16x9.png?auto=format&fit=max&w=1200",
    "excerpt": "The schedule describes Closed Beta access, 24/7 Spires availability, and regional Ascension windows from July 15 through July 26.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Closed Beta runs July 15–26. Queues are available 24/7, with Spires primary and Ascension operating Friday through Sunday."
      },
      {
        "type": "heading",
        "text": "Closed Beta Begins"
      },
      {
        "type": "list",
        "items": [
          "Europe: July 15, 6PM BST / 7PM CEST / 5PM UTC.",
          "South America: July 15, 6PM BRT / 6PM ADT / 9PM UTC.",
          "North America: July 15, 4PM PDT / 7PM EDT / 11PM UTC.",
          "Asia/Pacific: July 16, 10AM JST & KST / 1AM UTC."
        ]
      },
      {
        "type": "heading",
        "text": "Ascension"
      },
      {
        "type": "paragraph",
        "text": "Europe, South America, and North America run July 17, 18, 24, and 25; Asia/Pacific runs July 18, 19, 20, 25, and 26. Lower MMR matches may include bot teams."
      }
    ],
    "mentions": []
  },
  {
    "id": "fnf-blitz",
    "slug": "fnf_blitz",
    "title": "Friday Night Fights | April 24th - Get ready to Blitz.",
    "date": "2026-04-23",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_blitz/",
    "heroImage": "https://www.arkheron.com/160850/1776976671-ark_blog_header_fnf_042426.png?auto=format&fit=max&w=1200",
    "excerpt": "Blitz Ascension starts four teams of three on Floor 3, adds loot, and brings back a solo queue leaderboard.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Limited Mode: Blitz Ascension"
      },
      {
        "type": "list",
        "items": [
          "Four teams of three start on Floor 3.",
          "Common and Legendary chests drop 3x normal loot; Mythic chests drop 5x.",
          "Floor 3 Minor/Major Eliminations are worth 1/3 points; Floor 4 values are 2/6.",
          "Leavers receive a zero score that cannot be replaced."
        ]
      },
      {
        "type": "paragraph",
        "text": "Michelle “ohdeveraux”, Jordanne “VVild”, and Sarah “Pants5555” stream matches; RubyVerbena hosts custom games."
      }
    ],
    "mentions": []
  },
  {
    "id": "19j-patchnotes",
    "slug": "19j_patchnotes",
    "title": "Arkheron 0.19j Patch Notes",
    "date": "2026-04-23",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19j_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1776990022-ark_patchreports_16x9_patch_019j.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.19j increases Blitz chest loot and rotates Anchor Abilities.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Additional Loot"
      },
      {
        "type": "list",
        "items": [
          "Common and Legendary chests drop 3x normal loot; Mythic chests 5x.",
          "The change also applies to custom games."
        ]
      },
      {
        "type": "heading",
        "text": "Anchor Abilities"
      },
      {
        "type": "list",
        "items": [
          "Vision Pulse rotated out.",
          "Refill Consumables, an early prototype, rotated in.",
          "Self Revive rotated in."
        ]
      },
      {
        "type": "paragraph",
        "text": "The patch also includes minor bug fixes."
      }
    ],
    "mentions": []
  },
  {
    "id": "19i-patchnotes",
    "slug": "19i_patchnotes",
    "title": "Arkheron 0.19i Patch Notes",
    "date": "2026-04-22",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19i_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1776888668-ark_patchreports_16x9_patch_019i.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.19i changes Great Sword, Health Potion timing, Shrine channels, Beacon and fragment indicators, status icons, and bugs.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Great Sword Heavy Combo now deals crushing damage.",
          "Health Potion heals over time for 2 seconds, up from 1.2.",
          "Rejuvenate channel is 2.5 seconds; Resurrect channel is 1 second.",
          "Added nearest Beacon and fragment map indicators; updated status icons.",
          "Fixed team voice chat, Theatre of Blades portal visibility, Vaton and Rynshi abilities, weapon portals, sounds, stuck treasure-room states, and Hollow Wall audio."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Great Sword"
      },
      {
        "type": "item",
        "name": "Health Potion"
      }
    ]
  },
  {
    "id": "fnf-april17",
    "slug": "fnf_april17",
    "title": "Friday Night Fights | April 16th - Seek and Destroy! And… Fish?",
    "date": "2026-04-16",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_april17/",
    "heroImage": "https://www.arkheron.com/160850/1776363202-ark_fnf_16x9_041726.png?auto=format&fit=max&w=1200",
    "excerpt": "Seek and Destroy starts twelve teams on Floor 1 with Vision Pulse as the only Anchor Ability, plus fishing and the Destroyer Crown.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Seek and Destroy"
      },
      {
        "type": "list",
        "items": [
          "Floor 1 start; 12 teams of 3; Vision Pulse is the only Anchor Ability.",
          "The Fishing Amulet turns its user into a fish; each flop deals 12 damage and the user takes no damage.",
          "Destroyer Crown returns on Floor 2.",
          "Major Eliminations score 4/3/2/1 points on Floors 1/2/3/4; the “catch of the day” can add points."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Fishing Amulet"
      },
      {
        "type": "item",
        "name": "Destroyer Crown"
      }
    ]
  },
  {
    "id": "19h-patchnotes",
    "slug": "19h_patchnotes",
    "title": "Arkheron 0.19h Patch Notes",
    "date": "2026-04-16",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19h_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1776388700-ark_patchreports_16x9_patch_019h.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.19h restores uninterrupted Health Potions and gives Eternal Abilities unique cooldowns and balance changes.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Health Potions can no longer be interrupted by damage."
      },
      {
        "type": "heading",
        "text": "Eternal Ability Cooldowns"
      },
      {
        "type": "list",
        "items": [
          "Dahla 26, Edani 20, Grimwold 24, Hollow 22, Irenna 20, Karriv 25, Leodin 24, Penelope 20, Rynshi 20, Ravah 22, Tsu’bo 22, Vaton 26.",
          "Dahla loses Exhaust; Edani damage is 35; Leodin is Crushing Damage; Vaton damage is 40."
        ]
      },
      {
        "type": "paragraph",
        "text": "Fixed sprint after weapon swaps, ground Health Potion restoration, and controller queue cancellation."
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Health Potion"
      },
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Edani"
      },
      {
        "type": "eternal",
        "name": "Grimwold"
      },
      {
        "type": "eternal",
        "name": "Hollow"
      },
      {
        "type": "eternal",
        "name": "Irenna"
      },
      {
        "type": "eternal",
        "name": "Karriv"
      },
      {
        "type": "eternal",
        "name": "Leodin"
      },
      {
        "type": "eternal",
        "name": "Penelope"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Tsu’bo"
      },
      {
        "type": "eternal",
        "name": "Vaton"
      }
    ]
  },
  {
    "id": "19g-patchnotes",
    "slug": "19g_patchnotes",
    "title": "Arkheron 0.19g Patch Notes",
    "date": "2026-04-15",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19g_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1776286415-ark_patchreports_16x9_patch_019g.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.19g changes Health Potions, Shrine channels, Edani visuals, in-client news, quick cast, and movement interactions.",
    "videoUrl": null,
    "content": [
      {
        "type": "list",
        "items": [
          "Health Potions heal 150 over 1.25 seconds and stop at 20 damage.",
          "Rejuvenate and Resurrect require interruptible 4-second and 3-second channels.",
          "Edani’s Amulet shows nearby-enemy radius and damage-buff visuals.",
          "The main menu now shows latest news.",
          "Quick cast fires modal aim abilities on release; swapping or dodging cancels aim.",
          "Ravah Unload, Rynshi Sadistic Throw, and Leodin Righteous Swing receive movement-tag interaction changes.",
          "Fixed VFX dissolves, Korean line breaks, Irenna Caretaker, controller glyphs, Crossbow sprint, Dahla Vanish Crown, and corpse animation bugs."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Health Potion"
      },
      {
        "type": "eternal",
        "name": "Edani"
      },
      {
        "type": "eternal",
        "name": "Ravah"
      },
      {
        "type": "eternal",
        "name": "Rynshi"
      },
      {
        "type": "eternal",
        "name": "Leodin"
      },
      {
        "type": "item",
        "name": "Caretaker"
      },
      {
        "type": "item",
        "name": "Vanish Crown"
      }
    ]
  },
  {
    "id": "19f-patchnotes",
    "slug": "19f_patchnotes",
    "title": "Arkheron 0.19f Patch Notes",
    "date": "2026-04-13",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19f_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1776106074-ark_patchreports_16x9_patch_019f.png?auto=format&fit=max&w=1200",
    "excerpt": "Patch 0.19f fixes Escape menu highlighting, custom colors, audio, frontend music, queue cancellation, a crash, and Eternal emotes.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed Escape menu highlighting and custom color selector persistence.",
          "Fixed Abyss audio overlap, frontend music, Ascension map music volume, an exit crash, and queue cancellation hangs.",
          "Fixed Dahla, Hollow, and Vaton Eternal-specific emotes when transformed."
        ]
      }
    ],
    "mentions": [
      {
        "type": "eternal",
        "name": "Dahla"
      },
      {
        "type": "eternal",
        "name": "Hollow"
      },
      {
        "type": "eternal",
        "name": "Vaton"
      }
    ]
  },
  {
    "id": "fnf-april-10",
    "slug": "fnf-april-10",
    "title": "Friday Night Fights | April 10th - Wield the Destroyer Crown!",
    "date": "2026-04-09",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf-april-10/",
    "heroImage": "https://www.arkheron.com/160850/1775764512-ark_blog_header_fnf_v4.png?auto=format&fit=max&w=1200",
    "excerpt": "Turbo Ascension 3.0 starts eight teams on Floor 2 with extra looting, the Destroyer Crown, custom timing changes, and a solo leaderboard.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Turbo Ascension 3.0"
      },
      {
        "type": "list",
        "items": [
          "Eight teams of 3 start on Floor 2 with an extra minute before beacons.",
          "The Destroyer Crown spawns in a mythic chest in a pink-highlighted area. Doppelganger summons a doppelganger and grants Invisibility until an action; its passive unlocks up to three carried Eternal Relic set bonuses.",
          "Floor Two and Floor Three custom starts each gain one extra minute; Floor One is unchanged.",
          "Solo leaderboard points for Major Eliminations are 1/2/3 on Floors 1/2/3, and leavers score zero."
        ]
      },
      {
        "type": "paragraph",
        "text": "Developer livestreams, dev-hosted customs, and group-finding support accompany the event."
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Destroyer Crown"
      }
    ]
  },
  {
    "id": "19e-patchnotes",
    "slug": "19e_patchnotes",
    "title": "Arkheron 0.19e Patch Notes",
    "date": "2026-04-09",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19e_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1775774771-ark_blog_patch_19e-1.png?auto=format&fit=max&w=1200",
    "excerpt": "This experimental patch adds the Destroyer Crown, adjusts Custom Games and Empowered, and fixes several issues.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The patch naming convention now uses the monthly patch number and a letter for the public sequence. The build is playable on the Experimental Client and during Friday Night Fights."
      },
      {
        "type": "heading",
        "text": "Destroyer Crown"
      },
      {
        "type": "paragraph",
        "text": "The Destroyer Crown spawns on Floor 2 shortly after the match begins in a mythic chest; a pink circle on the initial spawn-point map indicates its general region."
      },
      {
        "type": "list",
        "items": [
          "Active Doppelganger: summon a doppelganger and become invisible; taking an action makes it disappear.",
          "Passive: the Destroyer Relic automatically unlocks the respective set bonus for each Eternal Relic carried, up to three set bonuses."
        ]
      },
      {
        "type": "heading",
        "text": "Custom Games and Empowered"
      },
      {
        "type": "list",
        "items": [
          "Floor 2 or 3 custom-game starts add one extra minute of looting time on the starting drop floor.",
          "Empowered major eliminations are 2, minor eliminations are 1.5, and decay is 10."
        ]
      },
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed incorrect skins and models on the main menu.",
          "Fixed Hollow's Darkling Staff wall sound effects and improved Hollow's Sneklan visual effects.",
          "Improved friend-list sorting."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Destroyer Crown"
      },
      {
        "type": "item",
        "name": "Darkling Staff"
      }
    ]
  },
  {
    "id": "1906-patchnotes",
    "slug": "1906_patchnotes",
    "title": "Arkheron 0.19.0.6 Patch Notes",
    "date": "2026-04-08",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/1906_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1775692064-ark_blog_patch_0_1906.png?auto=format&fit=max&w=1200",
    "excerpt": "This patch fixes visual, controller, UI, audio, and ability issues across Arkheron.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed Vaton's Training Room mannequin cape and lighting issues.",
          "Fixed UI overlap while holding TAB, overly bright Beacon lighting, and controller d-pad item scrolling.",
          "Fixed visual issues involving Irenna's Sword Caretaker, Dahla's Dancing Blade, Last Wish, Mending Hands, Vaton's Serpent Staff, Ravah's Talonflight Crossbow, Edani's Lunging Hook, and Healing Shot.",
          "Fixed displaced Anchors while crawling, missing first drop-location sound effects, controller focus in Select Game Mode, books, the abyss, a shadow, and Karriv's Flaming Lantern reticle inside Ravah's Shadowsmoke Crown."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Caretaker"
      },
      {
        "type": "item",
        "name": "Dancing Blade"
      },
      {
        "type": "item",
        "name": "Last Wish"
      },
      {
        "type": "item",
        "name": "Mending Hands"
      },
      {
        "type": "item",
        "name": "Serpent Staff"
      },
      {
        "type": "item",
        "name": "Talonflight Crossbow"
      },
      {
        "type": "item",
        "name": "Lunging Hook"
      },
      {
        "type": "item",
        "name": "Healing Shot"
      },
      {
        "type": "item",
        "name": "Flaming Lantern"
      },
      {
        "type": "item",
        "name": "Shadowsmoke Crown"
      }
    ]
  },
  {
    "id": "1905-patchnotes",
    "slug": "1905_patchnotes",
    "title": "Arkheron 0.19.0.5 Patch Notes",
    "date": "2026-04-06",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/1905_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1775524643-ark_blog_patch_0_1905.png?auto=format&fit=max&w=1200",
    "excerpt": "This patch fixes end-of-game, audio, visual, Training area, inventory, and Friends List issues.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes and Improvements"
      },
      {
        "type": "list",
        "items": [
          "Fixed the missing end-of-game overlay.",
          "Fixed duplicated Ravah's Stalking Amulet stop-damage-buff sounds and persistent damage-buffed attack sounds after losing Hollow's or Tsu'Bo's set bonus.",
          "Fixed visual flickering, Vaton's Training mannequin texture and lighting, and Irenna's Caretaker appearing shattered on the mannequin.",
          "Improved Friends List performance and fixed controller inventory navigation while the map was open."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Stalking Amulet"
      },
      {
        "type": "item",
        "name": "Caretaker"
      }
    ]
  },
  {
    "id": "fnf-april-3",
    "slug": "fnf-april-3",
    "title": "Friday Night Fights - Play Turbo Ascension 2.0",
    "date": "2026-04-02",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf-april-3/",
    "heroImage": "https://www.arkheron.com/160850/1775160037-ark_blog_header_fnf_v3.png?auto=format&fit=max&w=1200",
    "excerpt": "Friday Night Fights features Turbo Ascension 2.0, a revised solo leaderboard, a developer livestream, and hosted custom games.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Friday Night Fights is Arkheron's pre-Closed-Beta way to play, learn, and grow with the community. The team is experimenting with Turbo and Duos to learn about Custom Games and support healthier matchmaking."
      },
      {
        "type": "heading",
        "text": "Turbo Ascension 2.0"
      },
      {
        "type": "paragraph",
        "text": "Eight teams of three skip the ground floor and drop onto Floor 2. Loot density was increased in specific Floor 2 areas, affecting Turbo and main Ascension."
      },
      {
        "type": "heading",
        "text": "Solo Queue Leaderboard"
      },
      {
        "type": "list",
        "items": [
          "A solo player who leaves receives a score of zero that counts as one of the night's top scores and cannot be replaced.",
          "The leaderboard tracks each player's top three games instead of five.",
          "Major eliminations score 1 point on Floor 1, 2 on Floor 2, and 3 on Floor 3; repeat eliminations of the same player on the same floor do not score."
        ]
      },
      {
        "type": "heading",
        "text": "Developer Livestream and Customs"
      },
      {
        "type": "list",
        "items": [
          "Jeremy SunsetLion, Des Sug3rz, and Elliot Tetragon host the livestream from 7PM to 9PM PT on Discord and Twitch.",
          "Developer-hosted custom games are scheduled for South America and North America, with team members available for groups during NA queues."
        ]
      }
    ],
    "mentions": []
  },
  {
    "id": "1904-patchnotes",
    "slug": "1904_patchnotes",
    "title": "Arkheron 0.19.0.4 Patch Notes",
    "date": "2026-04-02",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/1904_patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1775173939-ark_blog_patchnotes_0_1904-1.png?auto=format&fit=max&w=1200",
    "excerpt": "This patch rotates Eternal sets, changes Edani and Leodin, updates Floor 2, and fixes known issues.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Eternal Rotation"
      },
      {
        "type": "paragraph",
        "text": "Dahla and Grimwold are in; Irenna and Karriv are out."
      },
      {
        "type": "heading",
        "text": "Gameplay and Floor 2"
      },
      {
        "type": "list",
        "items": [
          "Edani's banished enemies are slowed by 50%, and Outburst Crown radius is now 9 at Level 1 and 12 at Level 3.",
          "Leodin's Sanctuary amulet uses team colors.",
          "Major-elimination Empowered gain is 2.5; self-revive, Rescue, Execute, and bot execution interactions were updated.",
          "Added Forbidden Halls: Dark Study, Stacks: The Collapse, and changes to Sneaky Passage with loot, monsters, and an Ascension blocker."
        ]
      },
      {
        "type": "heading",
        "text": "Known Issues and Fixes"
      },
      {
        "type": "list",
        "items": [
          "Known issues include exit crashes, controller selection of the FNF card, a combat social menu, and missing FNF localization.",
          "Fixed stationary-object damage, Ravah Ringblade sprint throwing speed, connection-timeout lockups, Mahara loading, end-of-game overlays, audio effects, and general lag and performance instability."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Outburst Crown"
      },
      {
        "type": "item",
        "name": "Sanctuary"
      },
      {
        "type": "item",
        "name": "Ringblade"
      }
    ]
  },
  {
    "id": "19-miniupdate",
    "slug": "19_miniupdate",
    "title": "Arkheron 0.19.0.2 Patch Notes",
    "date": "2026-03-31",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/19_miniupdate/",
    "heroImage": "https://www.arkheron.com/160850/1774988108-ark_blog_patch_0_1902.png?auto=format&fit=max&w=1200",
    "excerpt": "This Experimental Client update rotates Eternals, increases Edani's Crown Range, and fixes several bugs.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The build is playable on the Experimental Client, during Friday Night Fights, or in custom games."
      },
      {
        "type": "heading",
        "text": "Eternal Rotation"
      },
      {
        "type": "paragraph",
        "text": "Grimwold and Dahla are out; Rynshi and Ravah are in."
      },
      {
        "type": "list",
        "items": [
          "Edani's Crown Range is now 9 at Level 1 and 12 at Level 3, up from 7 and 9.",
          "Fixed doubled Transform sounds, players walking in place, premature Stop Damage Buff sounds for Hollow and Tsu'Bo, stacked frontend Options UI sounds, and Irenna's Icebreaker Mace affecting enemies outside the ice cone."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Icebreaker Mace"
      }
    ]
  },
  {
    "id": "experimental-1803-patchnotes",
    "slug": "experimental-1803-patchnotes",
    "title": "Arkheron Experimental 0.18.0.3 Patch Notes",
    "date": "2026-03-30",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/experimental-1803-patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1774911979-ark_blog_patch_0_1803.png?auto=format&fit=max&w=1200",
    "excerpt": "This Experimental update fixes lighting, movement, UI, map, ability, customization, and hit-registration bugs.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed overly bright Beacons, slide-walking appearances, orange health bars, missing Floor 2 projectile collision, and Karriv's Flaming Lantern being usable twice before cooldown.",
          "Fixed Skins voice preview audio, Archives bookshelf dissolve, Esc menu interaction, Penelope's Porcelain Parasol crowd-control immunity, stuck full-screen glow, dead-player map pinging, and Dahla's Blade reset on kill.",
          "Fixed inconsistent hit registration for Rynshi's Wrath Cleaver and Edani's Pulling Claws."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Flaming Lantern"
      },
      {
        "type": "item",
        "name": "Porcelain Parasol"
      },
      {
        "type": "item",
        "name": "Wrath Cleaver"
      },
      {
        "type": "item",
        "name": "Pulling Claws"
      }
    ]
  },
  {
    "id": "experimental-1802-patchnotes",
    "slug": "experimental-1802-patchnotes",
    "title": "Arkheron Experimental 0.18.0.2 Patch Notes",
    "date": "2026-03-26",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/experimental-1802-patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1774487775-ark_blog_patch_0_1802.png?auto=format&fit=max&w=1200",
    "excerpt": "This Experimental update fixes combat, map, loading, Floor 4, portal, resurrection, and UI issues.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed Scimitar's Whirling Slash against Dual-Axes Bull Rush, dissolving walls and pots, Shrine spawning in walls, environmental and water flicker, and incorrect Custom Game Floor 3 starts.",
          "Fixed client stalls, Floor 3 map visibility, missing Start Match sounds, Floor 4 loading, brazier jumping collisions, minimap cutoff, overlapping chests, Archives books, statues, and loading-tip inconsistencies.",
          "Fixed teammate resurrection after Ascension, frontend environmental art, portal facing, map-background items, fullscreen settings, matchmaking request failures, Healing Ward's Eternal background, and Dahla's Dancing Blade damage."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Scimitar"
      },
      {
        "type": "item",
        "name": "Dual-Axes"
      },
      {
        "type": "item",
        "name": "Healing Ward"
      },
      {
        "type": "item",
        "name": "Dancing Blade"
      }
    ]
  },
  {
    "id": "fnf-march-27",
    "slug": "fnf_march_27",
    "title": "Friday Night Fights Returns - Turbo Ascension & Solo Leaderboard",
    "date": "2026-03-26",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fnf_march_27/",
    "heroImage": "https://www.arkheron.com/160850/1774551015-ark_blog_header_fnf_v2.png?auto=format&fit=max&w=1200",
    "excerpt": "Friday Night Fights introduces Turbo Ascension, a five-game solo leaderboard, developer livestream and LFG, and Bonfire custom games.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Turbo Ascension"
      },
      {
        "type": "paragraph",
        "text": "Eight teams drop directly onto Floor 2 for shorter games, scrappier looting, and fewer full builds."
      },
      {
        "type": "heading",
        "text": "Solo Queue Leaderboard"
      },
      {
        "type": "list",
        "items": [
          "Players score their top five games through Major Eliminations: 1 point on Floor 1, 2 on Floor 2, and 3 on Floor 3.",
          "A sixth game replaces the lowest score when higher; the leaderboard updates live during the night."
        ]
      },
      {
        "type": "heading",
        "text": "Livestream and Custom Games"
      },
      {
        "type": "paragraph",
        "text": "High-skill developers livestream from Discord during the North American queues, help players through the looking-for-group channel, and host a North American custom game after the queues."
      }
    ],
    "mentions": []
  },
  {
    "id": "experimental-1801-patchnotes",
    "slug": "experimental-1801-patchnotes",
    "title": "Arkheron Experimental 0.18.0.1 Patch Notes",
    "date": "2026-03-19",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/experimental-1801-patchnotes/",
    "heroImage": "https://www.arkheron.com/160850/1774397760-ark_blog_patchnotes_018.png?auto=format&fit=max&w=1200",
    "excerpt": "This Experimental update fixes customization, loading, voice chat, combat registration, UI, portals, bots, and item descriptions.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Bug Fixes and Improvements"
      },
      {
        "type": "list",
        "items": [
          "Custom colors now display and save correctly; fixed leaving-match loading, voice-chat icons, TypeName labels, spectator Victory screens, Gateway labels, and lobby flow.",
          "Improved Dahla's Throwing Knives registration and Scimitar hitbox; fixed Leodin's Eclipse Hammer numbers and first-hit registration, Rynshi's Fury Bracers cancellation, and Tsu'Bo's Boom Chakas against bound dashing players.",
          "Fixed teammate revival, Floor 3 flicker, Ravah Crossbow charge display, countdown text, social-panel profiles, teammate-info loading, healing numbers, status-effect audio, fortitude UI, and spectating audio.",
          "Improved bot item selection and fixed portals, Rejuvenate, Healing Ward description, DLSS artifacts, Crowns under Shadowsmoke Crown, and several visual and UI issues."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Throwing Knives"
      },
      {
        "type": "item",
        "name": "Eclipse Hammer"
      },
      {
        "type": "item",
        "name": "Fury Bracers"
      },
      {
        "type": "item",
        "name": "Boom Chakas"
      },
      {
        "type": "item",
        "name": "Shadowsmoke Crown"
      },
      {
        "type": "item",
        "name": "Healing Ward"
      }
    ]
  },
  {
    "id": "patch-notes-17",
    "slug": "patch-notes-17",
    "title": "Update 0.17 Patch Notes",
    "date": "2026-03-13",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/patch-notes-17/",
    "heroImage": "https://www.arkheron.com/160850/1773186178-ark_blog_patch_0_17.png?auto=format&fit=max&w=1200",
    "excerpt": "Update 0.17 fixes abilities, Eternal items, voice chat, environments, controls, customization, bots, and crashes.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Fixes"
      },
      {
        "type": "list",
        "items": [
          "Fixed Dahla's Dancing Blade, Edani's Banish and Outburst Crown, the Destroyer's interactions, Grimwold's Oscillating Regeneration Crown and Static Turret, Irenna's Caretaker and Frost Armor Crown, and Penelope's Looking Glass and Vaton's Seeing Eye visuals.",
          "Fixed voice-chat UI, weapon and dodge sound effects, damage numbers, embedded projectiles, Crown placement, Karriv and Rynshi sound effects, and Frost Armor HUD persistence.",
          "Fixed tutorial, collision, lighting, dissolve, loading, controller, social-menu, party-leader, frontend music, localization, waterfall VFX, and crash issues.",
          "Fixed Destroyer healing, widescreen sidebars, custom font settings, and multiple gameplay and UI issues; optimized shader graphs."
        ]
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Dancing Blade"
      },
      {
        "type": "item",
        "name": "Outburst Crown"
      },
      {
        "type": "item",
        "name": "Oscillating Regeneration Crown"
      },
      {
        "type": "item",
        "name": "Static Turret"
      },
      {
        "type": "item",
        "name": "Caretaker"
      },
      {
        "type": "item",
        "name": "Frost Armor Crown"
      },
      {
        "type": "item",
        "name": "Looking Glass"
      },
      {
        "type": "item",
        "name": "Seeing Eye"
      }
    ]
  },
  {
    "id": "fridaynightfights",
    "slug": "fridaynightfights",
    "title": "Introducing Friday Night Fights!",
    "date": "2026-03-09",
    "category": "Events",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/fridaynightfights/",
    "heroImage": "https://www.arkheron.com/160850/1775160037-ark_blog_header_fnf_v3.png?auto=format&fit=max&w=1200",
    "excerpt": "Friday Night Fights reopens Arkheron every Friday on the Experimental Client with regional play windows, Custom Games, and Training Mode.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "Weekly Friday Night Fights begin March 13 on the Experimental Client while the team works toward Closed Beta."
      },
      {
        "type": "heading",
        "text": "How to Join and Regional Times"
      },
      {
        "type": "list",
        "items": [
          "Players can get the Experimental Client through Bonfire and join Discord for updates and feedback.",
          "Regional windows are Asia/Pacific 12PM-2PM UTC, Europe 8PM-10PM UTC, South America 11PM-1AM UTC, and North America 2AM-4AM UTC."
        ]
      },
      {
        "type": "heading",
        "text": "Custom Games and Experimental Development"
      },
      {
        "type": "paragraph",
        "text": "Update .17 introduces Custom Games and Training Mode is available 24/7. The team warns that the Experimental Client contains live-development prototypes, changing matchmaking, bugs, crashes, and features that may not yet be localized. There is no NDA, so players may stream and share matches."
      }
    ],
    "mentions": []
  },
  {
    "id": "thankyou",
    "slug": "thankyou",
    "title": "Thanks for Playing during Next Fest!",
    "date": "2026-03-03",
    "category": "Community",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/thankyou/",
    "heroImage": "https://www.arkheron.com/160850/1772574015-ark_blog_header_snf_thanks.png?auto=format&fit=max&w=1200",
    "excerpt": "The team shares what Next Fest revealed about Arkheron's strengths, technical needs, new-player experience, hit clarity, and plans for Closed Beta.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "The Fun Stuff"
      },
      {
        "type": "list",
        "items": [
          "Players theorycrafted builds, discussed item synergies and trade-offs, iterated after Beacon fights, and showed early signs of a competitive meta.",
          "The team plans to explore deeper competitive play and progression with Ranked during Closed Beta."
        ]
      },
      {
        "type": "heading",
        "text": "What Needs Work"
      },
      {
        "type": "paragraph",
        "text": "Next Fest provided clearer performance data across PCs and setups. The team is prioritizing optimization, crashes, disconnects, high ping, a more approachable new-player experience, hit clarity, and clearer item HUD information, while reviewing feedback on balance, modes, queues, and matchmaking."
      },
      {
        "type": "heading",
        "text": "The Road Ahead"
      },
      {
        "type": "paragraph",
        "text": "The team will assess the test and lock in Closed Beta plans. Players can request Closed Beta access on Steam; people with an Alpha Playtest key do not need another one."
      }
    ],
    "mentions": []
  },
  {
    "id": "16-update-c",
    "slug": "16-update-c",
    "title": ".16 Update C",
    "date": "2026-02-26",
    "category": "Updates",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/16-update-c/",
    "heroImage": "https://www.arkheron.com/160850/1772163179-ark_blog_website_016hotfix_c_patch.png?auto=format&fit=max&w=1200",
    "excerpt": "Update C rotates Eternal sets, changes Ravah and Leodin items, and adds nearby-region matchmaking during off-peak hours.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The update deploys automatically at 10AM PT with no downtime or new download."
      },
      {
        "type": "heading",
        "text": "Eternal Set Rotation"
      },
      {
        "type": "list",
        "items": [
          "Hollow and Vaton leave; Ravah and Leodin return.",
          "Ravah's Talonflight Crossbow Unload stun is 1 second at all levels and its Level III Piercing Shot passes through targets.",
          "Leodin's Radiant Crown includes Crushing and lifesteal values; Eclipse Hammer gains a strike and changes damage; Glint Spear gains Piercing damage and a shorter Reflect channel."
        ]
      },
      {
        "type": "heading",
        "text": "Off-Peak Matchmaking"
      },
      {
        "type": "paragraph",
        "text": "Players experiencing excessive waits may be matched into a nearby region with a healthier queue population, which can result in higher ping."
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Talonflight Crossbow"
      },
      {
        "type": "item",
        "name": "Radiant Crown"
      },
      {
        "type": "item",
        "name": "Eclipse Hammer"
      },
      {
        "type": "item",
        "name": "Glint Spear"
      }
    ]
  },
  {
    "id": "16-hotfix",
    "slug": "16-hotfix",
    "title": ".16 Hotfixes A&B",
    "date": "2026-02-24",
    "category": "Hotfix",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/16-hotfix/",
    "heroImage": "https://www.arkheron.com/160850/1771952790-ark_steam_event_016hotfix.png?auto=format&fit=max&w=1200",
    "excerpt": "Two .16 hotfixes reduce the power of Rynshi, Penelope, and Tsu'Bo sets and add a warning for players who leave matches early.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "0.16 Hotfix A"
      },
      {
        "type": "list",
        "items": [
          "Penelope's Looking Glass base damage is 5 and detonate damage is 15.",
          "Tsu'Bo's Forefather Crown damage is 5, duration is 8, and Level 3 Yah'towa hitpoints are 100.",
          "Tsu'Bo's Boom-Chakas Bind durations are reduced and Endling grants 70% more low-health damage.",
          "Rynshi's Relentless set bonus grants 40% low-health damage reduction."
        ]
      },
      {
        "type": "heading",
        "text": "0.16 Hotfix B"
      },
      {
        "type": "paragraph",
        "text": "A new warning tells downed players they may be revived and asks them not to leave; it also warns of possible future penalties for repeatedly leaving early."
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Looking Glass"
      },
      {
        "type": "item",
        "name": "Forefather Crown"
      },
      {
        "type": "item",
        "name": "Boom-Chakas"
      }
    ]
  },
  {
    "id": "opendemo",
    "slug": "opendemo",
    "title": "Our Next Fest Demo is Live - Play Now!",
    "date": "2026-02-20",
    "category": "Announcement",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/opendemo/",
    "heroImage": "https://www.arkheron.com/160850/1771609724-ark_blog_website_nextfestdemo.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron's Steam Next Fest demo is live with new updates, two new Eternal Item Sets, a trailer, FAQ, and Closed Beta sign-up information.",
    "videoUrl": "https://youtu.be/OkBYdWY72rE",
    "content": [
      {
        "type": "paragraph",
        "text": "The Steam Next Fest demo is available globally on PC through Steam without a key. Servers are live 24/7 until March 2."
      },
      {
        "type": "heading",
        "text": "New Trailer and Shattered System Explainer"
      },
      {
        "type": "paragraph",
        "text": "The article links the New Trailer, Shattered System Explainer, and videos introducing the latest update and new Eternal Item Sets."
      },
      {
        "type": "heading",
        "text": "FAQ"
      },
      {
        "type": "list",
        "items": [
          "Arkheron is a team-based PvP game where 45 players compete to ascend a tower; teams of three gather items and combine abilities.",
          "Launch timing is not confirmed, but launch is planned for later in the year; PC, PlayStation, and Xbox are planned.",
          "Arkheron will launch with an upfront price. Closed Beta will test part of Ranked mode, and no solo mode is planned yet."
        ]
      },
      {
        "type": "heading",
        "text": "Closed Beta"
      },
      {
        "type": "paragraph",
        "text": "Following Next Fest, the team will announce Closed Beta; players can request access, and existing main-client access permits entry."
      }
    ],
    "mentions": []
  },
  {
    "id": "nextfest-expectations",
    "slug": "nextfest_expectations",
    "title": "Tech Update - Where We're At, February 2026",
    "date": "2026-02-19",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/nextfest_expectations/",
    "heroImage": "https://www.arkheron.com/160850/1771551782-ark_blog_performance-features.png?auto=format&fit=max&w=1200",
    "excerpt": "This technical update explains Arkheron's performance, loading, anti-cheat, matchmaking, regional support, and bot state ahead of Next Fest.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Performance and Loading"
      },
      {
        "type": "paragraph",
        "text": "The team is targeting smooth 60FPS+ performance and continuing large-scale optimization. Current minimum specifications are Windows 10, Intel i5-7600K, 16GB RAM, GTX 1060 6GB, and a 25GB SSD; recommended are Windows 10, Intel i5-9600K, 16GB RAM, RTX 2070 8GB, and a 25GB SSD. An SSD is strongly recommended because the client pre-warms shaders."
      },
      {
        "type": "heading",
        "text": "Matchmaking and Regional Support"
      },
      {
        "type": "list",
        "items": [
          "Matches require 45 players; skill estimation takes around 10-20 matches.",
          "The system balances skill, ping, queue time, language when possible, and premade-team considerations.",
          "Update .16 added a regional server selector."
        ]
      },
      {
        "type": "heading",
        "text": "Bots"
      },
      {
        "type": "paragraph",
        "text": "Bots are early in development. Bot Mode supports solo, duo, and trio parties with enemy teams matching party size; live matches may use bots when queues need filling, while higher-skill matches prioritize competitive integrity."
      }
    ],
    "mentions": []
  },
  {
    "id": "road-ahead-feb-2026",
    "slug": "road-ahead-feb-2026",
    "title": "The Road Ahead & Patch Notes",
    "date": "2026-02-11",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/road-ahead-feb-2026/",
    "heroImage": "https://www.arkheron.com/160850/1770829528-arkheron_thumb_roadahead_v2.png?auto=format&fit=max&w=1200",
    "excerpt": "Arkheron announces its Steam Next Fest demo, two incoming Eternal Item Sets, Patch 0.16.0, and the future Closed Beta.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The Next Fest demo launches February 20 and runs 24/7 through March 2 with no key required. A separate demo client is required, with download at 9AM Pacific and game time at 10AM Pacific."
      },
      {
        "type": "heading",
        "text": "Closed Beta"
      },
      {
        "type": "paragraph",
        "text": "After Next Fest, the team will announce Closed Beta. It will return to the main client; existing key holders are ready, while others can request access for the waitlist."
      },
      {
        "type": "heading",
        "text": "Update 0.16.0 and FAQ"
      },
      {
        "type": "paragraph",
        "text": "Two new Eternal Item Sets enter the loot pool and two existing sets rotate out. The FAQ describes Arkheron as a 45-player, three-person-team PvP game, with planned PC, PlayStation, and Xbox launch, no free-to-play model, planned Ranked progression, and no solo mode yet."
      }
    ],
    "mentions": []
  },
  {
    "id": "patch-notes-12-16",
    "slug": "patch-notes-12-16",
    "title": "Patch Notes 0.12 to 0.16",
    "date": "2026-02-11",
    "category": "Patch Notes",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/patch-notes-12-16/",
    "heroImage": "https://www.arkheron.com/160850/1774398528-ark_blog_patch_0_16.png?auto=format&fit=max&w=1200",
    "excerpt": "These notes cover several months of changes from updates 0.12.0 through 0.16.0, including Eternal items, gameplay, UI, controls, bots, performance, and fixes.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The build is for the Steam Next Fest demo from February 20 through March 2. Two new Eternal Item Sets were added while Leodin and Ravah temporarily leave the loot pool."
      },
      {
        "type": "heading",
        "text": "Notable Systems"
      },
      {
        "type": "list",
        "items": [
          "Added a tutorial, Recent Teammates, a revised Floor 2, 14-meter line of sight, Bots matches for solo/duo/trio parties, and a Regional Server Selector.",
          "Combat clarity adds hit flashes, audio cues, low-health feedback, crowd-control immunity glow, and long-range projectile changes.",
          "Global damage mitigation is capped at 80%; consumable stacks, Rescue, Beacons, monsters, UI, environments, audio, controls, spectating, performance, and bots were updated."
        ]
      },
      {
        "type": "heading",
        "text": "Eternal and Echo Items"
      },
      {
        "type": "list",
        "items": [
          "Changes affect Dahla, Edani, Grimwold, Hollow, Irenna, Karriv, Rynshi, Vaton, Elusive Crown, Bashing Shield, Great Sword, Dual Axes, Shuriken, Bow, and Scimitar, including the exact balance values documented in the article.",
          "Quest mobs have a subtle glow and 300 HP, distinct from 200-HP Tormentors; quest rewards now offer two Legendary chests and one Mythic."
        ]
      },
      {
        "type": "heading",
        "text": "Bots and Bug Fixes"
      },
      {
        "type": "paragraph",
        "text": "Bot navigation, idle behavior, and shield combat were improved. The article also records fixes for animation-cancel macros, Rescue and revive interactions, voice, environments, tutorials, controllers, quests, abilities, loading, and crashes."
      }
    ],
    "mentions": [
      {
        "type": "item",
        "name": "Bashing Shield"
      },
      {
        "type": "item",
        "name": "Great Sword"
      },
      {
        "type": "item",
        "name": "Dual Axes"
      },
      {
        "type": "item",
        "name": "Shuriken"
      },
      {
        "type": "item",
        "name": "Bow"
      },
      {
        "type": "item",
        "name": "Scimitar"
      }
    ]
  },
  {
    "id": "2026-welcome-back",
    "slug": "2026-welcome-back",
    "title": "We're Back at Work!",
    "date": "2026-01-08",
    "category": "News",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/2026-welcome-back/",
    "heroImage": "https://www.arkheron.com/160850/1767905030-ark_socal_2026playtest_16x9.jpg?auto=format&fit=max&w=1200",
    "excerpt": "The team returns to work, plans a February announcement, and invites North American testers to underground playtests.",
    "videoUrl": null,
    "content": [
      {
        "type": "paragraph",
        "text": "The team is returning to work on Arkheron and says early February will bring an official announcement about what to expect and when players can play."
      },
      {
        "type": "paragraph",
        "text": "Underground playtests will initially invite North American testers to test changes on local time zones and servers; everyone is encouraged to apply because regions may expand later."
      }
    ],
    "mentions": []
  },
  {
    "id": "a-note-from-rob-pardo",
    "slug": "a-note-from-rob-pardo",
    "title": "A Note From Rob Pardo",
    "date": "2025-09-17",
    "category": "Developer Update",
    "source": "Official Arkheron",
    "sourceUrl": "https://www.arkheron.com/en_US/news/a-note-from-rob-pardo/",
    "heroImage": "https://www.arkheron.com/160850/1759172264-arkheron_1.webp?auto=format&fit=max&w=1200",
    "excerpt": "Rob Pardo welcomes players to the Arkheron Alpha and explains the team's development process, expectations, and invitation to help shape the game.",
    "videoUrl": null,
    "content": [
      {
        "type": "heading",
        "text": "Welcome to the Arkheron Alpha!"
      },
      {
        "type": "paragraph",
        "text": "The team rebuilt Arkheron's combat four times before finding its current version. Every morning the team plays the game, discusses what worked, and makes changes for the next build."
      },
      {
        "type": "paragraph",
        "text": "After internal playtests, friends and family, and skilled competitive players, the team is opening the Alpha to thousands of new players. The article sets expectations for a steep learning curve, early onboarding, early bots, and immature matchmaking."
      },
      {
        "type": "paragraph",
        "text": "Pardo explains that playtesting, community feedback, and following the fun will guide development toward launch, and invites players to report what excites them or misses the mark."
      }
    ],
    "mentions": []
  },

]

/**
 * Return the curated set of official Arkheron news articles.
 * Deliberately async (and returns copies) so callers can treat this exactly
 * like a network call, and a future live-fetch implementation is a drop-in
 * replacement.
 * @returns {Promise<object[]>}
 */
export async function fetchOfficialArticles() {
  return ARTICLES.map((article) => ({
    ...article,
    content: article.content.map((block) => ({ ...block })),
    mentions: article.mentions.map((mention) => ({ ...mention })),
  }))
}

export default { fetchOfficialArticles }
