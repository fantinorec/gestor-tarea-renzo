import type { Task, TaskStatus } from '../types/task';

export function filterTasks(tasks: Task[], query: string, status: TaskStatus): Task[] {
  const byStatus = tasks.filter((task) => {
    if (status === 'pendientes') return !task.completed;
    if (status === 'completadas') return task.completed;
    return true;
  });

  // FIX incidencia 1: antes se comparaba el texto tal cual (includes distingue
  // mayusculas y los espacios de mas hacian que no encuentre nada).
  // Ahora paso los dos textos a minuscula y le saco los espacios a la busqueda.
  const busqueda = query.trim().toLowerCase();
  return byStatus.filter((task) => task.title.toLowerCase().includes(busqueda));
}
