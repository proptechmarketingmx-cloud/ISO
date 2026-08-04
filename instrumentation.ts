export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startSyncEngine } = await import('@/lib/sync/syncEngine');
    startSyncEngine();
  }
}
