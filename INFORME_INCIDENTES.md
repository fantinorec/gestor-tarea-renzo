# Informe de incidencias · Gestor de tareas

**Estudiante:** Renzo Fantino Recalde  
**Fecha:** 24/11/2026  
**Proyecto / rama Git:** gestor-tareas-renzo / main  
**Entorno (Expo SDK, Android, dispositivo):** Expo SDK 57, React Native 0.86, probado en Android con Expo Go y con la APK preview

## Resumen ejecutivo
Partí del proyecto Gestor de tareas que subió el profe en la clase 11. Primero hice un commit de respaldo y corrí `npm test`: de 9 pruebas fallaban 3. Después fui probando la app en el celular y encontré 6 fallas, las corregí de a una (un commit por cada una) y al final conecté la app al backend de tareas de Programación III (`https://api.montenegroariel.com.ar`). Ahora pasan las 16 pruebas.

## Incidencia 1
- **Título de incidencia:** La búsqueda no encuentra tareas si escribo en mayúscula o con espacios
- **Pasos para reproducir:** escribir "VALIDAR" o "  login  " en el buscador.
- **Esperado / observado:** esperaba que aparezca "Validar login". No aparecía nada.
- **Herramienta usada (DevTools / consola / test):** test `taskFilters.test.ts` (fallaban 2 casos) y `console.log` del query.
- **Hipótesis y evidencia:** pensé que comparaba el texto exacto. En el log se veía el query con los espacios y en mayúscula.
- **Archivo y función involucrada:** `src/utils/taskFilters.ts` → `filterTasks`
- **Causa raíz:** `includes()` distingue mayúsculas y minúsculas, y el query no se limpiaba con `trim()`.
- **Corrección aplicada:** paso el título y la búsqueda a minúscula y le saco los espacios a la búsqueda.
- **Prueba de regresión:** `taskFilters.test.ts` (los 4 casos pasan).
- **Estado:** Corregido

## Incidencia 2
- **Título de incidencia:** La lista no cambia mientras escribo en el buscador
- **Pasos para reproducir:** escribir algo en "Buscar por nombre". La lista recién cambia al tocar un filtro.
- **Esperado / observado:** que se filtre al escribir / no pasaba nada hasta tocar "Todas", "Pendientes"...
- **Herramienta usada:** React DevTools (el estado `query` cambiaba pero `visibleTasks` no).
- **Hipótesis y evidencia:** si el estado cambia y la lista no, el problema está en cómo se calcula la lista.
- **Archivo y función involucrada:** `app/index.tsx` → `useMemo` de `visibleTasks`
- **Causa raíz:** al `useMemo` le faltaba `query` en el arreglo de dependencias, entonces no se volvía a calcular.
- **Corrección aplicada:** agregué `query` a las dependencias: `[tasks, query, status]`.
- **Prueba de regresión:** prueba manual en el celular (buscar y ver que la lista cambia al instante).
- **Estado:** Corregido

## Incidencia 3
- **Título de incidencia:** Al marcar una tarea como completada no se ve el cambio
- **Pasos para reproducir:** tocar el cuadradito de una tarea pendiente.
- **Esperado / observado:** que se tache y suba el contador de completadas / no cambiaba nada en pantalla.
- **Herramienta usada:** breakpoint en `toggleTask` y `console.log(tasks)`.
- **Hipótesis y evidencia:** el dato sí cambiaba (en el log aparecía `completed: true`) pero no se redibujaba.
- **Archivo y función involucrada:** `app/index.tsx` → `toggleTask`
- **Causa raíz:** se modificaba el objeto directamente y se pasaba el mismo arreglo a `setTasks`. React compara la referencia, ve que es el mismo arreglo y no actualiza.
- **Corrección aplicada:** armo un arreglo nuevo con `map` y una copia de la tarea (`{ ...task, completed: !task.completed }`). Después, con la API, además se manda un PUT y si falla se vuelve al estado anterior.
- **Prueba de regresión:** `TaskCard.test.tsx` (permite completar una tarea) + prueba manual.
- **Estado:** Corregido

## Incidencia 4
- **Título de incidencia:** Con "Simular error API" el cargando queda girando para siempre
- **Pasos para reproducir:** tocar "⚠ Simular error API".
- **Esperado / observado:** que aparezca el mensaje de error y se vaya el spinner / salía el error pero el "Consultando tareas…" no se iba nunca.
- **Herramienta usada:** consola (aparecía el `console.error` del catch).
- **Hipótesis y evidencia:** si entra al catch, nunca se ejecuta lo que está después del `await` en el try.
- **Archivo y función involucrada:** `app/index.tsx` → `loadTasks`
- **Causa raíz:** `setLoading(false)` estaba solamente dentro del `try`.
- **Corrección aplicada:** lo moví a un bloque `finally`, que se ejecuta siempre (con error o sin error).
- **Prueba de regresión:** prueba manual con el botón de simular error y con el celular sin Internet. También el test "el boton de simular error sigue funcionando".
- **Estado:** Corregido

## Otras incidencias (opcional)
**Incidencia 5 – Se podían agregar tareas con solo espacios.** En `src/utils/taskValidation.ts` solo se miraba `title.length > 0`, entonces "   " era válido. Lo corregí con `title.trim().length > 0`. Prueba: `taskValidation.test.ts`.

**Incidencia 6 – Al cambiar de filtro quedaba expandida otra tarjeta.** El `keyExtractor` del FlatList usaba el índice. Cuando cambia el filtro, el índice 0 pasa a ser otra tarea y React reutiliza la tarjeta con el estado `expanded` de antes. Lo cambié por `item.id`. Prueba manual: expandir una tarea, cambiar a "Pendientes" y ver que no queda abierta otra.

**Integración con el backend.** Agregué `src/services/api.ts` (URL desde `EXPO_PUBLIC_API_URL`, timeout de 10 s y mensajes para 404, 422, 500 y sin conexión) y cambié `taskService.ts` para usar `GET /tasks/`, `POST /tasks/`, `PUT /tasks/{id}` y `DELETE /tasks/{id}`. Ojo: el GET por defecto trae solo 10 tareas, por eso pido `?limit=100`. El backend no tiene prioridad, así que en la app queda "media" por defecto.

## Pruebas
| Prueba | Antes | Después | Evidencia |
|---|---|---|---|
| Búsqueda | 2 tests fallaban | pasan | `taskFilters.test.ts` |
| Validación | 1 test fallaba | pasa | `taskValidation.test.ts` |
| Actualización de estado | no se veía el cambio | se tacha y se guarda en el servidor | `TaskCard.test.tsx` + manual |
| Error de servicio | spinner infinito | muestra el error y se puede reintentar | manual + `taskService.test.ts` |
| API (GET/POST/PUT/DELETE) | no existía | 7 tests con fetch simulado | `taskService.test.ts` |

Resultado final de `npm test`: **4 suites, 16 tests, todos pasan.**

## Conclusión y control de cambios
- **Commit final (hash):** (ver `git log` del repositorio)
- **Mensaje del commit:** "Completo informe de incidencias, README y declaración de uso de IA"
- **Qué aprendí y cómo lo aplicaría a mi app final:** aprendí a no cambiar código sin antes reproducir el error y tener una hipótesis. Lo que más me sirvió fue el `finally` y entender que en React no hay que modificar el estado directamente. En la app final voy a separar siempre las llamadas a la API en un servicio y probarlas con un fetch simulado.

## Uso de asistentes de IA
Usé IA para poder :ubicar algunos de los errores e ir probándolo en el celular.
