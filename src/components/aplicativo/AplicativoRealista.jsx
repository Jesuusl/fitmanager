import React, { useState } from 'react';
import { Stethoscope, Dumbbell, ShieldCheck, UserCheck } from 'lucide-react';
import PanelMedico from './PanelMedico';
import PanelEntrenador from './PanelEntrenador';
import PanelAdministrador from './PanelAdministrador';

export default function AplicativoRealista({ usuario, onCambiarModoDemo }) {
  // Inicializamos la vista según el rol del usuario autenticado
  const determinarVistaInicial = () => {
    if (usuario?.rol === 'MEDICO_DEPORTOLOGO') return 'medico';
    if (usuario?.rol === 'ENTRENADOR_CERTIFICADO') return 'entrenador';
    return 'administrador';
  };

  const [vistaActiva, setVistaActiva] = useState(determinarVistaInicial);

  return (
    <div className="space-y-6">
      {/* Barra de Navegación de Roles Profesionales */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 pl-2">
          <span>Vista de Especialista:</span>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs font-bold">
          <button
            onClick={() => setVistaActiva('medico')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition ${
              vistaActiva === 'medico'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope size={14} />
            <span>Médico Deportólogo</span>
          </button>

          <button
            onClick={() => setVistaActiva('entrenador')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition ${
              vistaActiva === 'entrenador'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell size={14} />
            <span>Entrenador Certificado</span>
          </button>

          <button
            onClick={() => setVistaActiva('administrador')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition ${
              vistaActiva === 'administrador'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={14} />
            <span>Administrador de Salud</span>
          </button>
        </div>
      </div>

      {/* Renderizado de la Consola correspondiente */}
      {vistaActiva === 'medico' && <PanelMedico />}
      {vistaActiva === 'entrenador' && <PanelEntrenador />}
      {vistaActiva === 'administrador' && <PanelAdministrador />}
    </div>
  );
}
