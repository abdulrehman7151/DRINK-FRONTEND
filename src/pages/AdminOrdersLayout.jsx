import { NavLink, Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export const ORDER_STAGES = [
    {
        slug: 'all',
        status: 'all',
        label: 'All Orders',
        description: 'Search and view every order in one place.',
        icon: '⌕'
    },
    {
        slug: 'new',
        status: 'pending',
        label: 'New Orders',
        description: 'Incoming orders waiting for your review.',
        icon: '●'
    },
    {
        slug: 'accepted',
        status: 'accepted',
        label: 'Accepted',
        description: 'Confirmed orders ready to prepare and dispatch.',
        icon: '✓'
    },
    {
        slug: 'out-for-delivery',
        status: 'out_for_delivery',
        label: 'Out for Delivery',
        description: 'Orders currently on the way to customers.',
        icon: '↗'
    },
    {
        slug: 'completed',
        status: 'completed',
        label: 'Completed',
        description: 'Successfully delivered orders.',
        icon: '◉'
    },
    {
        slug: 'rejected',
        status: 'rejected',
        label: 'Rejected',
        description: 'Orders that were declined.',
        icon: '✕'
    }
]

export function getStageBySlug(slug) {
    const stage = ORDER_STAGES.find((item) => item.slug === slug)
    return stage && stage.slug !== 'all' ? stage : ORDER_STAGES[1]
}

function AdminOrdersLayout() {
    const [counts, setCounts] = useState({
        pending: 0,
        accepted: 0,
        out_for_delivery: 0,
        completed: 0,
        rejected: 0
    })

    useEffect(() => {
        async function loadCounts() {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(
                    'http://localhost:3000/api/order/admin/counts',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setCounts(response.data.counts || {})
            } catch {
                // counts are optional for layout
            }
        }

        loadCounts()
        const interval = setInterval(loadCounts, 30000)
        window.addEventListener('orders-updated', loadCounts)
        return () => {
            clearInterval(interval)
            window.removeEventListener('orders-updated', loadCounts)
        }
    }, [])

    return (
        <div className="admin-orders-workspace">
            <div className="admin-header admin-orders-header">
                <div>
                    <span>ORDER MANAGEMENT</span>
                    <h1>Orders</h1>
                    <p>Move orders through each stage — new, accepted, delivery, and done.</p>
                </div>

                <Link className="admin-back-link" to="/admin">
                    ← Dashboard
                </Link>
            </div>

            <nav className="order-stage-nav" aria-label="Order stages">
                {ORDER_STAGES.map((stage) => (
                    <NavLink
                        key={stage.slug}
                        to={`/admin/orders/${stage.slug}`}
                        className={({ isActive }) =>
                            `order-stage-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="order-stage-icon">{stage.icon}</span>
                        <span className="order-stage-text">
                            <strong>{stage.label}</strong>
                            <small>
                                {stage.slug === 'all'
                                    ? `${Object.values(counts).reduce((a, b) => a + b, 0)} total`
                                    : `${counts[stage.status] || 0} orders`}
                            </small>
                        </span>
                    </NavLink>
                ))}
            </nav>

            <Outlet context={{ refreshCounts: () => {} }} />
        </div>
    )
}

export default AdminOrdersLayout
