import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../components/Toast'
import { notifyCartUpdated } from '../utils/cart'

function ProductDetails() {
    const { productId } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [selectedSize, setSelectedSize] = useState('Medium')
    const { showToast } = useToast()

    useEffect(() => {
        async function loadProduct() {
            try {
                const response = await axios.get(
                    `https://drink-backend-two.vercel.app/api/products/${productId}`
                )
                const savedProduct = response.data
                setProduct(savedProduct)

                if (savedProduct.availableSizes && savedProduct.availableSizes.length > 0) {
                    setSelectedSize(prevSize => {
                        const hasSize = savedProduct.availableSizes.find(s => s.size === prevSize)
                        return hasSize ? prevSize : savedProduct.availableSizes[0].size
                    })
                }
            } catch (err) {
                setMessage('Product could not be loaded.')
                showToast(err.response?.data?.message || 'Product could not be loaded.', 'error')
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [productId, showToast])

    if (loading) {
        return <main className="product-details-page"><div className="container empty-detail-state"><p>Loading product...</p></div></main>
    }

    if (!product) {
        return (
            <main className="product-details-page">
                <div className="container empty-detail-state">
                    <h1>{message}</h1>
                    <Link className="primary-btn" to="/products">Back to menu</Link>
                </div>
            </main>
        )
    }

    const addToCart = () => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || []
        const productInCart = savedCart.find(
            (item) => item.productId === productId && (item.size || 'Medium') === selectedSize
        )

        const sizeObj = product.availableSizes?.find(s => s.size === selectedSize)
        const priceToSave = sizeObj ? Number(sizeObj.price) : product.price

        if (productInCart) {
            productInCart.quantity += 1
        } else {
            savedCart.push({
                productId,
                name: product.productName,
                category: product.productCategory,
                price: priceToSave,
                imageUrl: product.imageUrl || '',
                size: selectedSize,
                quantity: 1
            })
        }

        localStorage.setItem('cart', JSON.stringify(savedCart))
        notifyCartUpdated()
        showToast(`${product.productName} (${selectedSize}) added to cart`)
    }

    return (
        <main className="product-details-page">
            <div className="container product-details">
                <Link className="details-back" to="/products">← Back to menu</Link>
                <div className="details-image">
                    {product.imageUrl ? (
                        <img className="details-product-image" src={product.imageUrl} alt={product.productName} />
                    ) : (
                        <div className="details-drink">🥤</div>
                    )}
                </div>
                <div className="details-info">
                    <span className="details-category">{product.productCategory}</span>
                    <h1>{product.productName}</h1>
                    <p className="details-description">{product.description}</p>
                    <div className="size-section">
                        <h2>Choose a size</h2>
                        <div className="size-options">
                            {(product.availableSizes && product.availableSizes.length > 0
                                ? product.availableSizes.map(s => s.size)
                                : ['Medium', 'Large']).map((size) => (
                                    <button
                                        key={size}
                                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                        type="button"
                                        aria-pressed={selectedSize === size}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                        </div>
                    </div>
                    <div className="details-bottom">
                        <strong className="details-price">Rs. {product.availableSizes?.find(s => s.size === selectedSize)?.price || product.price}</strong>
                        <button className="add-cart-large" type="button" onClick={addToCart}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ProductDetails