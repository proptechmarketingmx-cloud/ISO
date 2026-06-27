import { apiFetch } from './api.js';
import { formatDate, toast } from '/assets/js/utils.js';

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
        `;

        this.container.innerHTML = html;

        // Bind events
        this.container.querySelector('#btn-back-expediente').addEventListener('click', this.onBack);
        
        const tabs = this.container.querySelectorAll('.tab');
        const contents = this.container.querySelectorAll('.exp-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                this.container.querySelector(`#${tab.dataset.tabTarget}`).style.display = 'block';
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
}
