import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    port: 5173,
    open: '/dashboard/',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:                   resolve(__dirname, 'index.html'),
        dashboard:              resolve(__dirname, 'dashboard/index.html'),
        clientes:               resolve(__dirname, 'clientes/index.html'),
        propiedades:            resolve(__dirname, 'propiedades/index.html'),
        matching:               resolve(__dirname, 'matching/index.html'),
        cna:                    resolve(__dirname, 'cna/index.html'),
        cna_dashboard:          resolve(__dirname, 'cna/dashboard/index.html'),
        cna_clientes:           resolve(__dirname, 'cna/clientes/index.html'),
        cna_propiedades:        resolve(__dirname, 'cna/propiedades/index.html'),
        cna_clientes_main:      resolve(__dirname, 'cna_clientes/index.html'),
        cna_clientes_network:   resolve(__dirname, 'cna_clientes/network.html'),
        cna_clientes_rankings:  resolve(__dirname, 'cna_clientes/rankings.html'),
        cna_clientes_communities: resolve(__dirname, 'cna_clientes/communities.html'),
        cna_clientes_influence: resolve(__dirname, 'cna_clientes/influence.html'),
        cna_clientes_provider:  resolve(__dirname, 'cna_clientes/provider.html'),
        cna_asesores:           resolve(__dirname, 'cna_asesores/index.html'),
        cna_asesores_network:   resolve(__dirname, 'cna_asesores/network.html'),
        cna_asesores_rankings:  resolve(__dirname, 'cna_asesores/rankings.html'),
        cna_asesores_communities: resolve(__dirname, 'cna_asesores/communities.html'),
        cna_asesores_influence: resolve(__dirname, 'cna_asesores/influence.html'),
        cna_asesores_provider:  resolve(__dirname, 'cna_asesores/provider.html'),
        kpis_clientes:          resolve(__dirname, 'kpis/clientes/index.html'),
        kpis_propiedades:       resolve(__dirname, 'kpis/propiedades/index.html'),
        kpis_asesores:          resolve(__dirname, 'kpis/asesores/index.html'),
      }
    }
  }
});
