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
      // Aplicar registros recibidos del peer en el nodo local (Post /api/sync handler o directamente)
      await applyIncomingData(pullData.data);
    }

    // 2. PUSH: Obtener cambios locales recientes y enviarlos al Peer mediante POST /api/sync
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
      // Actualizar la fecha de última sincronización exitosa para este peer
      lastSyncTimestamps[peer.name] = new Date().toISOString();
      console.log(`[SyncEngine] Sincronización exitosa con peer "${peer.name}".`);
    } else {
      console.warn(`[SyncEngine] Push a peer "${peer.name}" falló con estatus HTTP ${pushRes.status}`);
    }
  } catch (error: any) {
    // Tolerancia a fallos: Log de advertencia por peer inalcanzable sin detener el ciclo ni los demás peers
    console.warn(`[SyncEngine] Peer "${peer.name}" (${peer.url}) inalcanzable u offline: ${error?.message}`);
  }
}

async function getLocalChanges(sinceIso: string) {
  const sinceDate = new Date(sinceIso);

  const usuarios = await prisma.usuario.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const clientes = await prisma.cliente.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const propiedades = await prisma.propiedad.findMany({ where: { updatedAt: { gt: sinceDate } } });
  const notas = await prisma.nota.findMany({ where: { updatedAt: { gt: sinceDate } } });

  return { usuarios, clientes, propiedades, notas };
}

async function applyIncomingData(payload: any) {
  const models = ['usuario', 'cliente', 'propiedad', 'nota'] as const;

  for (const model of models) {
    const list = payload[model + 's'] || payload[model];
    if (Array.isArray(list)) {
      for (const item of list) {
        const { id, createdAt, updatedAt, ...recordData } = item;
        if (!id) continue;

        const delegate = (prisma as any)[model];
        const incomingDate = new Date(updatedAt || Date.now());
        const existing = await delegate.findUnique({ where: { id } });

        if (!existing) {
          await delegate.create({
            data: {
              id,
              ...recordData,
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: incomingDate,
            },
          });
        } else if (incomingDate.getTime() > new Date(existing.updatedAt).getTime()) {
          await delegate.update({
            where: { id },
            data: {
              ...recordData,
              updatedAt: incomingDate,
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
