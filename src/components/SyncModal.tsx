import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Share2, 
  X, 
  Check, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { SyncStatus, ShoppingItem } from '../types';
import { googleSignIn, logout } from '../services/firebase';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  items: ShoppingItem[];
  onManualSync: () => Promise<void>;
  onImportItems: (imported: ShoppingItem[]) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  items,
  onManualSync,
  onImportItems,
  autoSyncEnabled,
  onToggleAutoSync,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        showFeedback('¡Conectado con Google Drive con éxito!');
        await onManualSync();
      }
    } catch (err: unknown) {
      console.error(err);
      setAuthError(err instanceof Error ? err.message : 'No se pudo completar el inicio de sesión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      showFeedback('Desconectado de Google Drive');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Export JSON file compatible with iCloud Drive / Google Drive / Local Files
  const handleExportFile = () => {
    try {
      const exportData = {
        app: 'Lista de la compra_by RB',
        version: 1,
        exportedAt: new Date().toISOString(),
        itemsCount: items.length,
        items,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `lista_compra_RB_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('Archivo descargado para guardar en iCloud / Drive');
    } catch (err) {
      console.error(err);
      showFeedback('Error al exportar archivo');
    }
  };

  // Import JSON file from iCloud / Device Files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedItems: ShoppingItem[] = Array.isArray(parsed) ? parsed : (parsed.items || []);
        
        if (Array.isArray(importedItems)) {
          onImportItems(importedItems);
          showFeedback(`¡Se importaron ${importedItems.length} productos!`);
        } else {
          showFeedback('Formato de archivo incompatible');
        }
      } catch (err) {
        console.error(err);
        showFeedback('Error al leer el archivo de copia de seguridad');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Share plain text shopping list (WhatsApp, Telegram, Notes)
  const handleShareList = async () => {
    const pendingItems = items.filter(i => !i.completed);
    const completedItems = items.filter(i => i.completed);

    let text = `🛒 *Lista de la compra*\n\n`;
    if (pendingItems.length > 0) {
      text += `*Por comprar (${pendingItems.length}):*\n`;
      pendingItems.forEach(item => {
        text += `• ${item.text}${item.quantity ? ` (${item.quantity})` : ''}\n`;
      });
    }

    if (completedItems.length > 0) {
      text += `\n*Ya comprados (${completedItems.length}):*\n`;
      completedItems.forEach(item => {
        text += `✓ ~${item.text}~\n`;
      });
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de la compra',
          text,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      showFeedback('¡Copiada al portapapeles para WhatsApp o Notas!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#faf1b4] rounded-xl p-5 shadow-2xl border-2 border-[#d5c275] text-[#1b2332] z-10 max-h-[92vh] overflow-y-auto"
            style={{
              backgroundImage: 'linear-gradient(to bottom, transparent 31px, rgba(199, 182, 126, 0.35) 31px, rgba(199, 182, 126, 0.35) 32px)',
              backgroundSize: '100% 32px',
            }}
          >
            {/* Top Vintage Perforation Bar */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#c2b060]/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#e4d48a] rounded-md border border-[#c2b060] text-stone-800">
                  <Cloud className="w-5 h-5 text-sky-800" />
                </div>
                <div>
                  <h3 className="font-patrick text-xl font-bold tracking-wide text-stone-900 leading-tight">
                    Sincronización en la Nube
                  </h3>
                  <p className="font-patrick text-xs text-stone-600">
                    Google Drive, iCloud y Copia de Seguridad
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-300/40 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert banner */}
            <AnimatePresence>
              {feedbackMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-2 bg-emerald-100 border border-emerald-300 rounded-md text-emerald-800 text-sm font-patrick flex items-center gap-2"
                >
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feedbackMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section 1: Google Drive */}
            <div className="mt-4 bg-[#fffdec]/90 rounded-lg p-4 border border-[#dfc97c] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                  <span className="font-patrick font-bold text-base text-stone-900">
                    Google Drive
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-patrick border ${
                  syncStatus.isSignedIn 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-stone-200 text-stone-600 border-stone-300'
                }`}>
                  {syncStatus.isSignedIn ? 'Conectado' : 'No conectado'}
                </span>
              </div>

              <p className="font-patrick text-xs text-stone-600 mt-1.5 leading-relaxed">
                Guarda automáticamente un archivo seguro <code className="text-stone-800 bg-stone-200/70 px-1 py-0.5 rounded">lista_de_la_compra_by_rb.json</code> en tu cuenta de Google.
              </p>

              {syncStatus.isSignedIn ? (
                <div className="mt-3 pt-3 border-t border-[#dfc97c]/60">
                  <div className="flex items-center justify-between text-xs font-patrick text-stone-700">
                    <span className="truncate max-w-[200px] font-bold">
                      {syncStatus.userName || syncStatus.userEmail}
                    </span>
                    <button
                      onClick={handleGoogleLogout}
                      className="text-red-700 hover:underline"
                    >
                      Desconectar
                    </button>
                  </div>

                  {syncStatus.lastSyncedAt && (
                    <div className="text-[11px] font-patrick text-stone-500 mt-1 flex items-center gap-1">
                      <CloudCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      Última sincronización: {new Date(syncStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {/* Auto Sync Toggle */}
                  <div className="mt-3 flex items-center justify-between bg-amber-50/60 p-2 rounded-md border border-amber-200/70">
                    <div>
                      <span className="font-patrick font-bold text-xs text-stone-800 block">
                        Sincronización automática
                      </span>
                      <span className="font-patrick text-[11px] text-stone-600">
                        Guarda cada cambio al instante
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => onToggleAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Manual Sync Button */}
                  <button
                    onClick={onManualSync}
                    disabled={syncStatus.isSyncing}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-md font-patrick text-sm font-bold shadow-xs transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    {syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-col items-center">
                  <button 
                    onClick={handleGoogleLogin} 
                    disabled={isLoggingIn}
                    className="gsi-material-button w-full"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isLoggingIn ? 'Conectando...' : 'Iniciar sesión con Google'}
                      </span>
                    </div>
                  </button>
                  {authError && (
                    <p className="mt-2 text-xs text-red-600 font-patrick flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {authError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: iCloud & Backup de Archivos */}
            <div className="mt-4 bg-[#fffdec]/90 rounded-lg p-4 border border-[#dfc97c] shadow-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-md text-blue-700">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-patrick font-bold text-base text-stone-900 leading-tight">
                    iCloud Drive y Archivos
                  </h4>
                  <p className="font-patrick text-xs text-stone-600">
                    Copia portátil para guardar en iCloud o transferir a otros dispositivos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={handleExportFile}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#f5e6a8] hover:bg-[#ebd992] text-stone-800 rounded-md font-patrick text-xs font-bold border border-[#c7b46a] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-700" />
                  Descargar Copia
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#f5e6a8] hover:bg-[#ebd992] text-stone-800 rounded-md font-patrick text-xs font-bold border border-[#c7b46a] transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-700" />
                  Restaurar Copia
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
              </div>
            </div>

            {/* Section 3: Share with family/partner */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleShareList}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-800 hover:bg-stone-900 text-[#fbf2b7] rounded-md font-patrick text-sm font-bold shadow-xs transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartir lista por WhatsApp / Notas
              </button>
            </div>

            <div className="mt-4 pt-2 text-center">
              <button
                onClick={onClose}
                className="font-patrick text-xs text-stone-600 hover:text-stone-900 underline"
              >
                Volver a la libreta
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
