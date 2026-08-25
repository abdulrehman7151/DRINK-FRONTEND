export function formatSizeAbbreviation(size) {
    const normalized = (size || 'Medium').trim()
    return normalized.charAt(0).toUpperCase()
}

export function formatOrderLineItem(item) {
    const name = item.productId?.productName || 'Removed product'
    const sizeAbbr = formatSizeAbbreviation(item.size)
    return `${name} (${sizeAbbr}) × ${item.quantity}`
}

export function formatStatusLabel(status) {
    return (status || '').replace(/_/g, ' ')
}

export function getOrderSearchText(order) {
    const productText = (order.products || [])
        .map((item) => item.productId?.productName || '')
        .join(' ')

    return [
        order._id,
        order._id?.slice(-6),
        order.status,
        formatStatusLabel(order.status),
        order.delivery?.fullName,
        order.delivery?.phone,
        order.delivery?.address,
        order.delivery?.houseNo,
        order.delivery?.notes,
        order.userId?.email,
        order.userId?.username,
        String(order.totalPrice || ''),
        productText
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
}

export function filterOrdersBySearch(orders, query) {
    const term = query.trim().toLowerCase()
    if (!term) return orders

    return orders.filter((order) => getOrderSearchText(order).includes(term))
}

export const STAGE_ACTIONS = {
    pending: [
        { status: 'accepted', label: 'Accept', className: 'accept' },
        { status: 'rejected', label: 'Reject', className: 'reject' }
    ],
    accepted: [
        { status: 'out_for_delivery', label: 'Out for Delivery', className: 'delivery' },
        { status: 'rejected', label: 'Reject', className: 'reject' }
    ],
    out_for_delivery: [
        { status: 'completed', label: 'Mark Completed', className: 'complete' }
    ],
    completed: [],
    rejected: []
}

export function getActionsForStatus(status) {
    return STAGE_ACTIONS[status] || []
}
