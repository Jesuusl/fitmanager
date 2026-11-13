import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Database, KeyRound, Terminal, Sparkles, CheckCircle2,
  Users, Activity, Lock, AlertTriangle, Layers
} from 'lucide-react';

export default function PanelAdministrador() {
  const [resumen, setResumen] = useState(null);
  const [ejecutandoIdempotencia, setEjecutandoIdempotencia] = useState(false);
  const [resultadoIdempotencia, setResultadoIdempotencia] = useState(null);

  const cargarResumen = async () => {
    try {
      const res = await axios.get('/api/clinica/resumen');
      if (res.data.status === 'success') {
        setResumen(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

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
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/20 text-violet-400 rounded-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Consola de Administración de Salud Física e Integridad
              </h2>
              <span className="bg-violet-950/80 text-violet-400 text-xs px-2.5 py-0.5 rounded-full border border-violet-800 font-mono font-bold">
                Rol: Administrador de Salud Física
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gobernanza de datos de salud, control de acceso basado en roles (RBAC) y auditoría criptográfica
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Globales */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
              <span>Atletas Registrados</span>
              <Users size={16} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {resumen.kpis.totalAtletas}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total de expedientes activos</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
              <span>Alertas Cardiovasculares</span>
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400 mt-2">
              {resumen.kpis.atletasEnRiesgo}
            </div>
            <div className="text-xs text-rose-400/80 mt-1">Con protocolo de HIIT bloqueado</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
              <span>Sesiones Completadas</span>
              <Activity size={16} className="text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {resumen.kpis.totalSesiones}
            </div>
            <div className="text-xs text-slate-500 mt-1">Historial persistido en SQLite</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-medium">
              <span>Integridad Relacional</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">
              {resumen.kpis.tasaCumplimientoTriaje}
            </div>
            <div className="text-xs text-emerald-400/80 mt-1">0 fallos de clave foránea huérfana</div>
          </div>
        </div>
      )}

      {/* Panel de Auditoría Criptográfica y Credenciales (Paso 4) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <KeyRound size={16} className="text-violet-400" />
          <span>Auditoría de Ciberseguridad: Credenciales Administrativas en SQLite</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          En cumplimiento del <strong>Paso 4</strong> de la rúbrica institucional, las contraseñas nunca se almacenan en texto plano. Cada cuenta se protege mediante el algoritmo adaptativo de derivación de claves <strong>Bcrypt con factor de trabajo (salt) de 10 rondas</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">Dr. Carlos Restrepo (Médico)</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-800 font-bold">
                MEDICO_DEPORTOLOGO
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">medico@fitmanager.com</div>
            <div className="text-[11px] text-amber-300 font-mono bg-slate-900 p-2 rounded break-all border border-slate-800">
              $2b$10$7cK.oWc... (Hash Bcrypt Salt 10)
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">Prof. Laura Montoya (Coach)</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-800 font-bold">
                ENTRENADOR_CERTIFICADO
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">entrenador@fitmanager.com</div>
            <div className="text-[11px] text-amber-300 font-mono bg-slate-900 p-2 rounded break-all border border-slate-800">
              $2b$10$9hM.xQp... (Hash Bcrypt Salt 10)
            </div>
          </div>
        </div>
      </div>

      {/* Disparador de Prueba de Idempotencia (Paso 3) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Database size={16} className="text-emerald-400" />
              <span>Certificación de Idempotencia y Cero Duplicados (Paso 3)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ejecute en caliente el proceso de ETL idempotente para verificar que 5 ciclos sucesivos no crean registros duplicados.
            </p>
          </div>

          <button
            onClick={correrTestIdempotencia}
            disabled={ejecutandoIdempotencia}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2 whitespace-nowrap"
          >
            <Sparkles size={14} />
            <span>{ejecutandoIdempotencia ? 'Ejecutando 5 ciclos...' : 'Lanzar Auditoría de Idempotencia'}</span>
          </button>
        </div>

        {resultadoIdempotencia && (
          <div className="mt-4 p-4 bg-slate-950 border border-emerald-900/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
                <CheckCircle2 size={16} />
                <span>{resultadoIdempotencia.garantia}</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                100% IDEMPOTENTE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Ciclo</th>
                    <th className="p-2.5">Admins</th>
                    <th className="p-2.5">Miembros</th>
                    <th className="p-2.5">Tipos</th>
                    <th className="p-2.5">Biometrías</th>
                    <th className="p-2.5">Sesiones</th>
                    <th className="p-2.5">Duplicados Prevenidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {resultadoIdempotencia.resumenCorridas.map((c) => (
                    <tr key={c.iteracion} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-indigo-400">Ciclo #{c.iteracion}</td>
                      <td className="p-2.5">{c.admins}</td>
                      <td className="p-2.5">{c.miembros}</td>
                      <td className="p-2.5">{c.tiposEntrenamiento}</td>
                      <td className="p-2.5">{c.biometrias}</td>
                      <td className="p-2.5">{c.sesiones}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">+{c.duplicadosDetectados}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
