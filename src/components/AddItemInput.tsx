import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Sparkles, CheckCircle2, RotateCcw, AlertCircle, ShoppingBasket } from 'lucide-react';
import { ShoppingItem, CategoryType } from '../types';
import { COMMON_SHOPPING_ITEMS, inferCategory } from '../data/commonItems';
import { soundManager } from '../services/sound';

interface AddItemInputProps {
  items: ShoppingItem[];
  onAddItem: (text: string, category?: CategoryType, quantity?: string) => boolean;
  onUncheckExistingItem: (id: string) => void;
  onHighlightItem: (id: string) => void;
}

export const AddItemInput: React.FC<AddItemInputProps> = ({
  items,
  onAddItem,
  onUncheckExistingItem,
  onHighlightItem,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedQty, setSelectedQty] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize text for comparison (remove accents & lowercase)
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Find duplicates or suggestions in the current list and common dictionary
  const currentNormalized = normalize(inputText);

  // Check if current input matches an existing item in the shopping list
  const existingItemMatch = useMemo(() => {
    if (!currentNormalized) return null;
    return items.find((item) => normalize(item.text) === currentNormalized);
  }, [items, currentNormalized]);

  // Autocomplete suggestions based on user input
  const suggestions = useMemo(() => {
    if (!currentNormalized || currentNormalized.length < 1) return [];

    const results: Array<{
      text: string;
      category: CategoryType;
      existingItem?: ShoppingItem;
      isCompleted?: boolean;
    }> = [];

    // 1. Check current items first
    items.forEach((item) => {
      if (normalize(item.text).includes(currentNormalized)) {
        results.push({
          text: item.text,
          category: item.category || 'General',
          existingItem: item,
          isCompleted: item.completed,
        });
      }
    });

    // 2. Add dictionary matches not already present in current list
    COMMON_SHOPPING_ITEMS.forEach((common) => {
      const match = normalize(common.name).includes(currentNormalized);
      const alreadyInResults = results.some(
        (r) => normalize(r.text) === normalize(common.name)
      );
      if (match && !alreadyInResults) {
        results.push({
          text: common.name,
          category: common.category,
        });
      }
    });

    return results.slice(0, 6);
  }, [items, currentNormalized]);

  // Popular quick adds when input is empty
  const popularQuickAdds = useMemo(() => {
    const listNames = new Set(items.map((i) => normalize(i.text)));
    return ['Plátanos', 'Leche entera', 'Huevos camperos', 'Pan de barra', 'Café molido', 'Tomates']
      .filter((name) => !listNames.has(normalize(name)))
      .slice(0, 4);
  }, [items]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Check for exact duplicate in current list
    if (existingItemMatch) {
      if (existingItemMatch.completed) {
        // It's marked/struck through -> uncheck/reactivate it as requested!
        onUncheckExistingItem(existingItemMatch.id);
        soundManager.playUntick();
        setDuplicateWarning(`¡"${existingItemMatch.text}" estaba tachado y se ha reactivado!`);
        setInputText('');
        setSelectedQty('');
        setTimeout(() => setDuplicateWarning(null), 3000);
        return;
      } else {
        // Already active in list -> prevent duplicate and highlight it
        setDuplicateWarning(`¡"${existingItemMatch.text}" ya está en tu lista!`);
        onHighlightItem(existingItemMatch.id);
        setTimeout(() => setDuplicateWarning(null), 3000);
        return;
      }
    }

    const category = inferCategory(trimmed);
    const added = onAddItem(trimmed, category, selectedQty || undefined);
    if (added) {
      soundManager.playAdd();
      setInputText('');
      setSelectedQty('');
      setDuplicateWarning(null);
    }
  };

  const handleSelectSuggestion = (suggestion: {
    text: string;
    category: CategoryType;
    existingItem?: ShoppingItem;
    isCompleted?: boolean;
  }) => {
    if (suggestion.existingItem) {
      if (suggestion.existingItem.completed) {
        // Reactivate struck item
        onUncheckExistingItem(suggestion.existingItem.id);
        soundManager.playUntick();
        setDuplicateWarning(`¡"${suggestion.existingItem.text}" reactivado a la lista!`);
        setInputText('');
        setTimeout(() => setDuplicateWarning(null), 3000);
      } else {
        // Already in list
        setDuplicateWarning(`"${suggestion.existingItem.text}" ya está pendiente en tu lista`);
        onHighlightItem(suggestion.existingItem.id);
        setTimeout(() => setDuplicateWarning(null), 3000);
      }
      return;
    }

    // Add new item
    const added = onAddItem(suggestion.text, suggestion.category, selectedQty || undefined);
    if (added) {
      soundManager.playAdd();
      setInputText('');
      setSelectedQty('');
      setDuplicateWarning(null);
    }
  };

  return (
    <div className="relative mb-4 z-20">
      {/* Duplicate / Reactivation Alert Note */}
      {duplicateWarning && (
        <div className="mb-2 p-2 bg-[#fef3c7] border border-[#d97706]/70 rounded-md font-patrick text-amber-900 text-sm flex items-center gap-2 shadow-xs animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Input container styled like vintage notepad line */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-[#fffdf0]/80 rounded-lg p-1.5 pl-3 border-2 border-[#d6c478] shadow-xs focus-within:border-[#967d33] focus-within:shadow-md transition-all"
      >
        <span className="font-handwriting text-2xl text-stone-600 select-none pb-0.5">
          ✍︎
        </span>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setDuplicateWarning(null);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Escribe un producto para comprar..."
          className="flex-1 bg-transparent border-none outline-none font-patrick text-xl text-[#1a2332] placeholder:text-stone-400/90 py-1"
        />

        {/* Quick quantity chips */}
        {inputText.trim().length > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-xs font-patrick">
            {['1', '2', '1 kg', 'Pack'].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setSelectedQty(selectedQty === qty ? '' : qty)}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  selectedQty === qty
                    ? 'bg-[#1b2432] text-[#fbf2b7] border-[#1b2432]'
                    : 'bg-[#f4eaab] text-stone-700 border-[#d5c479] hover:bg-[#ede098]'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>
        )}

        {/* Vintage Add Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-[#2d241e] hover:bg-[#1a1410] disabled:bg-stone-300 text-[#fbf2b7] rounded-md font-patrick text-lg font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      {/* Real-time suggestions dropdown without duplicates */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#fffce8] border-2 border-[#cbb868] rounded-lg shadow-xl overflow-hidden z-30">
          <div className="p-1.5 bg-[#efe49d]/70 border-b border-[#cbb868] flex items-center justify-between text-xs font-patrick text-stone-700">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Sugerencias de la libreta:
            </span>
            <span className="text-[11px] text-stone-500">
              Evita duplicados automáticamente
            </span>
          </div>

          <div className="divide-y divide-[#ebdca2]/60 max-h-56 overflow-y-auto">
            {suggestions.map((sug, idx) => (
              <button
                key={`${sug.text}-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#f6eeb3] active:bg-[#eee39a] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {sug.existingItem ? (
                    sug.isCompleted ? (
                      <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )
                  ) : (
                    <ShoppingBasket className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                  <span
                    className={`font-patrick text-lg ${
                      sug.isCompleted
                        ? 'line-through text-stone-500'
                        : 'text-stone-900 font-semibold'
                    }`}
                  >
                    {sug.text}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1e59f] text-stone-700 font-patrick border border-[#dfce7b]">
                    {sug.category}
                  </span>

                  {sug.existingItem && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-patrick font-bold ${
                        sug.isCompleted
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {sug.isCompleted ? 'Desmarcar / Reactivar' : 'Ya en lista'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick suggestions when input is empty & focused */}
      {isFocused && !inputText && popularQuickAdds.length > 0 && (
        <div className="mt-2 flex items-center flex-wrap gap-1.5 text-xs font-patrick">
          <span className="text-stone-600 select-none flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            Frecuentes:
          </span>
          {popularQuickAdds.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onAddItem(item, inferCategory(item));
                soundManager.playAdd();
              }}
              className="px-2 py-0.5 bg-[#f5e9a4] hover:bg-[#edd881] text-stone-800 rounded-full border border-[#d2be65] transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              + {item}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop listener to close suggestion popover */}
      {isFocused && (
        <div
          onClick={() => setIsFocused(false)}
          className="fixed inset-0 z-10"
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </div>
  );
};
