import { createRoot } from 'react-dom/client'
import App from './App.jsx'

document.documentElement.style.margin = '0'
document.documentElement.style.padding = '0'
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.overflow = 'hidden'

// StrictMode intentionally omitted: this app drives Three.js imperatively in a
// single effect; StrictMode's double-invoke would load the 140MB GLB twice and
// duplicate scene setup.
createRoot(document.getElementById('root')).render(<App />)
