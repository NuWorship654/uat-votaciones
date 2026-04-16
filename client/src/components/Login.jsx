import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [matricula, setMatricula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        login(data.token, data.usuario)
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header institucional */}
      <header className="bg-uat-orange px-6 py-3 flex items-center gap-3 shadow">
        <div className="bg-white text-uat-orange font-black text-sm w-9 h-9 rounded-full flex items-center justify-center">
          UAT
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Sistema de Votaciones UAT</p>
          <p className="text-orange-100 text-xs">Universidad Autónoma de Tamaulipas</p>
        </div>
      </header>

      {/* Contenido central */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
          {/* Logo + título */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-uat-orange text-white font-black text-lg w-14 h-14 rounded-full flex items-center justify-center shadow mb-3">
              UAT
            </div>
            <h2 className="text-uat-blue font-bold text-xl">Inicio de Sesión</h2>
            <p className="text-gray-500 text-sm text-center mt-1">
              Ingresa tus credenciales institucionales
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Ej. a2223010012"
                required
                className="w-full border border-uat-orange rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-uat-orange rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-uat-orange text-white font-bold py-2.5 rounded-lg hover:bg-uat-orange-light transition-colors disabled:opacity-60"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-5 border-t pt-4">
            <p className="text-xs text-gray-400 text-center mb-2">Usuarios de prueba:</p>
            <div className="text-xs text-gray-500 space-y-1 text-center">
              <p><span className="font-semibold">Admin:</span> admin / admin123</p>
              <p><span className="font-semibold">Alumno:</span> a2161150443 / alumno123</p>
              <p><span className="font-semibold">Alumno:</span> a2223010012 / alumno123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer institucional */}
      <footer className="bg-uat-blue text-center py-3">
        <p className="text-blue-200 text-xs">
          Universidad Autónoma de Tamaulipas · Sistema de Votaciones Estudiantiles 2024
        </p>
      </footer>
    </div>
  )
}
