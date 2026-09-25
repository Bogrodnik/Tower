import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BuildService from '../../data/BuildService.js'
import NewsService from '../../data/NewsService.js'
import BuildRow from '../../components/BuildRow/BuildRow.jsx'
import NewsCard from '../../components/NewsCard/NewsCard.jsx'
import './Home.css'

// A simple hardcoded pointer at an existing BuildService record — not a
// second source of build data. Swap this id to feature a different build.
const FEATURED_BUILD_ID = 'seed-vaton-payback-tank'
const TRENDING_BUILD_COUNT = 3

const FEATURED = [
  { to: '/eternals', title: 'ETERNALS', desc: 'Explore Eternals' },
  { to: '/items', title: 'ITEMS', desc: 'Browse Items' },
  { to: '/builds', title: 'BUILDS', desc: 'Explore Builds' },
  { to: '/guides', title: 'GUIDES', desc: 'Learn Arkheron' },
]

const LATEST_NEWS_COUNT = 6

const COMMUNITY_ITEMS = [
  { title: 'Top Build of the Week', meta: 'Builds · Placeholder' },
  { title: 'Regional Qualifier Results', meta: 'Tournaments · Placeholder' },
  { title: 'Draft Meta Discussion', meta: 'Draft · Placeholder' },
]

const QUICK_DATABASE_LINKS = [
  { to: '/eternals', label: 'Eternals' },
  { to: '/items', label: 'Items' },
  { to: '/builds', label: 'Builds' },
  { to: '/guides', label: 'Guides' },
  { to: '/news', label: 'News' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/draft', label: 'Draft' },
]

const DATABASE_SECTIONS = [
  { to: '/eternals', label: 'Eternals' },
  { to: '/items', label: 'Items' },
  { to: '/builds', label: 'Builds' },
  { to: '/guides', label: 'Guides' },
  { to: '/news', label: 'News' },
  { to: '/tournaments', label: 'Tournaments' },
]

function Home() {
  const [featuredBuild, setFeaturedBuild] = useState(undefined) // undefined = still checking, null = not found
  const [trendingBuilds, setTrendingBuilds] = useState([])
  const [latestNews, setLatestNews] = useState([])

  useEffect(() => {
    setFeaturedBuild(BuildService.getBuild(FEATURED_BUILD_ID) || null)
    const trending = BuildService.sortByTrending(BuildService.getBuilds()).filter((b) => b.id !== FEATURED_BUILD_ID)
    setTrendingBuilds(trending.slice(0, TRENDING_BUILD_COUNT))

    NewsService.getArticles()
      .then((articles) => setLatestNews(articles.slice(0, LATEST_NEWS_COUNT)))
      .catch((err) => console.error('Failed to load Arkheron news for the homepage:', err))
  }, [])

  return (
    <div className="home">
      <section className="home-featured container">
        <div className="home-featured-heading">
          <span className="home-featured-eyebrow">TOWER</span>
          <h1 className="home-featured-title">The Arkheron Database</h1>
        </div>
        <div className="featured-grid">
          {FEATURED.map((item) => (
            <Link to={item.to} className="featured-card" key={item.to}>
              <span className="featured-card-title">{item.title}</span>
              <span className="featured-card-desc">{item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-body container">
        <div className="home-main">
          {featuredBuild && (
            <div className="home-module">
              <h2 className="section-title">Build of the Week</h2>
              <BuildRow build={featuredBuild} featured />
            </div>
          )}

          <div className="home-module">
            <div className="home-section-heading">
              <h2 className="section-title home-section-title-noborder">Latest News</h2>
              <Link to="/news" className="home-section-link">
                See All News →
              </Link>
            </div>
            {latestNews.length > 0 ? (
              <>
                <NewsCard article={latestNews[0]} featured />
                <div className="news-list-compact">
                  {latestNews.slice(1).map((article) => (
                    <NewsCard key={article.id} article={article} compact />
                  ))}
                </div>
              </>
            ) : (
              <div className="list-row">
                <span className="list-row-meta">No news yet.</span>
              </div>
            )}
          </div>

          {trendingBuilds.length > 0 && (
            <div className="home-module">
              <div className="home-section-heading">
                <div>
                  <h2 className="section-title home-section-title-noborder">Trending Builds</h2>
                  <p className="home-section-desc">Community loadouts gaining traction right now.</p>
                </div>
                <Link to="/builds" className="home-section-link">
                  See All Builds →
                </Link>
              </div>
              <div className="trending-builds-stack">
                {trendingBuilds.map((build) => (
                  <BuildRow key={build.id} build={build} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="home-sidebar">
          <div className="sidebar-module">
            <h2 className="sidebar-module-title">Explore the Database</h2>
            <div className="sidebar-list">
              {QUICK_DATABASE_LINKS.map((link) => (
                <Link to={link.to} className="sidebar-list-link" key={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="sidebar-module">
            <h2 className="sidebar-module-title">Community</h2>
            <div className="list-stack">
              {COMMUNITY_ITEMS.map((item) => (
                <div className="list-row" key={item.title}>
                  <span className="list-row-title">{item.title}</span>
                  <span className="list-row-meta">{item.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="home-section container">
        <h2 className="section-title">Database</h2>
        <div className="database-grid">
          {DATABASE_SECTIONS.map((section) => (
            <Link to={section.to} className="database-card" key={section.to}>
              {section.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
