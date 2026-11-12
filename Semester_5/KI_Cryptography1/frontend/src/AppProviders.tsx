import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import {
  apiClient,
  setConsentRequiredListener,
  setUnauthorizedListener,
} from './api'
import { queryClient as defaultQueryClient } from './lib/queryClient'
import { useAuthStore } from './stores/authStore'

interface AppProvidersProps {
  children: ReactNode
  client?: QueryClient
}

function AuthSessionLifecycle({ client }: { client: QueryClient }) {
  const sessionChecked = useAuthStore((state) => state.sessionChecked)

  useEffect(() => {
    setUnauthorizedListener(() => {
      useAuthStore.getState().clearSession()
      client.removeQueries({ queryKey: ['auth', 'me'] })
    })

    setConsentRequiredListener(() => {
      useAuthStore.getState().markConsentOutdated()
    })

    return () => {
      setUnauthorizedListener(null)
      setConsentRequiredListener(null)
    }
  }, [client])

  useEffect(() => {
    if (sessionChecked) {
      return
    }

    const controller = new AbortController()
    useAuthStore.getState().setBootstrapping(true)

    apiClient.auth
      .getMe(controller.signal)
      .then((me) => {
        if (!controller.signal.aborted) {
          useAuthStore.getState().setSessionUser(me)
          client.setQueryData(['auth', 'me'], me)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          useAuthStore.getState().clearSession()
        }
      })

    return () => {
      controller.abort()
    }
  }, [sessionChecked, client])

  return null
}

export function AppProviders({ children, client = defaultQueryClient }: AppProvidersProps) {
  return (
    <QueryClientProvider client={client}>
      <AuthSessionLifecycle client={client} />
      {children}
    </QueryClientProvider>
  )
}
