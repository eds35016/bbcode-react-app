import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ListPage from './pages/ListPage'
import EditPage from './pages/EditPage'
import PreviewPage from './pages/PreviewPage'
import SharedPreviewPage from './pages/SharedPreviewPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { isLoggedIn, logout } from './utils/api'
import RequireAuth from './utils/RequireAuth'

function App() {
  const [auth, setAuth] = useState(isLoggedIn())

  const handleLogout = () => {
    logout()
    setAuth(false)
  }

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">BBCode Templates</Link>
          <div className="d-flex ms-auto">
            {auth ? (
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            ) : (
              <Link className="btn btn-outline-light" to="/login">Login</Link>
            )}
          </div>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<RequireAuth><ListPage /></RequireAuth>} />
          <Route path="/edit/:id" element={<RequireAuth><EditPage /></RequireAuth>} />
          <Route path="/edit" element={<RequireAuth><EditPage /></RequireAuth>} />
          <Route path="/preview/:id" element={<RequireAuth><PreviewPage /></RequireAuth>} />
          <Route path="/share/:shareId" element={<SharedPreviewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
