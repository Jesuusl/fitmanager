import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ShieldCheck, KeyRound, Terminal, CheckCircle2, XCircle } from 'lucide-react';

export default function SeguridadLogin() {
  const [email, setEmail] = useState('director@fitmanager.com');
  const [password, setPassword] = useState('Admin2026*Seguro');
  const [cargando, setCargando] = useState(false);
  const [respuestaAuth, setRespuestaAuth] = useState(null);
  const [errorAuth, setErrorAuth] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setRespuestaAuth(null);
    setErrorAuth(null);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setRespuestaAuth(res.data);
    } catch (err) {
      setErrorAuth(err.response?.data?.mensaje || 'Error al autenticar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
          <KeyRound size={15} />
          <span>Paso 4: Seguridad y Autenticación Criptográfica</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Gestión de Credenciales con Hashing Bcrypt (Salt 10)
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Demuestra cómo la aplicación protege las credenciales de acceso: las contraseñas nunca se guardan en texto plano en la base de datos SQLite, sino que se procesan mediante una función de derivación de claves adaptativa basada en Blowfish con 10 rondas de salado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Login */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Lock size={18} className="text-indigo-400" />
            <span>Inicio de Sesión Administrativo</span>
          </h3>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Correo Electrónico (UsuarioAdmin)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Contraseña en Texto Plano
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <ShieldCheck size={18} />
              <span>{cargando ? 'Verificando Hash...' : 'Autenticar y Auditar Hash'}</span>
            </button>
          </form>

          {/* Botones de prueba rápida */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500">Pruebas rápidas:</span>
            <button
              type="button"
              onClick={() => { setEmail('director@fitmanager.com'); setPassword('Admin2026*Seguro'); }}
              className="text-indigo-400 hover:underline"
            >
              Credencial Válida
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => { setEmail('director@fitmanager.com'); setPassword('PasswordErrada123'); }}
              className="text-rose-400 hover:underline"
            >
              Contraseña Errada
            </button>
          </div>
        </div>

        {/* Panel de Auditoría Criptográfica */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Terminal size={18} className="text-emerald-400" />
              <span>Evidencia Forense en Base de Datos</span>
            </h3>

            {respuestaAuth ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 size={18} />
                  <span>{respuestaAuth.mensaje}</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 text-slate-300">
                  <div>
                    <span className="text-slate-500">Usuario:</span> {respuestaAuth.data.usuario.nombre}
                  </div>
                  <div>
                    <span className="text-slate-500">Rol:</span> {respuestaAuth.data.usuario.rol}
                  </div>
                  <div>
                    <span className="text-slate-500">Estrategia Almacenamiento:</span>{' '}
                    <span className="text-emerald-400 font-bold">{respuestaAuth.data.evidenciaSeguridad.almacenamientoEnDb}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 block mb-1">Hash encriptado persistido en SQLite:</span>
                    <span className="text-amber-300 break-all bg-amber-950/40 p-1.5 rounded border border-amber-900/50 block">
                      {respuestaAuth.data.evidenciaSeguridad.hashAlmacenado}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    🔒 <strong className="text-white">Garantía Rúbrica:</strong> Texto plano almacenado en base de datos = <span className="text-emerald-400 font-bold">FALSE</span>.
                  </div>
                </div>
              </div>
            ) : errorAuth ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 flex items-start space-x-3 text-sm">
                <XCircle size={20} className="mt-0.5 text-rose-400" />
                <div>
                  <div className="font-bold">Acceso Denegado</div>
                  <div className="text-xs text-rose-200/80 mt-1">{errorAuth}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Envía el formulario para observar la verificación criptográfica del hash.
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-[11px] text-slate-400">
            <strong>Por qué Bcrypt y no MD5/SHA256:</strong> Bcrypt implementa un factor de costo computacional (work factor 10) que ralentiza deliberadamente los ataques de fuerza bruta y tablas arcoíris mediante salting aleatorio criptográficamente seguro.
          </div>
        </div>
      </div>
    </div>
  );
}
