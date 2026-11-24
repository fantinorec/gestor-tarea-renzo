import { createTask, deleteTaskApi, fetchTasks, updateTask } from '../src/services/taskService';

// Simulo el servidor con un fetch falso, asi los tests no dependen de Internet
const fetchFalso = jest.fn();
globalThis.fetch = fetchFalso as unknown as typeof fetch;

function respuesta(status: number, body: unknown) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
}

beforeEach(() => fetchFalso.mockReset());

describe('taskService contra la API de tareas', () => {
  it('convierte las tareas del backend al formato de la app', async () => {
    fetchFalso.mockReturnValue(respuesta(200, [{ id: 7, title: 'Entregar APK', description: null, completed: false }]));
    const tareas = await fetchTasks();
    expect(fetchFalso.mock.calls[0][0]).toContain('/tasks/?limit=100');
    expect(tareas[0]).toEqual({ id: '7', title: 'Entregar APK', description: '', priority: 'media', completed: false });
  });

  it('crea una tarea con POST y el titulo sin espacios de mas', async () => {
    fetchFalso.mockReturnValue(respuesta(201, { id: 8, title: 'Nueva', description: '', completed: false }));
    const tarea = await createTask('  Nueva  ', '');
    const [, opciones] = fetchFalso.mock.calls[0];
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body).title).toBe('Nueva');
    expect(tarea.id).toBe('8');
  });

  it('actualiza con PUT mandando el objeto completo', async () => {
    fetchFalso.mockReturnValue(respuesta(200, { id: 3, title: 'A', description: 'B', completed: true }));
    await updateTask({ id: '3', title: 'A', description: 'B', priority: 'media', completed: true });
    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toContain('/tasks/3');
    expect(opciones.method).toBe('PUT');
    expect(JSON.parse(opciones.body)).toEqual({ title: 'A', description: 'B', completed: true });
  });

  it('elimina con DELETE y acepta la respuesta 204 sin cuerpo', async () => {
    fetchFalso.mockReturnValue(respuesta(204, null));
    await expect(deleteTaskApi('3')).resolves.toBeUndefined();
  });

  it('muestra un mensaje claro si el servidor falla (500)', async () => {
    fetchFalso.mockReturnValue(respuesta(500, null));
    await expect(fetchTasks()).rejects.toThrow('Error del servidor');
  });

  it('muestra un mensaje claro si no hay conexion', async () => {
    fetchFalso.mockReturnValue(Promise.reject(new TypeError('Network request failed')));
    await expect(fetchTasks()).rejects.toThrow('No hay conexión');
  });

  it('el boton de simular error sigue funcionando', async () => {
    await expect(fetchTasks(true)).rejects.toThrow('503');
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
