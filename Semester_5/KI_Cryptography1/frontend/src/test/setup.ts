import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetMockState } from '../mocks/handlers'
import { server } from '../mocks/server'
import { useAuthStore } from '../stores/authStore'
import { useUiStore } from '../stores/uiStore'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockState()
  useAuthStore.setState({ sessionChecked: false, isBootstrapping: false, user: null })
  useUiStore.setState({ sidebarOpen: false, notices: [] })
})

afterAll(() => {
  server.close()
})
