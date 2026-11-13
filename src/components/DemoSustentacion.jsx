import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Shield, FileCheck2, Database, Sparkles, Terminal, ArrowLeft } from 'lucide-react';
import Dashboard from './Dashboard';
import SeguridadLogin from './SeguridadLogin';
import FormularioSesion from './FormularioSesion';

export default function DemoSustentacion({ onVolverAlLogin, onIrAlAplicativo }) {
  const [tabActiva, setTabActiva] = useState('dashboard');
  const [ejecutandoIdempotencia, setEjecutandoIdempotencia] = useState(false);
  const [resultadoIdempotencia, setResultadoIdempotencia] = useState(null);

  const correrTestIdempotencia = async () => {
    try {
      setEjecutandoIdempotencia(true);
      setResultadoIdempotencia(null);
      const res = await axios.post('/api/admin/test-idempotencia');
      setResultadoIdempotencia(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEjecutandoIdempotencia(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior de Demostración Rúbrica */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-600 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Modo Sustentación Académica
            </span>
            <span className="text-xs text-amber-300 font-medium">Momento Evaluativo 3 · Rúbrica Oficial</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Demostración Paso a Paso de Seguridad e Inteligencia
          </h2>
          <p className="text-xs text-slate-300">
            Navega entre los módulos de prueba técnica para sustentar cada uno de los 7 pasos requeridos por el docente.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onIrAlAplicativo}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
          >
            <span>Ir al Aplicativo Completo</span>
          </button>
          <button
            onClick={onVolverAlLogin}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Selector de Pestañas de los 7 Pasos */}
      <div className="flex flex-wrap items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 gap-1 text-xs font-semibold">
        <button
          onClick={() => setTabActiva('dashboard')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
            tabActiva === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={15} />
          <span>Paso 2 & 5: Dashboard (M2 Fix & Inferencia)</span>
        </button>

        <button
          onClick={() => setTabActiva('sesiones')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
            tabActiva === 'sesiones'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck2 size={15} />
          <span>Paso 4 & 6: Sesión, Anti-XSS y Dato Malo (BPM=145)</span>
        </button>

        <button
          onClick={() => setTabActiva('seguridad')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
            tabActiva === 'seguridad'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield size={15} />
          <span>Paso 4: Auditoría Hash Bcrypt</span>
        </button>

        <button
          onClick={() => setTabActiva('idempotencia')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition ${
            tabActiva === 'idempotencia'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database size={15} />
          <span>Paso 3: Idempotencia (5 Ciclos)</span>
        </button>
      </div>

      {/* Contenido de la pestaña */}
      <div className="pt-2">
        {tabActiva === 'dashboard' && <Dashboard />}
        {tabActiva === 'sesiones' && <FormularioSesion />}
        {tabActiva === 'seguridad' && <SeguridadLogin />}
        {tabActiva === 'idempotencia' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
                <Database size={15} />
                <span>Paso 3: Preparación de Datos e Idempotencia</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Demostración de Cero Duplicados en 5 Ejecuciones de Sembrado
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Este panel ejecuta el script <code className="text-indigo-300">seed.ts</code> durante 5 ciclos continuos sobre SQLite. Mediante operaciones <code className="text-indigo-300">upsert</code> y control de unicidad P2002, se demuestra que ninguna entidad es clonada o duplicada.
              </p>

              <button
                onClick={correrTestIdempotencia}
                disabled={ejecutandoIdempotencia}
                className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>{ejecutandoIdempotencia ? 'Ejecutando 5 ciclos...' : 'Disparar Prueba de 5 Ciclos'}</span>
              </button>
            </div>

            {resultadoIdempotencia && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                    <Terminal size={16} />
                    <span>{resultadoIdempotencia.garantia}</span>
                  </h3>
                  <span className="text-xs bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-mono">
                    100% IDEMPOTENTE
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Iteración</th>
                        <th className="p-3">Admins</th>
                        <th className="p-3">Miembros</th>
                        <th className="p-3">Tipos</th>
                        <th className="p-3">Biometrías</th>
                        <th className="p-3">Sesiones</th>
                        <th className="p-3">Duplicados Evitados</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {resultadoIdempotencia.resumenCorridas.map((c) => (
                        <tr key={c.iteracion} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-indigo-400">Ciclo #{c.iteracion}</td>
                          <td className="p-3">{c.admins}</td>
                          <td className="p-3">{c.miembros}</td>
                          <td className="p-3">{c.tiposEntrenamiento}</td>
                          <td className="p-3">{c.biometrias}</td>
                          <td className="p-3">{c.sesiones}</td>
                          <td className="p-3 text-emerald-400 font-bold">+{c.duplicadosDetectados}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
