import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ListPage from './pages/ListPage'
import EditPage from './pages/EditPage'
import PreviewPage from './pages/PreviewPage'
import SharedPreviewPage from './pages/SharedPreviewPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { isLoggedIn, logout, getUser } from './utils/api'
import RequireAuth from './utils/RequireAuth'

function App() {
  const [auth, setAuth] = useState(isLoggedIn())
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    const onAuthChange = () => {
      setAuth(isLoggedIn())
      setUser(getUser())
    }
    window.addEventListener('authchange', onAuthChange)
    return () => window.removeEventListener('authchange', onAuthChange)
  }, [])

  const handleLogout = () => {
    logout()
    setAuth(false)
    setUser(null)
  }

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">BBCode Templates</Link>
          <div className="d-flex ms-auto align-items-center">
            {auth ? (
              <>
                {user && (
                  <span className="navbar-text text-white me-3">Logged in as {user.username}</span>
                )}
                <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
              </>
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
