import { Link } from 'react-router-dom'
import './NewsCard.css'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function categorySlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-')
}

/**
 * A single news article preview. Used on /news, the homepage Latest News
 * section, and related-article lists — one implementation, no duplicated
 * markup/data.
 */
function NewsCard({ article, featured = false, compact = false }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className={`news-card${featured ? ' news-card-featured' : ''}${compact ? ' news-card-compact' : ''}`}
    >
      <div className="news-card-thumb">
        {article.heroImage ? (
          <img src={article.heroImage} alt="" loading="lazy" />
        ) : (
          <span className="news-card-thumb-fallback" aria-hidden="true">
            {article.category.charAt(0)}
          </span>
        )}
        {article.videoUrl && <span className="news-card-video-badge">▶ Video</span>}
      </div>
      <div className="news-card-body">
        <div className="news-card-meta">
          <span className={`news-card-category news-card-category-${categorySlug(article.category)}`}>
            {article.category}
          </span>
          <span className="news-card-date">{formatDate(article.date)}</span>
        </div>
        <h3 className="news-card-title">{article.title}</h3>
        {!compact && <p className="news-card-excerpt">{article.excerpt}</p>}
        <span className="news-card-source">Source: {article.source}</span>
      </div>
    </Link>
  )
}

export default NewsCard
