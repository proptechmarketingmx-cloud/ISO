import { apiFetch } from './api.js';
import { toast, openModal, closeModal } from '/assets/js/utils.js';
import { CATALOGOS, opcionesHTML, calcularEdad, calcularGeneracion, inferirLada, renderCheckboxes, llenarSelect } from '/assets/js/catalogos.js';

export class ClienteForm {
    constructor(onSaved) {
        this.onSaved = onSaved;
        this.clienteId = null;
        this.renderModal();
    }

    renderModal() {
        const modalHtml = `
        <style>
        .cf-modal-tabs {
            display: flex;
            gap: 4px;
            border-bottom: 1px solid var(--c-border);
            padding: 8px 16px 0;
            background: var(--c-surface-2);
            overflow-x: auto;
        }
        .cf-modal-tab {
            padding: 10px 14px;
            font-size: var(--ts-sm);
            color: var(--c-text-2);
            border-bottom: 2px solid transparent;
            font-weight: 500;
            transition: all var(--t);
            white-space: nowrap;
            background: none;
            border: none;
            cursor: pointer;
        }
        .cf-modal-tab:hover {
            color: var(--c-text);
            background: rgba(255,255,255,0.02);
        }
        .cf-modal-tab.active {
            color: var(--c-accent);
            border-bottom-color: var(--c-accent);
            background: rgba(201, 162, 39, 0.05);
        }
        .cf-tab-content {
            display: none;
            padding: 24px;
            max-height: 55vh;
            overflow-y: auto;
        }
        .cf-tab-content.active {
            display: block;
            animation: fadeIn var(--t) ease;
        }
        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
            padding: 10px 0;
        }
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: var(--ts-sm);
            color: var(--c-text-2);
            cursor: pointer;
        }
        .checkbox-label input {
            accent-color: var(--c-accent);
        }
        .form-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }
        @media (max-width: 768px) {
            .form-grid-3 {
                grid-template-columns: 1fr 1fr;
            }
        }
        </style>

        <div class="modal-overlay" id="modal-cliente-form">
          <div class="modal" style="max-width: 900px; width:95%">
            <div class="modal-header">
              <span class="modal-title" id="cf-title">Nuevo Cliente</span>
              <button class="modal-close" id="cf-close-btn" type="button">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form id="cliente-form-el" novalidate>
                <div class="cf-modal-tabs">
                    <button type="button" class="cf-modal-tab active" data-tab-target="cf-identificacion">Identificación</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-contacto">Contacto</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-demografico">Perfil Demográfico</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-familiar">Perfil Familiar</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-financiero">Perfil Financiero</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-necesidad">Necesidad Inmueble</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-seguimiento">Seguimiento</button>
                    <button type="button" class="cf-modal-tab" data-tab-target="cf-score">Scores CNA</button>
                </div>
                
                <div class="modal-body" style="padding: 0;">
                    
                    <!-- TAB: IDENTIFICACION -->
                    <div id="cf-identificacion" class="cf-tab-content active">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" class="input" name="nombre" required placeholder="Nombre(s)" />
                            </div>
                            <div class="form-group">
                                <label>Apellido Paterno *</label>
                                <input type="text" class="input" name="apellido_paterno" required placeholder="Primer apellido" />
                            </div>
                            <div class="form-group">
                                <label>Apellido Materno</label>
                                <input type="text" class="input" name="apellido_materno" placeholder="Segundo apellido" />
                            </div>
                            <div class="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input type="date" class="input" name="fecha_nacimiento" id="cf-fecha-nacimiento" />
                            </div>
                            <div class="form-group">
                                <label>Edad (Auto)</label>
                                <input type="number" class="input" name="edad" id="cf-edad" readonly style="background:var(--c-surface); color:var(--c-accent);" />
                            </div>
                            <div class="form-group">
                                <label>Generación (Auto)</label>
                                <input type="text" class="input" name="generacion" id="cf-generacion" readonly style="background:var(--c-surface); color:var(--c-accent);" />
                            </div>
                            <div class="form-group">
                                <label>Género</label>
                                <select class="select" name="genero" id="cf-genero"></select>
                            </div>
                            <div class="form-group">
                                <label>Estado Civil</label>
                                <select class="select" name="estado_civil" id="cf-estado-civil"></select>
                            </div>
                            <div class="form-group">
                                <label>Nacionalidad</label>
                                <input type="text" class="input" name="nacionalidad" placeholder="Ej. Mexicana" />
                            </div>
                            <div class="form-group">
                                <label>CURP</label>
                                <input type="text" class="input" name="curp" maxlength="18" placeholder="18 caracteres" style="text-transform: uppercase;" />
                            </div>
                            <div class="form-group">
                                <label>RFC</label>
                                <input type="text" class="input" name="rfc" maxlength="13" placeholder="13 caracteres" style="text-transform: uppercase;" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- TAB: CONTACTO -->
                    <div id="cf-contacto" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Teléfono Principal</label>
                                <input type="tel" class="input" name="telefono_principal" id="cf-telefono" />
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" class="input" name="whatsapp" id="cf-whatsapp" placeholder="+52..." />
                            </div>
                            <div class="form-group">
                                <label>Lada Internacional (Auto)</label>
                                <input type="text" class="input" name="lada" id="cf-lada" readonly style="background:var(--c-surface);" />
                            </div>
                            <div class="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" class="input" name="correo" placeholder="correo@ejemplo.com" />
                            </div>
                            <div class="form-group">
                                <label>País</label>
                                <select class="select" name="pais" id="cf-pais"></select>
                            </div>
                            <div class="form-group">
                                <label>Estado</label>
                                <select class="select" name="estado" id="cf-estado"></select>
                            </div>
                            <div class="form-group">
                                <label>Municipio / Ciudad</label>
                                <input type="text" class="input" name="municipio" placeholder="Municipio" />
                            </div>
                            <div class="form-group">
                                <label>Colonia</label>
                                <input type="text" class="input" name="colonia" placeholder="Colonia" />
                            </div>
                            <div class="form-group">
                                <label>Fraccionamiento</label>
                                <input type="text" class="input" name="fraccionamiento" placeholder="Fraccionamiento" />
                            </div>
                            <div class="form-group">
                                <label>Código Postal</label>
                                <input type="text" class="input" name="codigo_postal" placeholder="91000" />
                            </div>
                            <div class="form-group span-2">
                                <label>Dirección Completa</label>
                                <textarea class="textarea" name="direccion" placeholder="Calle, número, etc."></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- TAB: PERFIL DEMOGRAFICO -->
                    <div id="cf-demografico" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Profesión</label>
                                <input type="text" class="input" name="profesion" placeholder="Ej. Abogado" />
                            </div>
                            <div class="form-group">
                                <label>Puesto / Cargo</label>
                                <input type="text" class="input" name="puesto" placeholder="Ej. Gerente Regional" />
                            </div>
                            <div class="form-group">
                                <label>Escolaridad</label>
                                <select class="select" name="escolaridad" id="cf-escolaridad"></select>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: PERFIL FAMILIAR -->
                    <div id="cf-familiar" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nombre del Cónyuge</label>
                                <input type="text" class="input" name="conyuge" placeholder="Nombre completo cónyuge" />
                            </div>
                            <div class="form-group">
                                <label>WhatsApp Cónyuge</label>
                                <input type="tel" class="input" name="conyuge_whatsapp" placeholder="+52..." />
                            </div>
                            <div class="form-group">
                                <label>Hijos (Total)</label>
                                <input type="number" class="input" name="hijos" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Mascotas (Total)</label>
                                <input type="number" class="input" name="mascotas" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Integrantes del Hogar</label>
                                <input type="number" class="input" name="integrantes_hogar" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Dependientes Económicos</label>
                                <input type="number" class="input" name="dependientes_eco" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Adultos Mayores a Cargo</label>
                                <input type="number" class="input" name="adultos_mayores_cargo" min="0" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    <!-- TAB: PERFIL FINANCIERO -->
                    <div id="cf-financiero" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Empresa</label>
                                <input type="text" class="input" name="nombre_empresa" placeholder="Empresa donde labora" />
                            </div>
                            <div class="form-group">
                                <label>Ocupación / Giro</label>
                                <input type="text" class="input" name="ocupacion" placeholder="Giro de la empresa" />
                            </div>
                            <div class="form-group">
                                <label>Antigüedad Laboral</label>
                                <input type="text" class="input" name="antiguedad_laboral" placeholder="Ej. 3 años" />
                            </div>
                            <div class="form-group">
                                <label>Ingreso Mensual (MXN)</label>
                                <input type="number" class="input" name="ingreso_mensual" placeholder="0.00" min="0" />
                            </div>
                            <div class="form-group">
                                <label>Tipo de Crédito</label>
                                <select class="select" name="tipo_credito" id="cf-tipo-credito"></select>
                            </div>
                            <div class="form-group">
                                <label>Presupuesto Mínimo</label>
                                <input type="number" class="input" name="presupuesto_min" placeholder="0.00" min="0" />
                            </div>
                            <div class="form-group">
                                <label>Presupuesto Máximo</label>
                                <input type="number" class="input" name="presupuesto_max" placeholder="0.00" min="0" />
                            </div>
                            <div class="form-group">
                                <label>Enganche Disponible</label>
                                <input type="number" class="input" name="enganche_disponible" placeholder="0.00" min="0" />
                            </div>
                            <div class="form-group">
                                <label>Pago Mensual Objetivo</label>
                                <input type="number" class="input" name="pago_mensual_objetivo" placeholder="0.00" min="0" />
                            </div>
                            <div class="form-group">
                                <label>Capacidad Máxima de Crédito</label>
                                <input type="number" class="input" name="capacidad_credito_max" placeholder="0.00" min="0" />
                            </div>
                        </div>
                    </div>

                    <!-- TAB: NECESIDAD INMUEBLE -->
                    <div id="cf-necesidad" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Operación</label>
                                <select class="select" name="operacion" id="cf-necesidad-operacion"></select>
                            </div>
                            <div class="form-group">
                                <label>Tipo de Propiedad</label>
                                <select class="select" name="tipo_propiedad" id="cf-necesidad-tipo"></select>
                            </div>
                            <div class="form-group">
                                <label>Estado (Búsqueda)</label>
                                <select class="select" name="estado_busqueda" id="cf-necesidad-estado"></select>
                            </div>
                            <div class="form-group">
                                <label>Ciudad / Municipio (Búsqueda)</label>
                                <input type="text" class="input" name="ciudad_busqueda" placeholder="Ej. Veracruz" />
                            </div>
                            <div class="form-group span-2">
                                <label>Zonas / Colonias Deseadas</label>
                                <input type="text" class="input" name="fraccionamiento_colonia" placeholder="Ej. Fracc. Costa de Oro, Reforma..." />
                            </div>
                            <div class="form-group">
                                <label>Recámaras PA Mínimas</label>
                                <input type="number" class="input" name="habitaciones_pa" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Recámaras PB Mínimas</label>
                                <input type="number" class="input" name="habitaciones_pb" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Baños Mínimos</label>
                                <input type="number" class="input" name="banos" min="0" step="0.5" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Estacionamientos Mínimos</label>
                                <input type="number" class="input" name="estacionamiento" min="0" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Terreno Mínimo (m²)</label>
                                <input type="number" class="input" name="m2_terreno_min" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Terreno Máximo (m²)</label>
                                <input type="number" class="input" name="m2_terreno_max" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Construcción Mínima (m²)</label>
                                <input type="number" class="input" name="m2_construccion_min" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Construcción Máxima (m²)</label>
                                <input type="number" class="input" name="m2_construccion_max" placeholder="0" />
                            </div>
                            <div class="form-group">
                                <label>Niveles Máximos</label>
                                <input type="number" class="input" name="niveles_max" min="1" placeholder="99" />
                            </div>
                            <div class="form-group">
                                <label>Antigüedad Máxima (Años)</label>
                                <input type="number" class="input" name="antiguedad_max" min="0" placeholder="99" />
                            </div>
                            <div class="form-group">
                                <label>Motivación de Compra</label>
                                <select class="select" name="motivacion" id="cf-motivacion"></select>
                            </div>
                            <div class="form-group span-2">
                                <label>Amenidades Deseadas</label>
                                <div class="checkbox-grid" id="cf-amenidades-container"></div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: SEGUIMIENTO -->
                    <div id="cf-seguimiento" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Asesor Comercial</label>
                                <select class="select" name="id_asesor" id="cf-asesor"></select>
                            </div>
                            <div class="form-group">
                                <label>Estatus del Lead *</label>
                                <select class="select" name="estado_cliente" required>
                                    <option value="nuevo">Nuevo Prospecto</option>
                                    <option value="contactado">Contactado</option>
                                    <option value="cotizacion">Cotización</option>
                                    <option value="negociacion">En Negociación</option>
                                    <option value="cerrado">Cerrado / Compra</option>
                                    <option value="perdido">Perdido</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Temporalidad de Compra</label>
                                <select class="select" name="temporalidad" id="cf-temporalidad"></select>
                            </div>
                            <div class="form-group">
                                <label>Referido por / Recomendado por</label>
                                <input type="text" class="input" name="referenciado" placeholder="Nombre de quien refiere" />
                            </div>
                            <div class="form-group">
                                <label>Origen del Lead / Fuente</label>
                                <select class="select" name="fuente_lead" id="cf-fuente-lead"></select>
                            </div>
                            <div class="form-group">
                                <label>Campaña</label>
                                <input type="text" class="input" name="campana" placeholder="Ej. Google Ads Veracruz" />
                            </div>
                            <div class="form-group">
                                <label>Medio de Adquisición</label>
                                <select class="select" name="medio_adquisicion" id="cf-medio-adquisicion"></select>
                            </div>
                            <div class="form-group">
                                <label>UTM Source</label>
                                <input type="text" class="input" name="utm_source" placeholder="utm_source" />
                            </div>
                            <div class="form-group">
                                <label>UTM Medium</label>
                                <input type="text" class="input" name="utm_medium" placeholder="utm_medium" />
                            </div>
                            <div class="form-group">
                                <label>UTM Campaign</label>
                                <input type="text" class="input" name="utm_campaign" placeholder="utm_campaign" />
                            </div>
                        </div>
                    </div>

                    <!-- TAB: SCORES CNA -->
                    <div id="cf-score" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Score CNA (Red de Relaciones)</label>
                                <input type="text" class="input" name="score_cna" readonly style="background:var(--c-surface); color:var(--c-accent); font-weight:600;" placeholder="Se calcula en base a referencias" />
                            </div>
                            <div class="form-group">
                                <label>Compatibilidad Promedio con Propiedades</label>
                                <input type="text" class="input" name="score_compatibilidad" readonly style="background:var(--c-surface); color:var(--c-accent); font-weight:600;" placeholder="Se calcula con el motor de matching" />
                            </div>
                        </div>
                        <div id="cf-matches-panel" style="margin-top: 24px;">
                            <h3 style="font-size: var(--ts-md); font-weight:600; margin-bottom:12px;">Top Propiedades Compatibles</h3>
                            <div id="cf-matches-list" style="display:flex; flex-direction:column; gap:8px;">
                                <p style="color:var(--c-text-3); font-size:var(--ts-sm);">Guarde el cliente para calcular las compatibilidades en tiempo real.</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-ghost" id="cf-cancel-btn">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Cliente</button>
                </div>
            </form>
          </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.modal = document.getElementById('modal-cliente-form');
        this.form = document.getElementById('cliente-form-el');
        
        // Inicializar dropdowns usando catálogos maestros
        llenarSelect(this.form.elements['genero'], CATALOGOS.generos);
        llenarSelect(this.form.elements['estado_civil'], CATALOGOS.estadosCiviles);
        llenarSelect(this.form.elements['escolaridad'], CATALOGOS.escolaridades);
        llenarSelect(this.form.elements['tipo_credito'], CATALOGOS.tiposCredito);
        llenarSelect(this.form.elements['pais'], CATALOGOS.paises);
        llenarSelect(this.form.elements['estado'], CATALOGOS.estados);
        llenarSelect(this.form.elements['operacion'], CATALOGOS.operaciones);
        llenarSelect(this.form.elements['tipo_propiedad'], CATALOGOS.tiposPropiedad);
        llenarSelect(this.form.elements['estado_busqueda'], CATALOGOS.estados);
        llenarSelect(this.form.elements['motivacion'], CATALOGOS.motivaciones);
        llenarSelect(this.form.elements['temporalidad'], CATALOGOS.temporalidades);
        llenarSelect(this.form.elements['fuente_lead'], CATALOGOS.fuentesLead);
        llenarSelect(this.form.elements['medio_adquisicion'], CATALOGOS.mediosAdquisicion);

        // Cargar asesores
        this.loadAsesoresSelect();

        // Renderizar checkbox grids
        renderCheckboxes('cf-amenidades-container', CATALOGOS.amenidades, 'amenidades_deseadas');

        // Lógica de Tabs
        const tabs = this.modal.querySelectorAll('.cf-modal-tab');
        const contents = this.modal.querySelectorAll('.cf-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tabTarget).classList.add('active');
            });
        });

        // Lógica de cálculo automático en tiempo real
        const dateInput = document.getElementById('cf-fecha-nacimiento');
        const edadInput = document.getElementById('cf-edad');
        const genInput = document.getElementById('cf-generacion');
        
        dateInput.addEventListener('change', () => {
            const val = dateInput.value;
            if (val) {
                const edad = calcularEdad(val);
                edadInput.value = edad !== null ? edad : '';
                const anio = new Date(val).getFullYear();
                genInput.value = calcularGeneracion(anio);
            } else {
                edadInput.value = '';
                genInput.value = '';
            }
        });

        const waInput = document.getElementById('cf-whatsapp');
        const ladaInput = document.getElementById('cf-lada');
        waInput.addEventListener('input', () => {
            ladaInput.value = inferirLada(waInput.value);
        });
        
        // Event Listeners
        document.getElementById('cf-close-btn').addEventListener('click', () => this.close());
        document.getElementById('cf-cancel-btn').addEventListener('click', () => this.close());
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.save().catch((error) => {
                console.error(error);
                toast(error.message || 'Error al guardar el cliente', 'error');
            });
        });
    }

    async loadAsesoresSelect() {
        try {
            const res = await apiFetch('/api/asesores');
            const select = this.form.elements['id_asesor'];
            select.innerHTML = '<option value="">Sin Asesor</option>' + res.map(a => `<option value="${a.id_asesor}">${a.nombre} ${a.apellidos}</option>`).join('');
        } catch(e) {
            console.error('Error cargando asesores:', e);
        }
    }

    async loadMatches(clientId) {
        const container = document.getElementById('cf-matches-list');
        try {
            const list = await apiFetch(`/api/clientes/${clientId}/matches`);
            if (!list || list.length === 0) {
                container.innerHTML = `<p style="color:var(--c-text-3); font-size:var(--ts-sm);">No hay propiedades que coincidan con los requerimientos del cliente.</p>`;
                return;
            }
            container.innerHTML = list.map(m => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--c-surface-2); border:1px solid var(--c-border); border-radius:var(--r-sm);">
                    <span style="font-size:var(--ts-sm);"><strong>${m.score_total}%</strong> - ${m.titulo} (${m.tipo.toUpperCase()} - ${m.ciudad || 'Sin ciudad'})</span>
                    <strong style="color:var(--c-accent); font-size:var(--ts-sm);">$${m.precio ? m.precio.toLocaleString() : '—'}</strong>
                </div>
            `).join('');
        } catch(e) {
            container.innerHTML = `<p style="color:var(--c-err); font-size:var(--ts-sm);">Error al calcular compatibilidades: ${e.message}</p>`;
        }
    }

    open(clienteData = null) {
        this.clienteId = clienteData ? clienteData.id_cliente : null;
        document.getElementById('cf-title').textContent = this.clienteId ? 'Editar Cliente' : 'Nuevo Cliente';
        this.form.reset();
        
        // Limpiar checkboxes
        this.form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        if (clienteData) {
            // Llenar inputs simples
            Object.keys(clienteData).forEach(key => {
                const input = this.form.elements[key];
                if (input && key !== 'amenidades_deseadas') {
                    input.value = clienteData[key] !== null && clienteData[key] !== undefined ? clienteData[key] : '';
                }
            });

            // Parsear e inyectar checkbox grids
            const parseAndCheck = (val, inputName) => {
                if (!val) return;
                try {
                    const arr = typeof val === 'string' ? JSON.parse(val) : val;
                    if (Array.isArray(arr)) {
                        arr.forEach(item => {
                            const cb = this.form.querySelector(`input[name="${inputName}"][value="${item}"]`);
                            if (cb) cb.checked = true;
                        });
                    }
                } catch(e) {
                    console.warn('Error parsing checkbox grid field:', inputName, val, e);
                }
            };
            parseAndCheck(clienteData.amenidades_deseadas, 'amenidades_deseadas');

            // Cargar compatibilidad
            this.loadMatches(this.clienteId);
        } else {
            document.getElementById('cf-matches-list').innerHTML = `<p style="color:var(--c-text-3); font-size:var(--ts-sm);">Guarde el cliente para calcular las compatibilidades en tiempo real.</p>`;
        }
        
        // Reset tabs
        this.modal.querySelectorAll('.cf-modal-tab')[0].click();
        
        openModal('modal-cliente-form');
    }

    close() {
        closeModal('modal-cliente-form');
    }

    validateForm() {
        if (this.form.checkValidity()) {
            return true;
        }

        const invalid = this.form.querySelector(':invalid');
        if (invalid) {
            invalid.focus();
            const label = invalid.closest('.form-group')?.querySelector('label')?.textContent?.replace('*', '').trim();
            toast(label ? `Revise el campo "${label}"` : 'Complete los campos obligatorios correctamente', 'error');
            invalid.reportValidity();
        } else {
            toast('Complete los campos obligatorios correctamente', 'error');
        }
        return false;
    }

    async save() {
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Serializar vacíos
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });

        // Manejar checkbox list
        const getCheckedValues = (inputName) => {
            const list = [];
            this.form.querySelectorAll(`input[name="${inputName}"]:checked`).forEach(cb => {
                list.push(cb.value);
            });
            return list.length ? JSON.stringify(list) : null;
        };
        data.amenidades_deseadas = getCheckedValues('amenidades_deseadas');

        // Tipos de datos correctos
        if (data.ingreso_mensual) data.ingreso_mensual = parseFloat(data.ingreso_mensual);
        if (data.presupuesto_min) data.presupuesto_min = parseFloat(data.presupuesto_min);
        if (data.presupuesto_max) data.presupuesto_max = parseFloat(data.presupuesto_max);
        if (data.enganche_disponible) data.enganche_disponible = parseFloat(data.enganche_disponible);
        if (data.pago_mensual_objetivo) data.pago_mensual_objetivo = parseFloat(data.pago_mensual_objetivo);
        if (data.capacidad_credito_max) data.capacidad_credito_max = parseFloat(data.capacidad_credito_max);
        if (data.m2_terreno_min) data.m2_terreno_min = parseFloat(data.m2_terreno_min);
        if (data.m2_terreno_max) data.m2_terreno_max = parseFloat(data.m2_terreno_max);
        if (data.m2_construccion_min) data.m2_construccion_min = parseFloat(data.m2_construccion_min);
        if (data.m2_construccion_max) data.m2_construccion_max = parseFloat(data.m2_construccion_max);

        // Convertir campos numéricos enteros
        const intFields = ['edad', 'id_asesor', 'hijos', 'mascotas', 'integrantes_hogar', 'dependientes_eco', 'adultos_mayores_cargo', 'habitaciones_pa', 'habitaciones_pb', 'estacionamiento', 'niveles_max', 'antiguedad_max'];
        intFields.forEach(f => {
            if (data[f]) data[f] = parseInt(data[f]);
        });
        if (data.banos) data.banos = parseFloat(data.banos);

        try {
            if (this.clienteId) {
                await apiFetch(`/api/clientes/${this.clienteId}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                toast('Cliente actualizado exitosamente', 'success');
            } else {
                await apiFetch('/api/clientes', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                toast('Cliente creado exitosamente', 'success');
            }
            this.close();
            if (this.onSaved) this.onSaved();
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }
}
