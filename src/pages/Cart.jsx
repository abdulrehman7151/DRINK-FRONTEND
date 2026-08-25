import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from "axios"
import { useToast } from '../components/Toast'
import { notifyCartUpdated, saveCartToStorage } from '../utils/cart'

const emptyDelivery = {
    fullName: '',
    phone: '',
    address: '',
    houseNo: '',
    notes: ''
}

function Cart() {
    const navigate = useNavigate()
    const [cart, setCart] = useState(() => {
        return JSON.parse(localStorage.getItem('cart')) || []
    })
    const [showCheckoutForm, setShowCheckoutForm] = useState(false)
    const [delivery, setDelivery] = useState(emptyDelivery)
    const [submitting, setSubmitting] = useState(false)
    const { showToast } = useToast()

    function handleDeliveryChange(event) {
        const { name, value } = event.target
        setDelivery((prev) => ({ ...prev, [name]: value }))
    }

    function openCheckoutForm() {
        if (!localStorage.getItem('token')) {
            showToast('Please login to place an order', 'error')
            return
        }
        setShowCheckoutForm(true)
    }

    const handleCheckout = async (event) => {
        event.preventDefault()

        if (!delivery.fullName.trim() || !delivery.phone.trim() || !delivery.address.trim()) {
            showToast('Name, phone number, and address are required', 'error')
            return
        }

        try {
            setSubmitting(true)
            const token = localStorage.getItem("token")

            const orderData = {
                products: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size || 'Medium'
                })),
                totalPrice: total,
                delivery: {
                    fullName: delivery.fullName.trim(),
                    phone: delivery.phone.trim(),
                    address: delivery.address.trim(),
                    houseNo: delivery.houseNo.trim(),
                    notes: delivery.notes.trim()
                }
            }

            const response = await axios.post(
                "http://localhost:3000/api/order",
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            localStorage.removeItem('cart')
            setCart([])
            setDelivery(emptyDelivery)
            setShowCheckoutForm(false)
            notifyCartUpdated()
            showToast(response.data.message || 'Order placed successfully')
            navigate('/my-orders')

        } catch (error) {
            showToast(error.response?.data?.message || 'Unable to place your order', 'error')
        } finally {
            setSubmitting(false)
        }
    }


    function saveCart(updatedCart) {
        saveCartToStorage(updatedCart)
        setCart(updatedCart)
    }

    function changeQuantity(productId, amount, size) {
        const updatedCart = cart
            .map((item) => {
                if (item.productId === productId && (item.size || 'Medium') === size) {
                    return { ...item, quantity: item.quantity + amount }
                }

                return item
            })
            .filter((item) => item.quantity > 0)

        saveCart(updatedCart)
    }

    function removeProduct(productId, size) {
        const updatedCart = cart.filter((item) => !(item.productId === productId && (item.size || 'Medium') === size))
        saveCart(updatedCart)
    }

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    const deliveryFee = cart.length > 0 ? 150 : 0
    const total = subtotal + deliveryFee

    return (
        <>
            <Navbar />

            <main className="cart-page">
                <div className="container">

                    <div className="page-title">
                        <span>YOUR ORDER</span>
                        <h1>Shopping Cart</h1>
                    </div>

                    {cart.length === 0 ? (
                        <div className="empty-cart-state">
                            <h2>Your cart is empty</h2>

                            <p>
                                Products added from the menu will appear here.
                            </p>

                            <Link
                                className="primary-btn"
                                to="/products"
                            >
                                Browse menu
                            </Link>
                        </div>
                    ) : (
                        <div className="cart-layout">

                            <div className="cart-items">

                                {cart.map((item) => (
                                    <div
                                        className="cart-item"
                                        key={`${item.productId}-${item.size || 'Medium'}`}
                                    >

                                        <div className="cart-item-image">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} />
                                            ) : (
                                                '🥤'
                                            )}
                                        </div>

                                        <div className="cart-item-info">
                                            <span>{item.category} · {item.size || 'Medium'}</span>

                                            <h3>{item.name}</h3>

                                            <div className="cart-quantity">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            item.productId,
                                                            -1,
                                                            item.size || 'Medium'
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>

                                                <span>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            item.productId,
                                                            1,
                                                            item.size || 'Medium'
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>
                                        </div>

                                        <div className="cart-item-price">

                                            <strong>
                                                Rs. {item.price * item.quantity}
                                            </strong>

                                            <button
                                                className="remove-btn"
                                                type="button"
                                                onClick={() =>
                                                    removeProduct(
                                                        item.productId,
                                                        item.size || 'Medium'
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>
                                ))}

                            </div>

                            <div className="order-summary">

                                <h2>Order Summary</h2>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <strong>Rs. {subtotal}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Delivery</span>
                                    <strong>Rs. {deliveryFee}</strong>
                                </div>

                                <div className="summary-line"></div>

                                <div className="summary-row total">
                                    <span>Total</span>
                                    <strong>Rs. {total}</strong>
                                </div>

                                {!showCheckoutForm ? (
                                    <button
                                        className="checkout-btn"
                                        type="button"
                                        onClick={openCheckoutForm}
                                    >
                                        Proceed to Checkout
                                    </button>
                                ) : (
                                    <form
                                        className="checkout-delivery-form"
                                        onSubmit={handleCheckout}
                                    >
                                        <h3>Delivery details</h3>
                                        <p>Tell us where to send your order.</p>

                                        <label>
                                            Full name *
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={delivery.fullName}
                                                onChange={handleDeliveryChange}
                                                placeholder="Your full name"
                                                required
                                            />
                                        </label>

                                        <label>
                                            Phone number *
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={delivery.phone}
                                                onChange={handleDeliveryChange}
                                                placeholder="03XX-XXXXXXX"
                                                required
                                            />
                                        </label>

                                        <label>
                                            Address *
                                            <textarea
                                                name="address"
                                                value={delivery.address}
                                                onChange={handleDeliveryChange}
                                                placeholder="Street, area, city"
                                                rows={3}
                                                required
                                            />
                                        </label>

                                        <label>
                                            House / Flat no
                                            <input
                                                type="text"
                                                name="houseNo"
                                                value={delivery.houseNo}
                                                onChange={handleDeliveryChange}
                                                placeholder="Optional"
                                            />
                                        </label>

                                        <label>
                                            Notes
                                            <input
                                                type="text"
                                                name="notes"
                                                value={delivery.notes}
                                                onChange={handleDeliveryChange}
                                                placeholder="Optional delivery note"
                                            />
                                        </label>

                                        <button
                                            className="checkout-btn"
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Placing order...' : 'Place Order'}
                                        </button>

                                        <button
                                            className="checkout-cancel-btn"
                                            type="button"
                                            onClick={() => setShowCheckoutForm(false)}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                )}

                            </div>

                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </>
    )
}

export default Cart
