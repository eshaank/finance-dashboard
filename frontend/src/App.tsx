import { useState } from 'react'
import { Header } from './components/layout/Header'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/auth/AuthPage'
import { Loader2 } from 'lucide-react'
import type { TabId } from './components/layout/NavTabs'

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { session, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('global-economics')

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

  return (
    <div className="min-h-screen bg-dash-bg grid-pattern">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
