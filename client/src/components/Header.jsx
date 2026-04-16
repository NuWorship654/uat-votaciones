import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { usuario, logout } = useAuth()

  return (
    <header className="bg-uat-orange shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Nombre */}
        <div className="flex items-center gap-3">
          <div className="bg-white text-uat-orange font-black text-sm w-10 h-10 rounded-full flex items-center justify-center shadow">
            UAT
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Sistema de Votaciones UAT</h1>
            <p className="text-orange-100 text-xs">Universidad Autónoma de Tamaulipas</p>
          </div>
        </div>

        {/* Info usuario + logout */}
        {usuario && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{usuario.nombre}</p>
              <p className="text-orange-100 text-xs">
                {usuario.rol === 'admin' ? 'Administrador' : `Alumno · ${usuario.facultad}`}
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-white text-uat-orange font-semibold text-sm px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
