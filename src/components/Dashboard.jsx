import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, TrendingDown, HeartPulse, User, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const [miembros, setMiembros] = useState([]);
  const [miembroSeleccionadoId, setMiembroSeleccionadoId] = useState(null);
  const [detalleMiembro, setDetalleMiembro] = useState(null);
  const [analisisClinico, setAnalisisClinico] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Formulario para nueva medición biométrica
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [nuevaGrasa, setNuevaGrasa] = useState('');
  const [guardandoBiometria, setGuardandoBiometria] = useState(false);
  const [mensajeBiometria, setMensajeBiometria] = useState(null);

  // 1. Cargar lista de miembros
  const cargarMiembros = async () => {
    try {
      setCargando(true);
      const res = await axios.get('/api/miembros');
      if (res.data.status === 'success') {
        setMiembros(res.data.data);
        if (!miembroSeleccionadoId && res.data.data.length > 0) {
          setMiembroSeleccionadoId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error al cargar miembros:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMiembros();
  }, []);

  // 2. Cargar detalle del miembro seleccionado e inferencia clínica
  useEffect(() => {
    if (!miembroSeleccionadoId) return;

    const cargarDetalleYClinica = async () => {
      try {
        const [resDetalle, resClinico] = await Promise.all([
          axios.get(`/api/miembros/${miembroSeleccionadoId}`),
          axios.get(`/api/miembros/${miembroSeleccionadoId}/analisis-clinico`)
        ]);

        if (resDetalle.data.status === 'success') {
          setDetalleMiembro(resDetalle.data.data);
        }
        if (resClinico.data.status === 'success') {
          setAnalisisClinico(resClinico.data);
        }
      } catch (err) {
        console.error("Error al cargar detalle o análisis clínico:", err);
      }
    };

    cargarDetalleYClinica();
  }, [miembroSeleccionadoId]);

  // 3. Registrar nueva medición biométrica (Demostración de corrección M2)
  const handleGuardarBiometria = async (e) => {
    e.preventDefault();
    if (!nuevoPeso || !nuevaGrasa) return;

    try {
      setGuardandoBiometria(true);
      setMensajeBiometria(null);
      await axios.post(`/api/miembros/${miembroSeleccionadoId}/biometria`, {
        peso: parseFloat(nuevoPeso),
        grasaCorporal: parseFloat(nuevaGrasa)
      });

      setMensajeBiometria({
        tipo: 'success',
        texto: '✅ Nueva medición registrada. El historial previo se preserva sin sobreescritura.'
      });
      setNuevoPeso('');
      setNuevaGrasa('');

      // Recargar datos para refrescar la gráfica
      const [resDetalle, resClinico] = await Promise.all([
        axios.get(`/api/miembros/${miembroSeleccionadoId}`),
        axios.get(`/api/miembros/${miembroSeleccionadoId}/analisis-clinico`)
      ]);
      setDetalleMiembro(resDetalle.data.data);
      setAnalisisClinico(resClinico.data);
      cargarMiembros();
    } catch (err) {
      setMensajeBiometria({
        tipo: 'error',
        texto: err.response?.data?.mensaje || 'Error al registrar medición biométrica.'
      });
    } finally {
      setGuardandoBiometria(false);
    }
  };

  // Preparar datos para Recharts
  const datosGrafica = detalleMiembro?.historialBiometrico?.map((item) => ({
    fecha: new Date(item.fechaRegistro).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric'
    }),
    peso: item.peso,
    grasa: item.grasaCorporal
  })) || [];

  const miembroActual = miembros.find((m) => m.id === miembroSeleccionadoId);
  const esRiesgo = analisisClinico?.diagnostico?.riesgoCardiovascular;

  return (
    <div className="space-y-8">
      {/* Selector de Miembros */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
              <User size={15} />
              <span>Paso 2: Corrección M2 (Historial Biométrico 1:N)</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Dashboard de Rendimiento y Biometría
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-slate-400">Seleccionar Atleta:</label>
            <select
              value={miembroSeleccionadoId || ''}
              onChange={(e) => setMiembroSeleccionadoId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {miembros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} (ID #{m.id}) {m.email.includes('alberto') ? '⚠️ Caso Riesgo' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PASO 5: BANNER DE INFERENCIA CLÍNICA (REGLA DETERMINISTA) */}
      {analisisClinico && (
        <div
          className={`border rounded-2xl p-6 transition-all duration-300 shadow-xl ${
            esRiesgo
              ? 'bg-rose-950/40 border-rose-600/70 text-rose-100 shadow-rose-950/50'
              : 'bg-emerald-950/30 border-emerald-600/50 text-emerald-100 shadow-emerald-950/40'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl mt-1 ${
                  esRiesgo ? 'bg-rose-600/30 text-rose-400' : 'bg-emerald-600/30 text-emerald-400'
                }`}
              >
                {esRiesgo ? (
                  <AlertTriangle className="animate-pulse" size={28} />
                ) : (
                  <CheckCircle2 size={28} />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      esRiesgo ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {analisisClinico.diagnostico.clasificacion}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Motor: Regla Determinista (Paso 5)
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {esRiesgo
                    ? `⚠️ ALERTA CLÍNICA: Riesgo Cardiovascular Alto detectado (IMC ${analisisClinico.metricasCalculadas.imcCalculado} > 30 y BPM Reposo ${analisisClinico.metricasCalculadas.bpmReposoPromedio} > 85)`
                    : `Perfil Cardiovascular Óptimo (IMC ${analisisClinico.metricasCalculadas.imcCalculado} y BPM Reposo ${analisisClinico.metricasCalculadas.bpmReposoPromedio})`}
                </h3>
                <p className="text-sm font-medium text-slate-200">
                  <span className="font-bold underline">Prescripción de Entrenamiento:</span>{' '}
                  {analisisClinico.diagnostico.recomendacionClinica}
                </p>
                <p className="text-xs text-slate-300/80 italic pt-1">
                  💡 {analisisClinico.justificacionArquitectura.descarteIA}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-slate-700/60 pt-3 md:pt-0 md:pl-6">
              <div className="text-xs uppercase text-slate-400 font-mono">Acción en Plataforma</div>
              <div
                className={`text-sm font-black mt-1 px-3 py-1 rounded-lg ${
                  esRiesgo ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'
                }`}
              >
                {analisisClinico.diagnostico.accionSistema}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 text-right">
                Protocolos permitidos: {analisisClinico.diagnostico.protocoloSugerido.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Métricas Fisiológicas */}
      {miembroActual && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Peso Actual</span>
              <TrendingDown size={16} className="text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {miembroActual.pesoActual}{' '}
              <span className="text-sm font-normal text-slate-400">kg</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Altura: {miembroActual.altura} m | Edad: {miembroActual.edad} años
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Grasa Corporal</span>
              <Activity size={16} className="text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {miembroActual.grasaActual}{' '}
              <span className="text-sm font-normal text-slate-400">%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Nivel: {miembroActual.nivelExperiencia}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Índice Masa Corporal (IMC)</span>
              <User size={16} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {miembroActual.imcActual}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {miembroActual.imcActual > 30 ? '⚠️ Obesidad (Regla M3 activa)' : 'Rango saludable/controlado'}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>FC Reposo Promedio</span>
              <HeartPulse size={16} className="text-rose-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {analisisClinico?.metricasCalculadas?.bpmReposoPromedio || '--'}{' '}
              <span className="text-sm font-normal text-slate-400">BPM</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Basado en {analisisClinico?.metricasCalculadas?.sesionesAnalizadas || 0} sesiones
            </div>
          </div>
        </div>
      )}

      {/* Gráfica Recharts: Evolución Temporal del Historial Biométrico (Paso 2) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Evolución Temporal del Peso y Grasa Corporal</span>
              <span className="text-xs bg-indigo-600/30 text-indigo-300 font-mono px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                HistorialBiometrico 1:N
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Demuestra la corrección del Momento 2: cada pesaje es una serie de tiempo acumulativa, no una sobreescritura destructiva.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {datosGrafica.length} mediciones históricas registradas
          </div>
        </div>

        <div className="h-80 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="fecha" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 12 }} domain={['auto', 'auto']} unit="kg" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  color: '#fff'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="peso"
                name="Peso Corporal (kg)"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5, fill: '#38bdf8' }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="grasa"
                name="Grasa Corporal (%)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formulario para Inyectar Nueva Medición al Historial */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-4">
          <PlusCircle size={16} className="text-indigo-400" />
          <span>Agregar Nueva Medición al Historial (Comprobación en Vivo)</span>
        </h4>
        <form onSubmit={handleGuardarBiometria} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nuevo Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ej. 102.5"
              value={nuevoPeso}
              onChange={(e) => setNuevoPeso(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Grasa Corporal (%)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Ej. 27.5"
              value={nuevaGrasa}
              onChange={(e) => setNuevaGrasa(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardandoBiometria}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <span>{guardandoBiometria ? 'Guardando...' : 'Registrar en Serie Temporal'}</span>
            </button>
          </div>
        </form>
        {mensajeBiometria && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium ${
              mensajeBiometria.tipo === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}
          >
            {mensajeBiometria.texto}
          </div>
        )}
      </div>
    </div>
  );
}
