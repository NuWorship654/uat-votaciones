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
      if (!res.ok) setError(data.error || 'Error al iniciar sesión')
      else login(data.token, data.usuario)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header>
        <div className="bg-uat-blue px-6 py-2 flex items-center gap-3">
          <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2">
            <img src="/logo-uat-2.png" alt="Escudo UAT" className="h-10 object-contain" />
            <div className="w-px bg-gray-300 h-8" />
            <img src="/logo-uat.png" alt="UAT" className="h-10 object-contain" />
          </div>
          <div className="border-l border-blue-400 pl-3">
            <p className="text-white font-bold text-sm">Sistema de Votaciones</p>
            <p className="text-blue-200 text-xs">Universidad Autónoma de Tamaulipas</p>
          </div>
        </div>
        <div className="bg-uat-orange px-4 py-1.5">
          <p className="text-white text-xs font-medium text-center tracking-wide">VERDAD · BELLEZA · PROBIDAD</p>
        </div>
      </header>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
          {/* Logos centrados */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 mb-4 shadow-sm">
              <img src="/logo-uat-2.png" alt="Escudo UAT" className="h-14 object-contain" />
              <div className="w-px bg-gray-200 h-10" />
              <img src="/logo-uat.png" alt="UAT" className="h-14 object-contain" />
            </div>
            <h2 className="text-uat-blue font-bold text-xl">Inicio de Sesión</h2>
            <p className="text-gray-500 text-sm text-center mt-1">Ingresa tus credenciales institucionales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula</label>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Ej. a2223010012"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-blue"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-uat-blue text-white font-bold py-2.5 rounded-lg hover:bg-uat-blue-light transition-colors disabled:opacity-60"
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-5 border-t pt-4 text-center">
            <p className="text-xs text-gray-400">Utiliza tus credenciales institucionales UAT</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-uat-blue py-3 text-center">
        <div className="bg-uat-orange h-1 mb-3" />
        <p className="text-blue-200 text-xs">© Universidad Autónoma de Tamaulipas · Sistema de Votaciones Estudiantiles</p>
      </footer>
    </div>
  )
}
