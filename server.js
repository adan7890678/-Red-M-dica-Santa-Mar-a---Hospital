const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initDatabase, resetDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Estado global de configuración pedagógica
let configState = {
    isVulnerable: true,
    lastExecutedQuery: 'Ninguna consulta ejecutada aún.',
    lastError: null,
    queryHistory: []
};

function logQuery(query, params = [], error = null) {
    configState.lastExecutedQuery = query;
    configState.lastError = error ? error.message : null;
    configState.queryHistory.unshift({
        timestamp: new Date().toLocaleTimeString(),
        query,
        params,
        error: error ? error.message : null,
        mode: configState.isVulnerable ? 'VULNERABLE (Concatenación)' : 'SEGURO (Prepared Statement)'
    });
    if (configState.queryHistory.length > 20) {
        configState.queryHistory.pop();
    }
}

// -------------------------------------------------------------
// ENDPOINTS DEL PORTAL HOSPITALARIO (RED MÉDICA SANTA MARÍA)
// -------------------------------------------------------------

// 1. BUSCADOR PÚBLICO DE ARTÍCULOS DE SALUD (Vulnerable a UNION SELECT SQLi)
app.get('/api/public/health-articles', (req, res) => {
    let q = req.query.q || '';
    if (q.trim().endsWith('--') && !q.endsWith(' ')) {
        q += ' ';
    }
    let sqlQuery = '';

    if (configState.isVulnerable) {
        // VULNERABLE: Concatenación directa sin sanitizar en el buscador de noticias de salud
        sqlQuery = `SELECT id, titulo, especialidad, resumen, contenido, fecha_publicacion FROM articulos_salud_publicos WHERE titulo LIKE '%${q}%' OR resumen LIKE '%${q}%' OR especialidad LIKE '%${q}%'`;

        db.all(sqlQuery, (err, rows) => {
            logQuery(sqlQuery, [], err);
            if (err) {
                return res.json({ 
                    success: false, 
                    message: 'Error en la consulta de base de datos.',
                    sqlError: err.message,
                    executedQuery: sqlQuery
                });
            }
            return res.json({ 
                success: true, 
                count: rows ? rows.length : 0, 
                data: rows || [],
                executedQuery: sqlQuery
            });
        });
    } else {
        // SEGURO: Prepared Statements
        const searchPattern = `%${q}%`;
        sqlQuery = `SELECT id, titulo, especialidad, resumen, contenido, fecha_publicacion FROM articulos_salud_publicos WHERE titulo LIKE ? OR resumen LIKE ? OR especialidad LIKE ?`;

        db.all(sqlQuery, [searchPattern, searchPattern, searchPattern], (err, rows) => {
            logQuery(sqlQuery, [searchPattern], err);
            if (err) {
                return res.json({ success: false, message: 'Error de servidor SQL.', sqlError: err.message });
            }
            return res.json({ 
                success: true, 
                count: rows ? rows.length : 0, 
                data: rows || [],
                executedQuery: sqlQuery
            });
        });
    }
});

// 2. PORTAL DE ACCESO / LOGIN DE MÉDICOS Y PERSONAL SANITARIO (Bypass SQLi)
app.post('/api/auth/medical-login', (req, res) => {
    const { username, password } = req.body;
    let userInput = username || '';
    if (userInput.trim().endsWith('--') && !userInput.endsWith(' ')) {
        userInput += ' ';
    }
    const passInput = password || '';
    let sqlQuery = '';

    if (configState.isVulnerable) {
        // VULNERABLE: Auth Bypass
        sqlQuery = `SELECT id, matricula_medica, nombre, apellido, email, especialidad_medica, departamento_hospital, rol, salario_anual FROM personal_medico_usuarios WHERE (email = '${userInput}' OR matricula_medica = '${userInput}') AND password_hash = '${passInput}'`;
        
        db.get(sqlQuery, (err, row) => {
            logQuery(sqlQuery, [], err);
            if (err) {
                return res.json({ 
                    success: false, 
                    message: 'Error de autenticación en el servidor hospitalario.',
                    sqlError: err.message,
                    executedQuery: sqlQuery
                });
            }
            if (row) {
                return res.json({ 
                    success: true, 
                    message: `Acceso concedido al Portal Médico, Dr(a). ${row.nombre} ${row.apellido} [Rol: ${row.rol.toUpperCase()}].`,
                    user: row,
                    executedQuery: sqlQuery
                });
            } else {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales inválidas. Matrícula o contraseña incorrecta.',
                    executedQuery: sqlQuery
                });
            }
        });
    } else {
        // SEGURO: Prepared Statement
        sqlQuery = `SELECT id, matricula_medica, nombre, apellido, email, especialidad_medica, departamento_hospital, rol, salario_anual FROM personal_medico_usuarios WHERE (email = ? OR matricula_medica = ?) AND password_hash = ?`;
        
        db.get(sqlQuery, [userInput, userInput, passInput], (err, row) => {
            logQuery(sqlQuery, [userInput, userInput, passInput], err);
            if (err) {
                return res.status(500).json({ success: false, message: 'Error de servidor SQL.', sqlError: err.message });
            }
            if (row) {
                return res.json({ 
                    success: true, 
                    message: `Bienvenido(a), Dr(a). ${row.nombre} ${row.apellido}.`,
                    user: row,
                    executedQuery: sqlQuery
                });
            } else {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales incorrectas.',
                    executedQuery: sqlQuery
                });
            }
        });
    }
});

