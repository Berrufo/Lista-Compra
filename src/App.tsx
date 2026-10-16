import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ShoppingBag, Sparkles, CheckCheck } from 'lucide-react';
import { ShoppingItem, FilterMode, SyncStatus, CategoryType } from './types';
import { NotepadHeader } from './components/NotepadHeader';
import { AddItemInput } from './components/AddItemInput';
import { ItemRow } from './components/ItemRow';
import { SyncModal } from './components/SyncModal';
import { ConfirmModal } from './components/ConfirmModal';
import { soundManager } from './services/sound';
import { initAuth, setAccessToken } from './services/firebase';
import { saveToDrive, loadFromDrive } from './services/googleDrive';

const STORAGE_KEY = 'rb_shopping_list_items_v1';
const AUTO_SYNC_KEY = 'rb_auto_sync_enabled';

const INITIAL_SAMPLE_ITEMS: ShoppingItem[] = [
  {
    id: 'sample-1',
    text: 'Pan artesano',
    completed: false,
    category: 'Panadería',
    quantity: '2 barras',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'sample-2',
    text: 'Tomates de ensalada',
    completed: false,
    category: 'Frutas y Verduras',
    quantity: '1 kg',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sample-3',
    text: 'Huevos camperos',
    completed: false,
    category: 'Lácteos y Huevos',
    quantity: '1 docena',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-4',
    text: 'Café molido natural',
    completed: true,
    category: 'Despensa',
    quantity: '1 paquete',
    createdAt: Date.now() - 7200000,
    completedAt: Date.now() - 1800000,
  },
];

