import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmacionVoto from './ConfirmacionVoto'

// Iniciales del nombre para el avatar
function getIniciales(nombre) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

function CandidatoCard({ candidato, onVotar, yaVoto }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
      {/* Avatar con iniciales */}
      <div className="bg-uat-blue text-white font-bold text-xl w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow">
        {getIniciales(candidato.nombre)}
      </div>

      <h3 className="text-uat-blue font-bold text-base mb-1">{candidato.nombre}</h3>
      <p className="text-uat-orange font-semibold text-sm mb-3">{candidato.partido}</p>
      <p className="text-gray-600 text-sm mb-5 flex-1">{candidato.descripcion}</p>

      {!yaVoto && (
        <button
          onClick={() => onVotar(candidato)}
          className="bg-uat-orange text-white font-bold px-8 py-2 rounded-lg hover:bg-uat-orange-light transition-colors w-full"
        >
          Votar
        </button>
      )}
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

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [candidatosRes, estadoRes] = await Promise.all([
        fetch('/api/candidatos', { headers }),
        fetch('/api/estado-eleccion', { headers })
      ])

      const candidatosData = await candidatosRes.json()
      const estadoData = await estadoRes.json()

      setCandidatos(candidatosData)
      setEleccion(estadoData.eleccion)
      setYaVoto(estadoData.ha_votado || usuario?.ha_votado)

      if (estadoData.ha_votado || usuario?.ha_votado) {
        setVotacionExitosa(true)
      }
    } catch {
      setError('Error al cargar los datos. Intente recargar la página.')
    } finally {
      setLoading(false)
    }
  }

  const handleSeleccionarCandidato = (candidato) => {
    // RF-08: Confirmación antes de registrar
    setCandidatoSeleccionado(candidato)
    setMostrarConfirmacion(true)
  }

  const handleConfirmarVoto = async () => {
    try {
      const res = await fetch('/api/votar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidato_id: candidatoSeleccionado.id })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrar el voto')
        setMostrarConfirmacion(false)
      } else {
        setMostrarConfirmacion(false)
        setVotacionExitosa(true)
        setYaVoto(true)
        actualizarHaVotado()
      }
    } catch {
      setError('Error de conexión al registrar el voto.')
      setMostrarConfirmacion(false)
    }
  }

  const handleCancelarConfirmacion = () => {
    setMostrarConfirmacion(false)
    setCandidatoSeleccionado(null)
  }

  // Pantalla de confirmación exitosa (Wireframe 1.3)
  if (votacionExitosa) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-uat-blue font-bold text-xl mb-2">Gracias por tu participación</h2>
          <p className="text-gray-600 text-sm mb-4">
            Tu voto ha sido registrado exitosamente. La democracia universitaria depende de la participación activa de todos.
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-500">
            <p><span className="font-semibold">Matrícula:</span> {usuario?.matricula}</p>
            <p><span className="font-semibold">Facultad:</span> {usuario?.facultad}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-10 h-10 border-4 border-uat-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Cargando elección...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-8">
      {/* Modal de confirmación (RF-08) */}
      {mostrarConfirmacion && candidatoSeleccionado && (
        <ConfirmacionVoto
          candidato={candidatoSeleccionado}
          onConfirmar={handleConfirmarVoto}
          onCancelar={handleCancelarConfirmacion}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Encabezado de elección (Wireframe 1.2) */}
        <div className="text-center mb-8">
          <h2 className="text-uat-blue font-bold text-2xl">
            {eleccion?.titulo || 'Elección Representante Estudiantil'}
          </h2>
          <p className="text-gray-500 mt-1">
            Bienvenido, {usuario?.nombre}. Selecciona tu candidato.
          </p>
          {eleccion?.fecha_fin && (
            <p className="text-sm text-gray-400 mt-1">
              Cierre: {new Date(eleccion.fecha_fin).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Tarjetas de candidatos en grid horizontal (Wireframe 1.2) */}
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
                onVotar={handleSeleccionarCandidato}
                yaVoto={yaVoto}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
