import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { StoreProvider } from './state/store'
import './styles.css'

// Autoupdate: the next launch after a deploy quietly picks up the new build. There is no
// point prompting for a reload in an app you open with your hands on the floor.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
