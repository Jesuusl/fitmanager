import React, { useState } from 'react';
import { Activity, LogOut, GraduationCap, LayoutDashboard, Shield, User } from 'lucide-react';
import Login from './components/Login';
import DemoSustentacion from './components/DemoSustentacion';
import AplicativoRealista from './components/aplicativo/AplicativoRealista';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [modo, setModo] = useState('login'); // 'login' | 'aplicativo' | 'demo'

  const handleLoginExitoso = (datosUsuario) => {
    setUsuario(datosUsuario);
    // Si entra con rol de evaluador, enviamos directo al modo sustentación
    if (datosUsuario.rol === 'EVALUADOR_DEMO') {
      setModo('demo');
    } else {
      setModo('aplicativo');
    }
  };

  const handleAccesoDirectoDemo = () => {
    setUsuario({
      id: 99,
      nombre: 'Evaluador Académico',
      email: 'docente@fitmanager.com',
      rol: 'EVALUADOR_DEMO'
    });
    setModo('demo');
  };

  const handleLogout = () => {
    setUsuario(null);
    setModo('login');
  };

  // Si no está autenticado, renderiza la pantalla de Login
  if (modo === 'login') {
    return (
      <Login
        onLoginExitoso={handleLoginExitoso}
        onIrADemoDirecto={handleAccesoDirectoDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de Navegación Global */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Activity className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-white">FitManager Pro</h1>
                <span className="bg-indigo-600/30 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/40 font-bold">
                  Clinical & Sports v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Seguridad e Inteligencia de Aplicaciones (Momento Evaluativo 3)
              </p>
            </div>
          </div>

          {/* Selector de Modo y Usuario */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Botón Switcher entre Aplicativo y Demo */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setModo('aplicativo')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  modo === 'aplicativo'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>Aplicativo Completo</span>
              </button>

              <button
                onClick={() => setModo('demo')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  modo === 'demo'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap size={14} />
                <span>Demo Sustentación (7 Pasos)</span>
              </button>
            </div>

            {/* Perfil del Usuario Activo */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <User size={14} className="text-indigo-400" />
              <div className="text-left font-mono">
                <span className="font-bold text-white block leading-tight">{usuario?.nombre?.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-500 block leading-tight">{usuario?.rol}</span>
              </div>
            </div>

            {/* Botón Salir */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {modo === 'aplicativo' ? (
          <AplicativoRealista
            usuario={usuario}
            onCambiarModoDemo={() => setModo('demo')}
          />
        ) : (
          <DemoSustentacion
            onVolverAlLogin={handleLogout}
            onIrAlAplicativo={() => setModo('aplicativo')}
          />
        )}
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
        FitManager Pro · Optativa II (Momento Evaluativo 3) · SQLite + Express + Prisma ORM + React Vite
      </footer>
    </div>
  );
}
