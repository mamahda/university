import { QueryClient } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AppProviders } from '../AppProviders'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps
  queryClient?: QueryClient
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, queryClient = createTestQueryClient(), ...renderOptions }: CustomRenderOptions = {},
) {
  return {
    queryClient,
    ...render(
      <AppProviders client={queryClient}>
        <MemoryRouter {...routerProps}>{ui}</MemoryRouter>
      </AppProviders>,
      renderOptions,
    ),
  }
}
