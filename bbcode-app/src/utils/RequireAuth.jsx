import { Navigate } from 'react-router-dom'
import { isLoggedIn } from './api'

export default function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />
}
