import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'

const PERIODS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
    { value: 'all', label: 'All time' }
]

function Admin() {
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [period, setPeriod] = useState('all')
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        acceptedOrders: 0,
        outForDeliveryOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0,
        customers: 0,
        revenue: 0
    })
    const { showToast } = useToast()

    const loadStats = useCallback(async (selectedPeriod) => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `https://drink-backend-two.vercel.app/api/order/admin/stats?period=${selectedPeriod}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setStats(response.data.stats)
        } catch (error) {
            showToast(
                error.response?.data?.message || 'Unable to load stats',
                'error'
            )
        }
    }, [showToast])

    useEffect(() => {
        async function loadProducts() {
            try {
                const response = await axios.get(
                    'https://drink-backend-two.vercel.app/api/products'
                )

                const data = response.data
                let productList = []

                if (Array.isArray(data)) {
                    productList = data
                } else if (Array.isArray(data.value)) {
                    productList = data.value
                } else if (Array.isArray(data.products)) {
                    productList = data.products
                }

                setProducts(productList)
            } catch (error) {
                showToast(
                    error.response?.data?.message ||
                    'Unable to load products',
                    'error'
                )
            }
        }

        async function loadOrders() {
            try {
                const token = localStorage.getItem('token')

                const response = await axios.get(
                    'https://drink-backend-two.vercel.app/api/order/admin',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setOrders(response.data.orders || [])
            } catch (error) {
                showToast(
                    error.response?.data?.message ||
                    'Unable to load orders',
                    'error'
                )
            }
        }

        loadProducts()
        loadOrders()
        loadStats('all')
    }, [showToast, loadStats])

    function handlePeriodChange(event) {
        const nextPeriod = event.target.value
        setPeriod(nextPeriod)
        loadStats(nextPeriod)
    }

    const periodLabel =
        PERIODS.find((item) => item.value === period)?.label || 'All time'

    return (
        <>
            <div className="admin-header">
                <div>
                    <span>ADMIN WORKSPACE</span>
                    <h1>Good morning, Admin.</h1>
                    <p>Here&apos;s what&apos;s happening with your store.</p>
                </div>

                <div className="admin-header-actions">
                    <label className="admin-period-select-wrap">
                        <span>Period</span>

                        <select
                            className="admin-period-select"
                            value={period}
                            onChange={handlePeriodChange}
                        >
                            {PERIODS.map((item) => (
                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Link
                        className="add-product-btn"
                        to="/admin/products/new"
                    >
                        <b>+</b> Add Product
                    </Link>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange">◈</div>
                    <span>Total Products</span>
                    <strong>{products.length}</strong>
                    <small>Products in catalog</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">▤</div>
                    <span>Orders</span>
                    <strong>{stats.totalOrders}</strong>
                    <small>{periodLabel.toLowerCase()}</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">◉</div>
                    <span>Customers</span>
                    <strong>{stats.customers}</strong>
                    <small>{periodLabel.toLowerCase()}</small>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">↗</div>
                    <span>Revenue</span>
                    <strong>
                        Rs. {Number(stats.revenue || 0).toLocaleString()}
                    </strong>
                    <small>
                        Completed · {periodLabel.toLowerCase()}
                    </small>
                </div>
            </div>

            <div className="stats-grid stats-grid-secondary">
                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/all"
                >
                    <span>All orders</span>
                    <strong>{stats.totalOrders}</strong>
                </Link>

                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/new"
                >
                    <span>New</span>
                    <strong>{stats.pendingOrders}</strong>
                </Link>

                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/accepted"
                >
                    <span>Accepted</span>
                    <strong>{stats.acceptedOrders}</strong>
                </Link>

                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/out-for-delivery"
                >
                    <span>Out for delivery</span>
                    <strong>{stats.outForDeliveryOrders}</strong>
                </Link>

                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/completed"
                >
                    <span>Completed</span>
                    <strong>{stats.completedOrders}</strong>
                </Link>

                <Link
                    className="stat-card compact stat-card-link"
                    to="/admin/orders/rejected"
                >
                    <span>Rejected</span>
                    <strong>{stats.rejectedOrders}</strong>
                </Link>
            </div>

            <div className="admin-grid">
                <section
                    className="admin-section orders-section"
                    id="orders"
                >
                    <div className="admin-section-header">
                        <div>
                            <h2>Recent Orders</h2>
                            <p>Latest activity across all stages</p>
                        </div>

                        <Link to="/admin/orders/all">
                            Manage orders <span>→</span>
                        </Link>
                    </div>

                    <div className="dashboard-orders-list">
                        {orders.length === 0 && (
                            <div className="empty-table-state">
                                No orders have been created yet.
                            </div>
                        )}

                        {orders.slice(0, 6).map((order) => (
                            <div
                                className="dashboard-order-row"
                                key={order._id}
                            >
                                <div>
                                    <strong>
                                        #{order._id.slice(-6).toUpperCase()}
                                    </strong>

                                    <span>
                                        {order.delivery?.fullName ||
                                            order.userId?.email ||
                                            'Unknown customer'}
                                    </span>
                                </div>

                                <div>
                                    <span>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </span>

                                    <strong>
                                        Rs. {order.totalPrice}
                                    </strong>
                                </div>

                                <span
                                    className={`order-status ${order.status}`}
                                >
                                    {(order.status || '').replace(
                                        /_/g,
                                        ' '
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin-section performance-section">
                    <div className="admin-section-header">
                        <div>
                            <h2>Top products</h2>
                            <p>Best sellers this month</p>
                        </div>

                        <Link
                            to="/admin/products"
                            aria-label="View products"
                        >
                            ↗
                        </Link>
                    </div>

                    <div className="empty-panel-state">
                        Product performance will appear after products and
                        orders are added.
                    </div>
                </section>
            </div>

            <section className="insight-banner">
                <div className="insight-mark">✦</div>

                <div>
                    <strong>Order workflow</strong>
                    <p>
                        New orders arrive first. Accept or reject them,
                        then move accepted orders to out for delivery and
                        mark completed when done.
                    </p>
                </div>

                <Link to="/admin/orders/new">
                    Open new orders <span>→</span>
                </Link>
            </section>
        </>
    )
}

export default Admin