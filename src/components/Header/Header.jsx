import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../Nav/Nav.jsx'
import SearchBox from '../SearchBox/SearchBox.jsx'
import './Header.css'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="brand" onClick={closeMenu}>
            TOWER
          </Link>
        </div>

        <SearchBox onNavigate={closeMenu} />

        <div className="header-right">
          <Link to="/login" className="header-auth-link header-auth-signin" onClick={closeMenu}>
            Sign In
          </Link>
          <Link to="/signup" className="header-auth-link header-auth-signup" onClick={closeMenu}>
            Sign Up
          </Link>
          <Link to="/settings" className="header-settings" aria-label="Settings">
            ⚙
          </Link>
          <button
            className="header-menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={menuOpen ? 'header-nav-row header-nav-row-open' : 'header-nav-row'}>
        <Nav onNavigate={closeMenu} />
        <div className="header-nav-row-auth">
          <Link to="/login" className="header-auth-link header-auth-signin" onClick={closeMenu}>
            Sign In
          </Link>
          <Link to="/signup" className="header-auth-link header-auth-signup" onClick={closeMenu}>
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