// 3. EDICIÓN DE PERFIL MÉDICO (UPDATE SQLi / Escalado de Privilegios a Root SysAdmin)
app.post('/api/staff/profile', (req, res) => {
    const { email, especialidad, departamento } = req.body;
    let sqlQuery = '';

    if (configState.isVulnerable) {
        // VULNERABLE a UPDATE SQLi
        sqlQuery = `UPDATE personal_medico_usuarios SET especialidad_medica = '${especialidad}', departamento_hospital = '${departamento}' WHERE email = '${email}'`;

        db.run(sqlQuery, function(err) {
            logQuery(sqlQuery, [], err);
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al actualizar registro de personal médico.',
                    sqlError: err.message,
                    executedQuery: sqlQuery
                });
            }
            db.get(`SELECT id, matricula_medica, nombre, apellido, email, especialidad_medica, departamento_hospital, rol FROM personal_medico_usuarios WHERE email = '${email}'`, (e, updatedUser) => {
                return res.json({
                    success: true,
                    message: 'Perfil de personal médico actualizado.',
                    changes: this.changes,
                    updatedUser: updatedUser || null,
                    executedQuery: sqlQuery
                });
            });
        });
    } else {
        // SEGURO
        sqlQuery = `UPDATE personal_medico_usuarios SET especialidad_medica = ?, departamento_hospital = ? WHERE email = ?`;

        db.run(sqlQuery, [especialidad, departamento, email], function(err) {
            logQuery(sqlQuery, [especialidad, departamento, email], err);
            if (err) return res.status(500).json({ success: false, message: 'Error de servidor SQL.', sqlError: err.message });
            return res.json({
                success: true,
                message: 'Perfil médico actualizado de forma segura.',
                changes: this.changes,
                executedQuery: sqlQuery
            });
        });
    }
});

// -------------------------------------------------------------
// ENDPOINTS DE CONTROL Y DEVTOOLS DOCENTE
// -------------------------------------------------------------

app.get('/api/dev/status', (req, res) => {
    res.json({
        isVulnerable: configState.isVulnerable,
        lastExecutedQuery: configState.lastExecutedQuery,
        lastError: configState.lastError,
        queryHistory: configState.queryHistory
    });
});

app.post('/api/dev/toggle-mode', (req, res) => {
    configState.isVulnerable = !configState.isVulnerable;
    res.json({
        success: true,
        isVulnerable: configState.isVulnerable,
        message: configState.isVulnerable 
            ? '⚠️ Modo Vulnerable ACTIVADO (Concatenación de SQL activa).' 
            : '🛡️ Modo Seguro ACTIVADO (Consultas preparadas con Parameterized Queries).'
    });
});

app.get('/api/dev/db-tables', (req, res) => {
    db.all(`SELECT * FROM personal_medico_usuarios`, (err, personal) => {
        db.all(`SELECT * FROM historias_clinicas_pacientes`, (err2, historias) => {
            db.all(`SELECT * FROM equipamiento_y_farmacia`, (err3, farmacia) => {
                res.json({
                    personal_medico_usuarios: personal || [],
                    historias_clinicas_pacientes: historias || [],
                    equipamiento_y_farmacia: farmacia || []
                });
            });
        });
    });
});

app.post('/api/dev/reset-db', (req, res) => {
    resetDatabase().then(() => {
        configState.queryHistory = [];
        configState.lastExecutedQuery = 'Base de datos reiniciada por el profesor.';
        configState.lastError = null;
        res.json({ success: true, message: 'Base de datos de la Red Médica Santa María restablecida a su estado inicial.' });
    }).catch(err => {
        res.status(500).json({ success: false, message: 'Error al reiniciar la BD.' });
    });
});

// Inicializar base de datos y arrancar el servidor
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏥 Red Médica Santa María - Sitio Web Público & Sanatorio`);
        console.log(`🚀 Corriendo en: http://localhost:${PORT}`);
        console.log(`🛡️ Inspector SQL / DevTools habilitado para el profesor.`);
        console.log(`=======================================================`);
    });
});
