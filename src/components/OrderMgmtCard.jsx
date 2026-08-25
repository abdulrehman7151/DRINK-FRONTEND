import {
    formatOrderLineItem,
    formatStatusLabel
} from '../utils/orderHelpers'

function OrderMgmtCard({ order, actions = [], updatingId, onStatusUpdate }) {
    return (
        <article className="order-mgmt-card">
            <header className="order-mgmt-card-header">
                <div>
                    <span className="order-mgmt-id">
                        #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <time className="order-mgmt-date">
                        {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </time>
                </div>
                <span className={`order-status ${order.status}`}>
                    {formatStatusLabel(order.status)}
                </span>
            </header>

            <div className="order-mgmt-block">
                <h4>Customer</h4>
                <p className="order-mgmt-name">
                    {order.delivery?.fullName || '—'}
                </p>
                <p>{order.userId?.email || 'Unknown email'}</p>
                <p>{order.delivery?.phone || '—'}</p>
            </div>

            <div className="order-mgmt-block">
                <h4>Delivery</h4>
                <p>{order.delivery?.address || 'No address provided'}</p>
                {order.delivery?.houseNo ? (
                    <p>House / Flat: {order.delivery.houseNo}</p>
                ) : null}
                {order.delivery?.notes ? (
                    <p className="order-mgmt-note">Note: {order.delivery.notes}</p>
                ) : null}
            </div>

            <div className="order-mgmt-block">
                <h4>Items</h4>
                <ul className="order-mgmt-items">
                    {order.products.map((item) => (
                        <li key={item._id}>
                            {formatOrderLineItem(item)}
                        </li>
                    ))}
                </ul>
            </div>

            <footer className="order-mgmt-card-footer">
                <div className="order-mgmt-total">
                    <span>Total</span>
                    <strong>Rs. {Number(order.totalPrice || 0).toLocaleString()}</strong>
                </div>

                {actions.length > 0 && (
                    <div className="order-mgmt-actions">
                        {actions.map((action) => (
                            <button
                                key={action.status}
                                type="button"
                                className={`order-mgmt-btn ${action.className}`}
                                disabled={updatingId === order._id}
                                onClick={() => onStatusUpdate(order._id, action.status)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </footer>
        </article>
    )
}

export default OrderMgmtCard
