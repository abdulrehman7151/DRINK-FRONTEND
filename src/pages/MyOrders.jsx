import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { filterOrdersBySearch } from "../utils/orderHelpers"
import "../App.css"

function MyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [timeFilter, setTimeFilter] = useState("all")

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token")

                if (!token) {
                    setError("Please login to view your orders.")
                    setLoading(false)
                    return
                }

                const response = await axios.get(
                    "https://drink-backend-two.vercel.app/api/order/my-orders",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setOrders(response.data.orders || [])
            } catch (err) {
                console.log(err)
                setError(
                    err.response?.data?.message ||
                    "Unable to load your orders."
                )
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const filteredOrders = useMemo(() => {
        let result = filterOrdersBySearch(orders, search)

        if (timeFilter !== "all") {
            const now = new Date()
            result = result.filter((order) => {
                const orderDate = new Date(order.createdAt)
                if (timeFilter === "today") {
                    return orderDate.toDateString() === now.toDateString()
                } else if (timeFilter === "week") {
                    const diffTime = Math.abs(now - orderDate)
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays <= 7
                } else if (timeFilter === "month") {
                    return (
                        orderDate.getMonth() === now.getMonth() &&
                        orderDate.getFullYear() === now.getFullYear()
                    )
                } else if (timeFilter === "year") {
                    return orderDate.getFullYear() === now.getFullYear()
                }
                return true
            })
        }

        return result
    }, [orders, search, timeFilter])

    return (
        <>
            <Navbar />

            <main className="my-orders-page">
                <div className="container">
                    {loading ? (
                        <div className="orders-loading">
                            <h3>Loading your orders...</h3>
                        </div>
                    ) : error ? (
                        <div className="empty-orders">
                            <h2>Something went wrong</h2>
                            <p>{error}</p>
                            {error.includes("login") && (
                                <Link className="login-btn" to="/login">
                                    Go to Login
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="my-orders-header">
                                <h1>My Orders </h1>
                                <p>Track and manage your recent orders</p>
                            </div>

                            {orders.length > 0 && (
                                <div className="order-search-toolbar">
                                    <label className="order-search-field">
                                        <span aria-hidden="true">⌕</span>
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Search by order ID, product, or address..."
                                            aria-label="Search your orders"
                                        />
                                    </label>
                                    <div className="admin-period-select-wrap order-status-filter">
                                        <select
                                            className="admin-period-select"
                                            value={timeFilter}
                                            onChange={(e) => setTimeFilter(e.target.value)}
                                            aria-label="Filter by time period"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="year">This Year</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {orders.length === 0 ? (
                                <div className="empty-orders">
                                    <h2>No orders yet</h2>
                                    <p>
                                        Your orders will appear here after you make a purchase.
                                    </p>
                                    <Link className="login-btn" to="/products">
                                        Browse Menu
                                    </Link>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="empty-orders">
                                    <h2>No matching orders</h2>
                                    <p>Try a different search term.</p>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <div className="order-card" key={order._id}>
                                        <div className="order-card-header">
                                            <div className="order-info">
                                                <h3>
                                                    Order #
                                                    {order._id.slice(-6).toUpperCase()}
                                                </h3>
                                                <span className="order-date">
                                                    {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </span>
                                            </div>

                                            <span className={`order-status ${order.status}`}>
                                                {(order.status || '').replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {order.delivery && (
                                            <div className="order-delivery-block">
                                                <strong>{order.delivery.fullName}</strong>
                                                <span>{order.delivery.phone}</span>
                                                <span>{order.delivery.address}</span>
                                                {order.delivery.houseNo ? (
                                                    <span>House: {order.delivery.houseNo}</span>
                                                ) : null}
                                            </div>
                                        )}

                                        <div className="order-products">
                                            {order.products.map((item, index) => {
                                                const product = item.productId

                                                return (
                                                    <div
                                                        className="order-product"
                                                        key={product?._id || index}
                                                    >
                                                        <div className="product-info">
                                                            <span className="product-name">
                                                                {product?.productName || "Product"}
                                                            </span>
                                                            <span className="product-details">
                                                                Size: {item.size}
                                                                {" · "}
                                                                Quantity: {item.quantity}
                                                            </span>
                                                        </div>

                                                        <span className="product-price">
                                                            Rs.{" "}
                                                            {(
                                                                (product?.price || 0) * item.quantity
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="order-card-footer">
                                            <span className="total-label">Order Total</span>
                                            <span className="total-price">
                                                Rs.{" "}
                                                {Number(order.totalPrice || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </>
    )
}

export default MyOrders