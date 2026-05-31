import { useEffect } from 'react'
import App from '../App'

export function AppWithLoader() {
  useEffect(() => {
    const loader = document.getElementById('root-loader')
    if (!loader) return
    loader.style.opacity = '0'
    loader.style.transition = 'opacity 0.3s ease'
    window.setTimeout(() => loader.remove(), 300)
  }, [])

  return <App />
}
