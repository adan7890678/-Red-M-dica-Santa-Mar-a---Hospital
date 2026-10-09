const sqlite3 = require('sqlite3').verbose();

// Usar base de datos en memoria para reinicio rápido y seguridad local
let db = new sqlite3.Database(':memory:');

// Listas de datos realistas para generación de 50 registros por tabla
const especialidades = [
    'Cardiología', 'Infectología', 'Cirugía General', 'Neurología', 'Pediatría', 
    'Oncología', 'Psiquiatría', 'Traumatología', 'Dermatología', 'Neumonología', 
    'Ginecología', 'Endocrinología', 'Urología', 'Kinesiología', 'Gastroenterología',
    'Oftalmología', 'Otorrinolaringología', 'Nefrología', 'Hematología', 'Reumatología'
];

const nombresH = ['Carlos', 'Juan', 'Roberto', 'Alejandro', 'Fernando', 'Gabriel', 'Martín', 'Javier', 'Rodrigo', 'Esteban', 'Hugo', 'Lucas', 'Gonzalo', 'Mateo', 'Agustín', 'Diego', 'Nicolás', 'Felipe', 'Santiago', 'Joaquín'];
const nombresM = ['Elena', 'Claudia', 'Patricia', 'Valeria', 'Sofía', 'Mariana', 'Laura', 'Andrea', 'Camila', 'María', 'Lucía', 'Florencia', 'Valentina', 'Isabel', 'Paula', 'Carolina', 'Daniela', 'Natalia', 'Luciana', 'Victoria'];
const apellidos = ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Martínez', 'Díaz', 'Pérez', 'Sánchez', 'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ruiz', 'Ramírez', 'Flores', 'Benítez', 'Acosta', 'Medina', 'Herrera', 'Cabrera', 'Ríos', 'Morales', 'Vargas', 'Rossi'];

const obrasSociales = ['OSDE 210', 'OSDE 310', 'OSDE 410', 'OSDE 450', 'Swiss Medical Plan 300', 'Swiss Medical Plan 500', 'Galeno Oro', 'Galeno Cobertura Total', 'Medifé Plata', 'Medifé Oro', 'OMINT Línea Médica', 'OMINT Premium', 'Sancor Salud 3000', 'Sancor Salud 4000', 'PAMI Cobertura Nacional'];
const gruposSanguineos = ['A RH+', 'A RH-', 'B RH+', 'B RH-', '0 RH+', '0 RH-', 'AB RH+', 'AB RH-'];

const medicamentosBase = [
    ['Fentanilo Inyectable 0.5mg/10ml', 'Bóveda A - Subsuelo 2', 'SOLO JEFE FARMACIA & CIRUGÍA'],
    ['Morfina Sulfato 10mg Ampollas', 'Bóveda A - Subsuelo 2', 'RESTRINGIDO UCI / ONCOLOGÍA'],
    ['Midazolam 15mg/3ml', 'Bóveda B - Armario 04', 'PERSONAL ANESTESIA'],
    ['Oxicodona Comprimidos 20mg', 'Bóveda A - Caja Fuerte 01', 'SOLO FARMACIA & ONCOLOGÍA'],
    ['Ketamina Inyectable 50mg/ml', 'Bóveda B - Armario 02', 'EXCLUSIVO QUIROFANO & ANESTESIA'],
    ['Propofol Emulsión 1% 20ml', 'Bóveda B - Refrigerador 01', 'PERSONAL UCI & EMERGENCIAS'],
    ['Remifentanilo 2mg Liofilizado', 'Bóveda A - Subsuelo 2', 'RESTRINGIDO NEURO-CIRUGÍA'],
    ['Alprazolam 2mg Comprimidos', 'Bóveda C - Armario 01', 'PERSONAL PSIQUIATRÍA'],
    ['Diazepam 10mg Ampollas', 'Bóveda B - Armario 03', 'GUARDIA DE EMERGENCIAS'],
    ['Metadona 10mg Comprimidos', 'Bóveda A - Caja Fuerte 02', 'UNIDAD DE DOLOR Y PALIAÇÃO'],
    ['Sufentanilo 50mcg/5ml', 'Bóveda A - Subsuelo 2', 'EXCLUSIVO CARDIO-CIRUGÍA'],
    ['Lorazepam 4mg Ampollas', 'Bóveda B - Armario 04', 'PERSONAL ANESTESIA Y GUARDIA'],
    ['Hydromorphone 2mg/ml', 'Bóveda A - Caja Fuerte 03', 'ONCOLOGÍA PEDIÁTRICA Y ADULTOS'],
    ['Sevoflurano Líquido 250ml', 'Quirófano Depósito A', 'JEFE DE ANESTESIOLOGÍA'],
    ['Clonazepam 2mg Comprimidos', 'Bóveda C - Armario 02', 'PERSONAL PSIQUIATRÍA & NEUROLOGÍA'],
    ['Pentobarbital Sódico 50mg/ml', 'Bóveda A - Subsuelo 2', 'USO EXCLUSIVO TERAPIA INTENSIVA'],
    ['Buprenorfina 0.3mg Ampollas', 'Bóveda A - Caja Fuerte 04', 'UNIDAD DE TERAPIA DEL DOLOR'],
    ['Etomidato 20mg/10ml', 'Quirófano Depósito B', 'PERSONAL ANESTESIA & TRAUMA'],
    ['Naloxona 0.4mg/ml Antídoto', 'Bóveda B - Armario URG', 'ACCESO DIRECTO GUARDIA 24H'],
    ['Dexmedetomidina 200mcg/2ml', 'Bóveda A - Refrigerador 02', 'RESTRINGIDO CUIDADOS INTENSIVOS']
];

