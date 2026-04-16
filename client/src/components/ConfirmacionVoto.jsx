import React from 'react'

function getIniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export default function ConfirmacionVoto({ candidato, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        {/* Ícono de advertencia */}
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-uat-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h3 className="text-uat-blue font-bold text-lg mb-2">Confirmar tu voto</h3>
        <p className="text-gray-500 text-sm mb-5">
          Estás a punto de votar por:
        </p>

        {/* Info del candidato */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="bg-uat-blue text-white font-bold text-lg w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2">
            {getIniciales(candidato.nombre)}
          </div>
          <p className="text-uat-blue font-bold">{candidato.nombre}</p>
          <p className="text-uat-orange text-sm font-semibold">{candidato.partido}</p>
        </div>

        <p className="text-red-600 text-xs mb-5 font-semibold">
          ⚠️ Esta acción es irreversible. No podrás cambiar tu voto.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-uat-orange text-white font-bold py-2.5 rounded-lg hover:bg-uat-orange-light transition-colors"
          >
            Confirmar Voto
          </button>
        </div>
      </div>
    </div>
  )
}
