import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../utils/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await register(username, password)
      navigate('/')
    } catch {
      setError('Registration failed')
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h2>Register</h2>
        {error && <div className="text-danger mb-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Register</button>
          <Link to="/login" className="btn btn-link">Login</Link>
        </form>
      </div>
    </div>
  )
}
