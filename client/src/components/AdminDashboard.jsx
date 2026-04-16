import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ResultadosChart from './ResultadosChart'

const TAB = { RESULTADOS: 'resultados', CANDIDATOS: 'candidatos', USUARIOS: 'usuarios', CONFIG: 'config', BITACORA: 'bitacora' }

export default function AdminDashboard() {
  const { token } = useAuth()
  const [tab, setTab] = useState(TAB.RESULTADOS)
  const [resultados, setResultados] = useState(null)
  const [candidatos, setCandidatos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [config, setConfig] = useState({})
  const [bitacora, setBitacora] = useState([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  // Formulario candidato
  const [formCandidato, setFormCandidato] = useState({ nombre: '', partido: '', descripcion: '' })
  // Formulario usuario
  const [formUsuario, setFormUsuario] = useState({ matricula: '', nombre: '', password: '', rol: 'alumno', facultad: '' })

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => { cargarTab(tab) }, [tab])

  const cargarTab = async (t) => {
    setLoading(true); setError('')
    try {
      if (t === TAB.RESULTADOS) {
        const r = await fetch('/api/resultados', { headers })
        setResultados(await r.json())
      } else if (t === TAB.CANDIDATOS) {
        const r = await fetch('/api/candidatos', { headers })
        setCandidatos(await r.json())
      } else if (t === TAB.USUARIOS) {
        const r = await fetch('/api/admin/usuarios', { headers })
        setUsuarios(await r.json())
      } else if (t === TAB.CONFIG) {
        const r = await fetch('/api/configuracion', { headers })
        setConfig(await r.json())
      } else if (t === TAB.BITACORA) {
        const r = await fetch('/api/admin/bitacora', { headers })
        setBitacora(await r.json())
      }
    } catch { setError('Error al cargar datos') }
    setLoading(false)
  }

  const mostrarMensaje = (msg, isError = false) => {
    if (isError) setError(msg); else setMensaje(msg)
    setTimeout(() => { setMensaje(''); setError('') }, 3500)
  }

  // Cambiar estado de elección
  const cambiarEstado = async (estado) => {
    const r = await fetch('/api/admin/eleccion/estado', {
      method: 'PUT', headers,
      body: JSON.stringify({ estado })
    })
    const d = await r.json()
    if (r.ok) { mostrarMensaje(d.mensaje); cargarTab(TAB.CONFIG) }
    else mostrarMensaje(d.error, true)
  }

  // Guardar configuración
  const guardarConfig = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/admin/configuracion', {
      method: 'PUT', headers,
      body: JSON.stringify(config)
    })
    const d = await r.json()
    r.ok ? mostrarMensaje(d.mensaje) : mostrarMensaje(d.error, true)
  }

  // Agregar candidato
  const agregarCandidato = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/admin/candidatos', {
      method: 'POST', headers,
      body: JSON.stringify(formCandidato)
    })
    const d = await r.json()
    if (r.ok) {
      mostrarMensaje(d.mensaje)
      setFormCandidato({ nombre: '', partido: '', descripcion: '' })
      cargarTab(TAB.CANDIDATOS)
    } else mostrarMensaje(d.error, true)
  }

  // Eliminar candidato
  const eliminarCandidato = async (id) => {
    if (!confirm('¿Eliminar este candidato?')) return
    const r = await fetch(`/api/admin/candidatos/${id}`, { method: 'DELETE', headers })
    const d = await r.json()
    r.ok ? mostrarMensaje(d.mensaje) : mostrarMensaje(d.error, true)
    cargarTab(TAB.CANDIDATOS)
  }

  // Agregar usuario
  const agregarUsuario = async (e) => {
    e.preventDefault()
    const r = await fetch('/api/admin/usuarios', {
      method: 'POST', headers,
      body: JSON.stringify(formUsuario)
    })
    const d = await r.json()
    if (r.ok) {
      mostrarMensaje(d.mensaje)
      setFormUsuario({ matricula: '', nombre: '', password: '', rol: 'alumno', facultad: '' })
      cargarTab(TAB.USUARIOS)
    } else mostrarMensaje(d.error, true)
  }

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE', headers })
    mostrarMensaje('Usuario eliminado')
    cargarTab(TAB.USUARIOS)
  }

  const tabs = [
    { key: TAB.RESULTADOS, label: '📊 Resultados' },
    { key: TAB.CANDIDATOS, label: '👤 Candidatos' },
    { key: TAB.USUARIOS, label: '🎓 Usuarios' },
    { key: TAB.CONFIG, label: '⚙️ Configuración' },
    { key: TAB.BITACORA, label: '📋 Bitácora' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-uat-blue font-bold text-xl mb-4">Panel de Administración</h2>

      {/* Mensajes */}
      {mensaje && <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-2 text-sm mb-4">{mensaje}</div>}
      {error && <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-sm mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-uat-blue text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="w-8 h-8 border-4 border-uat-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Cargando...
        </div>
      ) : (
        <>
          {/* ── RESULTADOS ── */}
          {tab === TAB.RESULTADOS && resultados && (
            <ResultadosChart
              candidatos={resultados.candidatos || []}
              totalVotos={resultados.totalVotos || 0}
              totalVotantes={resultados.totalVotantes || 0}
              totalUsuarios={resultados.totalUsuarios || 0}
              porcentajeParticipacion={resultados.porcentajeParticipacion || '0.0'}
            />
          )}

          {/* ── CANDIDATOS ── */}
          {tab === TAB.CANDIDATOS && (
            <div className="space-y-6">
              {/* Formulario agregar */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-uat-blue mb-4">Agregar Candidato</h3>
                <form onSubmit={agregarCandidato} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Nombre completo" required
                    value={formCandidato.nombre}
                    onChange={e => setFormCandidato({ ...formCandidato, nombre: e.target.value })}
                  />
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Partido / Lista" required
                    value={formCandidato.partido}
                    onChange={e => setFormCandidato({ ...formCandidato, partido: e.target.value })}
                  />
                  <textarea
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange sm:col-span-2"
                    placeholder="Propuesta / Descripción" rows={3}
                    value={formCandidato.descripcion}
                    onChange={e => setFormCandidato({ ...formCandidato, descripcion: e.target.value })}
                  />
                  <button type="submit" className="sm:col-span-2 bg-uat-orange text-white font-bold py-2 rounded-lg hover:bg-uat-orange-light transition-colors">
                    Agregar Candidato
                  </button>
                </form>
              </div>

              {/* Lista */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-uat-blue text-white">
                    <tr>
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Partido</th>
                      <th className="text-center px-4 py-3">Votos</th>
                      <th className="text-center px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatos.map((c, i) => (
                      <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium">{c.nombre}</td>
                        <td className="px-4 py-3 text-uat-orange text-xs font-semibold">{c.partido}</td>
                        <td className="px-4 py-3 text-center font-bold text-uat-blue">{c.votos || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => eliminarCandidato(c.id)}
                            className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {candidatos.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-8 text-gray-400">No hay candidatos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {tab === TAB.USUARIOS && (
            <div className="space-y-6">
              {/* Formulario */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-uat-blue mb-4">Registrar Usuario</h3>
                <form onSubmit={agregarUsuario} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Matrícula" required
                    value={formUsuario.matricula}
                    onChange={e => setFormUsuario({ ...formUsuario, matricula: e.target.value })}
                  />
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Nombre completo" required
                    value={formUsuario.nombre}
                    onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })}
                  />
                  <input
                    type="password"
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Contraseña" required
                    value={formUsuario.password}
                    onChange={e => setFormUsuario({ ...formUsuario, password: e.target.value })}
                  />
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    placeholder="Facultad"
                    value={formUsuario.facultad}
                    onChange={e => setFormUsuario({ ...formUsuario, facultad: e.target.value })}
                  />
                  <select
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                    value={formUsuario.rol}
                    onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })}
                  >
                    <option value="alumno">Alumno</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <button type="submit" className="bg-uat-orange text-white font-bold py-2 rounded-lg hover:bg-uat-orange-light transition-colors">
                    Registrar Usuario
                  </button>
                </form>
              </div>

              {/* Lista */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-uat-blue text-white">
                    <tr>
                      <th className="text-left px-4 py-3">Matrícula</th>
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Facultad</th>
                      <th className="text-center px-4 py-3">Rol</th>
                      <th className="text-center px-4 py-3">¿Votó?</th>
                      <th className="text-center px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-mono text-xs">{u.matricula}</td>
                        <td className="px-4 py-3 font-medium">{u.nombre}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{u.facultad}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.rol === 'admin' ? 'bg-uat-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.ha_votado
                            ? <span className="text-green-600 font-bold">✓ Sí</span>
                            : <span className="text-gray-400">No</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.rol !== 'admin' && (
                            <button
                              onClick={() => eliminarUsuario(u.id)}
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {tab === TAB.CONFIG && (
            <div className="space-y-6">
              {/* Estado rápido */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-uat-blue mb-4">Control de Elección</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => cambiarEstado('activa')}
                    className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    ▶ Activar Elección
                  </button>
                  <button onClick={() => cambiarEstado('cerrada')}
                    className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    ■ Cerrar Elección
                  </button>
                  <button onClick={() => cambiarEstado('pendiente')}
                    className="bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                    ⏸ Poner en Espera
                  </button>
                </div>
                {config.estado && (
                  <p className="mt-3 text-sm">
                    Estado actual: <span className={`font-bold ${config.estado === 'activa' ? 'text-green-600' : config.estado === 'cerrada' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {config.estado}
                    </span>
                  </p>
                )}
              </div>

              {/* Editar configuración */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-uat-blue mb-4">Datos de la Elección</h3>
                <form onSubmit={guardarConfig} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                      value={config.titulo || ''}
                      onChange={e => setConfig({ ...config, titulo: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha inicio</label>
                      <input type="datetime-local"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                        value={config.fecha_inicio ? config.fecha_inicio.slice(0, 16) : ''}
                        onChange={e => setConfig({ ...config, fecha_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha cierre</label>
                      <input type="datetime-local"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uat-orange"
                        value={config.fecha_fin ? config.fecha_fin.slice(0, 16) : ''}
                        onChange={e => setConfig({ ...config, fecha_fin: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="bg-uat-blue text-white font-bold px-6 py-2 rounded-lg hover:bg-uat-blue-light transition-colors">
                    Guardar Configuración
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── BITÁCORA ── */}
          {tab === TAB.BITACORA && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-uat-blue text-white">
                  <tr>
                    <th className="text-left px-4 py-3">Fecha</th>
                    <th className="text-left px-4 py-3">Usuario</th>
                    <th className="text-left px-4 py-3">Acción</th>
                    <th className="text-left px-4 py-3">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacora.map((log, i) => (
                    <tr key={log.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.fecha).toLocaleString('es-MX')}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{log.matricula || '—'}</td>
                      <td className="px-4 py-2">
                        <span className="bg-uat-blue text-white text-xs px-2 py-0.5 rounded-full">{log.accion}</span>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">{log.detalle}</td>
                    </tr>
                  ))}
                  {bitacora.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">No hay registros en la bitácora</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
