import { AppProviders } from './AppProviders'
import { AppRouter } from './router'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
