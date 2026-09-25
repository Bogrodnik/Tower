import Header from '../Header/Header.jsx'
import Footer from '../Footer/Footer.jsx'

function Layout({ children }) {
  return (
    <div className="site">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
