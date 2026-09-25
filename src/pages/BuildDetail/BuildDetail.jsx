import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import BuildService from '../../data/BuildService.js'
import ItemInspectionPanel from '../../components/ItemInspectionPanel/ItemInspectionPanel.jsx'
import BuildSynergyPanel, { synergyBonusImage } from '../../components/BuildSynergyPanel/BuildSynergyPanel.jsx'
import './BuildDetail.css'

function relativeTime(isoDate) {
  if (!isoDate) return null
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo ago`
  return `${Math.floor(months / 12)} yr ago`
}

function BuildDetail() {
  const { id } = useParams()
  const [build, setBuild] = useState(null)
  const [loadout, setLoadout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setBuild(null)
    setLoadout(null)

    const found = BuildService.getBuild(id)
    if (!found) {
      setNotFound(true)
      setLoading(false)
      return undefined
    }

    BuildService.recordBuildView(found.id)
    // Re-read after recording so the displayed view count reflects this visit.
    const withView = BuildService.getBuild(id)
    setBuild(withView)

    BuildService.resolveBuildLoadout(withView)
      .then((resolved) => {
        if (cancelled) return
        setLoadout(resolved)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy build link:', err)
    }
  }

  return (
    <div className="build-detail-page">
      <Link to="/builds" className="detail-back-link">
        ← Back to Builds
      </Link>

      {loading && <div className="eternals-state">Loading build…</div>}
      {!loading && notFound && <div className="eternals-state">No build found for “{id}”.</div>}

      {!loading && !notFound && build && (
        <div className="loadout-inspect">
          <div className="panel build-header">
            <div className="build-header-top">
              {build.status === 'draft' && <span className="build-draft-badge">Draft</span>}
              <span className="page-eyebrow">
                {loadout?.composition?.length ? loadout.composition.join(' × ') : 'Loadout'}
              </span>
            </div>
            <h1 className="loadout-name">{build.name}</h1>
            {build.author && <span className="build-author">by {build.author}</span>}

            {build.tags?.length > 0 && (
              <div className="tag-row build-tag-row">
                {build.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="build-meta-row">
              <span className="build-meta-item">
                ★ {(build.rating ?? 0).toFixed(1)}{' '}
                <span className="build-card-meta-muted">({build.ratingCount ?? 0} ratings)</span>
              </span>
              <span className="build-meta-item">{build.viewCount ?? 0} views</span>
              <span className="build-meta-item">{build.commentCount ?? 0} comments</span>
              <span className="build-meta-item">Updated {relativeTime(build.updatedAt)}</span>
              {build.id?.startsWith('local-') && (
                <Link to={`/builds/${build.id}/edit`} className="build-share-btn build-edit-link">
                  Edit Build
                </Link>
              )}
              <button type="button" className="build-share-btn" onClick={handleShare}>
                {copied ? 'Link copied!' : 'Share ↗'}
              </button>
            </div>
          </div>

          <div className="panel loadout-panel">
            <span className="panel-eyebrow">Loadout</span>
            <div className="loadout-grid build-loadout-grid">
              <ItemInspectionPanel slotLabel="Anchor Ability" item={loadout?.anchor} variant="anchor" />
              <ItemInspectionPanel
                slotLabel="Crown"
                item={loadout?.crown}
                bonusImage={synergyBonusImage(loadout, loadout?.crown)}
              />
              <ItemInspectionPanel
                slotLabel="Amulet"
                item={loadout?.amulet}
                bonusImage={synergyBonusImage(loadout, loadout?.amulet)}
              />
              <ItemInspectionPanel
                slotLabel="Weapon"
                item={loadout?.weapon1}
                bonusImage={synergyBonusImage(loadout, loadout?.weapon1)}
              />
              <ItemInspectionPanel
                slotLabel="Weapon"
                item={loadout?.weapon2}
                bonusImage={synergyBonusImage(loadout, loadout?.weapon2)}
              />
              <ItemInspectionPanel slotLabel="Consumable" item={loadout?.consumable} variant="consumable" />
            </div>
          </div>

          {loadout?.synergies?.length > 0 && (
            <div className="panel build-section">
              <span className="panel-eyebrow">Set Bonuses</span>
              <p className="build-synergy-summary">
                Derived from the loadout above — a build can validly have zero active set bonuses.
              </p>
              <BuildSynergyPanel synergies={loadout.synergies} />
            </div>
          )}

          {(build.bigIdea || build.rotation || build.tips || build.playstyle || build.recommendedUse) && (
            <div className="panel build-section build-description-panel">
              <span className="panel-eyebrow">Build Details</span>
              {build.bigIdea && (
                <div className="build-detail-field">
                  <span className="build-detail-field-label">The Big Idea</span>
                  <p className="build-detail-field-text">{build.bigIdea}</p>
                </div>
              )}
              {build.playstyle && (
                <div className="build-detail-field">
                  <span className="build-detail-field-label">Playstyle</span>
                  <p className="build-detail-field-text">{build.playstyle}</p>
                </div>
              )}
              {build.rotation && (
                <div className="build-detail-field">
                  <span className="build-detail-field-label">Rotation / Gameplan</span>
                  <p className="build-detail-field-text">{build.rotation}</p>
                </div>
              )}
              {build.tips && (
                <div className="build-detail-field">
                  <span className="build-detail-field-label">Tips</span>
                  <p className="build-detail-field-text">{build.tips}</p>
                </div>
              )}
              {build.recommendedUse && (
                <div className="build-detail-field">
                  <span className="build-detail-field-label">Recommended Use</span>
                  <p className="build-detail-field-text">{build.recommendedUse}</p>
                </div>
              )}
            </div>
          )}

          <div className="panel build-section build-metrics-panel">
            <span className="panel-eyebrow">Build Metrics (Prototype)</span>
            <p className="build-metrics-note">
              These numbers are local/prototype values for demonstrating the UI — Tower does not yet have a
              real backend for ratings, views, or comments.
            </p>
            <div className="build-metrics-row">
              <div className="build-metric">
                <span className="build-metric-value">{(build.rating ?? 0).toFixed(1)}</span>
                <span className="build-metric-label">Rating ({build.ratingCount ?? 0})</span>
              </div>
              <div className="build-metric">
                <span className="build-metric-value">{build.viewCount ?? 0}</span>
                <span className="build-metric-label">Views</span>
              </div>
              <div className="build-metric">
                <span className="build-metric-value">{build.commentCount ?? 0}</span>
                <span className="build-metric-label">Comments</span>
              </div>
            </div>
          </div>

          <div className="panel build-section build-comments-panel">
            <span className="panel-eyebrow">Comments / Community Discussion</span>
            <p className="build-metrics-note">Comments are not implemented yet — Tower has no backend for community discussion.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildDetail
