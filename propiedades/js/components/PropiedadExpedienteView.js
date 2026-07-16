import { propiedadesApi } from '/assets/js/api.js';
import { formatDate, formatCurrency, formatNumber, toast } from '/assets/js/utils.js';

export class PropiedadExpedienteView {
    constructor(containerId, onBack) {
        this.container = document.getElementById(containerId);
        this.onBack = onBack;
        this.expediente = null;
    }

    async loadExpediente(propiedadId) {
        try {
            this.container.innerHTML = `<div style="text-align:center; padding: 40px;">Cargando expediente...</div>`;
            this.expediente = await propiedadesApi.getExpediente(propiedadId);
            this.render();
        } catch (error) {
            toast('Error al cargar el expediente', 'error');
            console.error(error);
            this.onBack();
        }
    }

    render() {
        const p = this.expediente;
        const statusBadgeClass = p.status === 'disponible' ? 'badge-success' : p.status === 'reservada' ? 'badge-warning' : p.status === 'vendida' ? 'badge-muted' : p.status === 'rentada' ? 'badge-info' : 'badge-muted';

        const html = `
            <div class="expediente-header" style="display: flex; gap: 16px; align-items: center; margin-bottom: 24px;">
                <button class="btn btn-ghost" id="btn-back-expediente">
                    <svg viewBox="0 0 24 24" width="20" height="20"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Volver
                </button>
                <div>
                    <h2 style="margin: 0;">${p.titulo} <span class="badge ${statusBadgeClass}" style="font-size: var(--ts-xs); vertical-align: middle;">${p.status}</span></h2>
                    <span class="muted" style="font-size: var(--ts-sm);">Registrada el ${formatDate(p.fecha_registro)}</span>
                </div>
            </div>

            <div class="tabs" style="border-bottom: 1px solid var(--c-border); margin-bottom: 24px;">
                <span class="tab active" data-tab-target="exp-resumen">Resumen</span>
                <span class="tab" data-tab-target="exp-actividades">Actividades & Notas</span>
                <span class="tab" data-tab-target="exp-historial">Historial</span>
                <span class="tab" data-tab-target="exp-matches">Clientes Compatibles</span>
            </div>

            <!-- Resumen -->
            <div id="exp-resumen" class="exp-tab-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
                    
                    <!-- Ficha Comercial y Ubicación -->
                    <div class="card" style="padding: 24px;">
                        <h3 style="margin-top: 0; color: var(--c-accent);">Ficha Comercial & Ubicación</h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: var(--ts-sm);">
                            ${[
                                ['Tipo de Inmueble', p.tipo || '—'],
                                ['Tipo de Operación', p.tipo_operacion || '—'],
                                ['Precio', p.precio ? formatCurrency(p.precio) : '—'],
                                ['Precio Negociable', p.precio_negociable ? 'Sí' : 'No'],
                                ['Exclusiva', p.exclusiva ? 'Sí' : 'No'],
                                ['Comisión Asesor', p.comision ? `${p.comision}%` : '—'],
                                ['Comisión Compartida', p.comision_compartida ? `${p.comision_compartida}%` : '—'],
                                ['Fecha Captación', p.fecha_captacion ? formatDate(p.fecha_captacion) : '—'],
                                ['Propietario', p.propietario_nombre || '—'],
                                ['WhatsApp Propietario', p.propietario_whatsapp || '—'],
                                ['País', p.pais || '—'],
                                ['Estado', p.estado || '—'],
                                ['Municipio / Alcaldía', p.municipio || '—'],
                                ['Ciudad', p.ciudad || '—'],
                                ['Colonia', p.colonia || '—'],
                                ['Fraccionamiento / Residencial', p.fraccionamiento || '—'],
                                ['Código Postal', p.codigo_postal || '—'],
                            ].map(([k, v]) => `<tr style="border-bottom: 1px solid var(--c-border)"><td style="padding: 8px 0; color: var(--c-text-2); font-weight: 500;">${k}</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${v}</td></tr>`).join('')}
                        </table>
                    </div>

                    <!-- Detalles Físicos y Legales -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="card" style="padding: 24px;">
                            <h3 style="margin-top: 0; color: var(--c-accent);">Detalles Físicos</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: var(--ts-sm);">
                                ${[
                                    ['M² Construcción', p.m2_construccion ? `${formatNumber(p.m2_construccion)} m²` : '—'],
                                    ['M² Terreno', p.m2_terreno ? `${formatNumber(p.m2_terreno)} m²` : '—'],
                                    ['Frente / Fondo', p.frente && p.fondo ? `${formatNumber(p.frente)}m x ${formatNumber(p.fondo)}m` : '—'],
                                    ['Nivel / Niveles Totales', p.niveles || '1'],
                                    ['Recámaras Totales', p.recamaras || '0'],
                                    ['Recámaras en Planta Baja', p.recamaras_pb || '0'],
                                    ['Baños Completos', p.banos || '0'],
                                    ['Estacionamientos', p.estacionamientos || '0'],
                                    ['Antigüedad (Años)', p.antiguedad != null ? p.antiguedad : '—'],
                                    ['Año Construcción', p.anio_construccion || '—'],
                                    ['Estado Conservación', p.estado_conservacion || '—'],
                                    ['Remodelada', p.remodelada ? 'Sí' : 'No'],
                                    ['Orientación', p.orientacion || '—'],
                                ].map(([k, v]) => `<tr style="border-bottom: 1px solid var(--c-border)"><td style="padding: 6px 0; color: var(--c-text-2); font-weight: 500;">${k}</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${v}</td></tr>`).join('')}
                            </table>
                        </div>

                        <div class="card" style="padding: 24px;">
                            <h3 style="margin-top: 0; color: var(--c-accent);">Estatus Legal</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: var(--ts-sm);">
                                ${[
                                    ['Escrituras en Orden', p.escrituras ? 'Sí' : 'No'],
                                    ['Régimen de Propiedad', p.regimen || '—'],
                                    ['Libre de Gravamen', p.libre_gravamen ? 'Sí' : 'No'],
                                    ['Predial Pagado', p.predial ? 'Sí' : 'No'],
                                    ['Sin Adeudos de Servicios', p.adeudos ? 'Sí' : 'No'],
                                    ['Hipoteca Vigente', p.hipoteca_vigente ? 'Sí' : 'No'],
                                    ['Carpeta Legal Completa', p.documentacion_completa ? 'Sí' : 'No'],
                                ].map(([k, v]) => `<tr style="border-bottom: 1px solid var(--c-border)"><td style="padding: 6px 0; color: var(--c-text-2); font-weight: 500;">${k}</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${v}</td></tr>`).join('')}
                            </table>
                        </div>
                    </div>

                    <!-- Perfil del Comprador Ideal y Documentos -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="card" style="padding: 24px;">
                            <h3 style="margin-top: 0; color: var(--c-accent);">Perfil Comprador Ideal (Matching)</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: var(--ts-sm);">
                                ${[
                                    ['Ingreso Mensual Mínimo', p.ingreso_recomendado ? formatCurrency(p.ingreso_recomendado) : '—'],
                                    ['Tipo de Crédito Ideal', p.tipo_credito_ideal || '—'],
                                    ['Uso de Suelo', p.uso_suelo || '—'],
                                    ['Estado Civil Recomendado', p.estado_civil_ideal || '—'],
                                    ['Género Recomendado', p.genero_ideal || '—'],
                                    ['Integrantes Sugeridos', p.integrantes_ideal != null ? `${p.integrantes_ideal} personas` : '—'],
                                    ['Acepta Hijos / Mascotas', `${p.hijos_ideal ? 'Sí' : 'No'} / ${p.mascotas_ideal ? 'Sí' : 'No'}`],
                                ].map(([k, v]) => `<tr style="border-bottom: 1px solid var(--c-border)"><td style="padding: 6px 0; color: var(--c-text-2); font-weight: 500;">${k}</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${v}</td></tr>`).join('')}
                            </table>
                        </div>

                        <div class="card" style="padding: 24px;">
                            <h3 style="margin-top:0;">Carpeta de Documentos del Expediente</h3>
                            <form id="form-exp-documento" style="display:flex; gap:8px; margin-bottom: 16px;">
                                <input type="text" class="input" name="nombre_archivo" required placeholder="Nombre del documento..." style="flex:1; font-size:var(--ts-sm)"/>
                                <input type="text" class="input" name="url" required placeholder="URL/Link de descarga..." style="flex:1; font-size:var(--ts-sm)"/>
                                <button class="btn btn-primary btn-sm">Subir</button>
                            </form>
                            <div id="exp-documentos-list" style="display: flex; flex-direction: column; gap: 8px;">
                                ${this.renderDocumentos()}
                            </div>
                        </div>
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
                            <textarea class="textarea" name="contenido" rows="3" required placeholder="Escribe una nota interna para la propiedad..."></textarea>
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
                                <option value="Visita con Cliente">Visita con Cliente</option>
                                <option value="Llamada Propietario">Llamada con Propietario</option>
                                <option value="Mantenimiento / Limpieza">Mantenimiento / Limpieza</option>
                                <option value="Valuación / Tasación">Valuación / Tasación</option>
                                <option value="Sesión de Fotos">Sesión de Fotos / Video</option>
                                <option value="Reunión Comercial">Reunión Comercial</option>
                                <option value="Otro">Otro</option>
                            </select>
                            <textarea class="textarea" name="descripcion" rows="2" placeholder="Detalles de la actividad realizada..."></textarea>
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
                    <h3 style="margin-top: 0;">Historial de Auditoría de Cambios</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; border-left: 2px solid var(--c-border); margin-left: 10px;">
                        ${this.renderHistorial()}
                    </ul>
                </div>
            </div>

            <!-- Clientes Compatibles -->
            <div id="exp-matches" class="exp-tab-content" style="display: none;">
                <div class="card" style="padding: 24px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin: 0; display:flex; align-items:center; gap:8px;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--c-accent)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Clientes Más Compatibles (Matching CNA)
                        </h3>
                        <span class="badge badge-muted" id="prop-matches-count">Cargando...</span>
                    </div>
                    <div id="prop-recommendations-container" style="background: var(--c-surface-2); border: 1px solid var(--c-border); padding: 16px; border-radius: 12px; margin-bottom: 20px; font-size:var(--ts-sm);">
                        Cargando recomendaciones automáticas...
                    </div>
                    <div id="prop-matches-list">
                        <div class="skeleton" style="height:200px"></div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Bind events
        this.container.querySelector('#btn-back-expediente').addEventListener('click', this.onBack);
        
        const tabs = this.container.querySelectorAll('.tab');
        const contents = this.container.querySelectorAll('.exp-tab-content');
        let matchesLoaded = false;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                this.container.querySelector(`#${tab.dataset.tabTarget}`).style.display = 'block';
                
                // Lazy-load matches on opening the tab
                if (tab.dataset.tabTarget === 'exp-matches' && !matchesLoaded) {
                    matchesLoaded = true;
                    this.loadMatches();
                }
            });
        });

        // Form submissions
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

        this.container.querySelector('#form-exp-documento').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                nombre_archivo: e.target.nombre_archivo.value.trim(),
                url: e.target.url.value.trim(),
                tipo_documento: 'Expediente'
            };
            await this.addDocumento(data);
            e.target.reset();
        });
    }

    renderNotas() {
        if (!this.expediente.notas || !this.expediente.notas.length) {
            return `<div class="muted" style="font-size: var(--ts-sm);">No hay notas registradas.</div>`;
        }
        return this.expediente.notas.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(n => `
            <div style="background: var(--c-surface-2); padding: 12px; border: 1px solid var(--c-border); border-radius: 8px;">
                <div style="font-size: var(--ts-sm); margin-bottom: 4px;">${n.contenido}</div>
                <div class="muted" style="font-size: 0.75rem;">${formatDate(n.fecha)}</div>
            </div>
        `).join('');
    }

    renderActividades() {
        if (!this.expediente.actividades || !this.expediente.actividades.length) {
            return `<div class="muted" style="font-size: var(--ts-sm);">No hay actividades registradas.</div>`;
        }
        return this.expediente.actividades.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(a => `
            <div style="background: var(--c-surface-2); padding: 12px; border: 1px solid var(--c-border); border-radius: 8px;">
                <div style="font-weight: 600; font-size: var(--ts-sm); color: var(--c-accent);">${a.tipo}</div>
                ${a.descripcion ? `<div style="font-size: var(--ts-sm); margin-top: 4px;">${a.descripcion}</div>` : ''}
                <div class="muted" style="font-size: 0.75rem; margin-top: 6px;">${formatDate(a.fecha)}</div>
            </div>
        `).join('');
    }

    renderDocumentos() {
        if (!this.expediente.documentos || !this.expediente.documentos.length) {
            return `<div class="muted" style="font-size: var(--ts-sm);">No hay documentos cargados en el expediente.</div>`;
        }
        return this.expediente.documentos.map((doc, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--c-surface-2); border: 1px solid var(--c-border); border-radius: var(--r-sm); font-size: var(--ts-sm);">
                <span style="max-width: 75%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    📁 <a href="${doc.url}" target="_blank" style="font-weight: 500; color: var(--c-accent);">${doc.nombre_archivo}</a>
                </span>
                <button type="button" class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 0.75rem;" onclick="window.removeExpDocument(${doc.id_documento})">Eliminar</button>
            </div>
        `).join('');
    }

    renderHistorial() {
        if (!this.expediente.historial || !this.expediente.historial.length) {
            return `<li style="color:var(--c-text-2); font-size: var(--ts-sm);">No hay registros de historial de auditoría.</li>`;
        }
        return this.expediente.historial.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(h => `
            <li style="position: relative; padding-left: 20px; padding-bottom: 16px;">
                <div style="position: absolute; left: -5px; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--c-accent);"></div>
                <div style="font-weight: 600; font-size: var(--ts-sm); text-transform: uppercase;">${h.accion.replace('_', ' ')}</div>
                ${h.descripcion ? `<div style="font-size: var(--ts-sm); color: var(--c-text-2); margin-top: 2px;">${h.descripcion} ${h.campo ? `(Campo: <code>${h.campo}</code>)` : ''}</div>` : ''}
                ${h.valor_anterior || h.valor_nuevo ? `
                    <div style="font-size: 0.75rem; background: var(--c-surface-3); padding: 4px 8px; border-radius: 4px; margin-top: 4px; display: inline-block;">
                        <span style="text-decoration: line-through; color: var(--c-err);">${h.valor_anterior !== null ? h.valor_anterior : 'Nulo'}</span>
                        <span style="margin: 0 4px;">→</span>
                        <span style="color: var(--c-ok); font-weight: 600;">${h.valor_nuevo !== null ? h.valor_nuevo : 'Nulo'}</span>
                    </div>
                ` : ''}
                <div class="muted" style="font-size: 0.75rem; margin-top: 4px;">${formatDate(h.fecha)} por ${h.usuario || 'Sistema'}</div>
            </li>
        `).join('');
    }

    async addNota(data) {
        try {
            await propiedadesApi.addNota(this.expediente.id_propiedad, data);
            toast('Nota agregada correctamente');
            await this.loadExpediente(this.expediente.id_propiedad);
        } catch (e) {
            toast('Error al guardar nota', 'error');
            console.error(e);
        }
    }

    async addActividad(data) {
        try {
            await propiedadesApi.addActividad(this.expediente.id_propiedad, data);
            toast('Actividad registrada correctamente');
            await this.loadExpediente(this.expediente.id_propiedad);
        } catch (e) {
            toast('Error al registrar actividad', 'error');
            console.error(e);
        }
    }

    async addDocumento(data) {
        try {
            await propiedadesApi.addDocumento(this.expediente.id_propiedad, data);
            toast('Documento agregado al expediente');
            await this.loadExpediente(this.expediente.id_propiedad);
        } catch (e) {
            toast('Error al asociar documento', 'error');
            console.error(e);
        }
    }

    async removeDocumento(docId) {
        try {
            await propiedadesApi.removeDocumento(this.expediente.id_propiedad, docId);
            toast('Documento eliminado del expediente');
            await this.loadExpediente(this.expediente.id_propiedad);
        } catch (e) {
            toast('Error al eliminar documento', 'error');
            console.error(e);
        }
    }

    _scoreColor(s) {
        if (s >= 95) return '#22c55e';
        if (s >= 80) return '#60a5fa';
        if (s >= 70) return '#f59e0b';
        return '#ef4444';
    }

    _nivelLabelFromScore(score) {
        if (score == null) return '—';
        if (score >= 95) return 'Excelente';
        if (score >= 80) return 'Alta';
        if (score >= 70) return 'Media';
        return 'Baja';
    }

    renderRecommendations(matches = []) {
        const lines = [];
        if (matches.length) {
            const top = matches[0];
            if (top.score_total >= 95) {
                lines.push('La propiedad tiene clientes compatibles con un nivel excelente. Prioriza contactar a estos clientes.');
            } else if (top.score_total >= 80) {
                lines.push('Hay buenos prospectos compatibles. Pequeños ajustes en la oferta podrían aumentar la conversión.');
            } else if (top.score_total >= 70) {
                lines.push('Se identificaron clientes con compatibilidad media. Revisa si conviene ajustar el perfil ideal de compra.');
            } else {
                lines.push('No hay clientes altamente compatibles. Considera flexibilizar los requisitos de precio o evaluar el estatus legal.');
            }
            lines.push(`El cliente más compatible es <strong>${top.nombre_completo || `Cliente #${top.id_cliente}`}</strong> con un <strong>${(top.score_total||0).toFixed(1)}%</strong> de afinidad.`);
        } else {
            lines.push('No se encontraron clientes compatibles actualmente.');
            lines.push('Revisa el perfil ideal del comprador registrado para esta propiedad para ampliar el rango de matching.');
        }
        return `<div style="font-weight:700; margin-bottom:8px;">Recomendaciones Inteligentes</div>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                    ${lines.map(l => `<li>${l}</li>`).join('')}
                </ul>`;
    }

    async loadMatches() {
        const listEl = this.container.querySelector('#prop-matches-list');
        const recsEl = this.container.querySelector('#prop-recommendations-container');
        const countEl = this.container.querySelector('#prop-matches-count');
        
        if (!listEl) return;
        
        try {
            const matches = await propiedadesApi.propiedadMatches(this.expediente.id_propiedad, 20);
            if (!Array.isArray(matches) || !matches.length) {
                countEl.textContent = '0 clientes';
                recsEl.innerHTML = this.renderRecommendations([]);
                listEl.innerHTML = `
                    <div style="text-align:center; padding: 32px; color: var(--c-text-2)">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px; opacity:.4"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        <p>No se encontraron clientes compatibles con esta propiedad en este momento.</p>
                    </div>`;
                return;
            }

            countEl.textContent = `${matches.length} clientes`;
            recsEl.innerHTML = this.renderRecommendations(matches);

            listEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 8px;" id="match-cards-container">
                    ${matches.map((m, i) => {
                        const color = this._scoreColor(m.score_total || 0);
                        return `
                            <div style="display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 10px; background: var(--c-surface-2); border: 1px solid var(--c-border); cursor: pointer;" class="match-card" data-match-id="${m.id_cliente}">
                                <div>
                                    <div style="font-weight:600; font-size:var(--ts-sm); margin-bottom: 2px;">${m.nombre_completo || `Cliente #${m.id_cliente}`}</div>
                                    <div style="font-size: var(--ts-xs); color: var(--c-text-2)">
                                        Presupuesto: ${m.presupuesto_min ? formatCurrency(m.presupuesto_min) : '—'} - ${m.presupuesto_max ? formatCurrency(m.presupuesto_max) : '—'} · Operación: ${m.operacion || '—'}
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 52px; padding: 3px 10px; border-radius: 9999px; font-size: .70rem; font-weight: 700; background: ${color}22; color: ${color}">
                                        ${(m.score_total || 0).toFixed(1)}%
                                    </span>
                                    <button class="btn btn-ghost btn-sm btn-desglose" style="padding: 4px 8px; font-size: var(--ts-xs);" data-match-idx="${i}">Desglose</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div id="match-desglose-panel" style="display: none; margin-top: 20px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 14px; padding: 24px;"></div>
            `;

            // Bind desglose buttons
            listEl.querySelectorAll('.btn-desglose').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.matchIdx, 10);
                    this.showDesglose(matches[idx]);
                });
            });

            // Bind match card click to navigate to the client's page
            listEl.querySelectorAll('.match-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-desglose')) return;
                    const cId = card.dataset.matchId;
                    if (cId) {
                        window.location.href = `/clientes/?id_cliente=${cId}`;
                    }
                });
            });

        } catch (e) {
            countEl.textContent = 'Error';
            recsEl.textContent = 'Error al generar recomendaciones.';
            listEl.innerHTML = `<div style="color:var(--c-err); padding: 16px;">Error al cargar prospectos compatibles: ${e.message}</div>`;
            console.error(e);
        }
    }

    showDesglose(m) {
        const panel = this.container.querySelector('#match-desglose-panel');
        if (!panel) return;

        const scoreColor = this._scoreColor(m.score_total || 0);
        const nivelLabel = this._nivelLabelFromScore(m.score_total);

        const factores = [
            { label: 'Geográfico', peso: '25%', val: m.score_geo || 0, color: '#60a5fa' },
            { label: 'Económico', peso: '30%', val: m.score_economico || 0, color: '#22c55e' },
            { label: 'Físico', peso: '25%', val: m.score_fisico || 0, color: '#c9a227' },
            { label: 'Familiar', peso: '10%', val: m.score_familiar || 0, color: '#a78bfa' },
            { label: 'Demográfico', peso: '10%', val: m.score_demo || 0, color: '#f472b6' },
        ];

        panel.style.display = 'block';
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <h4 style="margin: 0; font-size: 1rem;">Desglose CNA: ${m.nombre_completo || `Cliente #${m.id_cliente}`}</h4>
                <button class="btn btn-ghost btn-sm" id="btn-close-desglose">✕ Cerrar Desglose</button>
            </div>
            
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
                <div style="font-size: 2rem; font-weight: 800; color: ${scoreColor};">${(m.score_total || 0).toFixed(1)}%</div>
                <div>
                    <span style="display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: .70rem; font-weight: 700; background: ${scoreColor}22; color: ${scoreColor}">
                        ${nivelLabel}
                    </span>
                    <div style="font-size: var(--ts-xs); color: var(--c-text-2); margin-top: 6px;">Nivel de compatibilidad general</div>
                </div>
            </div>

            ${factores.map(f => `
                <div style="margin-bottom: 12px;">
                    <div style="display:flex; justify-content:space-between; font-size: var(--ts-xs); color: var(--c-text-2); margin-bottom: 4px;">
                        <span>${f.label} (Peso: ${f.peso})</span>
                        <span style="font-weight: 600; color: ${f.color}">${f.val.toFixed(1)}%</span>
                    </div>
                    <div style="height: 6px; background: var(--c-surface-2); border-radius: 9999px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(f.val, 100)}%; background: ${f.color}; border-radius: 9999px; transition: width .5s ease;"></div>
                    </div>
                </div>
            `).join('')}

            <div style="margin-top: 16px; font-size: var(--ts-xs); color: var(--c-text-2); line-height: 1.5; background: var(--c-surface-2); border: 1px solid var(--c-border); padding: 12px; border-radius: 8px;">
                Este desglose muestra el porcentaje de cumplimiento para cada dimensión del perfil ideal. El score total se calcula multiplicando cada dimensión por su peso respectivo y sumándolos.
            </div>
        `;

        panel.querySelector('#btn-close-desglose').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Scroll to the panel
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Bind globally for removing documents (called from inline onclick in HTML)
window.removeExpDocument = async (docId) => {
    if (confirm('¿Está seguro de eliminar este documento del expediente?')) {
        // Encontrar la instancia activa
        const viewEl = document.getElementById('vista-expediente-propiedad');
        if (viewEl && window.activePropiedadExpedienteView) {
            await window.activePropiedadExpedienteView.removeDocumento(docId);
        }
    }
};
