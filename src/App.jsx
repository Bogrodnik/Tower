import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Home from './pages/Home/Home.jsx'
import Eternals from './pages/Eternals/Eternals.jsx'
import EternalDetail from './pages/EternalDetail/EternalDetail.jsx'
import Items from './pages/Items/Items.jsx'
import ItemDetail from './pages/ItemDetail/ItemDetail.jsx'
import Monsters from './pages/Monsters/Monsters.jsx'
import MonsterDetail from './pages/MonsterDetail/MonsterDetail.jsx'
import Maps from './pages/Maps/Maps.jsx'
import MapDetail from './pages/MapDetail/MapDetail.jsx'
import Builds from './pages/Builds/Builds.jsx'
import BuildDetail from './pages/BuildDetail/BuildDetail.jsx'
import BuildCreate from './pages/BuildCreate/BuildCreate.jsx'
import Guides from './pages/Guides/Guides.jsx'
import News from './pages/News/News.jsx'
import NewsDetail from './pages/NewsDetail/NewsDetail.jsx'
import Tournaments from './pages/Tournaments/Tournaments.jsx'
import Draft from './pages/Draft/Draft.jsx'
import Settings from './pages/Settings/Settings.jsx'
import Login from './pages/Login/Login.jsx'
import Signup from './pages/Signup/Signup.jsx'
import Search from './pages/Search/Search.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eternals" element={<Eternals />} />
        <Route path="/eternals/:id" element={<EternalDetail />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/monsters" element={<Monsters />} />
        <Route path="/monsters/:id" element={<MonsterDetail />} />
        <Route path="/maps" element={<Maps />} />
        <Route path="/maps/:id" element={<MapDetail />} />
        <Route path="/builds" element={<Builds />} />
        <Route path="/builds/create" element={<BuildCreate />} />
        <Route path="/builds/:id/edit" element={<BuildCreate />} />
        <Route path="/builds/:id" element={<BuildDetail />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/draft" element={<Draft />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Layout>
  )
}

export default App
