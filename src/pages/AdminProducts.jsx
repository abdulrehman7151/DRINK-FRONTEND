import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../components/Toast'

// Defined categories matching your schema
const CATEGORIES = ['Milkshake', 'Smoothie', 'Coffee', 'Juice']

function AdminProducts() {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [timeframe, setTimeframe] = useState('salesToday')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        const fetchProducts = async () => {
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

        fetchProducts()
    }, [showToast])

    // Filter products by search query AND explicit category select
    const filteredProducts = products.filter((product) => {
        const query = search.toLowerCase().trim()
        const name = (
            product.productName ||
            product.name ||
            ''
        ).toLowerCase()

        const category = (
            product.productCategory ||
            product.category ||
            ''
        ).toLowerCase()

        const matchesCategory =
            selectedCategory === 'All' ||
            category === selectedCategory.toLowerCase()

        const matchesSearch =
            name.includes(query) ||
            category.includes(query)

        return matchesCategory && matchesSearch
    })

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <span>CATALOG</span>
                    <h1>Products</h1>
                    <p>
                        Manage your drinks, pricing, and inventory.
                    </p>
                </div>

                <Link
                    className="add-product-btn"
                    to="/admin/products/new"
                >
                    <b>+</b> Add Product
                </Link>
            </div>

            <section className="admin-section product-management">
                <div className="admin-toolbar">
                    <div className="admin-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            value={search}
                            aria-label="Search products"
                            placeholder="Search products..."
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="admin-toolbar-actions">
                        {/* Category Selector with hardcoded category options */}
                        <select
                            className="admin-category-select"
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }
                        >
                            <option value="All">
                                All categories
                            </option>

                            {CATEGORIES.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            className="admin-category-select"
                            value={timeframe}
                            onChange={(e) =>
                                setTimeframe(e.target.value)
                            }
                        >
                            <option value="salesToday">
                                Today
                            </option>

                            <option value="salesWeek">
                                This Week
                            </option>

                            <option value="salesMonth">
                                This Month
                            </option>

                            <option value="salesYear">
                                This Year
                            </option>

                            <option value="salesAll">
                                All Time
                            </option>
                        </select>

                        {/* Interactive Menu (⋮ Button) */}
                        <div className="action-menu-container">
                            <button
                                type="button"
                                className="action-menu-btn"
                                onClick={() =>
                                    setIsMenuOpen(
                                        !isMenuOpen
                                    )
                                }
                            >
                                ⋮
                            </button>

                            {isMenuOpen && (
                                <div className="action-dropdown-menu">
                                    <button
                                        onClick={() => {
                                            setSearch('')
                                            setSelectedCategory(
                                                'All'
                                            )
                                            setTimeframe(
                                                'salesToday'
                                            )
                                            setIsMenuOpen(
                                                false
                                            )
                                        }}
                                    >
                                        Reset Filters
                                    </button>

                                    <button
                                        onClick={() =>
                                            window.location.reload()
                                        }
                                    >
                                        Refresh List
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading-state">
                        <p>Loading catalog items...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-admin-section product-empty-state">
                        <div className="empty-admin-icon">
                            ◈
                        </div>

                        <h2>No products yet</h2>

                        <p>
                            Add your first drink to start building
                            the catalog.
                        </p>

                        <Link
                            className="add-product-btn"
                            to="/admin/products/new"
                        >
                            <b>+</b> Add your first product
                        </Link>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-admin-section product-empty-state">
                        <div className="empty-admin-icon">
                            ⌕
                        </div>

                        <h2>No matches found</h2>

                        <p>
                            No drinks matched{' '}
                            {selectedCategory !== 'All'
                                ? `category "${selectedCategory}"`
                                : ''}
                            {search
                                ? ` and keyword "${search}"`
                                : ''}
                            .
                        </p>
                    </div>
                ) : (
                    <div className="admin-product-grid">
                        {filteredProducts.map((product) => {
                            const id =
                                product._id || product.id

                            return (
                                <div
                                    className="admin-product-card"
                                    key={id}
                                >
                                    <div className="card-top">
                                        {product.imageUrl ? (
                                            <img
                                                className="admin-product-image"
                                                src={
                                                    product.imageUrl
                                                }
                                                alt={
                                                    product.productName ||
                                                    product.name
                                                }
                                            />
                                        ) : (
                                            <span className="admin-product-image-fallback">
                                                🥤
                                            </span>
                                        )}

                                        <span className="category-badge">
                                            {product.productCategory ||
                                                product.category ||
                                                'Drink'}
                                        </span>

                                        <Link
                                            className="edit-link"
                                            to={`/admin/products/${id}/edit`}
                                        >
                                            Edit
                                        </Link>
                                    </div>

                                    <h3 className="product-title">
                                        {product.productName ||
                                            product.name}
                                    </h3>

                                    <div className="card-details">
                                        <div className="detail-item">
                                            <span className="detail-label">
                                                Price
                                            </span>

                                            <span className="detail-value price">
                                                Rs.{' '}
                                                {product.price}
                                            </span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">
                                                Sales (
                                                {timeframe ===
                                                    'salesToday'
                                                    ? 'Today'
                                                    : timeframe ===
                                                        'salesWeek'
                                                        ? 'Week'
                                                        : timeframe ===
                                                            'salesMonth'
                                                            ? 'Month'
                                                            : timeframe ===
                                                                'salesYear'
                                                                ? 'Year'
                                                                : 'All'}
                                                )
                                            </span>

                                            <span className="detail-value stock">
                                                {product[
                                                    timeframe
                                                ] ?? 0}{' '}
                                                units
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}

export default AdminProducts