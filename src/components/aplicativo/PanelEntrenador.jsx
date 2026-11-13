import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dumbbell, AlertOctagon, CheckCircle2, ShieldAlert, Sparkles, Send,
  User, Activity, Flame, Heart, Bug, AlertTriangle
} from 'lucide-react';

export default function PanelEntrenador() {
  const [atletas, setAtletas] = useState([]);
  const [tipos, setTipos] = useState([]);

  // Estados del Formulario de Sesión
  const [miembroId, setMiembroId] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [duracionMin, setDuracionMin] = useState(45);
  const [caloriasQuemadas, setCaloriasQuemadas] = useState(380);
  const [bpmReposo, setBpmReposo] = useState(65);
  const [bpmPromedio, setBpmPromedio] = useState(135);
  const [bpmMaximo, setBpmMaximo] = useState(160);
  const [notas, setNotas] = useState('Entrenamiento de fuerza y resistencia completado.');

  const [enviando, setEnviando] = useState(false);
  const [toastAlerta, setToastAlerta] = useState(null);
  const [sesionExitosa, setSesionExitosa] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resC, resT] = await Promise.all([
        axios.get('/api/clinica/resumen'),
        axios.get('/api/tipos-entrenamiento')
      ]);

      if (resC.data.status === 'success') {
        setAtletas(resC.data.triaje);
        if (resC.data.triaje.length > 0) {
          setMiembroId(resC.data.triaje[0].id);
        }
      }
      if (resT.data.status === 'success') {
        setTipos(resT.data.data);
        if (resT.data.data.length > 0) {
          setTipoId(resT.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const atletaActual = atletas.find(a => a.id === Number(miembroId));
  const tipoActual = tipos.find(t => t.id === Number(tipoId));
  const intentoHIITBloqueado = atletaActual?.bloquearHIIT && tipoActual?.nombre === 'HIIT';

  // Presets para demostraciones rápidas
  const presetDatoMaloBPM145 = () => {
    setBpmReposo(145);
    setNotas("Prueba de esfuerzo. Registro fisiológico fuera de escala.");
    setToastAlerta(null);
    setSesionExitosa(null);
  };

  const presetXSS = () => {
    setBpmReposo(65);
    setNotas("<script>alert('Ataque XSS')</script><img src=x onerror=\"window.location='https://malicioso.com'\" /> Atleta completó el circuito.");
    setToastAlerta(null);
    setSesionExitosa(null);
  };

  const presetHIITEnRiesgo = () => {
    const atletaRiesgo = atletas.find(a => a.bloquearHIIT);
    const tipoHIIT = tipos.find(t => t.nombre === 'HIIT');
    if (atletaRiesgo) setMiembroId(atletaRiesgo.id);
    if (tipoHIIT) setTipoId(tipoHIIT.id);
    setBpmReposo(75);
    setNotas("Intento de registrar HIIT en paciente con alerta cardiovascular.");
    setToastAlerta(null);
    setSesionExitosa(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setToastAlerta(null);
    setSesionExitosa(null);

    const payload = {
      miembroId: Number(miembroId),
      tipoId: Number(tipoId),
      duracionMin: Number(duracionMin),
      caloriasQuemadas: Number(caloriasQuemadas),
      bpmReposo: Number(bpmReposo),
      bpmPromedio: bpmPromedio ? Number(bpmPromedio) : null,
      bpmMaximo: bpmMaximo ? Number(bpmMaximo) : null,
      notas
    };

    try {
      const res = await axios.post('/api/sesiones', payload);
      setSesionExitosa(res.data);
      cargarDatos();
    } catch (err) {
      if (err.response && err.response.data) {
        setToastAlerta({
          status: err.response.status,
          codigo: err.response.data.codigo || 'ERROR_VALIDACION',
          mensaje: err.response.data.mensaje || 'Error en validación',
          detalles: err.response.data.detallesErrores || []
        });
      } else {
        setToastAlerta({
          status: 500,
          codigo: 'ERROR_CONEXION',
          mensaje: 'Error de comunicación con el servidor backend.',
          detalles: []
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabecera del Rol */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Dumbbell size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Consola de Prescripción Operativa y Registro de Sesiones
              </h2>
              <span className="bg-indigo-950/80 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-800 font-mono font-bold">
                Rol: Entrenador Certificado (Coach)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervisión de atletas, ejecución de directivas médicas y registro seguro de bio-métricas
            </p>
          </div>
        </div>
      </div>

      {/* Roster de Atletas con Estado de Autorización Médica */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <User size={16} className="text-indigo-400" />
          <span>Atletas Asignados y Validación de Aprobación Médica</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {atletas.map((a) => (
            <div
              key={a.id}
              onClick={() => setMiembroId(a.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                Number(miembroId) === a.id
                  ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{a.nombre}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    a.bloquearHIIT
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {a.bloquearHIIT ? '⚠️ Sin HIIT' : '✅ Autorizado'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {a.bloquearHIIT ? (
                  <span className="text-rose-400 font-medium">
                    🚫 Contraindicación: Priorizar Yoga/Cardio
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Apto para HIIT, Fuerza, Yoga y Cardio
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de Pruebas de Seguridad en Vivo */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Simulaciones de Seguridad en Tiempo Real (Rúbrica M3):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={presetHIITEnRiesgo}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition"
          >
            🚫 Probar Bloqueo HIIT en Paciente de Riesgo
          </button>
          <button
            type="button"
            onClick={presetDatoMaloBPM145}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition"
          >
            ⛔ Probar Dato Malo (BPM = 145)
          </button>
          <button
            type="button"
            onClick={presetXSS}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition"
          >
            🛡️ Probar Sanitización Anti-XSS
          </button>
        </div>
      </div>

      {/* TOAST / ALERTA DE RECHAZO CONTROLADO (PASO 6 / BLOQUEO HIIT) */}
      {toastAlerta && (
        <div className="p-5 bg-rose-950/60 border-2 border-rose-600 rounded-2xl shadow-2xl animate-bounce-short">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-600/30 text-rose-400 rounded-xl mt-0.5">
              <AlertOctagon size={28} />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                  HTTP {toastAlerta.status} · {toastAlerta.codigo}
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  {toastAlerta.status === 400 ? 'Zod Guard Interception' : 'Clinical Prescription Lock'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {toastAlerta.mensaje}
              </h4>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                La solicitud fue interceptada y abortada antes de comprometer la integridad relacional de SQLite.
              </p>
              {toastAlerta.detalles.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-800/80 text-xs font-mono text-rose-300 space-y-0.5">
                  {toastAlerta.detalles.map((d, i) => (
                    <div key={i}>• {d}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE SESIÓN GUARDADA & SANITIZADA */}
      {sesionExitosa && (
        <div className="p-5 bg-emerald-950/50 border-2 border-emerald-600/70 rounded-2xl shadow-xl">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-600/30 text-emerald-400 rounded-xl mt-0.5">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                  HTTP 201 CREATED
                </span>
                <span className="text-xs text-emerald-300 font-mono">
                  {sesionExitosa.seguridad.xssSanitizado ? '🛡️ Script Sanitizado (Anti-XSS)' : 'Parámetros Fisiológicos Correctos'}
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">{sesionExitosa.mensaje}</h4>
              <p className="text-xs text-emerald-200">
                Sesión #{sesionExitosa.data.id} guardada con éxito para {sesionExitosa.data.miembro.nombre}.
              </p>
              {sesionExitosa.seguridad.xssSanitizado && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300">
                  <div className="text-amber-400 font-bold">🛡️ Sanitización Anti-XSS en Notas:</div>
                  <div className="text-emerald-300 bg-slate-900 p-2 rounded mt-1 break-all">
                    {sesionExitosa.seguridad.notasAlmacenadas}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Nueva Sesión */}
      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Activity size={16} className="text-indigo-400" />
          <span>Terminal de Registro de Sesión con Validación Fisiológica</span>
        </h3>

        {/* Advertencia preventiva si se intenta HIIT en paciente de riesgo */}
        {intentoHIITBloqueado && (
          <div className="p-4 bg-amber-950/60 border border-amber-600/70 rounded-xl text-amber-200 text-xs flex items-center space-x-3">
            <AlertTriangle className="text-amber-400 shrink-0" size={20} />
            <div>
              <span className="font-bold">Advertencia Médica Preventiva:</span> El atleta seleccionado tiene contraindicación médica de HIIT por Riesgo Cardiovascular. Si envía este registro, el backend lo rechazará automáticamente.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Atleta</label>
            <select
              value={miembroId}
              onChange={(e) => setMiembroId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {atletas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.bloquearHIIT ? '⚠️ Sin HIIT' : 'Apto'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Disciplina / Protocolo</label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">Duración (min)</label>
            <input
              type="number"
              min="1"
              max="360"
              required
              value={duracionMin}
              onChange={(e) => setDuracionMin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Gasto Calórico (kcal)</label>
            <input
              type="number"
              min="1"
              max="4000"
              required
              value={caloriasQuemadas}
              onChange={(e) => setCaloriasQuemadas(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-400">FC en Reposo (40-120 bpm)</label>
              {Number(bpmReposo) > 120 && (
                <span className="text-[10px] font-bold text-rose-400 font-mono">⚠️ Anómalo</span>
              )}
            </div>
            <input
              type="number"
              required
              value={bpmReposo}
              onChange={(e) => setBpmReposo(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2 text-sm ${
                Number(bpmReposo) > 120
                  ? 'border-rose-500 text-rose-300 focus:ring-2 focus:ring-rose-500'
                  : 'border-slate-700 text-white focus:ring-2 focus:ring-indigo-500'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Notas Técnicas del Entrenador (Filtro Anti-XSS Activo)
          </label>
          <textarea
            rows="3"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 text-sm"
        >
          <Send size={18} />
          <span>{enviando ? 'Validando Integridad...' : 'Registrar Sesión de Entrenamiento'}</span>
        </button>
      </form>
    </div>
  );
}
