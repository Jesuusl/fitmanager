import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Stethoscope, Dumbbell, ShieldCheck, GraduationCap, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginExitoso, onIrADemoDirecto }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const credencialesRapidas = [
    {
      rol: 'Médico Deportólogo',
      nombre: 'Dr. Carlos Restrepo',
      email: 'medico@fitmanager.com',
      password: 'Medico2026*',
      icono: Stethoscope,
      color: 'from-emerald-600 to-teal-500',
      badge: 'Triaje y Prescripción Clínica'
    },
    {
      rol: 'Entrenador Certificado',
      nombre: 'Prof. Laura Montoya',
      email: 'entrenador@fitmanager.com',
      password: 'Coach2026*',
      icono: Dumbbell,
      color: 'from-indigo-600 to-cyan-500',
      badge: 'Monitoreo y Registro Fisiológico'
    },
    {
      rol: 'Administrador de Salud',
      nombre: 'Ing. Roberto Casas',
      email: 'admin@fitmanager.com',
      password: 'Admin2026*',
      icono: ShieldCheck,
      color: 'from-violet-600 to-purple-500',
      badge: 'KPIs y Auditoría de Seguridad'
    },
    {
      rol: 'Modo Sustentación (Evaluador)',
      nombre: 'Evaluador Académico',
      email: 'docente@fitmanager.com',
      password: 'Docente2026*',
      icono: GraduationCap,
      color: 'from-amber-600 to-orange-500',
      badge: 'Demo Paso a Paso Rúbrica M3'
    }
  ];

  const handleSeleccionarRapido = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.status === 'success') {
        const usuario = res.data.data.usuario;
        onLoginExitoso({
          ...usuario,
          evidenciaSeguridad: res.data.data.evidenciaSeguridad
        });
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al autenticar credenciales.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl space-y-8 z-10">
        {/* Cabecera institucional */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/70 border border-indigo-800/60 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
            <Activity size={16} className="text-cyan-400" />
            <span>FitManager Clinical & Sports Intelligence Suite</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Plataforma Integral de Salud y Rendimiento
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Sistema unificado para Médicos Deportólogos, Entrenadores Certificados y Administradores de Salud Física con inferencia clínica y ciberseguridad avanzada.
          </p>
        </div>

        {/* Acceso Directo a la Demo Paso a Paso */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">¿Deseas evaluar directamente la rúbrica?</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  7 PASOS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Accede de inmediato al modo demostración guiada para sustentar cada requisito evaluativo.
              </p>
            </div>
          </div>
          <button
            onClick={onIrADemoDirecto}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <span>Ingresar al Modo Sustentación</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Bloque central: Formulario y Perfiles Rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulario de Login */}
          <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Lock size={20} className="text-indigo-400" />
              <span>Autenticación Criptográfica</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Las credenciales se validan con Bcrypt (salt 10). Ingrese con un rol específico para acceder a su panel especializado.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@fitmanager.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña Segura
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 mt-6"
              >
                <span>{cargando ? 'Verificando Hash...' : 'Ingresar a la Plataforma'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Tarjetas de Selección Rápida de Rol */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Seleccionar Perfil Profesional para Simulación:
            </div>

            {credencialesRapidas.map((cred, idx) => {
              const Icono = cred.icono;
              const estaSeleccionado = email === cred.email;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSeleccionarRapido(cred)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                    estaSeleccionado
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cred.color} text-white shadow-md`}>
                      <Icono size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{cred.rol}</span>
                        {estaSeleccionado && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {cred.nombre} · <span className="text-indigo-400">{cred.email}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {cred.badge}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 group-hover:border-slate-700">
                    Cargar
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
