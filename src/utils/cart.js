export function getCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        return cart.reduce((total, item) => total + (item.quantity || 0), 0)
    } catch {
        return 0
    }
}

export function notifyCartUpdated() {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
}

export function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
    notifyCartUpdated()
}
