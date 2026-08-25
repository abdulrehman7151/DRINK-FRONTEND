import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../components/Toast'
import OrderMgmtCard from '../components/OrderMgmtCard'
import { getStageBySlug } from './AdminOrdersLayout'
import {
    formatStatusLabel,
    getActionsForStatus
} from '../utils/orderHelpers'

function AdminOrderStage() {
    const { stage: stageSlug } = useParams()
    const stage = getStageBySlug(stageSlug)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const { showToast } = useToast()

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            const response = await axios.get(
                `https://drink-backend-two.vercel.app/api/order/admin?status=${stage.status}`,
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
        } finally {
            setLoading(false)
        }
    }, [stage.status, showToast])

    useEffect(() => {
        loadOrders()
    }, [loadOrders])

    async function updateStatus(orderId, nextStatus) {
        try {
            setUpdatingId(orderId)
            const token = localStorage.getItem('token')

            await axios.patch(
                `https://drink-backend-two.vercel.app/api/order/admin/${orderId}/status`,
                { status: nextStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setOrders((prev) =>
                prev.filter((order) => order._id !== orderId)
            )

            window.dispatchEvent(
                new CustomEvent('orders-updated')
            )

            showToast(
                `Order moved to ${formatStatusLabel(nextStatus)}`
            )
        } catch (error) {
            showToast(
                error.response?.data?.message ||
                'Unable to update order',
                'error'
            )
        } finally {
            setUpdatingId(null)
        }
    }

    const actions = getActionsForStatus(stage.status)

    return (
        <section className="admin-section order-stage-panel">
            <div className="order-stage-panel-header">
                <div>
                    <h2>{stage.label}</h2>
                    <p>{stage.description}</p>
                </div>

                <span
                    className={`order-stage-badge ${stage.status}`}
                >
                    {orders.length} in this stage
                </span>
            </div>

            {loading ? (
                <div className="order-stage-empty">
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="order-stage-empty">
                    <div className="order-stage-empty-icon">
                        {stage.icon}
                    </div>

                    <h3>No {stage.label.toLowerCase()}</h3>

                    <p>
                        {stage.status === 'pending'
                            ? 'New customer orders will show up here.'
                            : `Orders will appear here once moved to ${stage.label.toLowerCase()}.`}
                    </p>
                </div>
            ) : (
                <div className="order-stage-grid">
                    {orders.map((order) => (
                        <OrderMgmtCard
                            key={order._id}
                            order={order}
                            actions={actions}
                            updatingId={updatingId}
                            onStatusUpdate={updateStatus}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default AdminOrderStage