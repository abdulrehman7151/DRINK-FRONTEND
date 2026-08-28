import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'
import { useToast } from './Toast'

function ProductGrid({ activeFilter = 'All', searchQuery = '' }) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [likedProductIds, setLikedProductIds] = useState([])
    const { showToast } = useToast()

    // Load products
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

    // Load liked products
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
            .then((response) => {
                setLikedProductIds(
                    response.data.productIds || []
                )
            })
            .catch(() => {
                setLikedProductIds([])
            })
    }, [])

    // Search + category filtering
    const displayedProducts = products.filter((product) => {
        const productName =
            product.productName || product.name || ''

        const matchesSearch = productName
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())

        if (!matchesSearch) return false

        // Show all products
        if (activeFilter === 'All') return true

        // Show only liked products
        if (activeFilter === 'Liked') {
            return likedProductIds.includes(
                product._id || product.id
            )
        }

        // Category filtering
        const rawCategory = (
            product.productCategory ||
            product.category ||
            ''
        )
            .toString()
            .trim()
            .toLowerCase()

        const rawFilter = activeFilter
            .toString()
            .trim()
            .toLowerCase()

        // Remove trailing "s"
        // Example: Smoothies → Smoothie
        //          Juices → Juice
        const cleanCategory = rawCategory.endsWith('s')
            ? rawCategory.slice(0, -1)
            : rawCategory

        const cleanFilter = rawFilter.endsWith('s')
            ? rawFilter.slice(0, -1)
            : rawFilter

        return cleanCategory === cleanFilter
    })

    // Loading
    if (loading) {
        return (
            <div className='product-loading-home'>
                Loading...
            </div>
        )
    }

    // No products found
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

    // Display products
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