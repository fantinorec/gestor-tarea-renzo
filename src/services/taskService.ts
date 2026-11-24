import type { Task } from '../types/task';
import { apiRequest } from './api';

// Asi devuelve las tareas el backend (ver /docs del servidor):
// { id: number, title: string, description: string | null, completed: boolean }
export type TaskApi = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
};

// El backend no tiene prioridad, por eso en la app queda 'media' por defecto.
export function desdeApi(t: TaskApi): Task {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description ?? '',
    priority: 'media',
    completed: t.completed,
  };
}

// GET /tasks/ -> listado. El backend por defecto trae 10, pido hasta 100.
export async function fetchTasks(simulateFailure = false): Promise<Task[]> {
  if (simulateFailure) {
    // dejo el boton de "Simular error API" del taller para probar el estado de error
    throw new Error('HTTP 503: servidor temporalmente indisponible (simulado)');
  }
  const lista = await apiRequest<TaskApi[]>('/tasks/?limit=100');
  return lista.map(desdeApi);
}

// POST /tasks/ -> crea una tarea nueva
export async function createTask(title: string, description: string): Promise<Task> {
  const creada = await apiRequest<TaskApi>('/tasks/', {
    method: 'POST',
    body: { title: title.trim(), description: description.trim(), completed: false },
  });
  return desdeApi(creada);
}

// PUT /tasks/{id} -> el backend pide el objeto completo, no solo el campo que cambia
export async function updateTask(task: Task): Promise<Task> {
  const actualizada = await apiRequest<TaskApi>(`/tasks/${task.id}`, {
    method: 'PUT',
    body: { title: task.title, description: task.description, completed: task.completed },
  });
  return desdeApi(actualizada);
}

// DELETE /tasks/{id}
export async function deleteTaskApi(id: string): Promise<void> {
  await apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' });
}
