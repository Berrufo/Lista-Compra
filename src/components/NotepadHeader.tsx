import React from 'react';
import { 
  Cloud, 
  Volume2, 
  VolumeX, 
  Archive, 
  Trash2, 
  Sparkles, 
  Share2 
} from 'lucide-react';
import { FilterMode, SyncStatus } from '../types';

interface NotepadHeaderProps {
  pendingCount: number;
  completedCount: number;
  filter: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  onOpenSync: () => void;
  syncStatus: SyncStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const NotepadHeader: React.FC<NotepadHeaderProps> = ({
  pendingCount,
  completedCount,
  filter,
  onFilterChange,
  onOpenSync,
  syncStatus,
  soundEnabled,
  onToggleSound,
  onClearCompleted,
  onClearAll,
}) => {
  return (
    <div className="relative z-10">
      {/* Top Binding: Vintage dark leatherette / textured kraft top band with brass staples */}
      <div className="notebook-header-band rounded-t-xl px-4 py-3 flex items-center justify-between text-amber-100 shadow-md">
        {/* Brass staples styling */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-1.5 bg-[#c89d55] rounded-xs shadow-inner border border-[#835c24]" />
          <div className="w-6 h-1.5 bg-[#c89d55] rounded-xs shadow-inner border border-[#835c24]" />
        </div>

        <div className="text-center font-typewriter tracking-widest text-[11px] uppercase text-amber-200/90 font-bold">
          ★ BLOC DE NOTAS VINTAGE ★
        </div>

        <div className="flex items-center gap-3">
          <div className="w-6 h-1.5 bg-[#c89d55] rounded-xs shadow-inner border border-[#835c24]" />
          <div className="w-6 h-1.5 bg-[#c89d55] rounded-xs shadow-inner border border-[#835c24]" />
        </div>
      </div>

      {/* Perforated edge tear line */}
      <div className="h-2 perforated-edge opacity-60" />

      {/* Main Header inside notepad */}
      <div className="px-4 pt-3 pb-2 border-b border-[#ebdca2]">
        <div className="flex items-start justify-between gap-2">
          <div>
            {/* Title */}
            <h1 className="font-kalam text-3xl sm:text-4xl font-bold tracking-tight text-[#1b2332] leading-none">
              Lista de la compra
            </h1>
            <p className="font-handwriting text-lg text-stone-600 mt-0.5">
              Bloc de notas personal • Tacha y organiza
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            {/* Cloud Sync Button */}
            <button
              onClick={onOpenSync}
              title="Sincronización en la nube (Google Drive / iCloud)"
              className="relative p-2 rounded-lg bg-[#efe49d] hover:bg-[#e4d48a] border border-[#d2be65] text-stone-800 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <Cloud className="w-4 h-4 text-sky-800" />
              {/* Online indicator dot */}
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#fbf2b7] ${
                  syncStatus.isSignedIn ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                }`}
              />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Sonidos de papel y pluma activados' : 'Sonidos desactivados'}
              className="p-2 rounded-lg bg-[#efe49d] hover:bg-[#e4d48a] border border-[#d2be65] text-stone-800 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-stone-700" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>
          </div>
        </div>

        {/* Counter badges & Filter tabs */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-patrick">
          {/* Status summary */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#fff7d1] border border-[#e0cb74] text-stone-800 text-base font-bold">
              {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
            </span>
            {completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-[#eee3a2] text-stone-600 text-base">
                {completedCount} {completedCount === 1 ? 'tachado' : 'tachados'}
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center bg-[#f0e39c] p-0.5 rounded-lg border border-[#cbb868]">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-0.5 rounded-md text-base transition-all ${
                filter === 'all'
                  ? 'bg-[#1b2332] text-[#fbf2b7] font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Todos ({pendingCount + completedCount})
            </button>
            <button
              onClick={() => onFilterChange('pending')}
              className={`px-2.5 py-0.5 rounded-md text-base transition-all ${
                filter === 'pending'
                  ? 'bg-[#1b2332] text-[#fbf2b7] font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Por comprar ({pendingCount})
            </button>
            <button
              onClick={() => onFilterChange('completed')}
              className={`px-2.5 py-0.5 rounded-md text-base transition-all ${
                filter === 'completed'
                  ? 'bg-[#1b2332] text-[#fbf2b7] font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Tachados ({completedCount})
            </button>
          </div>
        </div>

        {/* Extra actions bar: clear completed */}
        {completedCount > 0 && (
          <div className="mt-2.5 flex items-center justify-end gap-2 text-xs font-patrick">
            <button
              onClick={onClearCompleted}
              className="flex items-center gap-1 text-stone-600 hover:text-red-700 hover:underline transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Borrar tachados
            </button>
            <span className="text-stone-400">•</span>
            <button
              onClick={onClearAll}
              className="text-stone-500 hover:text-red-800 hover:underline transition-colors"
            >
              Vaciar libreta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
