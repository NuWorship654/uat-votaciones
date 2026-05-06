import React from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Header from './components/Header'
import Footer from './components/Footer'
import VotacionPage from './components/VotacionPage'
import AdminDashboard from './components/AdminDashboard'

function AppContent() {
  const { usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-uat-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // No autenticado → pantalla de login (CU-01, RF-01)
  if (!usuario) {
    return <Login />
  }

  // Autenticado → layout principal
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1">
        {/* Admin → panel de administración (CU-03, CU-04, RF-11, RF-12) */}
        {usuario.rol === 'admin' ? <AdminDashboard /> : <VotacionPage />}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
