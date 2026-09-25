import { NavLink } from 'react-router-dom'
import './Nav.css'

const NAV_GROUPS = [
  {
    label: 'Database',
    links: [
      { to: '/eternals', label: 'Eternals' },
      { to: '/items', label: 'Items' },
    ],
  },
  {
    label: 'Content',
    links: [
      { to: '/guides', label: 'Guides' },
      { to: '/news', label: 'News' },
    ],
  },
  {
    label: 'Community',
    links: [
      { to: '/builds', label: 'Builds' },
      { to: '/tournaments', label: 'Tournaments' },
    ],
  },
  {
    label: 'Tools',
    links: [{ to: '/draft', label: 'Draft' }],
  },
]

function Nav({ onNavigate }) {
  return (
    <nav className="nav">
      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.label}>
          <span className="nav-group-label">{group.label}</span>
          <div className="nav-group-links">
            {group.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export default Nav