const diagnosticosBase = [
    ['Hipertensión Arterial Grado II', 'Enalapril 10mg / Dieta Hiposódica'],
    ['Arritmia Supraventricular', 'Amiodarona 200mg / Monitoreo Holter'],
    ['Esclerosis Múltiple Remitente', 'Interferón Beta-1a / Fisioterapia'],
    ['Diabetes Mellitus Tipo 1', 'Insulina NPH Noche / Bomba de Infusión'],
    ['Fractura Expuesta de Tibia', 'Fijación Externa / Cefazolina 1g IV'],
    ['Melanoma In Situ - Espalda', 'Resección Quirúrgica Marginal'],
    ['Trastorno de Ansiedad Generalizada', 'Sertralina 50mg / Terapia Cognitivo-Conductual'],
    ['Asma Bronquial Moderada', 'Budesonide/Formoterol Inhalado'],
    ['Embarazo de Alto Riesgo W32', 'Reposo Relativo / Monitoreo Fetal'],
    ['Hipotiroidismo de Hashimoto', 'Levotiroxina 75mcg / Control TSH'],
    ['Cólico Renal por Litiasis', 'Tamsulosina 0.4mg / Analgesia IV'],
    ['Síndrome Intestino Irritable', 'Trimebutina 200mg / Dieta FODMAP'],
    ['Neumonía Adquirida en Comunidad', 'Amoxicilina/Clavulánico 1g IV'],
    ['Colecistitis Litiasica Aguda', 'Colecistectomía Laparoscópica'],
    ['Traumatismo Encéfalo-Craneano Leve', 'Observación en Guardia 24h / TAC'],
    ['Insuficiencia Renal Crónica Stg 3', 'Furosemida 40mg / Dieta Estricta'],
    ['Artritis Reumatoidea Severa', 'Metotrexato 15mg / Ácido Fólico'],
    ['Gastritis Crónica Erosiva', 'Omeprazol 40mg / Biopsia Endoscópica'],
    ['Accidente Cerebrovascular Isquémico', 'Aspirina 100mg / Neuro-rehabilitación'],
    ['Insuficiencia Cardíaca Congestiva', 'Carvedilol 6.25mg / Espironolactona']
];

