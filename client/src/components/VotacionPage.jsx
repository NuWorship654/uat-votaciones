import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmacionVoto from './ConfirmacionVoto'

function getIniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function CandidatoCard({ candidato, onVotar, yaVoto }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
      {/* Foto o avatar */}
      <div className="w-full h-48 bg-gradient-to-br from-uat-blue to-uat-blue-light flex items-center justify-center overflow-hidden">
        {candidato.foto && !imgError ? (
          <img src={candidato.foto} alt={candidato.nombre} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <span className="text-white font-black text-4xl opacity-80">{getIniciales(candidato.nombre)}</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-uat-blue font-bold text-lg leading-tight mb-2">{candidato.nombre}</h3>

        {/* Cargo y Facultad */}
        <div className="flex flex-wrap gap-2 mb-3">
          {candidato.cargo && (
            <span className="bg-orange-50 text-uat-orange text-xs font-semibold px-2 py-1 rounded-full">
              🏅 {candidato.cargo}
            </span>
          )}
          {candidato.facultad_candidato && (
            <span className="bg-blue-50 text-uat-blue text-xs font-semibold px-2 py-1 rounded-full">
              🏫 {candidato.facultad_candidato}
            </span>
          )}
        </div>

        {/* Propuesta */}
        {candidato.descripcion && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Propuesta</p>
            <p className="text-gray-600 text-sm leading-relaxed">{candidato.descripcion}</p>
          </div>
        )}

        {/* Trayectoria */}
        {candidato.logros && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Trayectoria y experiencia</p>
            <p className="text-gray-600 text-sm leading-relaxed">{candidato.logros}</p>
          </div>
        )}

        {!yaVoto && (
          <div className="mt-auto">
            <button
              onClick={() => onVotar(candidato)}
              className="w-full bg-uat-orange text-white font-bold py-2.5 rounded-lg hover:bg-uat-orange-light transition-colors"
            >
              Votar por {candidato.nombre.split(' ')[0]}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VotacionPage() {
  const { usuario, token, actualizarHaVotado } = useAuth()
  const [candidatos, setCandidatos] = useState([])
  const [eleccion, setEleccion] = useState(null)
  const [yaVoto, setYaVoto] = useState(false)
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [votacionExitosa, setVotacionExitosa] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [cRes, eRes] = await Promise.all([
        fetch('/api/candidatos', { headers }),
        fetch('/api/estado-eleccion', { headers })
      ])
      const cData = await cRes.json()
      const eData = await eRes.json()
      setCandidatos(cData)
      setEleccion(eData.eleccion)
      setYaVoto(eData.ha_votado || usuario?.ha_votado)
      if (eData.ha_votado || usuario?.ha_votado) setVotacionExitosa(true)
    } catch { setError('Error al cargar los datos.') }
    finally { setLoading(false) }
  }

  const handleConfirmarVoto = async () => {
    try {
      const res = await fetch('/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidato_id: candidatoSeleccionado.id })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al registrar el voto'); setMostrarConfirmacion(false) }
      else { setMostrarConfirmacion(false); setVotacionExitosa(true); setYaVoto(true); actualizarHaVotado() }
    } catch { setError('Error de conexión.'); setMostrarConfirmacion(false) }
  }

  if (votacionExitosa) return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-uat-blue font-bold text-xl mb-2">Gracias por tu participación</h2>
        <p className="text-gray-600 text-sm mb-4">Tu voto ha sido registrado exitosamente. La democracia universitaria depende de la participación activa de todos.</p>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500">
          <p><span className="font-semibold">Matrícula:</span> {usuario?.matricula}</p>
          <p><span className="font-semibold">Facultad:</span> {usuario?.facultad}</p>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="w-10 h-10 border-4 border-uat-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Cargando elección...</p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 px-4 py-8">
      {mostrarConfirmacion && candidatoSeleccionado && (
        <ConfirmacionVoto
          candidato={candidatoSeleccionado}
          onConfirmar={handleConfirmarVoto}
          onCancelar={() => { setMostrarConfirmacion(false); setCandidatoSeleccionado(null) }}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-uat-blue font-bold text-2xl">{eleccion?.titulo || 'Elección Representante Estudiantil'}</h2>
          <p className="text-gray-500 mt-1">Bienvenido, {usuario?.nombre}. Conoce a los candidatos y emite tu voto.</p>
          {eleccion?.fecha_fin && (
            <p className="text-sm text-gray-400 mt-1">
              Cierre: {new Date(eleccion.fecha_fin).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm text-center">{error}</div>}

        {candidatos.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg">No hay candidatos registrados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatos.map(c => (
              <CandidatoCard
                key={c.id}
                candidato={c}
                onVotar={c => { setCandidatoSeleccionado(c); setMostrarConfirmacion(true) }}
                yaVoto={yaVoto}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