export default function App() {
  // Local shopping list state
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SAMPLE_ITEMS;
  });

  const [filter, setFilter] = useState<FilterMode>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    return localStorage.getItem(AUTO_SYNC_KEY) !== 'false';
  });

  // Modals for destructive actions
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConfigured: true,
    isSignedIn: false,
    userEmail: null,
    userName: null,
    userPhoto: null,
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
    provider: 'none',
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error al guardar en localStorage', err);
    }
  }, [items]);

  // Auth state listener for Google Drive OAuth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setSyncStatus((prev) => ({
          ...prev,
          isSignedIn: true,
          userEmail: user.email,
          userName: user.displayName || user.email?.split('@')[0] || 'Usuario',
          userPhoto: user.photoURL,
          provider: 'google-drive',
        }));

        if (token) {
          setAccessToken(token);
          // On fresh login or session reload with token, trigger initial sync
          performDriveSync();
        }
      },
      () => {
        setSyncStatus((prev) => ({
          ...prev,
          isSignedIn: false,
          userEmail: null,
          userName: null,
          userPhoto: null,
          provider: 'none',
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Debounced auto-sync to Google Drive when items change
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const performDriveSync = useCallback(async () => {
    if (!syncStatus.isSignedIn) return;

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      const res = await saveToDrive(items);
      if (res.success) {
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: res.updatedAt || Date.now(),
        }));
      } else {
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          error: res.error || 'Error al guardar en Google Drive',
        }));
      }
    } catch (err) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Error desconocido de sincronización',
      }));
    }
  }, [items, syncStatus.isSignedIn]);

  useEffect(() => {
    if (autoSyncEnabled && syncStatus.isSignedIn) {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
      autoSyncTimerRef.current = setTimeout(() => {
        performDriveSync();
      }, 2500);
    }
    return () => {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    };
  }, [items, autoSyncEnabled, syncStatus.isSignedIn, performDriveSync]);

  const handleManualSync = async () => {
    if (!syncStatus.isSignedIn) {
      setIsSyncModalOpen(true);
      return;
    }
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      // First try to load remote file to see if there is newer data
      const remote = await loadFromDrive();
      if (remote.success && remote.items && remote.items.length > 0) {
        // Merge strategy: combine items keeping non-duplicates
        const existingIds = new Set(items.map((i) => i.id));
        const merged = [...items];
        remote.items.forEach((remoteItem) => {
          if (!existingIds.has(remoteItem.id)) {
            merged.push(remoteItem);
          }
        });
        setItems(merged);
        await saveToDrive(merged);
      } else {
        await saveToDrive(items);
      }
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: Date.now(),
      }));
    } catch (err) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Error al sincronizar',
      }));
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem(AUTO_SYNC_KEY, enabled ? 'true' : 'false');
  };

  // Add Item handler
  const handleAddItem = (text: string, category?: CategoryType, quantity?: string) => {
    const newItem: ShoppingItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      completed: false,
      category: category || 'General',
      quantity: quantity || undefined,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
    return true;
  };

  // Toggle item complete status
  // When marked, items get struck through and go to the end of the list.
  // Marked items can be unmarked anytime, floating back up!
  const handleToggleComplete = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      const willBeCompleted = !target.completed;

      const updated = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? Date.now() : undefined,
          };
        }
        return item;
      });

      // Check if all items are completed -> launch celebratory confetti!
      const allDone = updated.length > 0 && updated.every((i) => i.completed);
      if (allDone && willBeCompleted) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#c89d55', '#2c3e50', '#ef4444', '#10b981'],
          });
        } catch {
          // Ignore
        }
      }

      return updated;
    });
  };

  // Uncheck (reactivate) struck item
  const handleUncheckExistingItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: false, completedAt: undefined }
          : item
      )
    );
    handleHighlightItem(id);
  };

  // Delete item with confirmation if desired
  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    if (!itemToDelete) return;

    setConfirmModalConfig({
      isOpen: true,
      title: '¿Borrar apunte?',
      message: `¿Seguro que deseas eliminar "${itemToDelete.text}" de la libreta?`,
      onConfirm: () => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setConfirmModalConfig((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  // Update item text/quantity
  const handleUpdateItem = (id: string, newText: string, newQuantity?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, text: newText, quantity: newQuantity }
          : item
      )
    );
  };

  // Highlight item temporarily (used when duplicate detected)
  const handleHighlightItem = (id: string) => {
    setHighlightedId(id);
    setTimeout(() => {
      setHighlightedId(null);
    }, 2000);
  };

  // Clear completed items (Archivar comprados)
  const handleClearCompleted = () => {
    const completedCount = items.filter((i) => i.completed).length;
    if (completedCount === 0) return;

    setConfirmModalConfig({
      isOpen: true,
      title: '¿Borrar productos tachados?',
      message: `Se eliminarán los ${completedCount} productos que ya has comprado de la libreta.`,
      onConfirm: () => {
        setItems((prev) => prev.filter((i) => !i.completed));
        setConfirmModalConfig((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  // Clear all items (Vaciar libreta)
  const handleClearAll = () => {
    if (items.length === 0) return;

    setConfirmModalConfig({
      isOpen: true,
      title: '¿Vaciar libreta de la compra?',
      message: '¿Estás seguro de que deseas eliminar todos los productos de la libreta? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setItems([]);
        setConfirmModalConfig((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  const handleImportItems = (imported: ShoppingItem[]) => {
    setItems(imported);
    setIsSyncModalOpen(false);
  };

  const handleToggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  // Sorted items: Active items FIRST (sorted by createdAt newest first),
  // then marked/struck-through items AT THE END (sorted by completedAt).
  const sortedItems = useMemo(() => {
    const pending = items
      .filter((i) => !i.completed)
      .sort((a, b) => b.createdAt - a.createdAt);

    const completed = items
      .filter((i) => i.completed)
      .sort((a, b) => (a.completedAt || a.createdAt) - (b.completedAt || b.createdAt));

    return [...pending, ...completed];
  }, [items]);

  // Filtered view
  const displayItems = useMemo(() => {
    if (filter === 'pending') {
      return sortedItems.filter((i) => !i.completed);
    }
    if (filter === 'completed') {
      return sortedItems.filter((i) => i.completed);
    }
    return sortedItems;
  }, [sortedItems, filter]);

  const pendingCount = useMemo(() => items.filter((i) => !i.completed).length, [items]);
  const completedCount = useMemo(() => items.filter((i) => i.completed).length, [items]);

  return (
    <div className="min-h-screen py-2 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-start">
      {/* Mobile/Android wrapper constraint (max-w-md on desktop, full screen on mobile) */}
      <div className="w-full max-w-lg">
        {/* The Vintage Yellow Legal Pad */}
        <div className="notebook-paper rounded-xl overflow-hidden shadow-2xl relative border border-[#d6c478] min-h-[92vh] flex flex-col">
          {/* Notepad Header & Controls */}
          <NotepadHeader
            pendingCount={pendingCount}
            completedCount={completedCount}
            filter={filter}
            onFilterChange={setFilter}
            onOpenSync={() => setIsSyncModalOpen(true)}
            syncStatus={syncStatus}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onClearCompleted={handleClearCompleted}
            onClearAll={handleClearAll}
          />

          {/* Notebook Paper Content Body */}
          <div className="flex-1 px-4 sm:px-6 pt-3 pb-8 flex flex-col">
            {/* Add Item Input with Real-time autocomplete suggestions */}
            <AddItemInput
              items={items}
              onAddItem={handleAddItem}
              onUncheckExistingItem={handleUncheckExistingItem}
              onHighlightItem={handleHighlightItem}
            />

            {/* List of Shopping Items */}
            {displayItems.length > 0 ? (
              <ul className="flex-1 flex flex-col">
                <AnimatePresence initial={false}>
                  {displayItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggleComplete={handleToggleComplete}
                      onDeleteItem={handleDeleteItem}
                      onUpdateItem={handleUpdateItem}
                      isHighlighted={highlightedId === item.id}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center select-none">
                <div className="w-16 h-16 rounded-full bg-[#f4eaab] border-2 border-dashed border-[#cbb868] flex items-center justify-center text-stone-600 mb-3 shadow-inner">
                  {filter === 'completed' ? (
                    <CheckCheck className="w-8 h-8 text-stone-500" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-stone-500" />
                  )}
                </div>
                <h3 className="font-kalam text-2xl font-bold text-stone-800">
                  {filter === 'completed'
                    ? 'No hay productos tachados'
                    : filter === 'pending'
                    ? '¡Todo comprado!'
                    : 'Tu libreta está vacía'}
                </h3>
                <p className="font-handwriting text-xl text-stone-600 max-w-xs mt-1">
                  {filter === 'completed'
                    ? 'Marca los productos con el tick cuando los vayas cogiendo en la tienda.'
                    : filter === 'pending'
                    ? '¡Excelente! No tienes nada pendiente por comprar.'
                    : 'Escribe un producto arriba para empezar tu lista de la compra.'}
                </p>
              </div>
            )}

            {/* Completed summary banner if all items checked */}
            {items.length > 0 && pendingCount === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-3 bg-emerald-50/80 border-2 border-emerald-300 rounded-lg text-emerald-900 text-center font-patrick shadow-xs"
              >
                <div className="flex items-center justify-center gap-1.5 font-bold text-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>¡Todo comprado! Lista completada con éxito</span>
                </div>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Puedes vaciar la libreta o desmarcar productos si vuelves a necesitarlos.
                </p>
              </motion.div>
            )}

            {/* Bottom vintage signature footer */}
            <div className="mt-8 pt-4 border-t border-[#ebdca2] flex items-center justify-between text-xs font-handwriting text-stone-600 select-none">
              <span className="text-base">Lista de la compra</span>
              <span className="text-sm font-typewriter">© 2026 • Bloc Pastel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Modal (Google Drive, iCloud / Files) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        items={items}
        onManualSync={handleManualSync}
        onImportItems={handleImportItems}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={handleToggleAutoSync}
      />

      {/* Confirmation Modal for destructive actions */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((c) => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
