import { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'
import OrderMgmtCard from '../components/OrderMgmtCard'
import {
    filterOrdersBySearch,
    formatStatusLabel,
    getActionsForStatus
} from '../utils/orderHelpers'

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'out_for_delivery', label: 'Out for delivery' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
]

function AdminAllOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [updatingId, setUpdatingId] = useState(null)
    const { showToast } = useToast()

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(
                'http://localhost:3000/api/order/admin',
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
    }, [showToast])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    async function updateStatus(orderId, nextStatus) {
        try {
            setUpdatingId(orderId)
            const token = localStorage.getItem('token')

            await axios.patch(
                `http://localhost:3000/api/order/admin/${orderId}/status`,
                { status: nextStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, status: nextStatus } : order
                )
            )
            window.dispatchEvent(new CustomEvent('orders-updated'))
            showToast(`Order moved to ${formatStatusLabel(nextStatus)}`)
        } catch (error) {
            showToast(error.response?.data?.message || 'Unable to update order', 'error')
        } finally {
            setUpdatingId(null)
        }
    }

    const filteredOrders = useMemo(() => {
        let result = filterOrdersBySearch(orders, search)

        if (statusFilter !== 'all') {
            result = result.filter((order) => order.status === statusFilter)
        }

        return result
    }, [orders, search, statusFilter])

    return (
        <section className="admin-section order-stage-panel">
            <div className="order-stage-panel-header">
                <div>
                    <h2>All Orders</h2>
                    <p>Search by order ID, name, phone, email, address, or product.</p>
                </div>
                <span className="order-stage-badge pending">
                    {filteredOrders.length} shown
                </span>
            </div>

            <div className="order-search-toolbar">
                <label className="order-search-field">
                    <span aria-hidden="true">⌕</span>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search orders..."
                        aria-label="Search orders"
                    />
                </label>

                <select
                    className="admin-period-select order-status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by status"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="order-stage-empty">
                    <p>Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="order-stage-empty">
                    <div className="order-stage-empty-icon">⌕</div>
                    <h3>No orders found</h3>
                    <p>
                        {search || statusFilter !== 'all'
                            ? 'Try a different search or clear your filters.'
                            : 'Orders will appear here once customers place them.'}
                    </p>
                </div>
            ) : (
                <div className="order-stage-grid">
                    {filteredOrders.map((order) => (
                        <OrderMgmtCard
                            key={order._id}
                            order={order}
                            actions={getActionsForStatus(order.status)}
                            updatingId={updatingId}
                            onStatusUpdate={updateStatus}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default AdminAllOrders
