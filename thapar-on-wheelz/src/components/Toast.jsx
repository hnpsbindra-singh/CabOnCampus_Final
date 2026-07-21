import { useState, useEffect } from 'react'

let _showToast = null
export function showToast(msg, type = 'success') {
  if (_showToast) _showToast(msg, type)
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _showToast = (msg, type) => {
      const id = Date.now()
      setToasts(t => [...t, { id, msg, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  )
}
