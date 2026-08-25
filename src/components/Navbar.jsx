import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useRef, useState } from 'react'
import { getCartCount } from '../utils/cart'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const navRef = useRef(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [cartCount, setCartCount] = useState(() => getCartCount())

    /* Close mobile menu on route change */
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location.pathname])

    /* Close mobile menu on outside click */
    useEffect(() => {
        if (!isMenuOpen) return

        function handleOutsideClick(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener('pointerdown', handleOutsideClick)
        return () => document.removeEventListener('pointerdown', handleOutsideClick)
    }, [isMenuOpen])

    useEffect(() => {
        const syncCartCount = () => setCartCount(getCartCount())

        window.addEventListener('cartUpdated', syncCartCount)
        window.addEventListener('storage', syncCartCount)

        return () => {
            window.removeEventListener('cartUpdated', syncCartCount)
            window.removeEventListener('storage', syncCartCount)
        }
    }, [])

    const token = localStorage.getItem("token")
    let isAdmin = false

    try {
        if (token) {
            isAdmin = jwtDecode(token).role === 'admin'
        }
    } catch {
        isAdmin = false
    }

    const handleSignOut = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        navigate("/login")
    }

    return (
        <nav className="navbar" ref={navRef}>
            <div className="container nav-content">

                <Link className="logo" to="/" aria-label="Drinkly home">
                    <span>DRINK</span><strong>LY</strong>
                </Link>

                <div className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/products">Menu</NavLink>
                    <NavLink to="/contact">Contact</NavLink>
                    {token && <NavLink to="/my-orders">My Orders</NavLink>}
                    {isAdmin && (
                        <Link className="mobile-admin-link" to="/admin">
                            Admin Panel
                        </Link>
                    )}
                </div>

                <div className="nav-actions">
                    <button
                        className="nav-menu-toggle"
                        type="button"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                    {isAdmin && (
                        <Link className="admin-panel-btn" to="/admin">
                            Admin Panel
                        </Link>
                    )}

                    <Link
                        className="cart-btn"
                        to="/cart"
                        aria-label={cartCount > 0 ? `View cart, ${cartCount} items` : 'View cart'}
                    >
                        🛒
                        {cartCount > 0 && (
                            <span className="cart-count">{cartCount}</span>
                        )}
                        <span className="cart-label">Cart</span>
                    </Link>

                    {token ? (
                        <button
                            className="login-btn"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            className="login-btn"
                            to="/login"
                        >
                            Login
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default Navbar
