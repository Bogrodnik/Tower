import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NewsService from '../../data/NewsService.js'
import YouTubeEmbed from '../../components/YouTubeEmbed/YouTubeEmbed.jsx'
import NewsCard from '../../components/NewsCard/NewsCard.jsx'
import ItemTooltip from '../../components/ItemTooltip/ItemTooltip.jsx'
import './NewsDetail.css'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function ArticleBody({ blocks }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="news-article-body">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={index} className="news-article-heading">
              {block.text}
            </h2>
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="news-article-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={index} className="news-article-paragraph">
            {block.text}
          </p>
        )
      })}
    </div>
  )
}

function NewsDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setArticle(null)
    setRelated([])

    Promise.all([NewsService.getArticle(id), NewsService.getRelatedArticles(id, 3)])
      .then(([foundArticle, relatedArticles]) => {
        if (cancelled) return
        setArticle(foundArticle || null)
        setRelated(relatedArticles)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load Arkheron news article:', err)
        setError('Unable to load this article right now.')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="news-detail-page">
      <Link to="/news" className="detail-back-link">
        ← Back to News
      </Link>

      {loading && <div className="eternals-state">Loading article…</div>}
      {!loading && error && <div className="eternals-state eternals-state-error">{error}</div>}
      {!loading && !error && !article && (
        <div className="eternals-state">No article found for “{id}”.</div>
      )}

      {!loading && !error && article && (
        <article className="news-article">
          {article.heroImage && (
            <div className="news-article-hero">
              <img src={article.heroImage} alt="" />
            </div>
          )}

          <div className="news-article-meta">
            <span className="news-article-category">{article.category}</span>
            <span className="news-article-date">{formatDate(article.date)}</span>
          </div>

          <h1 className="news-article-title">{article.title}</h1>

          {article.videoUrl && (
            <div className="news-article-video">
              <YouTubeEmbed url={article.videoUrl} title={article.title} />
            </div>
          )}

          <ArticleBody blocks={article.content} />

          {article.relatedEntities?.length > 0 && (
            <div className="panel news-related-entities">
              <span className="panel-eyebrow">Related Database Entries</span>
              <div className="news-related-entities-list">
                {article.relatedEntities.map((entity) => (
                  <Link
                    key={`${entity.type}-${entity.id}`}
                    to={entity.type === 'eternal' ? `/eternals/${entity.id}` : `/items/${entity.id}`}
                    className="tag-pill news-related-entity-pill"
                  >
                    {entity.type === 'item' ? (
                      <ItemTooltip itemId={entity.id}>{entity.name}</ItemTooltip>
                    ) : (
                      entity.name
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="panel news-source-panel">
            <span className="panel-eyebrow">Official Source</span>
            <p className="news-source-text">Source: {article.source}</p>
            <a className="detail-external-link" href={article.sourceUrl} target="_blank" rel="noreferrer">
              Read Original ↗
            </a>
          </div>

          {related.length > 0 && (
            <div className="news-related-articles">
              <span className="panel-eyebrow">Related News</span>
              <div className="news-related-grid">
                {related.map((relatedArticle) => (
                  <NewsCard key={relatedArticle.id} article={relatedArticle} compact />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  )
}

export default NewsDetail
