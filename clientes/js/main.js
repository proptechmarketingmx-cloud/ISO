import { ClienteTable } from './components/ClienteTable.js';
import { ClienteForm } from './components/ClienteForm.js';
import { ExpedienteView } from './components/ExpedienteView.js';
import { openModal, closeModal, toast } from '/assets/js/utils.js';
import { apiFetch } from './components/api.js';

export function initClientesApp() {
    const root = document.getElementById('clientes-app-root');
    const btnNuevo = document.getElementById('btn-nuevo-cliente');
    let deleteId = null;

    document.querySelectorAll('[data-close="modal-confirm"]').forEach(btn => {
        btn.addEventListener('click', () => closeModal('modal-confirm'));
    });
    
    // Contenedores dinámicos
    root.innerHTML = `
        <div id="vista-tabla"></div>
        <div id="vista-expediente" style="display: none;"></div>
    `;

    const vistaTabla = document.getElementById('vista-tabla');
    const vistaExpediente = document.getElementById('vista-expediente');

    // Inicializar componentes
    let table, form, expediente;

    const parseQueryParam = (name) => new URLSearchParams(window.location.search).get(name);

    const showTable = () => {
        vistaExpediente.style.display = 'none';
        vistaTabla.style.display = 'block';
        btnNuevo.style.display = 'inline-flex';
        table.loadData();
    };

    const showExpediente = async (id) => {
        vistaTabla.style.display = 'none';
        vistaExpediente.style.display = 'block';
        btnNuevo.style.display = 'none';
        await expediente.loadExpediente(id);
    };

    // Componente de Tabla
    table = new ClienteTable('vista-tabla', 
        (cliente) => {
            // onEdit
            form.open(cliente);
        },
        (clienteId) => {
            // onViewExpediente
            showExpediente(clienteId);
        },
        (clienteId) => {
            deleteId = clienteId;
            openModal('modal-confirm');
        }
    );

    // Componente de Formulario (Modal)
    form = new ClienteForm(() => {
        // onSaved
        table.loadData();
    });

    // Componente de Expediente
    expediente = new ExpedienteView('vista-expediente', () => {
        // onBack
        showTable();
    });

    // Eventos Globales
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            form.open();
        });
    }

    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', async () => {
            if (!deleteId) return;
            btnConfirmDelete.disabled = true;
            try {
                await apiFetch(`/api/clientes/${deleteId}`, { method: 'DELETE' });
                toast('Registro eliminado correctamente.', 'success');
                closeModal('modal-confirm');
                deleteId = null;
                await table.reloadWithCurrentFilters();
            } catch (error) {
                toast(error.message || 'Error al eliminar el registro', 'error');
            } finally {
                btnConfirmDelete.disabled = false;
            }
        });
    }

    // Carga inicial
    table.loadData();

    const initialClienteId = parseQueryParam('id_cliente');
    if (initialClienteId) {
        showExpediente(Number(initialClienteId));
    }
}
