import { Link } from 'react-router-dom'
import './Footer.css'

const FOOTER_COLUMNS = [
  {
    heading: 'Database',
    links: [
      { to: '/eternals', label: 'Eternals' },
      { to: '/items', label: 'Items' },
    ],
  },
  {
    heading: 'Content',
    links: [
      { to: '/guides', label: 'Guides' },
      { to: '/news', label: 'News' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { to: '/builds', label: 'Builds' },
      { to: '/tournaments', label: 'Tournaments' },
    ],
  },
  {
    heading: 'Tools',
    links: [{ to: '/draft', label: 'Draft' }],
  },
  {
    heading: 'About',
    links: [
      { to: '/settings', label: 'Settings' },
      { href: 'https://www.arkheron.com/en_US/news/', label: 'Official Arkheron' },
      { href: 'https://arkheron.wiki.gg/', label: 'Arkheron Wiki' },
    ],
  },
]

// Slim top strip mirroring Wowhead's footer-navigation row — a quick
// horizontal link list sitting above the full column layout below.
const FOOTER_QUICK_LINKS = FOOTER_COLUMNS.flatMap((column) => column.links).filter((link) => link.to)

function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-quicknav" aria-label="Quick links">
        <div className="footer-quicknav-inner">
          {FOOTER_QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="footer-quicknav-link">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-title">TOWER</span>
            <p className="footer-tagline">The Arkheron database and community hub.</p>
          </div>

          <div className="footer-columns">
            {FOOTER_COLUMNS.map((column) => (
              <nav className="footer-column" key={column.heading} aria-label={column.heading}>
                <span className="footer-column-heading">{column.heading}</span>
                {column.links.map((link) =>
                  link.href ? (
                    <a
                      key={link.href}
                      href={link.href}
                      className="footer-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.to} to={link.to} className="footer-link">
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Tower. Not affiliated with Arkheron. Data sourced from official
            Arkheron and community sources where applicable.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
