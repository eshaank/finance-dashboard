import { Header } from './components/layout/Header'
import { DashboardLayout } from './components/layout/DashboardLayout'

function App() {
  return (
    <div className="min-h-screen bg-dash-bg grid-pattern">
      <Header />
      <DashboardLayout />
    </div>
  )
}

export default App
