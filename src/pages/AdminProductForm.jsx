import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../components/Toast'

function AdminProductForm() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const isEditing = Boolean(productId)

    // Form State
    const [product, setProduct] = useState({
        productName: "",
        productCategory: "",
        description: "",
        availableSizes: [
            { size: 'Medium', price: '' },
            { size: 'Large', price: '' }
        ]
    })

    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('')

    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingProduct, setLoadingProduct] = useState(isEditing)
    const { showToast } = useToast()

    useEffect(() => {
        if (!isEditing) {
            return
        }

        async function loadProduct() {
            try {
                const response = await axios.get(
                    `https://drink-backend-two.vercel.app/api/products/${productId}`
                )

                const savedProduct = response.data

                // Migrate old string arrays to objects for backwards compatibility in the UI
                let sizes =
                    savedProduct.availableSizes &&
                        savedProduct.availableSizes.length > 0
                        ? savedProduct.availableSizes
                        : [
                            {
                                size: 'Medium',
                                price: savedProduct.price || ''
                            },
                            {
                                size: 'Large',
                                price: savedProduct.price || ''
                            }
                        ]

                if (typeof sizes[0] === 'string') {
                    sizes = sizes.map((s) => ({
                        size: s,
                        price: savedProduct.price || ''
                    }))
                }

                setProduct({
                    productName: savedProduct.productName || '',
                    productCategory:
                        savedProduct.productCategory || '',
                    description: savedProduct.description || '',
                    availableSizes: sizes
                })

                setImagePreview(savedProduct.imageUrl || '')
            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                    'Could not load product.'
                )

                setMessageType('error')

                showToast(
                    error.response?.data?.message ||
                    'Could not load product.',
                    'error'
                )
            } finally {
                setLoadingProduct(false)
            }
        }

        loadProduct()
    }, [isEditing, productId, showToast])

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target

        setProduct((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSizeToggle = (sizeName) => {
        setProduct((prev) => {
            const sizes = prev.availableSizes || []
            const exists = sizes.find((s) => s.size === sizeName)

            if (exists) {
                return {
                    ...prev,
                    availableSizes: sizes.filter(
                        (s) => s.size !== sizeName
                    )
                }
            } else {
                return {
                    ...prev,
                    availableSizes: [
                        ...sizes,
                        {
                            size: sizeName,
                            price: ''
                        }
                    ]
                }
            }
        })
    }

    const handleSizePriceChange = (sizeName, newPrice) => {
        setProduct((prev) => {
            const sizes = [...(prev.availableSizes || [])]
            const sizeObj = sizes.find(
                (s) => s.size === sizeName
            )

            if (sizeObj) {
                sizeObj.price = newPrice
            }

            return {
                ...prev,
                availableSizes: sizes
            }
        })
    }

    // Handle Image
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0]

        if (!selectedImage) {
            return
        }

        setImage(selectedImage)
        setImagePreview(
            URL.createObjectURL(selectedImage)
        )
    }

    // Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (product.availableSizes.length === 0) {
            showToast(
                'Please select at least one size',
                'error'
            )
            return
        }

        // Ensure all selected sizes have prices
        for (let s of product.availableSizes) {
            if (!s.price || isNaN(Number(s.price))) {
                showToast(
                    `Please enter a valid price for size ${s.size}`,
                    'error'
                )
                return
            }
        }

        setLoading(true)
        setMessage("")
        setMessageType("")

        try {
            const formData = new FormData()

            formData.append(
                "productName",
                product.productName
            )

            formData.append(
                "productCategory",
                product.productCategory
            )

            // Set base price to the cheapest option for sorting/display
            const lowestPrice = Math.min(
                ...product.availableSizes.map(
                    (s) => Number(s.price)
                )
            )

            formData.append("price", lowestPrice)

            formData.append(
                "description",
                product.description
            )

            formData.append(
                "availableSizes",
                JSON.stringify(
                    product.availableSizes
                )
            )

            if (image) {
                formData.append("image", image)
            }

            const url = isEditing
                ? `https://drink-backend-two.vercel.app/api/products/${productId}`
                : "https://drink-backend-two.vercel.app/api/products"

            const token = localStorage.getItem("token")

            const response = isEditing
                ? await axios.put(url, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                : await axios.post(url, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

            setMessage(
                response.data.message ||
                "Product saved successfully!"
            )

            setMessageType("success")

            showToast(
                response.data.message ||
                'Product saved successfully!'
            )

            navigate('/admin/products')
        } catch (error) {
            console.error(
                "Error saving product:",
                error
            )

            setMessage(
                error.response?.data?.message ||
                "Failed to save product. Please try again."
            )

            setMessageType("error")

            showToast(
                error.response?.data?.message ||
                'Failed to save product. Please try again.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    // Delete Product
    const handleDelete = async () => {
        const shouldDelete = window.confirm(
            'Are you sure you want to delete this product?'
        )

        if (!shouldDelete) {
            return
        }

        setLoading(true)
        setMessage('')
        setMessageType('')

        try {
            const token = localStorage.getItem("token")

            const response = await axios.delete(
                `https://drink-backend-two.vercel.app/api/products/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setMessage(
                response.data.message ||
                'Product deleted successfully.'
            )

            setMessageType('success')

            showToast(
                response.data.message ||
                'Product deleted successfully.'
            )

            navigate('/admin/products')
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Failed to delete product.'
            )

            setMessageType('error')

            showToast(
                error.response?.data?.message ||
                'Failed to delete product.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="admin-header">
                <div>
                    <span>CATALOG / PRODUCTS</span>

                    <h1>
                        {isEditing
                            ? 'Edit Product'
                            : 'Add Product'}
                    </h1>

                    <p>
                        {isEditing
                            ? 'Update the details shown in your customer menu.'
                            : 'Add a new drink to your customer menu.'}
                    </p>
                </div>

                <Link
                    className="admin-back-link"
                    to="/admin/products"
                >
                    ← Back to products
                </Link>
            </div>

            <section className="admin-section product-form-card">
                {loadingProduct ? (
                    <p className="admin-loading-state">
                        Loading product...
                    </p>
                ) : (
                    <form
                        className="admin-product-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-section-heading">
                            <h2>Product details</h2>

                            <p>
                                Keep the information clear and appetizing.
                            </p>

                            {message && (
                                <p
                                    className={`form-message ${messageType}`}
                                >
                                    {message}
                                </p>
                            )}
                        </div>

                        <div className="admin-form-grid">
                            {/* Product Name */}
                            <label>
                                Product name

                                <input
                                    type="text"
                                    name="productName"
                                    value={product.productName}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    required
                                />
                            </label>

                            {/* Category */}
                            <label>
                                Category

                                <select
                                    name="productCategory"
                                    value={
                                        product.productCategory
                                    }
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Choose category
                                    </option>

                                    <option value="Milkshake">
                                        Milkshake
                                    </option>

                                    <option value="Smoothie">
                                        Smoothie
                                    </option>

                                    <option value="Coffee">
                                        Coffee
                                    </option>

                                    <option value="Juice">
                                        Juice
                                    </option>
                                </select>
                            </label>

                            {/* Product Image */}
                            <label className="form-full">
                                Product image

                                {imagePreview && (
                                    <img
                                        className="admin-image-preview"
                                        src={imagePreview}
                                        alt="Product preview"
                                    />
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required={!isEditing}
                                />
                            </label>

                            {/* Available Sizes & Prices */}
                            <label className="form-full">
                                Available sizes & pricing

                                <div
                                    className="admin-size-options"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        marginTop: '10px'
                                    }}
                                >
                                    {[
                                        'Small',
                                        'Medium',
                                        'Large',
                                        'Extra Large'
                                    ].map((sizeName) => {
                                        const sizeObj = (
                                            product.availableSizes ||
                                            []
                                        ).find(
                                            (s) =>
                                                s.size ===
                                                sizeName
                                        )

                                        const isChecked =
                                            !!sizeObj

                                        return (
                                            <div
                                                key={sizeName}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px'
                                                }}
                                            >
                                                <label
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontWeight:
                                                            'normal',
                                                        cursor: 'pointer',
                                                        width: '120px',
                                                        margin: 0
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        style={{
                                                            width: 'auto',
                                                            minHeight:
                                                                'auto',
                                                            margin: 0
                                                        }}
                                                        checked={
                                                            isChecked
                                                        }
                                                        onChange={() =>
                                                            handleSizeToggle(
                                                                sizeName
                                                            )
                                                        }
                                                    />

                                                    {sizeName}
                                                </label>

                                                {isChecked && (
                                                    <input
                                                        type="number"
                                                        placeholder="Price (e.g. 400)"
                                                        value={
                                                            sizeObj.price
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleSizePriceChange(
                                                                sizeName,
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                '6px 10px',
                                                            minHeight:
                                                                '36px',
                                                            maxWidth:
                                                                '200px',
                                                            margin: 0
                                                        }}
                                                        required
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </label>

                            {/* Description */}
                            <label className="form-full">
                                Description

                                <textarea
                                    name="description"
                                    value={
                                        product.description
                                    }
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Describe this drink..."
                                />
                            </label>
                        </div>

                        <div className="admin-form-actions">
                            {isEditing && (
                                <button
                                    className="delete-product-btn"
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Deleting...'
                                        : 'Delete Product'}
                                </button>
                            )}

                            <Link to="/admin/products">
                                Cancel
                            </Link>

                            <button
                                className="add-product-btn"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Saving...'
                                    : isEditing
                                        ? 'Save changes'
                                        : 'Create product'}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </>
    )
}

export default AdminProductForm