import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { usuario, logout } = useAuth()

  return (
    <header>
      <div className="bg-uat-blue px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-uat-2.png" alt="Escudo UAT" className="h-12 object-contain" />
          <img src="/logo-uat.png" alt="UAT" className="h-12 object-contain" />
          <div className="border-l border-blue-400 pl-3">
            <p className="text-white font-bold text-sm leading-tight">Sistema de Votaciones</p>
            <p className="text-blue-200 text-xs">Universidad Autónoma de Tamaulipas</p>
          </div>
        </div>
        {usuario && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{usuario.nombre}</p>
              <p className="text-blue-200 text-xs">{usuario.rol === 'admin' ? 'Administrador' : usuario.facultad}</p>
            </div>
            <button onClick={logout} className="bg-uat-orange text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-uat-orange-light transition-colors">
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
      <div className="bg-uat-orange px-4 py-1.5">
        <p className="text-white text-xs font-medium text-center tracking-wide">VERDAD · BELLEZA · PROBIDAD</p>
      </div>
    </header>
  )
}