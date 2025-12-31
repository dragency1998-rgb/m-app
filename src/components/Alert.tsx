// src/components/Alert.tsx
interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info'
  message: string
  onClose?: () => void
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const alertClass = `alert alert-${type} alert-dismissible fade show`

  return (
    <div className={alertClass} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  )
}
