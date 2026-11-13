# FitManager Enterprise · Momento Evaluativo 3
## Seguridad e Inteligencia de Aplicaciones (Optativa II)

Sistema de gestión biomecánica, analítica de rendimiento deportivo y triaje clínico preventivo para centros de alto rendimiento y gimnasios inteligentes.

---

## 📋 Mapeo Integral de los 7 Pasos de la Rúbrica

### Paso 1: La Idea
- **El Problema:** Los gimnasios tradicionales y centros de acondicionamiento recopilan volúmenes considerables de métricas corporales y de entrenamiento (frecuencia cardíaca, peso, composición corporal), pero estos datos se encuentran dispersos, carecen de trazabilidad histórica o son tratados sin validación fisiológica, exponiendo a los atletas a sobreentrenamiento o accidentes cardiovasculares.
- **Para quién es:** Diseñado para **Médicos Deportólogos, Entrenadores Certificados y Administradores de Salud Física**.
- **Qué necesita para decidir mejor:** Requiere una plataforma centralizada que proteja la integridad de los datos, ofrezca trazabilidad de la evolución física a lo largo del tiempo, bloquee ingresos anómalos o maliciosos, y evalúe de manera confiable cuándo un atleta no debe someterse a rutinas de alta intensidad (HIIT).

---

### Paso 2: La App Funcionando y Corrección del Momento 2
- **Lo que se corrigió respecto al Momento 2:**
  - *Defecto en M2:* En la arquitectura del Momento 2, los campos de peso (`peso`) y grasa corporal (`grasa_corporal`) residían como columnas estáticas en la tabla `miembros`. Al ejecutarse una actualización de perfil (`UPDATE miembros SET peso = ...`), se sobrescribían destructivamente los registros previos, perdiéndose de manera irreversible el historial cronológico del atleta.
  - *Solución M3:* Se rediseñó el modelo de base de datos creando la entidad `HistorialBiometrico` vinculada en relación 1:N con `Miembro`. Cada registro cuenta con timestamp inmutable (`fechaRegistro DateTime @default(now())`).
- **Demostración en Frontend:** El módulo **Dashboard** incorpora gráficos interactivos de series de tiempo con `recharts`, visualizando la curva evolutiva del peso y porcentaje de grasa corporal en cada fecha de evaluación.

---

### Paso 3: Los Datos y Protección contra Duplicados (Idempotencia)
- **Preparación de Datos:** El script `seed.ts` ejecuta un proceso de ETL automatizado donde los perfiles son normalizados, tipados y vinculados a sus claves foráneas correspondientes.
- **Garantía Anti-Duplicados:** Se implementó una estrategia híbrida basada en:
  1. Operaciones atómicas `upsert` de Prisma basadas en restricciones de unicidad (`@unique` en emails y nombres de catálogo).
  2. Manejo controlado de excepciones relacionales interceptando el código de error `P2002` (Unique constraint failed).
- **Evidencia de 5 Ciclos:** Al correr `npm run seed`, el script ejecuta 5 ciclos consecutivos contra SQLite. La consola demuestra que tras la primera inserción, los ciclos 2 al 5 detectan y reconcilian los registros existentes sin crear duplicados (0 duplicados insertados).

---

### Paso 4: Seguridad (Formularios y Contraseñas)
1. **Protección de Contraseñas (Auth):**
   - El modelo `UsuarioAdmin` persiste credenciales administrativas.
   - Se utiliza `bcryptjs` con un factor de trabajo (*work factor*) de **10 rondas de salado criptográfico**.
   - El endpoint `POST /api/auth/login` compara la credencial usando `bcrypt.compare()`. La base de datos SQLite almacena exclusivamente el hash (`$2b$10$...`); el texto plano nunca es persistido ni registrado en logs.
2. **Protección de Formularios (Anti-XSS):**
   - Los campos de texto libre como `notas` en el registro de sesiones son procesados por un middleware de sanitización profunda con la librería `xss`.
   - Si un atacante inyecta vectores maliciosos como `<script>alert('Hack')</script>` o `<img src=x onerror=...>`, el backend neutraliza los ejecutables y almacena cadenas inofensivas codificadas en entidades HTML (`&lt;script&gt;`).

---

### Paso 5: Inteligencia (Motor de Inferencia Clínica Determinista)
- **Tarea Automatizada:** Clasificación de riesgo cardiovascular y prescripción automatizada de disciplinas de entrenamiento.
- **La Regla Determinista:**
  $$\text{Riesgo Cardiovascular} = (\text{Último IMC} > 30.0) \land (\text{FC Reposo Promedio} > 85\text{ bpm})$$
- **Acción del Sistema:** Si la condición se cumple, se genera un Banner de Alerta Clínica de alta prioridad recomendando:
  > *"Priorizar Yoga/Cardio y bloquear rutinas HIIT"*.
- **Justificación de la Elección (Regla Determinista vs. Inteligencia Artificial):**
  - **Por qué Regla Determinista:** En aplicaciones de salud y acondicionamiento físico, las decisiones que involucran riesgo cardiovascular deben ser 100% predecibles, auditables clínicamente y verificables ante comités de bioética médica. Una regla matemática no tiene riesgo de alucinación, su ejecución toma menos de 1 milisegundo y opera localmente sin costos de inferencia ni dependencias de APIs externas.
  - **Por qué se descartó la IA Generativa (LLM):** Los modelos de lenguaje son de naturaleza estocástica (probabilística). Un LLM puede sufrir desviaciones en sus respuestas (*prompt drift*), alucinar umbrales que pongan en peligro la vida del paciente, introducir latencias inaceptables (> 2 segundos) y violar la privacidad al requerir telemetría externa para datos sensibles de salud.

