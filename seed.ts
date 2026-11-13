import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ====================================================================
// FITMANAGER - SCRIPT DE SEMBRADO Y PRUEBA DE IDEMPOTENCIA (PASO 3)
// Demuestra que la ejecución repetida N veces NO duplica registros (Anti-Duplicados).
// Utiliza lógica atómica de Upsert y captura de errores Prisma P2002.
// ====================================================================

interface SeedSummary {
  iteracion: number;
  admins: number;
  miembros: number;
  tiposEntrenamiento: number;
  biometrias: number;
  sesiones: number;
  duplicadosDetectados: number;
}

export async function ejecutarSembrado(iteracion: number = 1): Promise<SeedSummary> {
  console.log(`\n============================================================`);
  console.log(`🌱 [EJECUCIÓN #${iteracion}] Iniciando preparación e inserción idempotente...`);
  console.log(`============================================================`);

  let duplicadosEvitados = 0;

  // ------------------------------------------------------------------
  // 1. USUARIOS ADMINISTRADORES Y ESPECIALISTAS (Seguridad Bcrypt - Paso 4)
  // Perfiles realistas para Médicos Deportólogos, Entrenadores y Administradores
  // ------------------------------------------------------------------
  const saltRounds = 10;
  const hashComun = await bcrypt.hash("Admin2026*Seguro", saltRounds);
  const hashMedico = await bcrypt.hash("Medico2026*", saltRounds);
  const hashCoach = await bcrypt.hash("Coach2026*", saltRounds);
  const hashAdmin = await bcrypt.hash("Admin2026*", saltRounds);
  const hashDocente = await bcrypt.hash("Docente2026*", saltRounds);

  const adminsData = [
    {
      email: "medico@fitmanager.com",
      nombre: "Dr. Carlos Restrepo (Médico Deportólogo)",
      passwordHash: hashMedico,
      rol: "MEDICO_DEPORTOLOGO"
    },
    {
      email: "entrenador@fitmanager.com",
      nombre: "Prof. Laura Montoya (Head Coach ACSM)",
      passwordHash: hashCoach,
      rol: "ENTRENADOR_CERTIFICADO"
    },
    {
      email: "admin@fitmanager.com",
      nombre: "Ing. Roberto Casas (Administrador de Salud Física)",
      passwordHash: hashAdmin,
      rol: "ADMIN_SALUD"
    },
    {
      email: "docente@fitmanager.com",
      nombre: "Evaluador Académico (Modo Sustentación)",
      passwordHash: hashDocente,
      rol: "EVALUADOR_DEMO"
    },
    {
      email: "director@fitmanager.com",
      nombre: "Director General FitManager",
      passwordHash: hashComun,
      rol: "ADMIN"
    }
  ];

  for (const admin of adminsData) {
    try {
      // Usamos Upsert para garantizar idempotencia por email único
      await prisma.usuarioAdmin.upsert({
        where: { email: admin.email },
        update: {
          nombre: admin.nombre,
          // Mantenemos el hash para no generar overhead innecesario si no cambió
        },
        create: {
          email: admin.email,
          nombre: admin.nombre,
          passwordHash: admin.passwordHash,
          rol: admin.rol
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        duplicadosEvitados++;
        console.log(`🛡️ Conflicto de unicidad P2002 interceptado para admin: ${admin.email}`);
      } else {
        throw e;
      }
    }
  }

  // ------------------------------------------------------------------
  // 2. CATÁLOGO DE TIPOS DE ENTRENAMIENTO (Idempotente por 'nombre')
  // ------------------------------------------------------------------
  const catalogoTipos = [
    { nombre: "Yoga", descripcion: "Control postural, respiración y flexibilidad", intensidadSugerida: "Baja" },
    { nombre: "Cardio", descripcion: "Entrenamiento aeróbico de resistencia cardiovascular", intensidadSugerida: "Media" },
    { nombre: "Strength", descripcion: "Hipertrofia y fuerza con cargas progresivas", intensidadSugerida: "Alta" },
    { nombre: "HIIT", descripcion: "Intervalos de alta intensidad y gasto metabólico elevado", intensidadSugerida: "Extrema" }
  ];

  for (const tipo of catalogoTipos) {
    await prisma.tipoEntrenamiento.upsert({
      where: { nombre: tipo.nombre },
      update: {
        descripcion: tipo.descripcion,
        intensidadSugerida: tipo.intensidadSugerida
      },
      create: tipo
    });
  }

  // Obtenemos los IDs de los tipos de entrenamiento
  const tiposRegistrados = await prisma.tipoEntrenamiento.findMany();
  const mapaTipos: Record<string, number> = {};
  tiposRegistrados.forEach(t => { mapaTipos[t.nombre] = t.id; });

  // ------------------------------------------------------------------
  // 3. MIEMBROS Y PERFILES BIOMÉTRICOS HISTÓRICOS (M2 vs M3)
  // En M2 peso y grasa sobrescribían. Aquí guardamos series de tiempo.
  // ------------------------------------------------------------------
  const miembrosData = [
    {
      email: "mateo.gomez@fitmanager.com",
      nombre: "Mateo Gómez",
      telefono: "+57 300 123 4567",
      genero: "M",
      edad: 29,
      altura: 1.78,
      nivelExperiencia: "Intermedio",
      // Historial temporal de peso y grasa (Evolución de 4 meses)
      historial: [
        { peso: 120.9, grasaCorporal: 38.2, fecha: new Date("2026-08-01T08:00:00Z") },
        { peso: 115.4, grasaCorporal: 35.0, fecha: new Date("2026-09-01T08:00:00Z") },
        { peso: 110.1, grasaCorporal: 32.5, fecha: new Date("2026-10-01T08:00:00Z") },
        { peso: 104.2, grasaCorporal: 29.8, fecha: new Date("2026-11-01T08:00:00Z") }
      ]
    },
    {
      email: "camila.valencia@fitmanager.com",
      nombre: "Camila Valencia",
      telefono: "+57 311 987 6543",
      genero: "F",
      edad: 46,
      altura: 1.53,
      nivelExperiencia: "Intermedio",
      historial: [
        { peso: 74.9, grasaCorporal: 33.9, fecha: new Date("2026-08-15T09:00:00Z") },
        { peso: 72.8, grasaCorporal: 31.8, fecha: new Date("2026-09-15T09:00:00Z") },
        { peso: 70.3, grasaCorporal: 30.1, fecha: new Date("2026-10-15T09:00:00Z") },
        { peso: 67.5, grasaCorporal: 28.4, fecha: new Date("2026-11-10T09:00:00Z") }
      ]
    },
    {
      email: "alberto.morales@fitmanager.com",
      nombre: "Dr. Alberto Morales (Caso Alerta Clínica)",
      telefono: "+57 320 555 8899",
      genero: "M",
      edad: 52,
      altura: 1.68,
      nivelExperiencia: "Principiante",
      // IMC = 92.5 / (1.68^2) = 32.77 (> 30: Obesidad Clase I)
      historial: [
        { peso: 94.0, grasaCorporal: 35.5, fecha: new Date("2026-09-01T07:30:00Z") },
        { peso: 93.2, grasaCorporal: 34.8, fecha: new Date("2026-10-01T07:30:00Z") },
        { peso: 92.5, grasaCorporal: 34.0, fecha: new Date("2026-11-05T07:30:00Z") }
      ]
    }
  ];

  for (const m of miembrosData) {
    const miembro = await prisma.miembro.upsert({
      where: { email: m.email },
      update: {
        nombre: m.nombre,
        telefono: m.telefono,
        edad: m.edad,
        altura: m.altura,
        nivelExperiencia: m.nivelExperiencia
      },
      create: {
        nombre: m.nombre,
        email: m.email,
        telefono: m.telefono,
        genero: m.genero,
        edad: m.edad,
        altura: m.altura,
        nivelExperiencia: m.nivelExperiencia
      }
    });

    // Para el historial biométrico, evitamos duplicados verificando si ya existen mediciones
    const biometriasExistentes = await prisma.historialBiometrico.count({
      where: { miembroId: miembro.id }
    });

    if (biometriasExistentes === 0) {
      for (const h of m.historial) {
        await prisma.historialBiometrico.create({
          data: {
            miembroId: miembro.id,
            peso: h.peso,
            grasaCorporal: h.grasaCorporal,
            fechaRegistro: h.fecha
          }
        });
      }
    } else {
      duplicadosEvitados += m.historial.length;
    }

    // ----------------------------------------------------------------
    // Sesiones de prueba por miembro
    // ----------------------------------------------------------------
    const sesionesExistentes = await prisma.sesionEntrenamiento.count({
      where: { miembroId: miembro.id }
    });

    if (sesionesExistentes === 0) {
      if (m.email.includes("alberto.morales")) {
        // Caso de Alerta Clínica: BPM reposo promedio > 85
        await prisma.sesionEntrenamiento.createMany({
          data: [
            {
              miembroId: miembro.id,
              tipoId: mapaTipos["Yoga"] ?? 1,
              duracionMin: 45,
              caloriasQuemadas: 320,
              bpmReposo: 88,
              bpmPromedio: 120,
              bpmMaximo: 135,
              notas: "Sesión inicial de adaptación. Frecuencia cardiaca basal elevada observada."
            },
            {
              miembroId: miembro.id,
              tipoId: mapaTipos["Cardio"] ?? 2,
              duracionMin: 35,
              caloriasQuemadas: 390,
              bpmReposo: 91,
              bpmPromedio: 140,
              bpmMaximo: 155,
              notas: "Caminadora ligera. Taquicardia en reposo previa al inicio del protocolo."
            }
          ]
        });
      } else {
        await prisma.sesionEntrenamiento.createMany({
          data: [
            {
              miembroId: miembro.id,
              tipoId: mapaTipos["HIIT"] ?? 4,
              duracionMin: 50,
              caloriasQuemadas: 610,
              bpmReposo: 62,
              bpmPromedio: 155,
              bpmMaximo: 178,
              notas: "Excelente rendimiento y recuperación rápida."
            },
            {
              miembroId: miembro.id,
              tipoId: mapaTipos["Strength"] ?? 3,
              duracionMin: 60,
              caloriasQuemadas: 540,
              bpmReposo: 64,
              bpmPromedio: 135,
              bpmMaximo: 160,
              notas: "Trabajo enfocado en sentadilla y peso muerto."
            }
          ]
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // Auditoría final del estado en la Base de Datos
  // ------------------------------------------------------------------
  const totalAdmins = await prisma.usuarioAdmin.count();
  const totalMiembros = await prisma.miembro.count();
  const totalTipos = await prisma.tipoEntrenamiento.count();
  const totalBiometrias = await prisma.historialBiometrico.count();
  const totalSesiones = await prisma.sesionEntrenamiento.count();

  return {
    iteracion,
    admins: totalAdmins,
    miembros: totalMiembros,
    tiposEntrenamiento: totalTipos,
    biometrias: totalBiometrias,
    sesiones: totalSesiones,
    duplicadosDetectados: duplicadosEvitados
  };
}

// --------------------------------------------------------------------
// DEMOSTRACIÓN DE IDEMPOTENCIA: 5 CORRIDAS CONSECUTIVAS
// --------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("🚀 PRUEBA DE IDEMPOTENCIA Y PROTECCIÓN CONTRA DUPLICADOS (PASO 3 DE LA RÚBRICA)");
  console.log("Se ejecutarán 5 ciclos continuos de preparación e inserción de datos.");
  console.log("================================================================================");

  const resultados: SeedSummary[] = [];

  for (let i = 1; i <= 5; i++) {
    const res = await ejecutarSembrado(i);
    resultados.push(res);
  }

  console.log("\n================================================================================");
  console.log("📊 RESUMEN AUDITADO DE IDEMPOTENCIA (COMPARATIVA DE 5 EJECUCIONES CONSECUTIVAS):");
  console.log("================================================================================");
  console.table(resultados);

  const primeraCorrida = resultados[0];
  const quintaCorrida = resultados[4];

  const esIdempotente =
    primeraCorrida.admins === quintaCorrida.admins &&
    primeraCorrida.miembros === quintaCorrida.miembros &&
    primeraCorrida.tiposEntrenamiento === quintaCorrida.tiposEntrenamiento &&
    primeraCorrida.biometrias === quintaCorrida.biometrias &&
    primeraCorrida.sesiones === quintaCorrida.sesiones;

  if (esIdempotente) {
    console.log("✅ CERTIFICACIÓN DE INTEGRIDAD SUPERADA: 0 registros duplicados tras 5 ejecuciones.");
    console.log("🔒 El sistema es 100% IDEMPOTENTE y resistente a ejecuciones redundantes de ETL.");
  } else {
    console.error("❌ FALLO DE IDEMPOTENCIA: Se encontraron discrepancias en el conteo de registros.");
  }
}

// Ejecutar si se invoca directamente
if (process.argv[1]?.includes('seed')) {
  main()
    .catch((e) => {
      console.error("Error durante el sembrado:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
