// ==========================================================================
// RED MÉDICA SANTA MARÍA - CLIENTE INSTITUCIONAL & INSPECTOR DOCENTE
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    let currentUser = null;

    // -------------------------------------------------------------
    // 1. NAVEGACIÓN Y PESTAÑAS
    // -------------------------------------------------------------
    const navBtns = document.querySelectorAll('.nav-btn[data-target]');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            
            navBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // -------------------------------------------------------------
    // 2. BUSCADOR PÚBLICO DE ARTÍCULOS DE SALUD
    // -------------------------------------------------------------
    const healthSearchInput = document.getElementById('health-search-input');
    const btnSearchHealth = document.getElementById('btn-search-health');
    const healthSqlError = document.getElementById('health-sql-error');
    const healthSqlErrorText = document.getElementById('health-sql-error-text');
    const healthResultsMeta = document.getElementById('health-results-meta');
    const healthCount = document.getElementById('health-count');
    const healthResultsGrid = document.getElementById('health-results-grid');

    async function fetchHealthArticles(query = '') {
        healthSqlError.classList.add('hidden');
        healthResultsGrid.innerHTML = '';

        try {
            const res = await fetch(`/api/public/health-articles?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            updateLiveQuery();

            if (!data.success && data.sqlError) {
                healthSqlError.classList.remove('hidden');
                healthSqlErrorText.textContent = `${data.sqlError}\n\nConsulta SQL Executed:\n${data.executedQuery}`;
                healthResultsMeta.classList.add('hidden');
                return;
            }

            const articles = data.data || [];
            healthCount.textContent = articles.length;
            healthResultsMeta.classList.remove('hidden');

            if (articles.length === 0) {
                healthResultsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem; background: #fff; border: 1px solid #ccc; border-radius: 4px;">
                        <p>No se encontraron registros que coincidan con el criterio de búsqueda ingresado.</p>
                    </div>
                `;
                return;
            }

            articles.forEach(art => {
                const card = document.createElement('div');
                card.className = 'news-card';

                const titleText = String(art.titulo || 'Registro Sanitario');
                const categoryText = String(art.especialidad || 'INFORMACIÓN');
                const dateText = String(art.fecha_publicacion || '');
                const summaryText = art.resumen || art.contenido || '';

                card.innerHTML = `
                    <div class="news-meta">
                        <span class="news-category">${escapeHtml(categoryText)}</span>
                        <span class="news-date">${escapeHtml(dateText)}</span>
                    </div>
                    <div class="news-title">${escapeHtml(titleText)}</div>
                    <div class="news-summary">${formatSummaryText(summaryText)}</div>
                `;
                healthResultsGrid.appendChild(card);
            });

            // Ocultar cartel de error si los resultados se renderizaron bien
            healthSqlError.classList.add('hidden');

        } catch (err) {
            console.error('Health articles rendering error:', err);
            healthSqlError.classList.remove('hidden');
            healthSqlErrorText.textContent = `Error al procesar la respuesta: ${err.message}`;
        }
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatSummaryText(text) {
        if (text === null || text === undefined) return '';
        const strText = String(text);
        if (strText.includes('CREATE TABLE') || strText.includes('SELECT') || strText.includes('$2b$') || strText.includes('PIN-') || strText.includes('HC-') || strText.includes('MN-') || strText.includes('sqlite_')) {
            return `<code>${escapeHtml(strText)}</code>`;
        }
        return escapeHtml(strText);
    }

    btnSearchHealth.addEventListener('click', () => {
        fetchHealthArticles(healthSearchInput.value.trim());
    });

    healthSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchHealthArticles(healthSearchInput.value.trim());
    });

    // Cargar artículos por defecto
    fetchHealthArticles('');

    // -------------------------------------------------------------
    // 3. MODAL DE LOGIN
    // -------------------------------------------------------------
    const loginModal = document.getElementById('login-modal');
    const btnOpenLogin = document.getElementById('btn-open-login');
    const btnCloseLogin = document.getElementById('btn-close-login');
    const loginForm = document.getElementById('login-form');
    const loginErrorBox = document.getElementById('login-error-box');
    const userStatusText = document.getElementById('user-status-text');
    const navBtnProfile = document.getElementById('nav-btn-profile');
    const userBadgeInfo = document.getElementById('user-badge-info');

    btnOpenLogin.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    btnCloseLogin.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorBox.classList.add('hidden');

        const username = document.getElementById('login-user').value.trim();
        const password = document.getElementById('login-pass').value.trim();

        try {
            const res = await fetch('/api/auth/medical-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            updateLiveQuery();

            if (data.success) {
                currentUser = data.user;
                userStatusText.textContent = `Dr(a). ${currentUser.nombre}`;
                navBtnProfile.style.display = 'flex';
                loginModal.classList.add('hidden');

                document.getElementById('prof-email').value = currentUser.email;
                document.getElementById('prof-especialidad').value = currentUser.especialidad_medica;
                document.getElementById('prof-dept').value = currentUser.departamento_hospital;

                userBadgeInfo.innerHTML = `
                    <div style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 4px;">
                        <h3 style="color: var(--header-bg);"><i class="fa-solid fa-user-doctor"></i> Dr(a). ${currentUser.nombre} ${currentUser.apellido}</h3>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 0.3rem;">
                            Email: <code>${currentUser.email}</code> | Matrícula: <code>${currentUser.matricula_medica}</code> | 
                            Rol Asignado: <strong style="color: ${currentUser.rol.includes('root') ? 'red' : 'var(--primary)'}">${currentUser.rol.toUpperCase()}</strong> | 
                            Departamento: <strong>${currentUser.departamento_hospital}</strong>
                        </p>
                    </div>
                `;

                alert(`${data.message}`);
                navBtnProfile.click();
            } else {
                loginErrorBox.classList.remove('hidden');
                loginErrorBox.innerHTML = `
                    <div class="error-header">Acceso Denegado</div>
                    <div>${data.message}</div>
                    ${data.sqlError ? `<pre>SQL Error: ${data.sqlError}</pre>` : ''}
                `;
            }
        } catch (err) {
            loginErrorBox.classList.remove('hidden');
            loginErrorBox.textContent = 'Error al validar credenciales.';
        }
    });

    // -------------------------------------------------------------
    // 4. EDICIÓN DE PERFIL MÉDICO
    // -------------------------------------------------------------
    const profileForm = document.getElementById('profile-form');
    const profileResponseBox = document.getElementById('profile-response-box');

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        profileResponseBox.classList.add('hidden');

        const email = document.getElementById('prof-email').value.trim();
        const especialidad = document.getElementById('prof-especialidad').value.trim();
        const departamento = document.getElementById('prof-dept').value.trim();

        try {
            const res = await fetch('/api/staff/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, especialidad, departamento })
            });

            const data = await res.json();
            updateLiveQuery();

            profileResponseBox.classList.remove('hidden');

            if (data.success) {
                const updatedUser = data.updatedUser;
                const isRootNow = updatedUser && (updatedUser.rol.includes('root') || updatedUser.rol.includes('admin') || updatedUser.rol.includes('director'));
                
                profileResponseBox.className = `result-feedback-box ${isRootNow ? 'feedback-warning' : 'feedback-success'}`;
                profileResponseBox.innerHTML = `
                    <div><i class="fa-solid fa-check"></i> ${data.message}</div>
                    ${updatedUser ? `
                        <div style="margin-top: 8px; font-size: 0.85rem;">
                            <strong>Registro actualizado en Padrón:</strong><br>
                            Email: <code>${updatedUser.email}</code> | Rol: <strong style="color: ${isRootNow ? 'red' : 'green'}">${updatedUser.rol.toUpperCase()}</strong> | Especialidad: ${updatedUser.especialidad_medica}
                        </div>
                    ` : ''}
                `;
            } else {
                profileResponseBox.className = 'sql-error-banner';
                profileResponseBox.innerHTML = `<strong>Error:</strong> <pre>${data.sqlError || data.message}</pre>`;
            }
        } catch (err) {
            profileResponseBox.classList.remove('hidden');
            profileResponseBox.textContent = 'Error al actualizar perfil.';
        }
    });

    // -------------------------------------------------------------
    // 5. INSPECTOR DEVTOOLS PARA EL PROFESOR
    // -------------------------------------------------------------
    const btnToggleHud = document.getElementById('btn-toggle-hud');
    const btnCloseHud = document.getElementById('btn-close-hud');
    const hudDrawer = document.getElementById('hud-drawer');
    const btnSetVulnerable = document.getElementById('btn-set-vulnerable');
    const btnSetSecure = document.getElementById('btn-set-secure');
    const modeDescText = document.getElementById('mode-desc-text');
    const liveSqlCode = document.getElementById('live-sql-code');
    const btnRefreshStatus = document.getElementById('btn-refresh-status');
    const btnViewDb = document.getElementById('btn-view-db');
    const dbViewerContent = document.getElementById('db-viewer-content');
    const btnResetDb = document.getElementById('btn-reset-db');

    btnToggleHud.addEventListener('click', () => {
        hudDrawer.classList.toggle('hidden');
        updateLiveQuery();
    });

    btnCloseHud.addEventListener('click', () => {
        hudDrawer.classList.add('hidden');
    });

    async function updateLiveQuery() {
        try {
            const res = await fetch('/api/dev/status');
            const data = await res.json();

            liveSqlCode.textContent = data.lastExecutedQuery || 'Ninguna consulta ejecutada aún.';
            
            if (data.isVulnerable) {
                btnSetVulnerable.className = 'mode-toggle-btn active-vulnerable';
                btnSetSecure.className = 'mode-toggle-btn';
                modeDescText.textContent = 'Modo VULNERABLE (Concatenación de variables sin sanitizar en la consulta SQL).';
            } else {
                btnSetVulnerable.className = 'mode-toggle-btn';
                btnSetSecure.className = 'mode-toggle-btn active-secure';
                modeDescText.textContent = 'Modo SEGURO (Consultas preparadas con Parameterized Queries).';
            }
        } catch (err) {
            console.error('Error DevTools.');
        }
    }

    btnSetVulnerable.addEventListener('click', () => setMode(true));
    btnSetSecure.addEventListener('click', () => setMode(false));

    async function setMode(vulnerable) {
        try {
            const currentStatus = await fetch('/api/dev/status').then(r => r.json());
            if (currentStatus.isVulnerable !== vulnerable) {
                await fetch('/api/dev/toggle-mode', { method: 'POST' });
            }
            updateLiveQuery();
        } catch (err) {
            alert('Error al cambiar modo.');
        }
    }

    btnRefreshStatus.addEventListener('click', updateLiveQuery);

    // Inspector de BD
    btnViewDb.addEventListener('click', async () => {
        dbViewerContent.classList.toggle('hidden');
        if (!dbViewerContent.classList.contains('hidden')) {
            try {
                const res = await fetch('/api/dev/db-tables');
                const data = await res.json();
                
                let html = '<strong>personal_medico_usuarios</strong>';
                html += '<table class="db-table"><thead><tr><th>ID</th><th>Email</th><th>Rol</th><th>Hash</th></tr></thead><tbody>';
                (data.personal_medico_usuarios || []).forEach(u => {
                    html += `<tr><td>${u.id}</td><td>${u.email}</td><td><strong>${u.rol}</strong></td><td><code>${u.password_hash.substring(0, 10)}...</code></td></tr>`;
                });
                html += '</tbody></table>';

                html += '<strong>historias_clinicas_pacientes</strong>';
                html += '<table class="db-table"><thead><tr><th>Expediente</th><th>Paciente</th><th>DNI/SSN</th><th>Diagnóstico</th></tr></thead><tbody>';
                (data.historias_clinicas_pacientes || []).forEach(p => {
                    html += `<tr><td>${p.numero_expediente}</td><td>${p.nombre_paciente}</td><td>${p.dni_ssn}</td><td>${p.diagnostico_principal}</td></tr>`;
                });
                html += '</tbody></table>';

                html += '<strong>equipamiento_y_farmacia</strong>';
                html += '<table class="db-table"><thead><tr><th>Sustancia</th><th>Nombre</th><th>PIN Bóveda</th></tr></thead><tbody>';
                (data.equipamiento_y_farmacia || []).forEach(f => {
                    html += `<tr><td>${f.codigo_sustancia}</td><td>${f.nombre_medicamento}</td><td><code>${f.pin_boveda_narcoticos}</code></td></tr>`;
                });
                html += '</tbody></table>';

                dbViewerContent.innerHTML = html;
            } catch (err) {
                dbViewerContent.innerHTML = 'Error al consultar tablas.';
            }
        }
    });

    // Reiniciar BD
    btnResetDb.addEventListener('click', async () => {
        if (confirm('¿Restablecer la base de datos a su estado inicial?')) {
            try {
                const res = await fetch('/api/dev/reset-db', { method: 'POST' });
                const data = await res.json();
                alert(data.message);
                updateLiveQuery();
                fetchHealthArticles('');
            } catch (err) {
                alert('Error al reiniciar la BD.');
            }
        }
    });

    // Ejecutor de Payloads Interactivo desde la Guía
    document.querySelectorAll('.btn-run-payload').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.getAttribute('data-target');
            const payload = btn.getAttribute('data-payload');

            if (target === 'health') {
                // Activar pestaña de noticias de salud
                const navArticles = document.querySelector('.nav-btn[data-target="tab-articles"]');
                if (navArticles) navArticles.click();

                // Llenar el input y ejecutar la búsqueda
                healthSearchInput.value = payload;
                fetchHealthArticles(payload);
            } else if (target === 'login') {
                // Abrir modal de login y rellenar usuario
                const loginModal = document.getElementById('login-modal');
                if (loginModal) loginModal.classList.remove('hidden');
                const userInput = document.getElementById('login-user');
                if (userInput) userInput.value = payload;
            } else if (target === 'profile') {
                // Ir a pestaña de perfil y rellenar especialidad
                const navProfile = document.querySelector('.nav-btn[data-target="tab-profile"]');
                if (navProfile) navProfile.click();
                const specInput = document.getElementById('prof-especialidad');
                if (specInput) specInput.value = payload;
            }

            // Opcional: cerrar drawer en dispositivos móviles
            if (window.innerWidth < 768) {
                hudDrawer.classList.add('hidden');
            }
        });
    });

    updateLiveQuery();
});
