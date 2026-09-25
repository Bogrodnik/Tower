import './YouTubeEmbed.css'

// Extracts an 11-character YouTube video id from the handful of URL shapes
// official Arkheron articles actually use (youtu.be/<id>, watch?v=<id>).
function extractVideoId(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

function YouTubeEmbed({ url, title = 'Video' }) {
  const videoId = extractVideoId(url)
  if (!videoId) return null

  return (
    <div className="youtube-embed">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}

export default YouTubeEmbed
