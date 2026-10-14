export type CategoryType = 
  | 'General'
  | 'Frutas y Verduras'
  | 'Lácteos y Huevos'
  | 'Panadería'
  | 'Carnes y Pescados'
  | 'Despensa'
  | 'Bebidas'
  | 'Limpieza y Hogar'
  | 'Higiene Personal';

export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  category?: CategoryType;
  quantity?: string;
  notes?: string;
  createdAt: number;
  completedAt?: number;
}

export type FilterMode = 'all' | 'pending' | 'completed';

export interface SyncStatus {
  isConfigured: boolean;
  isSignedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  userPhoto: string | null;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  error: string | null;
  provider: 'none' | 'google-drive';
}

export interface SuggestionMatch {
  text: string;
  category: CategoryType;
  isExistingInList: boolean;
  existingItem?: ShoppingItem;
}
