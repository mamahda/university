import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { env } from './config/env'
import './index.css'

async function enableMockingIfConfigured(): Promise<void> {
  if (!env.enableMsw) {
    return
  }
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledFrame: 'bypass',
  })
}

void enableMockingIfConfigured().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