---

### Paso 6: Manejo del Dato Malo (Rechazo Controlado)
- **Prueba Fisiológica Anómala:** En el formulario de sesión, se intenta registrar una frecuencia cardíaca en reposo de `bpm_reposo = 145`, valor clínicamente incompatible con el estado basal (el rango normal aceptado en triaje es de 40 a 120 bpm).
- **Respuesta de la Aplicación:**
  - El backend intercepta la anomalía en el perímetro mediante esquemas de validación estricta con **Zod**, retornando inmediatamente un estado `HTTP 400 Bad Request`.
  - La transacción en base de datos es abortada antes de tocar SQLite.
  - El frontend captura la excepción de Axios y renderiza una alerta visual de alta visibilidad:
    > *"⛔ Integridad Rechazada: El BPM ingresado es fisiológicamente anómalo y fue bloqueado por seguridad"*.

---

### Paso 7: La Decisión de Diseño Arquitectural
- **Decisión Seleccionada:** Implementación de **Defensa en Profundidad con Validación de Frontera (Zod Schemas) + Tipado Fuerte con Prisma ORM sobre SQLite**.
- **Por qué se eligió:** Permite separar claramente la validación semántica del negocio (capa de aplicación en Node.js) de las restricciones relacionales físicas del motor de persistencia. Garantiza que las cargas de trabajo inválidas se rechacen con latencia mínima, entregando códigos de error estructurados y mensajes contextuales sin degradar la memoria del motor SQLite.
- **Qué otra opción se descartó:** Se descartó depender exclusivamente de las restricciones `CHECK` directas del motor SQLite y procesar excepciones capturadas de SQLite (`sqlite3.IntegrityError`), ya que los motores SQL tradicionales entregan mensajes crudos dependientes del driver nativo, difíciles de internacionalizar, sin capacidad de sanitización previa y con riesgo de acoplar la lógica de negocio a la sintaxis interna del motor relacional.

---

## 🛠️ Tecnologías y Arquitectura

- **Motor de Base de Datos:** SQLite 3 (Preservando continuidad con el Momento 2).
- **Backend / ORM:** Node.js v26+, Express 5, Prisma ORM 6, Zod, BcryptJS, XSS.
- **Frontend:** React 19, Vite 8, Tailwind CSS 3, Recharts, Lucide Icons, Axios.
- **Lenguaje:** TypeScript / JavaScript Moderno (ESModules).

---

## 👥 Credenciales de Acceso por Perfil y Rol Profesional

La plataforma cuenta con un portal unificado de autenticación con verificación criptográfica Bcrypt (Salt 10). Se proporcionan cuentas especializadas para la simulación operativa:

| Perfil Profesional | Correo Electrónico | Contraseña | Capacidades y Alcance en el Sistema |
| :--- | :--- | :--- | :--- |
| **🩺 Médico Deportólogo** | `medico@fitmanager.com` | `Medico2026*` | Triaje cardiovascular ACSM, prescripción de directivas médicas, bloqueo clínico de HIIT y registro de series temporales antropométricas. |
| **🏋️ Entrenador Certificado** | `entrenador@fitmanager.com` | `Coach2026*` | Supervisión de atletas, terminal de registro de sesiones con validación de BPM en reposo (Zod), bloqueo automático de HIIT en atletas de riesgo y sanitización Anti-XSS. |
| **🏢 Administrador de Salud Física** | `admin@fitmanager.com` | `Admin2026*` | Dashboard de KPIs deportivos y clínicos, auditoría forense de hashes Bcrypt y lanzamiento del test de idempotencia en 5 ciclos. |
| **🎓 Evaluador Académico (Sustentación)** | `docente@fitmanager.com` | `Docente2026*` | Acceso directo a la **Demo Paso a Paso** para calificar y contrastar los 7 requisitos de la rúbrica oficial. |

> **Nota:** La pantalla de login incluye botones de carga rápida de credenciales y un botón de acceso directo al **Modo Sustentación (7 Pasos)** para agilizar la evaluación académica.

---

## 🚀 Guía de Puesta en Marcha Rápida

### 1. Requisitos Previos
Tener instalado Node.js (v18 o superior) y npm.

### 2. Sincronización de Base de Datos e Inferencia
```bash
# Situarse en la carpeta del proyecto
cd /home/jesuuusl/Descargas/Momento3

# Generar cliente de Prisma y estructurar la base de datos dev.db
npx prisma generate
npx prisma db push
```

### 3. Ejecutar Prueba de Idempotencia (Paso 3)
```bash
npm run seed
```
*Observará la tabla comparativa de 5 ejecuciones consecutivas certificando 0 duplicados.*

### 4. Iniciar Backend y Frontend

**Terminal 1 (Backend Express en Puerto 4000):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend React Vite en Puerto 5173):**
```bash
npm run dev:client
```

Abra su navegador en [http://localhost:5173](http://localhost:5173) para interactuar con la suite completa de los 7 pasos.
