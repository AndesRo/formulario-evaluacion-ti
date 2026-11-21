
import { useState } from 'react'

function App() {
  // Leer los parámetros recibidos desde el enlace
  const parametros = new URLSearchParams(window.location.search)

  const numeroTicket = parametros.get('ticket')
  const token = parametros.get('token')

  const calificacionInicial = Number(parametros.get('calificacion'))

  const [calificacion, setCalificacion] = useState(
    Number.isInteger(calificacionInicial) &&
      calificacionInicial >= 1 &&
      calificacionInicial <= 5
      ? calificacionInicial
      : 5
  )

  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async () => {
    if (!numeroTicket || !token || enviando || exito) {
      return
    }

    setEnviando(true)
    setMensaje('')

    try {
      const respuesta = await fetch(
        import.meta.env.VITE_N8N_WEBHOOK_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            numero_ticket: numeroTicket,
            token: token,
            calificacion: String(calificacion),
            comentario: comentario.trim(),
          }).toString(),
        }
      )

      const resultado = await respuesta.json()

      if (resultado.procesado === true) {
        setExito(true)
        setMensaje(
          resultado.mensaje ||
          'Tu evaluación fue registrada correctamente. Gracias por tu opinión.'
        )
      } else {
        setMensaje(
          resultado.mensaje ||
          'No fue posible registrar tu evaluación.'
        )
      }
    } catch (error) {
      console.error('Error al enviar evaluación:', error)

      setMensaje(
        'No fue posible conectar con el servicio. Inténtalo nuevamente.'
      )
    } finally {
      setEnviando(false)
    }
  }

  const etiquetas = [
    '',
    'Muy mala',
    'Mala',
    'Regular',
    'Buena',
    'Excelente',
  ]

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎧</div>

          <h1 className="text-2xl font-bold text-slate-800">
            Evaluación de atención TI
          </h1>

          <p className="text-slate-500 mt-2">
            Tu opinión nos ayuda a mejorar nuestro servicio.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500">
            Número de ticket
          </p>

          <p className="font-semibold text-slate-800 mt-1">
            {numeroTicket || 'Ticket no identificado'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">
            ¿Cómo calificas la atención recibida?
          </h2>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((nota) => (
              <button
                key={nota}
                type="button"
                onClick={() => setCalificacion(nota)}
                disabled={enviando || exito}
                aria-label={`Calificar con ${nota} estrellas`}
                aria-pressed={calificacion === nota}
                className={`text-4xl transition-transform hover:scale-110 disabled:cursor-not-allowed ${calificacion >= nota
                  ? 'text-amber-400'
                  : 'text-slate-300'
                  }`}
              >
                ★
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-3">
            {etiquetas[calificacion]}
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="comentario"
            className="block font-semibold text-slate-700 mb-2"
          >
            Comentario (opcional)
          </label>

          <textarea
            id="comentario"
            rows="4"
            maxLength={1000}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={enviando || exito}
            placeholder="Cuéntanos cómo fue tu experiencia..."
            className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!numeroTicket || !token || enviando || exito}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {enviando
            ? 'Enviando...'
            : exito
              ? 'Evaluación enviada'
              : 'Enviar evaluación'}
        </button>

        {mensaje && (
          <p
            role="status"
            className={`text-center text-sm mt-4 ${exito ? 'text-green-700' : 'text-slate-600'
              }`}
          >
            {mensaje}
          </p>
        )}

        <p className="text-center text-xs text-slate-400 mt-5">
          Mesa de Ayuda TI · Gracias por tu colaboración
        </p>

      </section>
    </main>
  )
}

export default App
