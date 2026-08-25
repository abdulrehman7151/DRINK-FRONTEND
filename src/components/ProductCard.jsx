import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from './Toast'

function ProductCard({ product }) {
    const productId = product._id || product.id
    const productName = product.productName || product.name
    const productCategory = product.productCategory || product.category
    const [liked, setLiked] = useState(false)
    const [likeLoading, setLikeLoading] = useState(false)
    const { showToast } = useToast()
    const navigate = useNavigate()

    const openProduct = () => navigate(`/products/${productId}`)

    const openProductWithKeyboard = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openProduct()
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) return

        axios.get(`https://drink-backend-two.vercel.app/api/likes/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((response) => setLiked(response.data.liked))
            .catch(() => setLiked(false))
    }, [productId])

    const handleLike = async (event) => {
        event.stopPropagation()
        const token = localStorage.getItem('token')

        if (!token) {
            showToast('Please log in to save favorites', 'error')
            return
        }

        if (likeLoading) return

        setLikeLoading(true)

        try {
            if (liked) {
                await axios.delete(
                    `https://drink-backend-two.vercel.app/api/likes/${productId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
            } else {
                await axios.post(
                    `https://drink-backend-two.vercel.app/api/likes/${productId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
            }

            setLiked((currentLiked) => !currentLiked)

            showToast(
                liked
                    ? 'Removed from favorites'
                    : 'Added to favorites'
            )
        } catch (error) {
            showToast(
                error.response?.data?.message ||
                'Unable to update favorite',
                'error'
            )
        } finally {
            setLikeLoading(false)
        }
    }

    let displayPrice = `Rs. ${product.price || 0}`

    if (product.availableSizes && product.availableSizes.length > 0) {
        const prices = product.availableSizes.map((s) => Number(s.price))
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        if (minPrice !== maxPrice) {
            displayPrice = `From Rs. ${minPrice}`
        } else {
            displayPrice = `Rs. ${minPrice}`
        }
    }

    return (
        <article
            className="product-card"
            role="link"
            tabIndex="0"
            aria-label={`View ${productName}`}
            onClick={openProduct}
            onKeyDown={openProductWithKeyboard}
        >
            <div className="product-image">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={productName}
                    />
                ) : (
                    <span>🥤</span>
                )}

                <div className="product-overlay">
                    <span>View Product</span>
                </div>

                <button
                    className="heart-btn"
                    type="button"
                    aria-label={`${liked ? 'Remove' : 'Add'} ${productName} ${liked ? 'from' : 'to'
                        } favorites`}
                    aria-pressed={liked}
                    disabled={likeLoading}
                    onClick={handleLike}
                >
                    {liked ? '♥' : '♡'}
                </button>
            </div>

            <div className="product-info">
                <span className="product-category">
                    {productCategory}
                </span>

                <h3>{productName}</h3>

                <div className="product-bottom">
                    <strong>{displayPrice}</strong>
                </div>
            </div>
        </article>
    )
}

export default ProductCard