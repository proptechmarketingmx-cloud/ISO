/**
 * catalogos.js — Catálogos Maestros Centralizados
 * ISO Plataforma Inmobiliaria
 *
 * Fuente única de datos para todos los campos tipo catálogo.
 * No se permite captura libre cuando exista un catálogo.
 */

export const CATALOGOS = {

  // ── Geografía ─────────────────────────────────────────────────────────────

  paises: [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
    { value: 'OT', label: 'Otro' },
  ],

  estados: [
    'Aguascalientes','Baja California','Baja California Sur','Campeche',
    'Chiapas','Chihuahua','Ciudad de México','Coahuila','Colima','Durango',
    'Estado de México','Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán',
    'Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro',
    'Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco',
    'Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
  ],

  // ── Demografía y Perfil ──────────────────────────────────────────────────
  generos: [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ],

  estadosCiviles: [
    { value: 'soltero', label: 'Soltero(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viudo', label: 'Viudo(a)' },
    { value: 'union_libre', label: 'Unión Libre' }
  ],

  escolaridades: [
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'preparatoria', label: 'Preparatoria' },
    { value: 'licenciatura', label: 'Licenciatura' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' }
  ],

  // ── Financiero y Adquisición ─────────────────────────────────────────────
  tiposCredito: [
    { value: 'infonavit', label: 'INFONAVIT' },
    { value: 'fovissste', label: 'FOVISSSTE' },
    { value: 'bancario', label: 'Bancario' },
    { value: 'recursos_propios', label: 'Recursos Propios' },
    { value: 'cofinavit', label: 'Cofinavit' },
    { value: 'alianza2', label: 'Alianza 2' }
  ],

  motivaciones: [
    { value: 'inversion', label: 'Inversión' },
    { value: 'vivienda_propia', label: 'Vivienda Propia' },
    { value: 'vacacional', label: 'Vacacional / Descanso' },
    { value: 'negocio', label: 'Negocio Comercial' }
  ],

  temporalidades: [
    { value: 'inmediato', label: 'Inmediato (0-1 mes)' },
    { value: 'corto_plazo', label: 'Corto Plazo (1-3 meses)' },
    { value: 'mediano_plazo', label: 'Mediano Plazo (3-6 meses)' },
    { value: 'largo_plazo', label: 'Largo Plazo (6+ meses)' }
  ],

  fuentesLead: [
    { value: 'organico', label: 'Orgánico' },
    { value: 'referido', label: 'Referido' },
    { value: 'redes_sociales', label: 'Redes Sociales' },
    { value: 'campana', label: 'Campaña Pagada' },
    { value: 'directo', label: 'Directo / Walk-in' }
  ],

  mediosAdquisicion: [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'google', label: 'Google Ads' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'sitio_web', label: 'Sitio Web' },
    { value: 'inmobiliaria', label: 'Portal Inmobiliario' }
  ],


  // ── Propiedad ─────────────────────────────────────────────────────────────

  tiposPropiedad: [
    { value: 'casa',         label: 'Casa' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'terreno',      label: 'Terreno' },
    { value: 'local',        label: 'Local Comercial' },
    { value: 'oficina',      label: 'Oficina' },
    { value: 'bodega',       label: 'Bodega' },
    { value: 'rancho',       label: 'Rancho / Hacienda' },
    { value: 'villa',        label: 'Villa / Cabaña' },
    { value: 'penthouse',    label: 'Penthouse' },
    { value: 'duplex',       label: 'Dúplex' },
    { value: 'edificio',     label: 'Edificio' },
  ],

  operaciones: [
    { value: 'venta',    label: 'Venta' },
    { value: 'renta',    label: 'Renta' },
    { value: 'preventa', label: 'Preventa' },
  ],

  estatusPropiedad: [
    { value: 'disponible', label: 'Disponible' },
    { value: 'reservada',  label: 'Reservada' },
    { value: 'vendida',    label: 'Vendida' },
    { value: 'rentada',    label: 'Rentada' },
    { value: 'inactiva',   label: 'Inactiva' },
  ],

  usoDeSuelo: [
    { value: 'habitacional',          label: 'Habitacional' },
    { value: 'comercial',             label: 'Comercial' },
    { value: 'mixto',                 label: 'Mixto' },
    { value: 'industrial',            label: 'Industrial' },
    { value: 'agricola',              label: 'Agrícola' },
    { value: 'turistico',             label: 'Turístico' },
    { value: 'equipamiento_urbano',   label: 'Equipamiento Urbano' },
  ],

  orientaciones: [
    { value: 'norte', label: 'Norte' },
    { value: 'sur',   label: 'Sur' },
    { value: 'este',  label: 'Este' },
    { value: 'oeste', label: 'Oeste' },
    { value: 'noreste', label: 'Noreste' },
    { value: 'noroeste', label: 'Noroeste' },
    { value: 'sureste', label: 'Sureste' },
    { value: 'suroeste', label: 'Suroeste' },
  ],

  estadosConservacion: [
    { value: 'excelente',  label: 'Excelente' },
    { value: 'bueno',      label: 'Bueno' },
    { value: 'regular',    label: 'Regular' },
    { value: 'necesita_reparacion', label: 'Necesita reparación' },
    { value: 'obra_negra', label: 'Obra negra' },
  ],

  regimenes: [
    { value: 'propiedad_privada',    label: 'Propiedad Privada' },
    { value: 'condominio_horizontal',label: 'Condominio Horizontal' },
    { value: 'condominio_vertical',  label: 'Condominio Vertical' },
    { value: 'ejidal',               label: 'Ejidal' },
    { value: 'comunal',              label: 'Comunal' },
    { value: 'zona_federal',         label: 'Zona Federal' },
  ],

  // ── Amenidades ────────────────────────────────────────────────────────────

  amenidades: [
    { value: 'alberca',             label: 'Alberca' },
    { value: 'gimnasio',            label: 'Gimnasio' },
    { value: 'jardin',              label: 'Jardín' },
    { value: 'terraza',             label: 'Terraza' },
    { value: 'roof_garden',         label: 'Roof Garden' },
    { value: 'salon_eventos',       label: 'Salón de Eventos' },
    { value: 'area_bbq',            label: 'Área BBQ' },
    { value: 'cancha_tennis',       label: 'Cancha de Tennis' },
    { value: 'cancha_futbol',       label: 'Cancha de Fútbol' },
    { value: 'juegos_infantiles',   label: 'Juegos Infantiles' },
    { value: 'seguridad_24h',       label: 'Seguridad 24h' },
    { value: 'caseta',              label: 'Caseta de Vigilancia' },
    { value: 'acceso_controlado',   label: 'Acceso Controlado' },
    { value: 'elevador',            label: 'Elevador' },
    { value: 'bodega',              label: 'Bodega' },
    { value: 'cuarto_servicio',     label: 'Cuarto de Servicio' },
    { value: 'estudio',             label: 'Estudio' },
    { value: 'spa',                 label: 'Spa' },
    { value: 'area_mascotas',       label: 'Área de Mascotas' },
    { value: 'paneles_solares',     label: 'Paneles Solares' },
    { value: 'cisterna',            label: 'Cisterna' },
    { value: 'planta_electrica',    label: 'Planta Eléctrica' },
  ],

  servicios: [
    { value: 'agua',           label: 'Agua Potable' },
    { value: 'luz',            label: 'Electricidad' },
    { value: 'gas',            label: 'Gas Natural' },
    { value: 'drenaje',        label: 'Drenaje' },
    { value: 'internet',       label: 'Internet / Fibra Óptica' },
    { value: 'cable',          label: 'Cable / TV' },
    { value: 'telefono',       label: 'Teléfono' },
    { value: 'alumbrado',      label: 'Alumbrado Público' },
    { value: 'pavimento',      label: 'Pavimento' },
    { value: 'transporte',     label: 'Transporte Público' },
    { value: 'recoleccion_basura', label: 'Recolección de Basura' },
  ],

  idealPara: [
    { value: 'familia_joven',   label: 'Familia Joven' },
    { value: 'pareja',          label: 'Pareja' },
    { value: 'inversion',       label: 'Inversión' },
    { value: 'adulto_mayor',    label: 'Adulto Mayor' },
    { value: 'soltero',         label: 'Soltero/a' },
    { value: 'negocio',         label: 'Negocio / Comercio' },
    { value: 'vacacional',      label: 'Vacacional' },
    { value: 'renta_airbnb',    label: 'Renta por Airbnb' },
  ],

  // ── Financiero ────────────────────────────────────────────────────────────

  tiposCredito: [
    { value: 'contado',        label: 'Contado' },
    { value: 'infonavit',      label: 'INFONAVIT' },
    { value: 'fovissste',      label: 'FOVISSSTE' },
    { value: 'bancario',       label: 'Crédito Bancario' },
    { value: 'infonavit_cofinavit', label: 'INFONAVIT + COFINAVIT' },
    { value: 'preventa',       label: 'Preventa / Enganche' },
    { value: 'desarrollador',  label: 'Crédito Desarrollador' },
    { value: 'cofinanciado',   label: 'Cofinanciado' },
  ],

  // ── Personas — Demográfico ────────────────────────────────────────────────

  estadosCiviles: [
    { value: 'soltero',      label: 'Soltero/a' },
    { value: 'casado',       label: 'Casado/a' },
    { value: 'divorciado',   label: 'Divorciado/a' },
    { value: 'viudo',        label: 'Viudo/a' },
    { value: 'union_libre',  label: 'Unión Libre' },
    { value: 'separado',     label: 'Separado/a' },
  ],

  generos: [
    { value: 'masculino',    label: 'Masculino' },
    { value: 'femenino',     label: 'Femenino' },
    { value: 'no_binario',   label: 'No Binario' },
    { value: 'prefiero_no',  label: 'Prefiero no decir' },
  ],

  // Catálogo para el campo "Género Ideal" de propiedades (incluye comodín del algoritmo)
  generosIdealPropiedad: [
    { value: 'cualquiera',   label: 'Cualquiera (sin preferencia)' },
    { value: 'masculino',    label: 'Masculino' },
    { value: 'femenino',     label: 'Femenino' },
    { value: 'no_binario',   label: 'No Binario' },
  ],

  escolaridades: [
    { value: 'primaria',          label: 'Primaria' },
    { value: 'secundaria',        label: 'Secundaria' },
    { value: 'preparatoria',      label: 'Preparatoria / Bachillerato' },
    { value: 'tecnico',           label: 'Técnico' },
    { value: 'licenciatura',      label: 'Licenciatura' },
    { value: 'ingenieria',        label: 'Ingeniería' },
    { value: 'maestria',          label: 'Maestría' },
    { value: 'doctorado',         label: 'Doctorado' },
    { value: 'posgrado',          label: 'Posgrado' },
  ],

  generaciones: [
    { value: 'silenciosa',  label: 'Generación Silenciosa', desde: null,  hasta: 1945 },
    { value: 'boomers',     label: 'Baby Boomers',          desde: 1946,  hasta: 1964 },
    { value: 'x',           label: 'Generación X',          desde: 1965,  hasta: 1980 },
    { value: 'millennial',  label: 'Millennial',            desde: 1981,  hasta: 1996 },
    { value: 'z',           label: 'Generación Z',          desde: 1997,  hasta: 2012 },
    { value: 'alpha',       label: 'Generación Alfa',       desde: 2013,  hasta: null },
  ],

  // ── Motivación y Temporalidad ─────────────────────────────────────────────

  motivaciones: [
    { value: 'primera_vivienda',   label: 'Primera Vivienda' },
    { value: 'cambio_residencia',  label: 'Cambio de Residencia' },
    { value: 'inversion',          label: 'Inversión' },
    { value: 'patrimonio',         label: 'Patrimonio' },
    { value: 'vacacional',         label: 'Vacacional' },
    { value: 'negocio',            label: 'Negocio / Comercio' },
    { value: 'downsizing',         label: 'Downsizing' },
    { value: 'divorcio',           label: 'Divorcio / Separación' },
  ],

  temporalidades: [
    { value: 'inmediato',    label: 'Compra Inmediata' },
    { value: '1_3_meses',    label: '1–3 meses' },
    { value: '3_6_meses',    label: '3–6 meses' },
    { value: 'mas_6_meses',  label: 'Más de 6 meses' },
  ],

  // ── Seguimiento Comercial ─────────────────────────────────────────────────

  fuentesLead: [
    { value: 'facebook',       label: 'Facebook' },
    { value: 'instagram',      label: 'Instagram' },
    { value: 'google',         label: 'Google Ads' },
    { value: 'tiktok',         label: 'TikTok' },
    { value: 'portales',       label: 'Portales Inmobiliarios' },
    { value: 'referido',       label: 'Referido' },
    { value: 'walk_in',        label: 'Walk-in (oficina)' },
    { value: 'whatsapp',       label: 'WhatsApp directo' },
    { value: 'llamada',        label: 'Llamada directa' },
    { value: 'correo',         label: 'Correo electrónico' },
    { value: 'exposicion',     label: 'Exposición / Evento' },
    { value: 'pagina_web',     label: 'Página Web' },
    { value: 'otro',           label: 'Otro' },
  ],

  mediosAdquisicion: [
    { value: 'organico',    label: 'Orgánico' },
    { value: 'pagado',      label: 'Pagado (CPC/CPM)' },
    { value: 'email',       label: 'Email Marketing' },
    { value: 'referral',    label: 'Referral' },
    { value: 'directo',     label: 'Directo' },
    { value: 'social',      label: 'Social Media' },
  ],

  // ── Multimedia ────────────────────────────────────────────────────────────

  tiposMultimedia: [
    { value: 'foto',      label: 'Fotografía' },
    { value: 'video',     label: 'Video' },
    { value: 'virtual',   label: 'Recorrido Virtual' },
    { value: 'plano',     label: 'Plano' },
    { value: 'documento', label: 'Documento' },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Genera opciones HTML para un <select> a partir de un catálogo.
 * @param {Array} catalogo - Array de { value, label } u opciones simples string
 * @param {string} [selectedValue] - Valor actualmente seleccionado
 * @param {string} [placeholder] - Texto del option vacío inicial
 * @returns {string} HTML de los <option> elementos
 */
export function opcionesHTML(catalogo, selectedValue = '', placeholder = '— Seleccionar —') {
  const first = `<option value="">${placeholder}</option>`;
  const opts = catalogo.map(item => {
    const val   = typeof item === 'string' ? item : item.value;
    const lbl   = typeof item === 'string' ? item : item.label;
    const sel   = val === selectedValue ? ' selected' : '';
    return `<option value="${val}"${sel}>${lbl}</option>`;
  }).join('');
  return first + opts;
}

/**
 * Llena un elemento <select> con opciones de un catálogo.
 * @param {string|HTMLElement} selectorOrEl - Selector CSS o elemento DOM
 * @param {Array} catalogo - Catálogo de opciones
 * @param {string} [selectedValue] - Valor seleccionado
 * @param {string} [placeholder] - Texto del option vacío
 */
export function llenarSelect(selectorOrEl, catalogo, selectedValue = '', placeholder = '— Seleccionar —') {
  const el = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl;
  if (!el) return;
  el.innerHTML = opcionesHTML(catalogo, selectedValue, placeholder);
}

/**
 * Calcula la generación a partir del año de nacimiento.
 * @param {number} anio
 * @returns {string} Etiqueta de generación
 */
export function calcularGeneracion(anio) {
  if (!anio) return '';
  if (anio <= 1945) return 'Generación Silenciosa';
  if (anio <= 1964) return 'Baby Boomers';
  if (anio <= 1980) return 'Generación X';
  if (anio <= 1996) return 'Millennial';
  if (anio <= 2012) return 'Generación Z';
  return 'Generación Alfa';
}

/**
 * Calcula la edad a partir de la fecha de nacimiento (YYYY-MM-DD o timestamp).
 * @param {string|number} fechaNacimiento
 * @returns {number|null}
 */
export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy   = new Date();
  const nac   = new Date(fechaNacimiento);
  let edad    = hoy.getFullYear() - nac.getFullYear();
  const m     = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

/**
 * Infiere la lada internacional de México a partir del WhatsApp/teléfono.
 * Si el número no empieza con +, asume +52 (México).
 * @param {string} telefono
 * @returns {string}
 */
export function inferirLada(telefono) {
  if (!telefono) return '';
  const t = telefono.trim();
  if (t.startsWith('+')) return t.match(/^\+\d+/)?.[0] || '';
  return '+52';
}

/**
 * Renderiza checkboxes dinámicos desde un catálogo
 * @param {string} containerId - ID del contenedor
 * @param {Array} catalogo - Catálogo de opciones
 * @param {string} inputName - Name para los inputs
 */
export function renderCheckboxes(containerId, catalogo, inputName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = catalogo.map(item => {
    const val = typeof item === 'string' ? item : item.value;
    const lbl = typeof item === 'string' ? item : item.label;
    return `
      <label class="checkbox-label">
        <input type="checkbox" name="${inputName}" value="${val}">
        ${lbl}
      </label>
    `;
  }).join('');
}

// ── Validaciones ───────────────────────────────────────────────────────────

const RE_CURP = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/i;
const RE_RFC  = /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{3}$/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_WA   = /^\+?[1-9]\d{7,14}$/;

export const VALIDACIONES = {
  curp:    (v) => !v || RE_CURP.test(v.trim().toUpperCase()),
  rfc:     (v) => !v || RE_RFC.test(v.trim().toUpperCase()),
  email:   (v) => !v || RE_EMAIL.test(v.trim()),
  whatsapp:(v) => !v || RE_WA.test(v.replace(/\s/g, '')),
  presupuesto: (min, max) => {
    const mn = parseFloat(min), mx = parseFloat(max);
    if (isNaN(mn) || isNaN(mx)) return true;
    return mn <= mx;
  },
};
