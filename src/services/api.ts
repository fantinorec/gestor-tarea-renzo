// Cliente comun para hablar con el backend de tareas (FastAPI del profe Montenegro).
// La URL se lee de la variable EXPO_PUBLIC_API_URL (archivo .env o eas.json).
// No va ninguna clave aca, es una URL publica.
const DEFAULT_URL = 'https://api.montenegroariel.com.ar';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL).trim().replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Opciones = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown };

export async function apiRequest<T>(path: string, opciones: Opciones = {}): Promise<T> {
  // si el servidor no contesta en 10 segundos cancelo el pedido
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method: opciones.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(opciones.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('El servidor tardó demasiado en responder.');
    }
    throw new ApiError('No hay conexión con el servidor. Revisá tu Internet.');
  } finally {
    clearTimeout(timer);
  }

  // 204 = se borro bien y no viene cuerpo
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 404) throw new ApiError('La tarea ya no existe en el servidor.', 404);
    if (response.status === 422) throw new ApiError('Datos inválidos, revisá el título.', 422);
    if (response.status >= 500) throw new ApiError('Error del servidor, probá de nuevo.', response.status);
    throw new ApiError(`Error HTTP ${response.status}`, response.status);
  }
  return data as T;
}
