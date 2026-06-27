/**
 * ISO Platform — Sidebar Navigation Component
 * Se inyecta en todas las páginas de la plataforma.
 * Detecta automáticamente la página activa por URL.
 */

const NAV_CONFIG = [
  { type: 'section', label: 'GESTIÓN' },
  {
    id: 'dashboard', label: 'Dashboard',
    href: '/dashboard/',
    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
  },
  {
    id: 'clientes', label: 'Clientes',
    href: '/clientes/',
    icon: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    id: 'propiedades', label: 'Propiedades',
    href: '/propiedades/',
    icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    id: 'asesores', label: 'Asesores',
    href: '/asesores/',
    icon: `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
  },
  { type: 'section', label: 'ANÁLISIS CNA' },
  {
    id: 'cna-clientes', label: 'CNA Clientes',
    icon: `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    children: [
      { label: 'Resumen',           href: '/cna_clientes/' },
      { label: 'Red de Relaciones', href: '/cna_clientes/network.html' },
      { label: 'Rankings',          href: '/cna_clientes/rankings.html' },
      { label: 'Comunidades',       href: '/cna_clientes/communities.html' },
      { label: 'Influence Score',   href: '/cna_clientes/influence.html' },
      { label: 'Provider Score',    href: '/cna_clientes/provider.html' },
    ]
  },
  {
    id: 'cna-asesores', label: 'CNA Asesores',
    icon: `<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    children: [
      { label: 'Resumen',           href: '/cna_asesores/' },
      { label: 'Red de Relaciones', href: '/cna_asesores/network.html' },
      { label: 'Rankings',          href: '/cna_asesores/rankings.html' },
      { label: 'Comunidades',       href: '/cna_asesores/communities.html' },
      { label: 'Influence Score',   href: '/cna_asesores/influence.html' },
      { label: 'Provider Score',    href: '/cna_asesores/provider.html' },
    ]
  },
  { type: 'section', label: 'REPORTES' },
  {
    id: 'kpis-clientes', label: 'KPIs Clientes',
    href: '/kpis/clientes/',
    icon: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
  },
  {
    id: 'kpis-propiedades', label: 'KPIs Propiedades',
    href: '/kpis/propiedades/',
    icon: `<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
  },
  {
    id: 'kpis-asesores', label: 'KPIs Asesores',
    href: '/kpis/asesores/',
    icon: `<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
  },
];

function getCurrentId() {
  const path = window.location.pathname;
  const search = window.location.search;
  if (path.startsWith('/dashboard'))         return 'dashboard';
  if (path.startsWith('/clientes'))          return 'clientes';
  if (path.startsWith('/propiedades'))       return 'propiedades';
  if (path.startsWith('/asesores') && !path.startsWith('/cna')) return 'asesores';
  if (path.startsWith('/cna_clientes'))      return 'cna-clientes';
  if (path.startsWith('/cna_asesores'))      return 'cna-asesores';
  if (path.startsWith('/kpis/clientes'))     return 'kpis-clientes';
  if (path.startsWith('/kpis/propiedades'))  return 'kpis-propiedades';
  if (path.startsWith('/kpis/asesores'))     return 'kpis-asesores';
  return 'dashboard';
}

function getCurrentHref() {
  return window.location.pathname + window.location.search;
}

function buildNavHTML(activeId, activeHref) {
  let html = '';

  for (const item of NAV_CONFIG) {
    if (item.type === 'section') {
      html += `<div class="nav-section-label">${item.label}</div>`;
      continue;
    }

    const isActive = item.id === activeId;

    if (item.children) {
      const childActive = item.children.some(c => activeHref.startsWith(c.href));
      const open = isActive || childActive;

      const childrenHtml = item.children.map(c => {
        const ca = activeHref.startsWith(c.href) || activeHref === c.href;
        return `<a href="${c.href}" class="nav-subitem${ca ? ' active' : ''}">
          <span class="nav-label">${c.label}</span>
        </a>`;
      }).join('');

      html += `
        <div class="nav-item${open ? ' active open' : ''}" data-toggle="${item.id}">
          ${item.icon}
          <span class="nav-label">${item.label}</span>
          <svg class="nav-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="nav-submenu${open ? ' open' : ''}" data-menu="${item.id}">
          ${childrenHtml}
        </div>
      `;
    } else {
      html += `
        <a href="${item.href}" class="nav-item${isActive ? ' active' : ''}">
          ${item.icon}
          <span class="nav-label">${item.label}</span>
        </a>
      `;
    }
  }

  return html;
}

function buildSidebar() {
  const activeId   = getCurrentId();
  const activeHref = getCurrentHref();

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div class="sidebar-logo-text">
        <span class="brand">ISO</span>
        <span class="sub">Plataforma Inmobiliaria</span>
      </div>
    </div>
    <nav class="sidebar-nav" id="sidebar-nav">
      ${buildNavHTML(activeId, activeHref)}
    </nav>
    <div class="sidebar-footer">
      <button class="sidebar-toggle" id="sidebar-toggle" title="Colapsar sidebar">
        <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  `;

  return sidebar;
}

function initSidebar() {
  const layout = document.querySelector('.app-layout');
  if (!layout) return;

  // Insert sidebar
  const sidebar = buildSidebar();
  layout.insertBefore(sidebar, layout.firstChild);

  // Toggle collapse
  const collapsed = localStorage.getItem('iso-sidebar-collapsed') === 'true';
  if (collapsed) layout.classList.add('collapsed');

  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    layout.classList.toggle('collapsed');
    localStorage.setItem('iso-sidebar-collapsed', layout.classList.contains('collapsed'));
  });

  // Submenu toggles
  layout.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.toggle;
      const menu = layout.querySelector(`[data-menu="${id}"]`);
      btn.classList.toggle('open');
      menu.classList.toggle('open');
    });
  });
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebar);
} else {
  initSidebar();
}

export { initSidebar };
