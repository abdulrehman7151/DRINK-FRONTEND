import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

function AdminRoute({ children }) {
    const token = localStorage.getItem('token')
    let role = ''

    try {
        if (token) {
            role = jwtDecode(token).role
        }
    } catch {
        localStorage.removeItem('token')
    }

    if (!token || role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute
