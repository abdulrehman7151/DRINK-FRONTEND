import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'
import { useToast } from './Toast'

function ProductGrid({ activeFilter = 'All', searchQuery = '' }) {
    // State variables - think of these as storage boxes
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [likedProductIds, setLikedProductIds] = useState([])
    const { showToast } = useToast()

    // This runs once when the component loads
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
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [showToast])

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            return
        }

        axios.get(
            'https://drink-backend-two.vercel.app/api/likes',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then((response) =>
                setLikedProductIds(
                    response.data.productIds || []
                )
            )
            .catch(() => setLikedProductIds([]))
    }, [])

    const displayedProducts = products.filter((product) => {
        const productName =
            product.productName || product.name || ''

        const matchesSearch = productName
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())

        if (!matchesSearch) return false

        if (activeFilter === 'All') return true

        if (activeFilter === 'Liked') {
            return likedProductIds.includes(
                product._id || product.id
            )
        }

        return (
            (product.productCategory || product.category) ===
            activeFilter
        )
    })

    // What to show on screen
    if (loading) {
        return <div>Loading...</div>
    }

    if (displayedProducts.length === 0) {
        return (
            <div className="container product-grid empty-product-grid">
                <div className="empty-product-state">
                    <span>◌</span>
                    <h3>No drinks found</h3>
                    <p>Try selecting a different category.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container product-grid">
            {displayedProducts.map((product) => (
                <ProductCard
                    key={product._id || product.id}
                    product={product}
                />
            ))}
        </div>
    )
}

export default ProductGrid