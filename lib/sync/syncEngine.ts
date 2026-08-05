import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

interface PeerConfig {
  name: string;
  url: string;
  intervalSeconds: number;
}

const lastSyncTimestamps: Record<string, string> = {};
let isEngineRunning = false;

function loadPeers(): PeerConfig[] {
  try {
    const filePath = path.join(process.cwd(), 'peers.json');
    if (!fs.existsSync(filePath)) {
      console.log('[SyncEngine] No se encontró el archivo peers.json. Sincronización omitida.');
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('[SyncEngine] Error al leer peers.json:', error);
    return [];
  }
}

async function syncWithPeer(peer: PeerConfig) {
  const syncToken = process.env.SYNC_TOKEN;
  if (!syncToken) {
    console.error('[SyncEngine] SYNC_TOKEN no definido. Omitiendo sincronización.');
    return;
  }

  const peerUrl = peer.url.replace(/\/$/, '');
  const lastSync = lastSyncTimestamps[peer.name] || new Date(0).toISOString();

  try {
    // 1. PULL: Solicitar cambios del Peer mediante GET /api/sync?since=...
    const getUrl = `${peerUrl}/api/sync?since=${encodeURIComponent(lastSync)}`;
    const pullRes = await fetch(getUrl, {
      headers: {
        'x-sync-token': syncToken,
      },
    });

    if (!pullRes.ok) {
      console.warn(`[SyncEngine] Peer "${peer.name}" respondió con estatus HTTP ${pullRes.status}`);
      return;
    }

    const pullData = await pullRes.json();
    if (pullData?.data) {
      // Aplicar registros recibidos del peer en el nodo local
      await applyIncomingData(pullData.data);
    }

    // 2. PUSH: Obtener cambios locales recientes (incluyendo soft-deleted) y enviarlos al Peer
    const localChanges = await getLocalChanges(lastSync);
    const postUrl = `${peerUrl}/api/sync`;
    const pushRes = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-token': syncToken,
      },
      body: JSON.stringify({ data: localChanges }),
    });

    if (pushRes.ok) {
      lastSyncTimestamps[peer.name] = new Date().toISOString();
      console.log(`[SyncEngine] Sincronización exitosa con peer "${peer.name}".`);
    } else {
      console.warn(`[SyncEngine] Push a peer "${peer.name}" falló con estatus HTTP ${pushRes.status}`);
    }
  } catch (error: any) {
    // Tolerancia a fallos: Log por peer inalcanzable u offline
    console.warn(`[SyncEngine] Peer "${peer.name}" (${peer.url}) inalcanzable u offline: ${error?.message}`);
  }
}

async function getLocalChanges(sinceIso: string) {
  const sinceDate = new Date(sinceIso);

  // Retornar en el orden exacto: Usuario, Propiedad, Cliente, Nota
  const usuarios = await prisma.usuario.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const propiedades = await prisma.propiedad.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const clientes = await prisma.cliente.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const notas = await prisma.nota.findMany({ where: { updatedAt: { gt: sinceDate } } });

  return { usuarios, propiedades, clientes, notas };
}

async function applyIncomingData(payload: any) {
  // Orden estricto de procesamiento para respetar dependencias de clave foránea
  const orderedModels = [
    { key: 'usuarios', modelName: 'usuario' },
    { key: 'propiedades', modelName: 'propiedad' },
    { key: 'clientes', modelName: 'cliente' },
    { key: 'notas', modelName: 'nota' },
  ] as const;

  for (const { key, modelName } of orderedModels) {
    const list = payload[key] || payload[modelName];
    if (Array.isArray(list)) {
      for (const item of list) {
        const { id, createdAt, updatedAt, deletedAt, ...recordData } = item;
        if (!id) continue;

        const delegate = (prisma as any)[modelName];
        const incomingUpdatedAt = new Date(updatedAt || Date.now());
        const incomingDeletedAt = deletedAt ? new Date(deletedAt) : null;

        const existing = await delegate.findUnique({ where: { id } });

        if (!existing) {
          await delegate.create({
            data: {
              id,
              ...recordData,
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: incomingUpdatedAt,
              deletedAt: incomingDeletedAt,
            },
          });
        } else if (incomingUpdatedAt.getTime() > new Date(existing.updatedAt).getTime()) {
          await delegate.update({
            where: { id },
            data: {
              ...recordData,
              updatedAt: incomingUpdatedAt,
              deletedAt: incomingDeletedAt,
            },
          });
        }
      }
    }
  }
}

export function startSyncEngine() {
  if (isEngineRunning) return;
  isEngineRunning = true;

  const peers = loadPeers();
  if (peers.length === 0) {
    console.log('[SyncEngine] Sin peers configurados para sincronizar.');
    return;
  }

  console.log(`[SyncEngine] Iniciando motor de sincronización para ${peers.length} peer(s)...`);

  peers.forEach((peer) => {
    const intervalMs = (peer.intervalSeconds || 30) * 1000;
    // Ejecución inicial inmediata
    syncWithPeer(peer);
    // Programar ejecuciones periódicas
    setInterval(() => syncWithPeer(peer), intervalMs);
  });
}
