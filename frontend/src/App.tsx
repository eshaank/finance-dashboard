import { useState, useRef, useCallback } from 'react'
import { SWRConfig } from 'swr'
import { Header } from './components/layout/Header'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardHome } from './components/layout/DashboardHome'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/auth/AuthPage'
import { Loader2 } from 'lucide-react'
import { swrConfig } from './lib/swr'
import type { ViewId, TabId } from './components/layout/NavTabs'

function App() {
  return (
    <SWRConfig value={swrConfig}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SWRConfig>
  )
}

function AppContent() {
  const { session, loading } = useAuth()
  const [activeView, setActiveView] = useState<ViewId>('home')
  const lastNonHomeView = useRef<TabId>('markets')
  const addWidgetHandler = useRef<(() => void) | null>(null)
  const commandPaletteHandler = useRef<(() => void) | null>(null)

  const registerAddWidget = useCallback((handler: () => void) => {
    addWidgetHandler.current = handler
  }, [])

  const registerCommandPalette = useCallback((handler: () => void) => {
    commandPaletteHandler.current = handler
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dash-bg grid-pattern flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  const isTerminalMode = activeView === 'home'

  function handleTabChange(tab: TabId) {
    lastNonHomeView.current = tab
    setActiveView(tab)
  }

  function handleExitTerminal() {
    setActiveView(lastNonHomeView.current)
  }

  return (
    <div className="min-h-screen bg-dash-bg grid-pattern">
      <Header
        activeView={activeView}
        onTabChange={handleTabChange}
        onGoHome={() => setActiveView('home')}
        isTerminalMode={isTerminalMode}
        onExitTerminal={handleExitTerminal}
        onAddWidgetClick={() => addWidgetHandler.current?.()}
        onCommandPaletteOpen={() => commandPaletteHandler.current?.()}
      />
      {isTerminalMode ? (
        <DashboardHome
          onAddWidgetClick={registerAddWidget}
          onCommandPaletteOpen={registerCommandPalette}
        />
      ) : (
        <DashboardLayout activeTab={activeView} />
      )}
    </div>
  )
}

export default App
