import { ShoppingItem } from '../types';
import { getAccessToken } from './firebase';

const DRIVE_FILE_NAME = 'lista_de_la_compra_by_rb.json';

export interface DriveSyncResult {
  success: boolean;
  fileId?: string;
  items?: ShoppingItem[];
  updatedAt?: number;
  error?: string;
}

/**
 * Searches for an existing shopping list file in the user's Google Drive.
 */
export async function findDriveFile(token: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id, name, modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Sesión caducada. Por favor, vuelve a iniciar sesión con Google.');
    }
    const err = await res.text();
    throw new Error(`Error al buscar en Google Drive: ${err}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Loads the shopping list items from Google Drive.
 */
export async function loadFromDrive(): Promise<DriveSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'Inicia sesión con Google para sincronizar.' };
  }

  try {
    const fileId = await findDriveFile(token);
    if (!fileId) {
      return { success: true, items: [] };
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('No se pudo leer el archivo de Google Drive');
    }

    const payload = await res.json();
    const items: ShoppingItem[] = Array.isArray(payload) ? payload : (payload.items || []);
    return {
      success: true,
      fileId,
      items,
      updatedAt: Date.now(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cargar de Google Drive';
    return { success: false, error: message };
  }
}

/**
 * Saves current shopping list items to Google Drive (creates or updates).
 */
export async function saveToDrive(items: ShoppingItem[]): Promise<DriveSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: 'No se encontró el token de acceso de Google Drive.' };
  }

  try {
    const fileId = await findDriveFile(token);
    const content = JSON.stringify({
      version: 1,
      appName: 'Lista de la compra_by RB',
      updatedAt: new Date().toISOString(),
      items,
    }, null, 2);

    if (fileId) {
      // Update existing file content
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: content,
        }
      );

      if (!res.ok) {
        throw new Error('Error al actualizar el archivo en Google Drive');
      }

      return { success: true, fileId, updatedAt: Date.now() };
    } else {
      // Create new file with metadata & content via multipart
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata = {
        name: DRIVE_FILE_NAME,
        mimeType: 'application/json',
        description: 'Lista de la compra sincronizada - Bloc de notas by RB',
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        content +
        closeDelimiter;

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!res.ok) {
        throw new Error('Error al crear el archivo en Google Drive');
      }

      const created = await res.json();
      return { success: true, fileId: created.id, updatedAt: Date.now() };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar en Google Drive';
    return { success: false, error: message };
  }
}
