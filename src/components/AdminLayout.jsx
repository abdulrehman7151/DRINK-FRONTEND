import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ORDER_STAGES } from '../pages/AdminOrdersLayout'

function AdminLayout() {
    const token = localStorage.getItem('token')
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    let user = null

    const handleSignOut = () => {
        localStorage.removeItem('token')
        navigate('/admin/login')
    }

    if (token) {
        user = jwtDecode(token)
    }

    let pageName = 'Dashboard'

    useEffect(() => {
        setIsSidebarOpen(false)
    }, [location.pathname])

    useEffect(() => {
        async function loadPendingCount() {
            try {
                const response = await axios.get(
                    'https://drink-backend-two.vercel.app/api/order/admin/counts',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setPendingCount(response.data.counts?.pending || 0)
            } catch {
                setPendingCount(0)
            }
        }

        if (token) {
            loadPendingCount()

            window.addEventListener('orders-updated', loadPendingCount)

            return () =>
                window.removeEventListener('orders-updated', loadPendingCount)
        }
    }, [token, location.pathname])

    if (location.pathname.includes('/products')) {
        pageName = 'Products'
    } else if (location.pathname.includes('/orders')) {
        pageName = 'Orders'
    }

    const isOrdersSection = location.pathname.includes('/orders')

    return (
        <main className="admin-page">
            {isSidebarOpen && (
                <button
                    type="button"
                    className="admin-sidebar-backdrop"
                    aria-label="Close navigation"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`admin-sidebar${isSidebarOpen ? ' admin-sidebar-open' : ''
                    }`}
            >
                <Link className="admin-logo" to="/">
                    <span>DRINK</span>LY
                </Link>

                <div className="admin-workspace">
                    <span>WORKSPACE</span>
                    <strong>Drinkly HQ</strong>
                </div>

                <nav className="admin-nav">
                    <span className="admin-nav-label">OVERVIEW</span>

                    <NavLink to="/admin" end>
                        <span>▦</span> Dashboard
                    </NavLink>

                    <NavLink to="/admin/products">
                        <span>◈</span> Products
                    </NavLink>

                    <NavLink
                        to="/admin/orders/all"
                        className={({ isActive }) =>
                            isActive ||
                                location.pathname.includes('/admin/orders')
                                ? 'active'
                                : undefined
                        }
                    >
                        <span>▤</span> Orders
                        {pendingCount > 0 ? <em>{pendingCount}</em> : null}
                    </NavLink>

                    {isOrdersSection && (
                        <div className="admin-nav-sub">
                            {ORDER_STAGES.map((stage) => (
                                <NavLink
                                    key={stage.slug}
                                    to={`/admin/orders/${stage.slug}`}
                                >
                                    {stage.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user">
                        <span>AK</span>

                        <div>
                            <strong>
                                {user?.username || user?.name || 'Admin'}
                            </strong>

                            <small>{user?.email}</small>
                        </div>
                    </div>

                    <Link
                        className="admin-logout"
                        to="/"
                        onClick={handleSignOut}
                    >
                        <span>↪</span> Sign out
                    </Link>
                </div>
            </aside>

            <section className="admin-content">
                <header className="admin-topbar">
                    <button
                        className="admin-menu-button"
                        type="button"
                        aria-label={
                            isSidebarOpen
                                ? 'Close navigation'
                                : 'Open navigation'
                        }
                        aria-expanded={isSidebarOpen}
                        onClick={() => setIsSidebarOpen((open) => !open)}
                    >
                        {isSidebarOpen ? '✕' : '☰'}
                    </button>

                    <div className="admin-breadcrumb">
                        <span>Workspace</span>
                        <b>/</b>
                        <strong>{pageName}</strong>
                    </div>

                    <div className="admin-top-actions">
                        <button type="button" aria-label="Notifications">
                            ♧<i />
                        </button>

                        <Link to="/" aria-label="View storefront">
                            ↗
                        </Link>
                    </div>
                </header>

                <div className="admin-main">
                    <Outlet />
                </div>
            </section>
        </main>
    )
}

export default AdminLayout