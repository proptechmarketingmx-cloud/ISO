/**
 * ISO Platform — Utilidades Globales
 */

/* ── Formateo ──────────────────────────────────────── */
export function formatCurrency(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('es-MX').format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateStr));
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/* ── Score helpers ─────────────────────────────────── */
export function getInfluenceLevel(score) {
  if (score <= 20)  return { label: 'Baja',     class: 'badge-muted' };
  if (score <= 40)  return { label: 'Media',    class: 'badge-info' };
  if (score <= 60)  return { label: 'Alta',     class: 'badge-warning' };
  if (score <= 80)  return { label: 'Muy Alta', class: 'badge-accent' };
  return               { label: 'Líder',    class: 'badge-success' };
}

export function getProviderLevel(score) {
  if (score <= 20)  return { label: 'Cliente Normal',        class: 'badge-muted' };
  if (score <= 40)  return { label: 'Cliente Activo',        class: 'badge-info' };
  if (score <= 60)  return { label: 'Influenciador',         class: 'badge-warning' };
  if (score <= 80)  return { label: 'Generador de Negocio',  class: 'badge-accent' };
  return               { label: 'Proveedor Estratégico',  class: 'badge-success' };
}

/* ── DOM helpers ───────────────────────────────────── */
export function el(selector) {
  return document.querySelector(selector);
}

export function els(selector) {
  return [...document.querySelectorAll(selector)];
}

export function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') element.className = v;
    else if (k === 'text') element.textContent = v;
    else if (k === 'html') element.innerHTML = v;
    else element.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') element.appendChild(document.createTextNode(c));
    else if (c) element.appendChild(c);
  });
  return element;
}

/* ── Toast Notifications ───────────────────────────── */
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function toast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };

  t.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));

  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* ── Table helpers ─────────────────────────────────── */
export function renderEmptyState(container, message = 'No hay registros') {
  container.innerHTML = `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

export function renderLoadingRows(tbody, cols = 5, rows = 5) {
  tbody.innerHTML = Array(rows).fill(0).map(() => `
    <tr>
      ${Array(cols).fill('<td><div class="skeleton"></div></td>').join('')}
    </tr>
  `).join('');
}

/* ── Debounce ──────────────────────────────────────── */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ── Modal helpers ─────────────────────────────────── */
export function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

export function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
