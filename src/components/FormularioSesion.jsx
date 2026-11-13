import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Bug, CheckCircle, AlertOctagon, Sparkles, Send } from 'lucide-react';

export default function FormularioSesion() {
  const [miembros, setMiembros] = useState([]);
  const [tipos, setTipos] = useState([]);

  // Estados del formulario
  const [miembroId, setMiembroId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [duracionMin, setDuracionMin] = useState(45);
  const [caloriasQuemadas, setCaloriasQuemadas] = useState(380);
  const [bpmReposo, setBpmReposo] = useState(65);
  const [bpmPromedio, setBpmPromedio] = useState(135);
  const [bpmMaximo, setBpmMaximo] = useState(160);
  const [notas, setNotas] = useState('Sesión estándar de adaptación cardiovascular.');

  const [enviando, setEnviando] = useState(false);
  const [toastError, setToastError] = useState(null);
  const [resultadoExitoso, setResultadoExitoso] = useState(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [resM, resT] = await Promise.all([
          axios.get('/api/miembros'),
          axios.get('/api/tipos-entrenamiento')
        ]);
        if (resM.data.status === 'success') {
          setMiembros(resM.data.data);
          if (resM.data.data.length > 0) setMiembroId(resM.data.data[0].id);
        }
        if (resT.data.status === 'success') {
          setTipos(resT.data.data);
          if (resT.data.data.length > 0) setTipoId(resT.data.data[0].id);
        }
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    };
    cargarCatalogos();
  }, []);

  // Preset 1: Inyección XSS (Paso 4)
  const cargarPayloadXSS = () => {
    setBpmReposo(70);
    setNotas("<script>alert('Hack: Inyección de Script en Sesión')</script><img src=x onerror=\"window.location='https://malicioso.com'\" /> Atleta reporta fatiga moderada.");
    setToastError(null);
    setResultadoExitoso(null);
  };

  // Preset 2: Dato Malo Anómalo (Paso 6)
  const cargarDatoMalo = () => {
    setBpmReposo(145); // Fuera del rango clínico de reposo (40-120)
    setNotas("Prueba de estrés con frecuencia cardiaca basal errónea.");
    setToastError(null);
    setResultadoExitoso(null);
  };

  // Preset 3: Datos Válidos y Saludables
  const cargarDatosValidos = () => {
    setBpmReposo(62);
    setNotas("Rutina completada con excelente cadencia y técnica adecuada.");
    setToastError(null);
    setResultadoExitoso(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setToastError(null);
    setResultadoExitoso(null);

    const payload = {
      miembroId: Number(miembroId),
      tipoId: Number(tipoId),
      duracionMin: Number(duracionMin),
      caloriasQuemadas: Number(caloriasQuemadas),
      bpmReposo: Number(bpmReposo),
      bpmPromedio: bpmPromedio ? Number(bpmPromedio) : null,
      bpmMaximo: bpmMaximo ? Number(bpmMaximo) : null,
      notas: notas
    };

    try {
      const res = await axios.post('/api/sesiones', payload);
      setResultadoExitoso(res.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setToastError({
          status: err.response.status,
          mensaje: err.response.data.mensaje || "Error en validación",
          detalles: err.response.data.detallesErrores || []
        });
      } else {
        setToastError({
          status: 500,
          mensaje: "Fallo de conexión con el servidor backend.",
          detalles: []
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
          <ShieldAlert size={15} />
          <span>Pasos 4 y 6: Defensa en Profundidad, Anti-XSS y Rechazo de Datos Malos</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Registro de Sesión con Validación Zod y Sanitización
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Esta interfaz evalúa dos barreras de ciberseguridad e integridad relacional:
          1) Intercepta y sanitiza scripts maliciosos (Anti-XSS).
          2) Frena con validación Zod en frontera (HTTP 400) datos fisiológicamente anómalos como BPM en reposo = 145.
        </p>
      </div>

      {/* Botonera de Casos de Prueba Rápida */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Simulaciones de Rúbrica:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cargarPayloadXSS}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <Bug size={14} />
            <span>🧪 Caso 1: Inyectar Ataque XSS</span>
          </button>
          <button
            type="button"
            onClick={cargarDatoMalo}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <AlertOctagon size={14} />
            <span>🧪 Caso 2: Dato Malo (BPM = 145)</span>
          </button>
          <button
            type="button"
            onClick={cargarDatosValidos}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <CheckCircle size={14} />
            <span>🧪 Caso 3: Datos Fisiológicos Válidos</span>
          </button>
        </div>
      </div>

      {/* PASO 6: TOAST / ALERTA ELEGANTE DE RECHAZO CONTROLADO DE DATO MALO */}
      {toastError && (
        <div className="p-5 bg-rose-950/60 border-2 border-rose-600 rounded-2xl shadow-2xl shadow-rose-950/60 animate-bounce-short">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-600/30 text-rose-400 rounded-xl mt-0.5">
              <AlertOctagon size={28} />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                  HTTP {toastError.status} BAD REQUEST
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  Zod Schema Guard Interception
                </span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {toastError.mensaje}
              </h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                El motor de validación Zod bloqueó la petición antes de impactar la base de datos SQLite. Ningún registro anómalo o corrupto fue insertado.
              </p>
              {toastError.detalles.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-800/80 text-xs font-mono text-rose-300">
                  {toastError.detalles.map((d, idx) => (
                    <div key={idx}>• {d}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÉXITO / SANITIZACIÓN XSS CONFIRMADA */}
      {resultadoExitoso && (
        <div className="p-5 bg-emerald-950/50 border-2 border-emerald-600/70 rounded-2xl shadow-xl shadow-emerald-950/40">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-600/30 text-emerald-400 rounded-xl mt-0.5">
              <CheckCircle size={28} />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                  HTTP 201 CREATED
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  {resultadoExitoso.seguridad.xssSanitizado ? '🛡️ XSS Neutralizado' : 'Validación Exitosa'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">
                {resultadoExitoso.mensaje}
              </h4>
              <p className="text-xs text-emerald-200">
                La sesión #{resultadoExitoso.data.id} se registró cumpliendo todas las restricciones de salud.
              </p>
              {resultadoExitoso.seguridad.xssSanitizado && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                  <div className="text-amber-400 font-bold">🛡️ Sanitización Anti-XSS ejecutada:</div>
                  <div className="text-slate-400">Texto persistido inofensivo:</div>
                  <div className="text-emerald-300 bg-slate-900 p-2 rounded break-all border border-slate-800">
                    {resultadoExitoso.seguridad.notasAlmacenadas || '(Texto sin scripts peligrosos)'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Miembro</label>
            <select
              value={miembroId}
              onChange={(e) => setMiembroId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {miembros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} (ID #{m.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Entrenamiento</label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} (Intensidad: {t.intensidadSugerida})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Duración (minutos)</label>
            <input
              type="number"
              min="1"
              max="360"
              required
              value={duracionMin}
              onChange={(e) => setDuracionMin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Calorías Quemadas</label>
            <input
              type="number"
              min="1"
              max="4000"
              required
              value={caloriasQuemadas}
              onChange={(e) => setCaloriasQuemadas(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400">BPM en Reposo (40-120)</label>
              {Number(bpmReposo) > 120 && (
                <span className="text-[10px] font-bold text-rose-400 font-mono">⚠️ Anómalo</span>
              )}
            </div>
            <input
              type="number"
              required
              value={bpmReposo}
              onChange={(e) => setBpmReposo(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2 text-sm focus:outline-none transition ${
                Number(bpmReposo) > 120
                  ? 'border-rose-500 text-rose-300 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-700 text-white focus:ring-2 focus:ring-indigo-500'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">BPM Promedio (Opcional)</label>
            <input
              type="number"
              value={bpmPromedio}
              onChange={(e) => setBpmPromedio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">BPM Máximo (Opcional)</label>
            <input
              type="number"
              value={bpmMaximo}
              onChange={(e) => setBpmMaximo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-400">
              Notas y Observaciones de la Sesión (Protegido con Anti-XSS)
            </label>
            {notas.includes('<script>') && (
              <span className="text-[10px] font-mono text-amber-400">⚠️ Payload XSS detectado</span>
            )}
          </div>
          <textarea
            rows="3"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            placeholder="Escribe observaciones o inyecta el script de prueba..."
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-sm"
        >
          <Send size={18} />
          <span>{enviando ? 'Validando con Zod...' : 'Enviar Petición al Backend'}</span>
        </button>
      </form>
    </div>
  );
}