function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            // 1. Tabla PÚBLICA: Artículos de Salud
            db.run(`CREATE TABLE IF NOT EXISTS articulos_salud_publicos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                especialidad TEXT NOT NULL,
                resumen TEXT NOT NULL,
                contenido TEXT NOT NULL,
                fecha_publicacion DATE DEFAULT CURRENT_DATE
            )`);

            // 2. Tabla SENSIBLE: Personal Médico
            db.run(`CREATE TABLE IF NOT EXISTS personal_medico_usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                matricula_medica TEXT NOT NULL,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                especialidad_medica TEXT NOT NULL,
                departamento_hospital TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                pin_acceso_quirofano TEXT NOT NULL,
                rol TEXT NOT NULL DEFAULT 'medico',
                salario_anual TEXT NOT NULL,
                estado_licencia TEXT NOT NULL DEFAULT 'Activa'
            )`);

            // 3. Tabla PRIVADA: Historias Clínicas
            db.run(`CREATE TABLE IF NOT EXISTS historias_clinicas_pacientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero_expediente TEXT NOT NULL,
                nombre_paciente TEXT NOT NULL,
                dni_ssn TEXT NOT NULL,
                grupo_sanguineo TEXT NOT NULL,
                diagnostico_principal TEXT NOT NULL,
                tratamiento_prescripto TEXT NOT NULL,
                medico_tratante TEXT NOT NULL,
                obra_social_seguro TEXT NOT NULL
            )`);

            // 4. Tabla TOP SECRET: Bóveda de Farmacia
            db.run(`CREATE TABLE IF NOT EXISTS equipamiento_y_farmacia (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_sustancia TEXT NOT NULL,
                nombre_medicamento TEXT NOT NULL,
                boveda_ubicacion TEXT NOT NULL,
                pin_boveda_narcoticos TEXT NOT NULL,
                nivel_acceso_requerido TEXT NOT NULL
            )`);

            // Limpiar datos existentes
            db.run(`DELETE FROM articulos_salud_publicos`);
            db.run(`DELETE FROM personal_medico_usuarios`);
            db.run(`DELETE FROM historias_clinicas_pacientes`);
            db.run(`DELETE FROM equipamiento_y_farmacia`);

            // -----------------------------------------------------------------
            // GENERACIÓN DE 50 REGISTROS PARA CADA TABLA
            // -----------------------------------------------------------------

            // --- TABLA 1: ARTÍCULOS DE SALUD PÚBLICOS (50 Registros) ---
            const stmtArt = db.prepare(`INSERT INTO articulos_salud_publicos (titulo, especialidad, resumen, contenido, fecha_publicacion) VALUES (?, ?, ?, ?, ?)`);
            
            const articulosManuales = [
                ['Prevención Cardiovascular: Hábitos Saludables para el Corazón', 'Cardiología', 'Guía médica con recomendaciones para cuidar la salud arterial y mitigar riesgos.', 'La prevención de enfermedades cardiovasculares requiere una combinación de dieta equilibrada, ejercicio regular...', '2017-01-10'],
                ['Consejos sobre Vacunación Estacional y Refuerzos Inmunológicos', 'Infectología', 'Información oficial de la Red Médica sobre la campaña de vacunación anual.', 'Con la llegada de la temporada invernal, la Red Médica Santa María inicia su campaña de vacunación gratuita...', '2017-01-22'],
                ['Novedades en Cirugía Laparoscópica de Mínima Invasión', 'Cirugía General', 'Incorporación de torres quirúrgicas 4K en nuestros quirófanos principales.', 'Los avances en tecnología médica permiten reducir significativamente el tiempo de recuperación posoperatorio...', '2017-02-05'],
                ['Avances en Neurología: Diagnóstico Temprano de Enfermedades Cognitivas', 'Neurología', 'Estudios preventivos de memoria y salud cerebral en adultos mayores.', 'Nuestros especialistas en neurociencia presentan un protocolo integral para la detección precoz...', '2017-02-18'],
                ['Unidad de Pediatría 24 Horas: Atención Médica Infantil Especializada', 'Pediatría', 'Guardia médica infantil permanente y servicios de consulta programada.', 'La salud de los más pequeños es nuestra prioridad. Contamos con un cuerpo de pediatras de alta especialización...', '2017-03-01'],
                ['Nutrición Oncológica: Acompañamiento en Tratamientos Complejos', 'Oncología', 'Importancia del soporte nutricional adaptado a cada fase del paciente.', 'Un estado nutricional óptimo es clave durante las terapias oncológicas para preservar la fuerza corporal...', '2017-03-15']
            ];

            for (const a of articulosManuales) stmtArt.run(a);

            for (let i = 7; i <= 50; i++) {
                const esp = especialidades[i % especialidades.length];
                const mes = String((i % 12) + 1).padStart(2, '0');
                const dia = String((i % 28) + 1).padStart(2, '0');
                stmtArt.run([
                    `Guía Clínica #${i}: Avances y Diagnóstico en ${esp}`,
                    esp,
                    `Publicación institucional sobre nuevos protocolos de atención y prevención en el área de ${esp}.`,
                    `El departamento de ${esp} de la Red Médica Santa María ha publicado los nuevos estándares de diagnóstico temprano y manejo del paciente para el año 2017...`,
                    `2017-${mes}-${dia}`
                ]);
            }
            stmtArt.finalize();

            // --- TABLA 2: PERSONAL MÉDICO Y USUARIOS (50 Registros) ---
            const stmtStaff = db.prepare(`INSERT INTO personal_medico_usuarios 
                (matricula_medica, nombre, apellido, email, especialidad_medica, departamento_hospital, password_hash, pin_acceso_quirofano, rol, salario_anual, estado_licencia) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            // CTF Critical Seeds
            const staffManuales = [
                ['MN-SYS-001', 'Admin', 'HospitalRoot', 'sysadmin@santamariahealth.org', 'Sistemas Hospitalarios', 'Dirección de IT', '$2b$10$99Xz88Yy77Zz66Aa55Bb44Cc33Dd22Ee11Ff00Gg99Hh88Ii', '9901', 'root_sysadmin', '$190,000 USD', 'Activa'],
                ['MN-DIR-002', 'Dr. Roberto', 'Gutiérrez', 'r.gutierrez@santamariahealth.org', 'Cirugía Cardiovascular', 'Dirección Médica General', '$2b$10$e7WqL1K8z9X0vM2N3P4Q5u6R7S8T9U0V1W2X3Y4Z5a6b7c8d9e0f', '8812', 'director_general', '$280,000 USD', 'Activa'],
                ['MN-10452', 'Dra. Elena', 'Morales', 'e.morales@santamariahealth.org', 'Cardiología Intervencionista', 'Cardiología', '$2b$10$8k9J0H1G2F3E4D5C6B7A890123456789abcdef0123456789abcd', '4321', 'admin_hospital', '$160,000 USD', 'Activa'],
                ['MN-11883', 'Dr. Alejandro', 'Sosa', 'a.sosa@santamariahealth.org', 'Neurología & Neurocirugía', 'Neurología', '$2b$10$Q1W2E3R4T5Y6U7I8O9P0a1s2d3f4g5h6j7k8l9z8x7c6v5b4n', '1122', 'medico', '$145,000 USD', 'Activa'],
                ['MN-12004', 'Dra. Claudia', 'Ríos', 'c.rios@santamariahealth.org', 'Pediatría Integral', 'Pediatría', '$2b$10$9x8y7z6w5v4u3t2s1r0q9P8O7N6M5L4K3J2I1H0GfEdCbA', '5544', 'medico', '$120,000 USD', 'Activa'],
                ['MN-13550', 'Dr. Fernando', 'Cisneros', 'f.cisneros@santamariahealth.org', 'Oncología Clínica', 'Oncología', '$2b$10$1a2b3c4d5e6f7g8h9i0j1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z', '3399', 'medico', '$150,000 USD', 'Activa'],
                ['MN-14221', 'Dra. Patricia', 'Vargas', 'p.vargas@santamariahealth.org', 'Jefa de Farmacia & Toxicología', 'Farmacia Hospitalaria', '$2b$10$Z9Y8X7W6V5U4T3S2R1Q0p9o8n7m6l5k4j3i2h1g0fedcba', '7766', 'admin_hospital', '$135,000 USD', 'Activa']
            ];

            for (const s of staffManuales) stmtStaff.run(s);

            const doctoresNombres = [];
            for (let i = 8; i <= 50; i++) {
                const esMujer = i % 2 === 0;
                const nombre = esMujer ? nombresM[(i * 3) % nombresM.length] : nombresH[(i * 3) % nombresH.length];
                const apellido = apellidos[(i * 7) % apellidos.length];
                const inicial = nombre.substring(0, 1).toLowerCase();
                const email = `${inicial}.${apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u06ff]/g, "")}${i}@santamariahealth.org`;
                const esp = especialidades[i % especialidades.length];
                const matricula = `MN-${15000 + i}`;
                const pin = String(1000 + (i * 137) % 8999);
                const hash = `$2b$10$${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
                const salario = `$${115 + (i * 2) % 65},000 USD`;
                const rol = (i % 9 === 0) ? 'admin_hospital' : 'medico';
                const tituloDoctor = esMujer ? `Dra. ${nombre}` : `Dr. ${nombre}`;

                doctoresNombres.push(`${tituloDoctor} ${apellido}`);
                stmtStaff.run([matricula, tituloDoctor, apellido, email, esp, esp, hash, pin, rol, salario, 'Activa']);
            }
            stmtStaff.finalize();

            // --- TABLA 3: HISTORIAS CLÍNICAS PRIVADAS DE PACIENTES (50 Registros) ---
            const stmtHist = db.prepare(`INSERT INTO historias_clinicas_pacientes 
                (numero_expediente, nombre_paciente, dni_ssn, grupo_sanguineo, diagnostico_principal, tratamiento_prescripto, medico_tratante, obra_social_seguro) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

            const pacientesManuales = [
                ['HC-88901', 'Juan Carlos Pérez', '28.455.102', 'A RH+', 'Hipertensión Arterial Grado II', 'Enalapril 10mg / Dieta Hiposódica', 'Dra. Elena Morales', 'Swiss Medical Plan 500'],
                ['HC-88902', 'María Laura Fernández', '32.119.804', '0 RH-', 'Arritmia Supraventricular', 'Amiodarona 200mg / Monitoreo Holter', 'Dra. Elena Morales', 'OSDE 410'],
                ['HC-88905', 'Gonzalo Martínez', '24.890.331', 'B RH+', 'Esclerosis Múltiple Remitente', 'Interferón Beta-1a / Fisioterapia', 'Dr. Alejandro Sosa', 'Medifé Plata'],
                ['HC-88910', 'Camila Benítez', '41.002.955', 'AB RH+', 'Diabetes Mellitus Tipo 1', 'Insulina NPH Noche / Bomba de Infusión', 'Dra. Claudia Ríos', 'Galeno Cobertura Total']
            ];

            for (const p of pacientesManuales) stmtHist.run(p);

            for (let i = 5; i <= 50; i++) {
                const esMujer = i % 2 !== 0;
                const nombreP = esMujer ? nombresM[(i * 5) % nombresM.length] : nombresH[(i * 5) % nombresH.length];
                const apellidoP = apellidos[(i * 11) % apellidos.length];
                const exp = `HC-${88910 + i}`;
                const dni = `${20 + (i % 25)}.${100 + (i * 17) % 899}.${100 + (i * 23) % 899}`;
                const sangre = gruposSanguineos[i % gruposSanguineos.length];
                const diagPair = diagnosticosBase[i % diagnosticosBase.length];
                const medicoTratante = doctoresNombres[i % doctoresNombres.length] || 'Dra. Elena Morales';
                const obra = obrasSociales[i % obrasSociales.length];

                stmtHist.run([exp, `${nombreP} ${apellidoP}`, dni, sangre, diagPair[0], diagPair[1], medicoTratante, obra]);
            }
            stmtHist.finalize();

            // --- TABLA 4: BÓVEDA DE FARMACIA Y MEDICAMENTOS CONTROLADOS (50 Registros) ---
            const stmtPharm = db.prepare(`INSERT INTO equipamiento_y_farmacia 
                (codigo_sustancia, nombre_medicamento, boveda_ubicacion, pin_boveda_narcoticos, nivel_acceso_requerido) 
                VALUES (?, ?, ?, ?, ?)`);

            for (let i = 1; i <= 50; i++) {
                const cod = `MED-CTRL-${String(i).padStart(2, '0')}`;
                const baseIndex = (i - 1) % medicamentosBase.length;
                const baseMed = medicamentosBase[baseIndex];
                const nombreMed = (i <= medicamentosBase.length) 
                    ? baseMed[0] 
                    : `${baseMed[0]} (Lote #${Math.floor(i / medicamentosBase.length) + 1})`;
                const ubicacion = baseMed[1];
                const pinVault = `PIN-SEC-${1000 + (i * 183) % 8999}`;
                const nivel = baseMed[2];

                stmtPharm.run([cod, nombreMed, ubicacion, pinVault, nivel]);
            }
            stmtPharm.finalize();

            console.log('✅ Base de datos de Red Médica Santa María cargada exitosamente: 50 REGISTROS POR TABLA (200 registros en total).');
            resolve();
        });
    });
}

function resetDatabase() {
    return initDatabase();
}

module.exports = {
    db,
    initDatabase,
    resetDatabase
};
