import { CategoryType } from '../types';

export interface PredefinedItem {
  name: string;
  category: CategoryType;
  emoji?: string;
}

export const COMMON_SHOPPING_ITEMS: PredefinedItem[] = [
  // Frutas y Verduras
  { name: 'Plátanos', category: 'Frutas y Verduras', emoji: '🍌' },
  { name: 'Manzanas', category: 'Frutas y Verduras', emoji: '🍎' },
  { name: 'Naranjas', category: 'Frutas y Verduras', emoji: '🍊' },
  { name: 'Limones', category: 'Frutas y Verduras', emoji: '🍋' },
  { name: 'Tomates', category: 'Frutas y Verduras', emoji: '🍅' },
  { name: 'Cebollas', category: 'Frutas y Verduras', emoji: '🧅' },
  { name: 'Patatas', category: 'Frutas y Verduras', emoji: '🥔' },
  { name: 'Ajos', category: 'Frutas y Verduras', emoji: '🧄' },
  { name: 'Lechuga', category: 'Frutas y Verduras', emoji: '🥬' },
  { name: 'Zanahorias', category: 'Frutas y Verduras', emoji: '🥕' },
  { name: 'Aguacates', category: 'Frutas y Verduras', emoji: '🥑' },
  { name: 'Fresas', category: 'Frutas y Verduras', emoji: '🍓' },
  { name: 'Pimientos', category: 'Frutas y Verduras', emoji: '🫑' },
  { name: 'Calabacín', category: 'Frutas y Verduras', emoji: '🥒' },

  // Lácteos y Huevos
  { name: 'Leche entera', category: 'Lácteos y Huevos', emoji: '🥛' },
  { name: 'Leche desnatada', category: 'Lácteos y Huevos', emoji: '🥛' },
  { name: 'Leche semidesnatada', category: 'Lácteos y Huevos', emoji: '🥛' },
  { name: 'Huevos camperos', category: 'Lácteos y Huevos', emoji: '🥚' },
  { name: 'Mantequilla', category: 'Lácteos y Huevos', emoji: '🧈' },
  { name: 'Queso rallado', category: 'Lácteos y Huevos', emoji: '🧀' },
  { name: 'Queso curado', category: 'Lácteos y Huevos', emoji: '🧀' },
  { name: 'Yogures naturales', category: 'Lácteos y Huevos', emoji: '🥣' },
  { name: 'Nata para cocinar', category: 'Lácteos y Huevos', emoji: '🥛' },

  // Panadería
  { name: 'Pan de barra', category: 'Panadería', emoji: '🥖' },
  { name: 'Pan de molde', category: 'Panadería', emoji: '🍞' },
  { name: 'Croissants', category: 'Panadería', emoji: '🥐' },
  { name: 'Galletas', category: 'Panadería', emoji: '🍪' },
  { name: 'Magdalenas', category: 'Panadería', emoji: '🧁' },

  // Carnes y Pescados
  { name: 'Pechuga de pollo', category: 'Carnes y Pescados', emoji: '🍗' },
  { name: 'Carne picada', category: 'Carnes y Pescados', emoji: '🥩' },
  { name: 'Filetes de ternera', category: 'Carnes y Pescados', emoji: '🥩' },
  { name: 'Salmón fresco', category: 'Carnes y Pescados', emoji: '🐟' },
  { name: 'Merluza', category: 'Carnes y Pescados', emoji: '🐟' },
  { name: 'Jamón serrano', category: 'Carnes y Pescados', emoji: '🥓' },
  { name: 'Jamón cocido', category: 'Carnes y Pescados', emoji: '🥓' },

  // Despensa
  { name: 'Aceite de oliva virgen extra', category: 'Despensa', emoji: '🫒' },
  { name: 'Arroz redondo', category: 'Despensa', emoji: '🍚' },
  { name: 'Pasta espaguetis', category: 'Despensa', emoji: '🍝' },
  { name: 'Pasta macarrones', category: 'Despensa', emoji: '🍝' },
  { name: 'Café molido', category: 'Despensa', emoji: '☕' },
  { name: 'Cápsulas de café', category: 'Despensa', emoji: '☕' },
  { name: 'Azúcar blanco', category: 'Despensa', emoji: '🧂' },
  { name: 'Sal fina', category: 'Despensa', emoji: '🧂' },
  { name: 'Atún en lata', category: 'Despensa', emoji: '🥫' },
  { name: 'Tomate frito', category: 'Despensa', emoji: '🥫' },
  { name: 'Legumbres / Garbanzos', category: 'Despensa', emoji: '🫘' },
  { name: 'Cereales desayuno', category: 'Despensa', emoji: '🥣' },

  // Bebidas
  { name: 'Agua mineral', category: 'Bebidas', emoji: '💧' },
  { name: 'Zumo de naranja', category: 'Bebidas', emoji: '🧃' },
  { name: 'Cerveza', category: 'Bebidas', emoji: '🍺' },
  { name: 'Vino tinto', category: 'Bebidas', emoji: '🍷' },
  { name: 'Refresco', category: 'Bebidas', emoji: '🥤' },

  // Limpieza y Hogar
  { name: 'Papel higiénico', category: 'Limpieza y Hogar', emoji: '🧻' },
  { name: 'Papel de cocina', category: 'Limpieza y Hogar', emoji: '🧻' },
  { name: 'Detergente lavadora', category: 'Limpieza y Hogar', emoji: '🧺' },
  { name: 'Suavizante', category: 'Limpieza y Hogar', emoji: '🧺' },
  { name: 'Lavavajillas / Fairy', category: 'Limpieza y Hogar', emoji: '🍽️' },
  { name: 'Pastillas lavavajillas', category: 'Limpieza y Hogar', emoji: '🧼' },
  { name: 'Bolsas de basura', category: 'Limpieza y Hogar', emoji: '🗑️' },
  { name: 'Fregasuelos', category: 'Limpieza y Hogar', emoji: '🧹' },
  { name: 'Bayetas y estropajos', category: 'Limpieza y Hogar', emoji: '🧽' },

  // Higiene Personal
  { name: 'Gel de ducha', category: 'Higiene Personal', emoji: '🧴' },
  { name: 'Champú', category: 'Higiene Personal', emoji: '🧴' },
  { name: 'Pasta de dientes', category: 'Higiene Personal', emoji: '🪥' },
  { name: 'Desodorante', category: 'Higiene Personal', emoji: '✨' },
  { name: 'Jabón de manos', category: 'Higiene Personal', emoji: '🧼' },
];

