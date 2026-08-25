/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

function Toast({ toast, onDismiss }) {
    return (
        <div className={`toast toast-${toast.type}`} role="status">
            <span>{toast.message}</span>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
            >
                ×
            </button>
        </div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const dismissToast = useCallback((id) => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message, type = 'success') => {
        const id = crypto.randomUUID()
        setToasts((currentToasts) => [...currentToasts, { id, message, type }])
        window.setTimeout(() => dismissToast(id), 4000)
    }, [dismissToast])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error('useToast must be used inside ToastProvider')
    }

    return context
}
