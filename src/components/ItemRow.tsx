import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit3, Check, X, RotateCcw } from 'lucide-react';
import { ShoppingItem } from '../types';
import { CATEGORY_COLORS } from '../data/commonItems';
import { soundManager } from '../services/sound';

interface ItemRowProps {
  item: ShoppingItem;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, newText: string, newQuantity?: string) => void;
  isHighlighted?: boolean;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onToggleComplete,
  onDeleteItem,
  onUpdateItem,
  isHighlighted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editQty, setEditQty] = useState(item.quantity || '');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    if (!item.completed) {
      soundManager.playStrike();
    } else {
      soundManager.playUntick();
    }
    onToggleComplete(item.id);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      onUpdateItem(item.id, trimmed, editQty.trim() || undefined);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(item.text);
    setEditQty(item.quantity || '');
    setIsEditing(false);
  };

  const categoryStyle = item.category ? CATEGORY_COLORS[item.category] : CATEGORY_COLORS['General'];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        backgroundColor: isHighlighted ? '#fef08a' : 'transparent',
      }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
      transition={{
        layout: { type: 'spring', damping: 28, stiffness: 350 },
        opacity: { duration: 0.25 },
      }}
      className={`group relative flex items-center justify-between min-h-[41px] py-1 px-1 border-b border-[#ebdca2]/50 rounded-sm transition-colors ${
        item.completed ? 'bg-[#f5ecad]/40' : 'hover:bg-[#fbf0a9]/60'
      }`}
    >
      {/* Left side: Tick Checkbox and Item Text */}
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
        {/* Vintage Ink Tick Button */}
        <button
          type="button"
          onClick={handleToggle}
          title={item.completed ? 'Desmarcar y reactivar producto' : 'Marcar y tachar producto'}
          className={`relative w-6 h-6 rounded-md flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
            item.completed
              ? 'border-[#2c3e50] bg-[#1e293b]/10'
              : 'border-[#7d6837] hover:border-[#1e293b] bg-[#fffce8]/80'
          }`}
          style={{
            transform: item.completed ? 'rotate(-2deg)' : 'rotate(1deg)',
          }}
        >
          <AnimatePresence>
            {item.completed && (
              <motion.svg
                key="tick-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#172554"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                initial={{ pathLength: 0, scale: 0.5, rotate: -20 }}
                animate={{ pathLength: 1, scale: 1, rotate: 0 }}
                exit={{ pathLength: 0, scale: 0.5 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <motion.path d="M4 12l5 5L20 6" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* Content: Display Mode vs Edit Mode */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="flex-1 bg-[#fffdec] border border-[#cbb868] rounded px-2 py-0.5 font-patrick text-xl text-stone-900 outline-none"
            />
            <input
              type="text"
              placeholder="Cant."
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="w-16 bg-[#fffdec] border border-[#cbb868] rounded px-1.5 py-0.5 font-patrick text-lg text-stone-900 outline-none"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
              title="Guardar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-stone-500 hover:bg-stone-200 rounded"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleToggle}
            className="relative flex-1 min-w-0 cursor-pointer select-none flex items-baseline flex-wrap gap-x-2"
          >
            {/* The Item Text with Realistic Handwritten Strike Animation */}
            <div className="relative inline-block">
              <span
                className={`font-patrick text-2xl tracking-wide transition-colors duration-300 ${
                  item.completed
                    ? 'text-stone-500/80 font-normal'
                    : 'text-[#17202e] font-semibold'
                }`}
              >
                {item.text}
              </span>

              {/* Hand-drawn ink strikeout line with smooth animated drawing */}
              <AnimatePresence>
                {item.completed && (
                  <motion.div
                    key="strike-line"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '105%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-[-2.5%] top-[52%] h-[2.5px] rounded-full pointer-events-none origin-left"
                    style={{
                      background: 'linear-gradient(90deg, #1e293b 0%, #334155 70%, #1e293b 100%)',
                      boxShadow: '0 0.5px 1px rgba(0,0,0,0.2)',
                      transform: 'rotate(-0.8deg)',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Quantity or details badge */}
            {item.quantity && (
              <span
                className={`font-handwriting text-xl text-stone-600 transition-opacity ${
                  item.completed ? 'opacity-50 line-through' : ''
                }`}
              >
                ({item.quantity})
              </span>
            )}

            {/* Category tag */}
            {item.category && item.category !== 'General' && (
              <span
                className={`text-[11px] font-patrick px-2 py-0.2 rounded-full border shrink-0 transition-opacity ${
                  item.completed ? 'opacity-40 grayscale' : 'opacity-85'
                }`}
                style={{
                  backgroundColor: categoryStyle.badgeBg,
                  borderColor: categoryStyle.badgeBorder,
                  color: categoryStyle.text,
                }}
              >
                {item.category}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: Action controls */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {item.completed ? (
            <button
              onClick={handleToggle}
              title="Desmarcar y devolver arriba"
              className="p-1 text-stone-500 hover:text-amber-800 hover:bg-amber-100/50 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              title="Editar texto o cantidad"
              className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onDeleteItem(item.id)}
            title="Eliminar de la libreta"
            className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-100/60 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.li>
  );
};
