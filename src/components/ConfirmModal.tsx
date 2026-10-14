import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0"
          />

          {/* Vintage Note Card Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15, rotate: -1 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10, rotate: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-[#fff8cc] rounded-lg p-5 shadow-2xl border-2 border-[#dfc97c] text-[#1c1d21] z-10"
            style={{
              backgroundImage: 'linear-gradient(to bottom, transparent 27px, rgba(200, 180, 110, 0.3) 27px, rgba(200, 180, 110, 0.3) 28px)',
              backgroundSize: '100% 28px',
            }}
          >
            {/* Vintage piece of tape on top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#f7eed0]/80 border border-[#e2d5ab] rotate-1 shadow-xs rounded-xs pointer-events-none opacity-85" />

            <div className="flex items-start gap-3 mt-1">
              <div className={`p-2.5 rounded-full shrink-0 ${isDestructive ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-patrick text-xl font-bold tracking-wide text-stone-900 leading-tight">
                  {title}
                </h3>
                <p className="font-patrick text-base text-stone-700 mt-1 leading-snug">
                  {message}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-[#dfc97c]/60">
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-1.5 rounded-md font-patrick text-base text-stone-700 hover:bg-stone-200/50 transition-colors border border-stone-300 active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-1.5 rounded-md font-patrick text-base font-bold shadow-xs active:scale-95 transition-all text-white ${
                  isDestructive 
                    ? 'bg-[#c53030] hover:bg-[#9b2c2c] border border-[#742a2a]' 
                    : 'bg-[#2b6cb0] hover:bg-[#2c5282] border border-[#1a365d]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
