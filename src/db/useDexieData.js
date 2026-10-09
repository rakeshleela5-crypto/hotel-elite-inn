// src/db/useDexieData.js
// React Hooks for Reactive Dexie.js Integration in Hotel Elite Inn

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, subscribeSyncState, flushDexieOutbox, retryFailedOutboxItems } from './dexieDb';

/**
 * Reactive hook for live KOTs stored in Dexie IndexedDB
 */
export function useDexieLiveKots(limit = 100) {
  const kots = useLiveQuery(
    () => db.kots.orderBy('timestamp').reverse().limit(limit).toArray(),
    [limit]
  );
  return kots || [];
}

/**
 * Reactive hook for running table sessions in Dexie IndexedDB
 */
export function useDexieTableSessions() {
  const sessions = useLiveQuery(
    () => db.tableSessions.toArray(),
    []
  );

  const sessionMap = {};
  if (Array.isArray(sessions)) {
    sessions.forEach(s => {
      sessionMap[s.tableNumber] = s;
    });
  }
  return sessionMap;
}

/**
 * Reactive hook for Menu Catalog items in Dexie IndexedDB
 */
export function useDexieMenuCatalog(category = 'all', searchQuery = '') {
  return useLiveQuery(async () => {
    let collection = db.menuCatalog;
    let items = await collection.toArray();

    if (category && category !== 'all') {
      items = items.filter(it => it.category?.toLowerCase() === category.toLowerCase());
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(it => 
        it.name?.toLowerCase().includes(q) || 
        it.itemCode?.toLowerCase().includes(q) ||
        it.subcategory?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [category, searchQuery]) || [];
}

/**
 * Reactive hook for Dexie Sync Engine State & Outbox Telemetry
 */
export function useDexieSyncStatus() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    failedCount: 0,
    isSyncing: false,
    lastSyncedAt: null,
    lastError: null
  });

  useEffect(() => {
    const unsubscribe = subscribeSyncState(setStatus);
    return () => unsubscribe();
  }, []);

  return {
    ...status,
    triggerManualSync: flushDexieOutbox,
    retryFailed: retryFailedOutboxItems
  };
}
