import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ListPage from './pages/ListPage'
import EditPage from './pages/EditPage'
import PreviewPage from './pages/PreviewPage'

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">BBCode Templates</Link>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/edit" element={<EditPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
