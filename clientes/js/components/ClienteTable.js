import { formatDate, toast, openModal, closeModal } from '/assets/js/utils.js';
import { apiFetch } from './api.js';

export class ClienteTable {
    constructor(containerId, onEdit, onViewExpediente, onDelete) {
        this.container = document.getElementById(containerId);
        this.onEdit = onEdit;
        this.onViewExpediente = onViewExpediente;
        this.onDelete = onDelete;
        this.clientes = [];
        this.render();
    }

    async loadData(search = '', estado = '') {
        try {
            let url = '/api/clientes?limit=100';
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (estado) url += `&estado=${encodeURIComponent(estado)}`;
            
            const response = await apiFetch(url);
            // FastAPI devuelve una lista; algunos proxies/dev servers pueden
            // envolverla como {items: []} o {data: []}.
            this.clientes = Array.isArray(response) ? response : (response?.items || response?.data || []);
            this.updateTableBody();
        } catch (error) {
            const tbody = this.container.querySelector('#cliente-tbody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--c-err)">${this.escapeHTML(error.message || 'No se pudieron cargar los clientes')}</td></tr>`;
            toast(`Error al cargar clientes: ${error.message || 'respuesta no válida'}`, 'error');
            console.error(error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="toolbar" style="margin-bottom: 24px; display: flex; gap: 16px; align-items: center;">
                <div class="search-wrap" style="flex: 1; max-width: 400px;">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="search" class="input" id="search-clientes-input" placeholder="Buscar por nombre, correo, teléfono..."/>
                </div>
                <select class="select" id="filter-estado" style="width: 200px;">
                    <option value="">Todos los Estados</option>
                    <option value="nuevo">Nuevo Prospecto</option>
                    <option value="contactado">Contactado</option>
                    <option value="cotizacion">Cotización</option>
                    <option value="negociacion">En Negociación</option>
                    <option value="cerrado">Cerrado / Activo</option>
                    <option value="perdido">Perdido</option>
                </select>
                <div style="margin-left: auto;">
                    <span class="badge badge-muted" id="count-badge">0 registros</span>
                </div>
            </div>
            
            <div class="card">
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Contacto</th>
                                <th>Estado</th>
                                <th>Registro</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cliente-tbody">
                            <tr><td colspan="6" style="text-align: center; padding: 24px;">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Bind events
        const searchInput = this.container.querySelector('#search-clientes-input');
        const estadoFilter = this.container.querySelector('#filter-estado');

        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.loadData(e.target.value, estadoFilter.value), 300);
        });

        estadoFilter.addEventListener('change', (e) => {
            this.loadData(searchInput.value, e.target.value);
        });
    }

    updateTableBody() {
        const tbody = this.container.querySelector('#cliente-tbody');
        const badge = this.container.querySelector('#count-badge');
        
        badge.textContent = `${this.clientes.length} registros`;

        if (this.clientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--c-text-2);">No se encontraron clientes</td></tr>`;
            return;
        }

        tbody.innerHTML = this.clientes.map(c => {
            const nombreCompleto = `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno || ''}`.trim();
            const contacto = [c.whatsapp, c.correo].filter(Boolean).join('<br>');
            
            let estadoClass = 'badge-muted';
            if (c.estado_cliente === 'nuevo') estadoClass = 'badge-info';
            if (c.estado_cliente === 'cerrado') estadoClass = 'badge-success';
            if (c.estado_cliente === 'perdido') estadoClass = 'badge-error';
            if (['contactado', 'cotizacion', 'negociacion'].includes(c.estado_cliente)) estadoClass = 'badge-warning';

            return `
                <tr>
                    <td class="muted">#${c.id_cliente}</td>
                    <td style="font-weight: 500;">${nombreCompleto}</td>
                    <td class="muted" style="font-size: var(--ts-xs);">${contacto || '-'}</td>
                    <td><span class="badge ${estadoClass}">${c.estado_cliente}</span></td>
                    <td class="muted">${formatDate(c.fecha_registro)}</td>
                    <td style="text-align: right; white-space: nowrap;">
                        <button class="btn btn-ghost btn-sm btn-expediente" data-id="${c.id_cliente}" title="Abrir Expediente">
                            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </button>
                        <button class="btn btn-ghost btn-sm btn-edit" data-id="${c.id_cliente}" title="Editar">
                            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon btn-delete" data-id="${c.id_cliente}" title="Eliminar">
                            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Bind button actions
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const cliente = this.clientes.find(c => c.id_cliente === id);
                this.onEdit(cliente);
            });
        });

        tbody.querySelectorAll('.btn-expediente').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.onViewExpediente(id);
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.onDelete(id);
            });
        });
    }

    getCurrentFilters() {
        const searchInput = this.container.querySelector('#search-clientes-input');
        const estadoFilter = this.container.querySelector('#filter-estado');
        return {
            search: searchInput?.value || '',
            estado: estadoFilter?.value || '',
        };
    }

    async reloadWithCurrentFilters() {
        const { search, estado } = this.getCurrentFilters();
        await this.loadData(search, estado);
    }

    escapeHTML(value) {
        return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
    }
}
