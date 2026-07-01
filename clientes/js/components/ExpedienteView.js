import { apiFetch } from './api.js';
import { formatDate, formatCurrency, toast } from '/assets/js/utils.js';

export class ExpedienteView {
    constructor(containerId, onBack) {
        this.container = document.getElementById(containerId);
        this.onBack = onBack;
        this.expediente = null;
    }

    async loadExpediente(clienteId) {
        try {
            this.container.innerHTML = `<div style="text-align:center; padding: 40px;">Cargando expediente...</div>`;
            this.expediente = await apiFetch(`/api/clientes/${clienteId}/expediente`);
            this.render();
        } catch (error) {
            toast('Error al cargar el expediente', 'error');
            console.error(error);
            this.onBack();
        }
    }

    render() {
        const c = this.expediente;
        const nombreCompleto = `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno || ''}`.trim();

        const html = `
            <div class="expediente-header" style="display: flex; gap: 16px; align-items: center; margin-bottom: 24px;">
                <button class="btn btn-ghost" id="btn-back-expediente">
                    <svg viewBox="0 0 24 24" width="20" height="20"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Volver
                </button>
                <div>
                    <h2 style="margin: 0;">${nombreCompleto} <span class="badge badge-info" style="font-size: var(--ts-xs); vertical-align: middle;">${c.estado_cliente}</span></h2>
                    <span class="muted" style="font-size: var(--ts-sm);">Registrado el ${formatDate(c.fecha_registro)}</span>
                </div>
            </div>

            <div class="tabs" style="border-bottom: 1px solid var(--c-border); margin-bottom: 24px;">
                <span class="tab active" data-tab-target="exp-resumen">Resumen</span>
                <span class="tab" data-tab-target="exp-actividades">Actividades & Notas</span>
                <span class="tab" data-tab-target="exp-historial">Historial</span>
                <span class="tab" data-tab-target="exp-cna">Customer Needs Analysis</span>
            </div>

            <!-- Resumen -->
            <div id="exp-resumen" class="exp-tab-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top: 0;">Información de Contacto</h3>
                        <p><strong>Teléfono:</strong> ${c.telefono_principal || 'N/A'}</p>
                        <p><strong>WhatsApp:</strong> ${c.whatsapp || 'N/A'}</p>
                        <p><strong>Correo:</strong> ${c.correo || 'N/A'}</p>
                        <p><strong>Dirección:</strong> ${c.direccion || 'N/A'}</p>
                    </div>
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top: 0;">Datos Personales</h3>
                        <p><strong>RFC / CURP:</strong> ${c.rfc || 'N/A'} / ${c.curp || 'N/A'}</p>
                        <p><strong>Fecha Nac.:</strong> ${c.fecha_nacimiento || 'N/A'}</p>
                        <p><strong>Estado Civil:</strong> ${c.estado_civil || 'N/A'}</p>
                        <p><strong>Ocupación:</strong> ${c.ocupacion || 'N/A'} en ${c.empresa || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <!-- Actividades & Notas -->
            <div id="exp-actividades" class="exp-tab-content" style="display: none;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    
                    <!-- Nueva Nota -->
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top:0;">Agregar Nota</h3>
                        <form id="form-nota">
                            <textarea class="textarea" name="contenido" rows="3" required placeholder="Escribe una nota rápida..."></textarea>
                            <button class="btn btn-primary btn-sm" style="margin-top: 12px;">Guardar Nota</button>
                        </form>
                        <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--c-border);"/>
                        <h4>Notas Recientes</h4>
                        <div id="notas-list" style="display: flex; flex-direction: column; gap: 12px;">
                            ${this.renderNotas()}
                        </div>
                    </div>

                    <!-- Nueva Actividad -->
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top:0;">Registrar Actividad</h3>
                        <form id="form-actividad">
                            <select class="select" name="tipo" style="margin-bottom: 12px;" required>
                                <option value="Llamada">Llamada</option>
                                <option value="Reunión">Reunión</option>
                                <option value="Visita">Visita a Propiedad</option>
                                <option value="Correo">Correo Electrónico</option>
                            </select>
                            <textarea class="textarea" name="descripcion" rows="2" placeholder="Detalles de la actividad..."></textarea>
                            <button class="btn btn-primary btn-sm" style="margin-top: 12px;">Registrar Actividad</button>
                        </form>
                        <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--c-border);"/>
                        <h4>Actividades</h4>
                        <div id="actividades-list" style="display: flex; flex-direction: column; gap: 12px;">
                            ${this.renderActividades()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historial -->
            <div id="exp-historial" class="exp-tab-content" style="display: none;">
                <div class="card" style="padding: 24px;">
                    <h3 style="margin-top: 0;">Registro de Auditoría</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; border-left: 2px solid var(--c-border); margin-left: 10px;">
                        ${this.renderHistorial()}
                    </ul>
                </div>
            </div>

            <!-- Customer Needs Analysis -->
            <div id="exp-cna" class="exp-tab-content" style="display: none;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                    <!-- Perfil CNA -->
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top: 0; display:flex; align-items:center; gap:8px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--c-accent)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Perfil CNA del Cliente
                        </h3>
                        ${this.renderCNAPerfil()}
                    </div>
                    <!-- Resumen rápido -->
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top: 0; display:flex; align-items:center; gap:8px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--c-accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Resumen CNA
                        </h3>
                        ${this.renderCNAResumen()}
                    </div>
                </div>
                <!-- Propiedades Compatibles -->
                <div class="card" style="padding: 24px; margin-top: 24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin: 0; display:flex; align-items:center; gap:8px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--c-accent)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                            Propiedades Compatibles
                        </h3>
                        <span class="badge badge-muted" id="cna-matches-count">Cargando...</span>
                    </div>
                    <div id="cna-matches-list"><div class="skeleton" style="height:200px"></div></div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Bind events
        this.container.querySelector('#btn-back-expediente').addEventListener('click', this.onBack);
        
        const tabs = this.container.querySelectorAll('.tab');
        const contents = this.container.querySelectorAll('.exp-tab-content');
        let cnaLoaded = false;
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                this.container.querySelector(`#${tab.dataset.tabTarget}`).style.display = 'block';
                // Lazy-load CNA matches on first open
                if (tab.dataset.tabTarget === 'exp-cna' && !cnaLoaded) {
                    cnaLoaded = true;
                    this.loadCNAMatches();
                }
            });
        });

        // Formularios
        this.container.querySelector('#form-nota').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = { contenido: e.target.contenido.value };
            await this.addNota(data);
            e.target.reset();
        });

        this.container.querySelector('#form-actividad').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = { tipo: e.target.tipo.value, descripcion: e.target.descripcion.value };
            await this.addActividad(data);
            e.target.reset();
        });
    }

    renderNotas() {
        if (!this.expediente.notas.length) return `<div class="muted" style="font-size: var(--ts-sm);">No hay notas registradas.</div>`;
        return this.expediente.notas.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(n => `
            <div style="background: var(--c-surface-2); padding: 12px; border-radius: 8px;">
                <div style="font-size: var(--ts-sm); margin-bottom: 4px;">${n.contenido}</div>
                <div class="muted" style="font-size: 0.75rem;">${formatDate(n.fecha)}</div>
            </div>
        `).join('');
    }

    renderActividades() {
        if (!this.expediente.actividades.length) return `<div class="muted" style="font-size: var(--ts-sm);">No hay actividades registradas.</div>`;
        return this.expediente.actividades.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(a => `
            <div style="background: var(--c-surface-2); padding: 12px; border-radius: 8px;">
                <div style="font-weight: 500; font-size: var(--ts-sm);">${a.tipo}</div>
                ${a.descripcion ? `<div style="font-size: var(--ts-sm); margin-top: 4px;">${a.descripcion}</div>` : ''}
                <div class="muted" style="font-size: 0.75rem; margin-top: 6px;">${formatDate(a.fecha)}</div>
            </div>
        `).join('');
    }

    renderHistorial() {
        if (!this.expediente.historial.length) return `<li>No hay registros de historial.</li>`;
        return this.expediente.historial.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(h => `
            <li style="position: relative; padding-left: 20px; padding-bottom: 16px;">
                <div style="position: absolute; left: -5px; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--c-primary);"></div>
                <div style="font-weight: 500; font-size: var(--ts-sm);">${h.accion.toUpperCase().replace('_', ' ')}</div>
                ${h.descripcion ? `<div style="font-size: var(--ts-sm); color: var(--c-text-2); margin-top: 2px;">${h.descripcion}</div>` : ''}
                <div class="muted" style="font-size: 0.75rem; margin-top: 4px;">${formatDate(h.fecha)} por ${h.usuario || 'Sistema'}</div>
            </li>
        `).join('');
    }

    async addNota(data) {
        try {
            await apiFetch(`/api/clientes/${this.expediente.id_cliente}/notas`, { method: 'POST', body: JSON.stringify(data) });
            toast('Nota agregada');
            await this.loadExpediente(this.expediente.id_cliente);
        } catch(e) {
            toast('Error al guardar nota', 'error');
        }
    }

    async addActividad(data) {
        try {
            await apiFetch(`/api/clientes/${this.expediente.id_cliente}/actividades`, { method: 'POST', body: JSON.stringify(data) });
            toast('Actividad registrada');
            await this.loadExpediente(this.expediente.id_cliente);
        } catch(e) {
            toast('Error al guardar actividad', 'error');
        }
    }

    // ── CNA Helpers ─────────────────────────────────────────────────

    _nivelColor(nivel) {
        const map = { excelente: 'score-excelente', alta: 'score-alta', media: 'score-media', baja: 'score-baja' };
        return map[nivel] || 'score-baja';
    }
    _nivelLabel(nivel) {
        const map = { excelente: 'Excelente', alta: 'Alta', media: 'Media', baja: 'Baja' };
        return map[nivel] || nivel || '—';
    }
    _scoreColor(s) {
        if (s >= 95) return '#22c55e';
        if (s >= 80) return '#60a5fa';
        if (s >= 70) return '#f59e0b';
        return '#ef4444';
    }

    renderCNAPerfil() {
        const c = this.expediente;
        const pmin = c.presupuesto_min != null ? formatCurrency(c.presupuesto_min) : '—';
        const pmax = c.presupuesto_max != null ? formatCurrency(c.presupuesto_max) : '—';
        const rows = [
            ['Tipo de propiedad',   c.tipo_propiedad   || '—'],
            ['Tipo de crédito',     c.tipo_credito     || '—'],
            ['Presupuesto mínimo',  pmin],
            ['Presupuesto máximo',  pmax],
            ['Estado de búsqueda',  c.estado_busqueda  || '—'],
            ['Ciudad de búsqueda',  c.ciudad_busqueda  || '—'],
            ['Zona / Fraccionamiento', c.fraccionamiento_colonia || '—'],
            ['Recámaras deseadas',  c.habitaciones_pa != null ? c.habitaciones_pa : '—'],
            ['Baños deseados',      c.banos != null ? c.banos : '—'],
            ['Estacionamientos',    c.estacionamiento != null ? c.estacionamiento : '—'],
            ['Antigüedad máx.',     c.antiguedad_max != null ? `${c.antiguedad_max} años` : '—'],
            ['Integrantes del hogar', c.integrantes_hogar != null ? c.integrantes_hogar : '—'],
            ['Mascotas',            c.mascotas != null ? c.mascotas : '—'],
            ['Ingreso mensual',     c.ingreso_mensual != null ? formatCurrency(c.ingreso_mensual) : '—'],
        ];
        return `<table style="width:100%;font-size:var(--ts-sm);border-collapse:collapse">${
            rows.map(([k,v]) => `<tr>
                <td style="padding:6px 0;color:var(--c-text-2);width:55%">${k}</td>
                <td style="padding:6px 0;font-weight:500;text-align:right">${v}</td>
            </tr>`).join('')
        }</table>`;
    }

    renderCNAResumen() {
        const c = this.expediente;
        const presupuesto = c.presupuesto_max != null ? formatCurrency(c.presupuesto_max) : (c.presupuesto_min != null ? formatCurrency(c.presupuesto_min) : '—');
        const items = [
            { label: 'Presupuesto', value: presupuesto, color: 'var(--c-accent)' },
            { label: 'Tipo de crédito', value: c.tipo_credito || '—', color: 'var(--c-info)' },
            { label: 'Propiedad buscada', value: c.tipo_propiedad || '—', color: 'var(--c-ok)' },
            { label: 'Zona', value: c.ciudad_busqueda || c.estado_busqueda || '—', color: 'var(--c-warn)' },
        ];
        return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${
            items.map(i => `<div style="background:var(--c-surface-2);border-radius:8px;padding:12px">
                <div style="font-size:var(--ts-xs);color:var(--c-text-2);margin-bottom:4px">${i.label}</div>
                <div style="font-weight:600;color:${i.color};font-size:var(--ts-sm)">${i.value}</div>
            </div>`).join('')
        }</div>`;
    }

    async loadCNAMatches() {
        const listEl  = this.container.querySelector('#cna-matches-list');
        const countEl = this.container.querySelector('#cna-matches-count');
        if (!listEl) return;
        try {
            const matches = await apiFetch(`/api/clientes/${this.expediente.id_cliente}/matches?limit=20`);
            if (!Array.isArray(matches) || !matches.length) {
                countEl.textContent = '0 resultados';
                listEl.innerHTML = `<div style="text-align:center;padding:32px;color:var(--c-text-2)">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;opacity:.4"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <p>No se encontraron propiedades compatibles con este cliente.</p>
                </div>`;
                return;
            }
            countEl.textContent = `${matches.length} propiedades`;
            let selectedMatch = null;
            listEl.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:8px" id="cna-match-cards">${
                    matches.map((m, i) => {
                        const color = this._scoreColor(m.score_total || 0);
                        return `<div style="display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;
                            padding:14px 16px;border-radius:10px;background:var(--c-surface-2);
                            border:1px solid var(--c-border);transition:border-color .18s ease">
                            <div>
                                <div style="font-weight:600;font-size:var(--ts-sm);margin-bottom:2px">${m.titulo || `Propiedad #${m.id_propiedad}`}</div>
                                <div style="font-size:var(--ts-xs);color:var(--c-text-2)">
                                    ${m.tipo || '—'} · ${m.ciudad || '—'}
                                    ${m.precio != null ? ` · ${formatCurrency(m.precio)}` : ''}
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:8px">
                                <span style="display:inline-flex;align-items:center;justify-content:center;min-width:52px;
                                    padding:3px 10px;border-radius:9999px;font-size:.70rem;font-weight:700;
                                    background:${color}22;color:${color}">
                                    ${(m.score_total || 0).toFixed(1)}%
                                </span>
                                <button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:var(--ts-xs)" data-cna-idx="${i}">Desglose</button>
                            </div>
                        </div>`;
                    }).join('')
                }</div>
                <!-- Score Modal Inline -->
                <div id="cna-score-modal" style="display:none;margin-top:20px;background:var(--c-surface);border:1px solid var(--c-border-a);
                    border-radius:14px;padding:24px"></div>`;

            // Bind desglose buttons
            listEl.querySelectorAll('[data-cna-idx]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.cnzIdx || btn.dataset.cnaIdx);
                    const m = matches[idx];
                    const modalEl = listEl.querySelector('#cna-score-modal');
                    const factores = [
                        { label: 'Geográfico',  peso: 25, val: m.score_geo       || 0, color: '#60a5fa' },
                        { label: 'Económico',   peso: 30, val: m.score_economico  || 0, color: '#22c55e' },
                        { label: 'Físico',      peso: 25, val: m.score_fisico     || 0, color: '#c9a227' },
                        { label: 'Familiar',    peso: 10, val: m.score_familiar   || 0, color: '#a78bfa' },
                        { label: 'Demográfico', peso: 10, val: m.score_demo       || 0, color: '#f472b6' },
                    ];
                    const scoreColor = this._scoreColor(m.score_total || 0);
                    const nivelLabel = this._nivelLabel(m.nivel);
                    modalEl.style.display = 'block';
                    modalEl.innerHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                            <h4 style="margin:0">Desglose: ${m.titulo || `Propiedad #${m.id_propiedad}`}</h4>
                            <button class="btn btn-ghost btn-sm" id="close-cna-modal">✕ Cerrar</button>
                        </div>
                        <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px">
                            <div style="font-size:2rem;font-weight:800;color:${scoreColor}">${(m.score_total||0).toFixed(1)}%</div>
                            <div>
                                <span style="display:inline-flex;padding:4px 12px;border-radius:9999px;font-size:.70rem;
                                    font-weight:700;background:${scoreColor}22;color:${scoreColor}">${nivelLabel}</span>
                                <div style="font-size:var(--ts-xs);color:var(--c-text-2);margin-top:6px">Nivel de compatibilidad</div>
                            </div>
                        </div>
                        ${factores.map(f => `
                            <div style="margin-bottom:10px">
                                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                                    <span style="font-size:var(--ts-xs);color:var(--c-text-2)">${f.label} (${f.peso}%)</span>
                                    <span style="font-size:var(--ts-xs);font-weight:600;color:${f.color}">${f.val.toFixed(1)}</span>
                                </div>
                                <div style="height:5px;background:var(--c-surface-3);border-radius:9999px;overflow:hidden">
                                    <div style="height:100%;width:${Math.min(f.val,100)}%;background:${f.color};border-radius:9999px;transition:width .5s ease"></div>
                                </div>
                            </div>`).join('')}
                        <table style="width:100%;border-collapse:collapse;font-size:var(--ts-xs);margin-top:12px">
                            <thead><tr style="background:var(--c-surface-3)">
                                <th style="padding:6px 10px;text-align:left">Factor</th>
                                <th style="padding:6px 10px;text-align:right">Peso</th>
                                <th style="padding:6px 10px;text-align:right">Resultado</th>
                                <th style="padding:6px 10px;text-align:right">Contribución</th>
                            </tr></thead>
                            <tbody>${factores.map(f=>`<tr style="border-bottom:1px solid var(--c-border)">
                                <td style="padding:6px 10px">${f.label}</td>
                                <td style="padding:6px 10px;text-align:right;color:var(--c-text-2)">${f.peso}%</td>
                                <td style="padding:6px 10px;text-align:right;font-weight:600;color:${f.color}">${f.val.toFixed(1)}</td>
                                <td style="padding:6px 10px;text-align:right">${(f.val*f.peso/100).toFixed(1)}</td>
                            </tr>`).join('')}
                            <tr style="background:var(--c-surface-3);font-weight:700">
                                <td colspan="3" style="padding:6px 10px">Score Total</td>
                                <td style="padding:6px 10px;text-align:right;color:${scoreColor}">${(m.score_total||0).toFixed(2)}</td>
                            </tr></tbody>
                        </table>`;
                    modalEl.querySelector('#close-cna-modal').addEventListener('click', () => {
                        modalEl.style.display = 'none';
                    });
                });
            });
        } catch(e) {
            if (countEl) countEl.textContent = 'Error';
            if (listEl) listEl.innerHTML = `<div style="color:var(--c-err);padding:16px">Error al cargar las propiedades compatibles: ${e.message}</div>`;
        }
    }
}
