function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <div className="page">
      <span className="page-eyebrow">{eyebrow}</span>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
      <div className="accent-bar" />
    </div>
  )
}

export default PlaceholderPage
