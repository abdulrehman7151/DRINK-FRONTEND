import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'

function formatSizeAbbreviation(size) {
    const normalized = (size || 'Medium').trim()
    return normalized.charAt(0).toUpperCase()
}

function formatOrderLineItem(item) {
    const name = item.productId?.productName || 'Removed product'
    const sizeAbbr = formatSizeAbbreviation(item.size)
    return `${name}(${sizeAbbr}) × ${item.quantity}`
}

function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState(null)
    const { showToast } = useToast()

    async function loadOrders(filter = statusFilter) {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const query = filter !== 'all' ? `?status=${filter}` : ''

            const response = await axios.get(
                `http://localhost:3000/api/order/admin${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setOrders(response.data.orders || [])
        } catch (error) {
            showToast(error.response?.data?.message || 'Unable to load orders', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders('all')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast])

    function handleFilterChange(event) {
        const nextFilter = event.target.value
        setStatusFilter(nextFilter)
        loadOrders(nextFilter)
    }

    async function updateStatus(orderId, status) {
        try {
            setUpdatingId(orderId)
            const token = localStorage.getItem('token')

            const response = await axios.patch(
                `http://localhost:3000/api/order/admin/${orderId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const updated = response.data.order

            setOrders((prev) => {
                const next = prev.map((order) =>
                    order._id === updated._id ? updated : order
                )

                if (statusFilter === 'all') return next
                return next.filter((order) => order.status === statusFilter)
            })

            showToast(response.data.message || `Order ${status}`)
        } catch (error) {
            showToast(error.response?.data?.message || 'Unable to update order', 'error')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <>
            <div className="admin-header">
                <div>
                    <span>MANAGEMENT</span>
                    <h1>Orders</h1>
                    <p>View, accept, or reject customer orders.</p>
                </div>

                <Link className="admin-back-link" to="/admin">
                    ← Back to dashboard
                </Link>
            </div>

            <section className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <h2>All Orders</h2>
                        <p>{orders.length} orders found</p>
                    </div>

                    <select
                        className="admin-order-category"
                        value={statusFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {loading ? (
                    <div className="empty-admin-section">
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-admin-section">
                        <div className="empty-admin-icon">◫</div>
                        <h2>No orders yet</h2>
                        <p>
                            {statusFilter === 'all'
                                ? 'Customer orders will appear here after they place an order.'
                                : `No ${statusFilter} orders found.`}
                        </p>
                    </div>
                ) : (
                    <div className="orders-table admin-orders-list">
                        <div className="table-row table-heading admin-order-heading">
                            <span>Order</span>
                            <span>Customer</span>
                            <span>Delivery</span>
                            <span>Products</span>
                            <span>Total</span>
                            <span>Status</span>
                            <span>Actions</span>
                        </div>

                        {orders.map((order) => (
                            <div className="table-row admin-order-row" key={order._id}>
                                <span data-label="Order">
                                    #{order._id.slice(-6).toUpperCase()}
                                    <small className="order-date-meta">
                                        {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </small>
                                </span>

                                <span data-label="Customer">
                                    <strong>{order.delivery?.fullName || '—'}</strong>
                                    <small>{order.userId?.email || 'Unknown customer'}</small>
                                    <small>{order.delivery?.phone || ''}</small>
                                </span>

                                <span className="order-delivery-cell" data-label="Delivery">
                                    <span>{order.delivery?.address || 'No address'}</span>
                                    {order.delivery?.houseNo ? (
                                        <small>House: {order.delivery.houseNo}</small>
                                    ) : null}
                                    {order.delivery?.notes ? (
                                        <small>Note: {order.delivery.notes}</small>
                                    ) : null}
                                </span>

                                <span className="order-products-cell" data-label="Products">
                                    {order.products.map((item) => (
                                        <span className="order-product" key={item._id}>
                                            {formatOrderLineItem(item)}
                                        </span>
                                    ))}
                                </span>

                                <span data-label="Total">
                                    Rs. {order.totalPrice}
                                </span>

                                <span data-label="Status">
                                    <span className={`order-status ${order.status}`}>
                                        {order.status}
                                    </span>
                                </span>

                                <span className="order-actions" data-label="Actions">
                                    {order.status !== 'accepted' && (
                                        <button
                                            type="button"
                                            className="order-action-btn accept"
                                            disabled={updatingId === order._id}
                                            onClick={() => updateStatus(order._id, 'accepted')}
                                        >
                                            Accept
                                        </button>
                                    )}
                                    {order.status !== 'rejected' && (
                                        <button
                                            type="button"
                                            className="order-action-btn reject"
                                            disabled={updatingId === order._id}
                                            onClick={() => updateStatus(order._id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    )}
                                    {order.status !== 'pending' && (
                                        <button
                                            type="button"
                                            className="order-action-btn pending"
                                            disabled={updatingId === order._id}
                                            onClick={() => updateStatus(order._id, 'pending')}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}

export default AdminOrders
