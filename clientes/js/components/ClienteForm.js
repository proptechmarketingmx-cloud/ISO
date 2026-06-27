import { apiFetch } from './api.js';
import { toast, openModal, closeModal } from '/assets/js/utils.js';

export class ClienteForm {
    constructor(onSaved) {
        this.onSaved = onSaved;
        this.clienteId = null;
        this.renderModal();
    }

    renderModal() {
        const modalHtml = `
        <div class="modal-overlay" id="modal-cliente-form">
          <div class="modal" style="max-width: 800px;">
            <div class="modal-header">
              <span class="modal-title" id="cf-title">Nuevo Cliente</span>
              <button class="modal-close" id="cf-close-btn">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <form id="cliente-form-el" novalidate>
                <div class="tabs" style="background: var(--c-surface-2); padding: 8px 16px 0; border-bottom: 1px solid var(--c-border);">
                    <span class="tab active" data-tab-target="cf-basica">Información Básica</span>
                    <span class="tab" data-tab-target="cf-contacto">Contacto</span>
                    <span class="tab" data-tab-target="cf-comercial">Comercial & Familiar</span>
                </div>
                
                <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                    
                    <!-- Tab Básica -->
                    <div id="cf-basica" class="cf-tab-content">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" class="input" name="nombre" required />
                            </div>
                            <div class="form-group">
                                <label>Apellido Paterno *</label>
                                <input type="text" class="input" name="apellido_paterno" required />
                            </div>
                            <div class="form-group">
                                <label>Apellido Materno</label>
                                <input type="text" class="input" name="apellido_materno" />
                            </div>
                            <div class="form-group">
                                <label>Género</label>
                                <select class="select" name="genero">
                                    <option value="">Seleccionar</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Estado Civil</label>
                                <select class="select" name="estado_civil">
                                    <option value="">Seleccionar</option>
                                    <option value="Soltero">Soltero/a</option>
                                    <option value="Casado">Casado/a</option>
                                    <option value="Divorciado">Divorciado/a</option>
                                    <option value="Viudo">Viudo/a</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input type="date" class="input" name="fecha_nacimiento" />
                            </div>
                            <div class="form-group">
                                <label>CURP</label>
                                <input type="text" class="input" name="curp" maxlength="18" />
                            </div>
                            <div class="form-group">
                                <label>RFC</label>
                                <input type="text" class="input" name="rfc" maxlength="13" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tab Contacto -->
                    <div id="cf-contacto" class="cf-tab-content" style="display: none;">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Teléfono Principal</label>
                                <input type="tel" class="input" name="telefono_principal" />
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" class="input" name="whatsapp" />
                            </div>
                            <div class="form-group span-2">
                                <label>Correo Electrónico</label>
                                <input type="email" class="input" name="correo" />
                            </div>
                            <div class="form-group span-2">
                                <label>Dirección Física</label>
                                <textarea class="textarea" name="direccion"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tab Comercial & Familiar -->
                    <div id="cf-comercial" class="cf-tab-content" style="display: none;">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Estado del Cliente</label>
                                <select class="select" name="estado_cliente">
                                    <option value="nuevo">Nuevo Prospecto</option>
                                    <option value="contactado">Contactado</option>
                                    <option value="cotizacion">Cotización</option>
                                    <option value="negociacion">En Negociación</option>
                                    <option value="cerrado">Cerrado / Activo</option>
                                    <option value="perdido">Perdido</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Origen / Fuente</label>
                                <input type="text" class="input" name="origen" placeholder="Ej. Recomendación, Facebook..." />
                            </div>
                            <div class="form-group">
                                <label>Ocupación</label>
                                <input type="text" class="input" name="ocupacion" />
                            </div>
                            <div class="form-group">
                                <label>Empresa</label>
                                <input type="text" class="input" name="empresa" />
                            </div>
                            <div class="form-group">
                                <label>Ingresos Estimados (Mensual)</label>
                                <input type="number" step="0.01" class="input" name="ingresos" />
                            </div>
                            <div class="form-group">
                                <label>Hijos (Detalle)</label>
                                <input type="text" class="input" name="hijos" placeholder="Ej. 2 (5 y 8 años)" />
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

        // Tabs Logic
        const tabs = this.modal.querySelectorAll('.tab');
        const contents = this.modal.querySelectorAll('.cf-tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                document.getElementById(tab.dataset.tabTarget).style.display = 'block';
            });
        });
    }

    open(clienteData = null) {
        this.clienteId = clienteData ? clienteData.id_cliente : null;
        document.getElementById('cf-title').textContent = this.clienteId ? 'Editar Cliente' : 'Nuevo Cliente';
        this.form.reset();
        
        if (clienteData) {
            Object.keys(clienteData).forEach(key => {
                const input = this.form.elements[key];
                if (input) {
                    input.value = clienteData[key] !== null ? clienteData[key] : '';
                }
            });
        }
        
        // Reset tabs
        this.modal.querySelectorAll('.tab')[0].click();
        
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

        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });
        if (data.ingresos !== null && data.ingresos !== undefined && data.ingresos !== '') {
            data.ingresos = parseFloat(data.ingresos);
        }

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
