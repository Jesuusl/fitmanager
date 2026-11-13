import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Stethoscope, AlertTriangle, CheckCircle2, HeartPulse, Scale, Activity,
  FileText, ShieldAlert, PlusCircle, UserCheck, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function PanelMedico() {
  const [resumenClinico, setResumenClinico] = useState(null);
  const [miembroSeleccionadoId, setMiembroSeleccionadoId] = useState(null);
  const [detalleMiembro, setDetalleMiembro] = useState(null);
  const [analisisClinico, setAnalisisClinico] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Formulario de pesaje / biometría clínica
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [nuevaGrasa, setNuevaGrasa] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeBiometria, setMensajeBiometria] = useState(null);

  const cargarResumen = async () => {
    try {
      const res = await axios.get('/api/clinica/resumen');
      if (res.data.status === 'success') {
        setResumenClinico(res.data);
        if (!miembroSeleccionadoId && res.data.triaje.length > 0) {
          // Seleccionamos por defecto el caso clínico de riesgo o el primero
          const casoRiesgo = res.data.triaje.find(t => t.riesgoCardiovascular);
          setMiembroSeleccionadoId(casoRiesgo ? casoRiesgo.id : res.data.triaje[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    if (!miembroSeleccionadoId) return;

    const cargarDetalle = async () => {
      try {
        const [resD, resC] = await Promise.all([
          axios.get(`/api/miembros/${miembroSeleccionadoId}`),
          axios.get(`/api/miembros/${miembroSeleccionadoId}/analisis-clinico`)
        ]);
        if (resD.data.status === 'success') setDetalleMiembro(resD.data.data);
        if (resC.data.status === 'success') setAnalisisClinico(resC.data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarDetalle();
  }, [miembroSeleccionadoId]);

  const handleRegistrarBiometria = async (e) => {
    e.preventDefault();
    if (!nuevoPeso || !nuevaGrasa) return;
    try {
      setGuardando(true);
      await axios.post(`/api/miembros/${miembroSeleccionadoId}/biometria`, {
        peso: parseFloat(nuevoPeso),
        grasaCorporal: parseFloat(nuevaGrasa)
      });
      setMensajeBiometria({
        tipo: 'success',
        texto: '✅ Evaluación antropométrica registrada en la serie temporal histórica inmutable.'
      });
      setNuevoPeso('');
      setNuevaGrasa('');

      const [resD, resC] = await Promise.all([
        axios.get(`/api/miembros/${miembroSeleccionadoId}`),
        axios.get(`/api/miembros/${miembroSeleccionadoId}/analisis-clinico`)
      ]);
      setDetalleMiembro(resD.data.data);
      setAnalisisClinico(resC.data);
      cargarResumen();
    } catch (err) {
      setMensajeBiometria({
        tipo: 'error',
        texto: err.response?.data?.mensaje || 'Error al registrar biometría médica.'
      });
    } finally {
      setGuardando(false);
    }
  };

  const datosGrafica = detalleMiembro?.historialBiometrico?.map((item) => ({
    fecha: new Date(item.fechaRegistro).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric'
    }),
    peso: item.peso,
    grasa: item.grasaCorporal
  })) || [];

  const atletaSeleccionado = resumenClinico?.triaje.find(t => t.id === miembroSeleccionadoId);
  const esRiesgo = atletaSeleccionado?.riesgoCardiovascular;

  return (
    <div className="space-y-8">
      {/* Cabecera del Rol */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Stethoscope size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Consola de Medicina Deportiva y Triaje Clínico
              </h2>
              <span className="bg-emerald-950/80 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                Rol: Médico Deportólogo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estratificación cardiovascular según criterios ACSM / OMS · Inferencia clínica determinista
            </p>
          </div>
        </div>

        {resumenClinico && (
          <div className="flex items-center space-x-4 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
            <div className="text-center px-2">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Atletas</span>
              <span className="text-base font-black text-white">{resumenClinico.kpis.totalAtletas}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-rose-400 block text-[10px] uppercase font-mono">En Riesgo</span>
              <span className="text-base font-black text-rose-400">{resumenClinico.kpis.atletasEnRiesgo}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center px-2">
              <span className="text-emerald-400 block text-[10px] uppercase font-mono">Aptos / Seguros</span>
              <span className="text-base font-black text-emerald-400">{resumenClinico.kpis.atletasOptimos}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Triaje de Atletas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <HeartPulse size={16} className="text-emerald-400" />
          <span>Matriz de Triaje Cardiovascular de Atletas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resumenClinico?.triaje.map((atleta) => (
            <div
              key={atleta.id}
              onClick={() => setMiembroSeleccionadoId(atleta.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                miembroSeleccionadoId === atleta.id
                  ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{atleta.nombre}</h4>
                  <div className="text-xs text-slate-400 font-mono">{atleta.email}</div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${
                    atleta.riesgoCardiovascular
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600/30 text-emerald-300 border border-emerald-600/50'
                  }`}
                >
                  {atleta.riesgoCardiovascular ? 'Alto Riesgo' : 'Apto'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">IMC Actual</span>
                  <span className="font-bold text-white">{atleta.imc}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FC Reposo Promedio</span>
                  <span className="font-bold text-white">{atleta.bpmReposoPromedio} bpm</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Prescripción:</span> {atleta.accionRecomendada}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expediente del Atleta Seleccionado */}
      {atletaSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Ficha Clínica y Prescripción Médica */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta de Riesgo Clínico */}
            <div
              className={`border-2 rounded-2xl p-6 shadow-xl ${
                esRiesgo
                  ? 'bg-rose-950/50 border-rose-600 text-rose-100 shadow-rose-950/60'
                  : 'bg-emerald-950/40 border-emerald-600 text-emerald-100 shadow-emerald-950/40'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    esRiesgo ? 'bg-rose-600/30 text-rose-400' : 'bg-emerald-600/30 text-emerald-400'
                  }`}
                >
                  {esRiesgo ? <AlertTriangle size={24} className="animate-pulse" /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
                    Diagnóstico Automático (Regla Clínica Determinista)
                  </div>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {atletaSeleccionado.clasificacion}
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {esRiesgo
                      ? `⚠️ El paciente supera los umbrales seguros: IMC de ${atletaSeleccionado.imc} (>30.0) y Frecuencia Cardíaca de Reposo promedio de ${atletaSeleccionado.bpmReposoPromedio} bpm (>85 bpm).`
                      : `Parámetros fisiológicos en rango adaptativo seguro para cargas progresivas.`}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-2">
                <div className="text-xs">
                  <span className="font-bold underline text-white">Directiva Médica para el Entrenador:</span>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 mt-1 text-xs text-amber-300 font-mono">
                    {atletaSeleccionado.accionRecomendada}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  * Por seguridad del atleta, cualquier intento de agendar rutinas HIIT por parte del entrenador será bloqueado por el backend con HTTP 422.
                </div>
              </div>
            </div>

            {/* Formulario Médico de Nueva Medición Antropométrica */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-4">
                <PlusCircle size={16} className="text-emerald-400" />
                <span>Registrar Consulta Antropométrica (Biometría 1:N)</span>
              </h4>
              <form onSubmit={handleRegistrarBiometria} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Peso Clínico (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej. 91.8"
                      value={nuevoPeso}
                      onChange={(e) => setNuevoPeso(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Grasa Corporal (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej. 33.2"
                      value={nuevaGrasa}
                      onChange={(e) => setNuevaGrasa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30"
                >
                  {guardando ? 'Guardando en Historial...' : 'Guardar en Serie de Tiempo'}
                </button>
              </form>

              {mensajeBiometria && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs ${
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

          {/* Gráfica de Serie Temporal (Solución Momento 2) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Curva Antropométrica Longitudinal</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                    Serie Inmutable
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {atletaSeleccionado.nombre} · {datosGrafica.length} pesajes acumulados en HistorialBiometrico
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="fecha" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit="kg" />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit="%" />
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
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="grasa"
                    name="Grasa (%)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Historial de Sesiones Evaluadas Clínicamente */}
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Últimas Sesiones de Entrenamiento Monitoreadas:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {detalleMiembro?.sesiones?.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{s.tipo.nombre}</span> ·{' '}
                      <span className="text-slate-400">{s.duracionMin} min ({s.caloriasQuemadas} kcal)</span>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        FC Reposo: {s.bpmReposo} bpm | FC Promedio: {s.bpmPromedio || '--'} bpm
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(s.fechaSesion).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
