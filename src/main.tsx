import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/host-grotesk/wght.css'
import '@fontsource-variable/playfair-display/wght.css'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/caveat/wght.css'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource/cinzel-decorative/900.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource-variable/big-shoulders/wght.css'
import './index.css'
import App from './App.tsx'
import { Print } from './components/Print.tsx'

// `?imprimir` shows the print sheets for the stand instead of the site
const printing = new URLSearchParams(location.search).has('imprimir')

createRoot(document.getElementById('root')!).render(<StrictMode>{printing ? <Print /> : <App />}</StrictMode>)
