import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

const COLORES = [
  '#003087', '#E8521A', '#1a4fa0', '#f06030',
  '#0d6efd', '#fd7e14', '#198754', '#dc3545'
]

export default function ResultadosChart({ candidatos, totalVotos, totalVotantes, totalUsuarios, porcentajeParticipacion }) {
  const labels = candidatos.map(c => c.nombre.split(' ').slice(0, 2).join(' '))
  const votos = candidatos.map(c => c.votos || 0)
  const colores = candidatos.map((_, i) => COLORES[i % COLORES.length])

  const barData = {
    labels,
    datasets: [{
      label: 'Votos obtenidos',
      data: votos,
      backgroundColor: colores,
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  const pieData = {
    labels,
    datasets: [{
      data: votos,
      backgroundColor: colores,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Votos por candidato', font: { size: 14 } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Distribución porcentual', font: { size: 14 } }
    }
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total votos" value={totalVotos} color="bg-uat-blue" />
        <StatCard label="Votantes" value={totalVotantes} color="bg-uat-orange" />
        <StatCard label="Alumnos registrados" value={totalUsuarios} color="bg-blue-500" />
        <StatCard label="Participación" value={`${porcentajeParticipacion}%`} color="bg-green-600" />
      </div>

      {/* Tabla de resultados */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-uat-blue text-white">
            <tr>
              <th className="text-left px-4 py-3">Candidato</th>
              <th className="text-left px-4 py-3">Partido</th>
              <th className="text-center px-4 py-3">Votos</th>
              <th className="text-center px-4 py-3">%</th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-gray-800">{c.nombre}</td>
                <td className="px-4 py-3 text-uat-orange font-semibold text-xs">{c.partido}</td>
                <td className="px-4 py-3 text-center font-bold text-uat-blue">{c.votos || 0}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-16">
                      <div
                        className="bg-uat-orange h-2 rounded-full"
                        style={{ width: `${c.porcentaje || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-10">{c.porcentaje || '0.0'}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráficas Chart.js (RF-10, doc Tecnologías: Chart.js para resultados) */}
      {totalVotos > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          <p>Aún no hay votos registrados. Las gráficas aparecerán aquí.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} text-white rounded-xl p-4 text-center shadow`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  )
}