export const CATEGORY_COLORS: Record<CategoryType, { badgeBg: string; badgeBorder: string; text: string }> = {
  'General': { badgeBg: '#fef08a', badgeBorder: '#ca8a04', text: '#713f12' },
  'Frutas y Verduras': { badgeBg: '#dcfce7', badgeBorder: '#16a34a', text: '#14532d' },
  'Lácteos y Huevos': { badgeBg: '#e0f2fe', badgeBorder: '#0284c7', text: '#0369a1' },
  'Panadería': { badgeBg: '#ffedd5', badgeBorder: '#ea580c', text: '#9a3412' },
  'Carnes y Pescados': { badgeBg: '#ffe4e6', badgeBorder: '#e11d48', text: '#881337' },
  'Despensa': { badgeBg: '#fef3c7', badgeBorder: '#d97706', text: '#78350f' },
  'Bebidas': { badgeBg: '#e0e7ff', badgeBorder: '#4f46e5', text: '#312e81' },
  'Limpieza y Hogar': { badgeBg: '#ccfbf1', badgeBorder: '#0d9488', text: '#134e4a' },
  'Higiene Personal': { badgeBg: '#f3e8ff', badgeBorder: '#9333ea', text: '#581c87' },
};

export function inferCategory(itemName: string): CategoryType {
  const normalized = itemName.toLowerCase().trim();
  const match = COMMON_SHOPPING_ITEMS.find(item => 
    normalized.includes(item.name.toLowerCase()) || 
    item.name.toLowerCase().includes(normalized)
  );
  return match ? match.category : 'General';
}
