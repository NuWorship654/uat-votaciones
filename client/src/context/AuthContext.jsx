import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sesión de 10 minutos de inactividad (RNF Seguridad)
  const SESSION_TIMEOUT = 10 * 60 * 1000
  let inactivityTimer = null

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer)
    if (token) {
      inactivityTimer = setTimeout(() => {
        logout()
        alert('Sesión cerrada por inactividad (10 minutos).')
      }, SESSION_TIMEOUT)
    }
  }, [token])

  useEffect(() => {
    const savedToken = localStorage.getItem('uat_token')
    const savedUsuario = localStorage.getItem('uat_usuario')
    if (savedToken && savedUsuario) {
      try {
        const u = JSON.parse(savedUsuario)
        setToken(savedToken)
        setUsuario(u)
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => document.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      clearTimeout(inactivityTimer)
      events.forEach(e => document.removeEventListener(e, resetTimer))
    }
  }, [resetTimer])

  const login = (tokenData, usuarioData) => {
    setToken(tokenData)
    setUsuario(usuarioData)
    localStorage.setItem('uat_token', tokenData)
    localStorage.setItem('uat_usuario', JSON.stringify(usuarioData))
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('uat_token')
    localStorage.removeItem('uat_usuario')
    clearTimeout(inactivityTimer)
  }

  const actualizarHaVotado = () => {
    if (usuario) {
      const updated = { ...usuario, ha_votado: 1 }
      setUsuario(updated)
      localStorage.setItem('uat_usuario', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout, actualizarHaVotado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
