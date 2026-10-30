import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { initNative, hideSplash } from './native.js'
import { reloadOnceForChunkError } from './lib/chunkReload.js'
import { installPasswordClipboardGuard } from './lib/blockPasswordClipboard.js'

// Vite fires this when a lazy chunk fails to load, usually right after a new deploy.
window.addEventListener('vite:preloadError', (e) => {
  if (reloadOnceForChunkError()) e.preventDefault()
})

initNative() // no-op in the browser
installPasswordClipboardGuard()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

requestAnimationFrame(() => requestAnimationFrame(hideSplash))
