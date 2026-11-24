# Gestor de tareas · Renzo Fantino Recalde

App móvil del taller de EDI (React Native + Expo Router + TypeScript, Expo SDK 57), **conectada al backend de tareas** hecho en Programación III con el profe Montenegro.

- Backend: `https://api.montenegroariel.com.ar` (documentación en `/docs`)
- Partí del proyecto original de la clase 11 (Gestor_Tareas_ESTUDIANTES_Expo57) y corregí 6 incidencias. Detalle en `INFORME_INCIDENTES.md`.

## Qué hace
- Lista las tareas del servidor (`GET /tasks/`), con estados de carga, error y lista vacía.
- Agrega tareas (`POST /tasks/`), valida que el título no esté vacío ni sea solo espacios.
- Marca como completada / pendiente (`PUT /tasks/{id}`), si falla vuelve atrás y avisa.
- Elimina tareas (`DELETE /tasks/{id}`).
- Busca por nombre (sin importar mayúsculas ni espacios) y filtra por estado.
- Botón "Simular error API" para probar el estado de error.

## Estructura
```text
app/               pantallas (index = gestor, guia = consigna)
src/services/      api.ts (cliente HTTP comun) y taskService.ts (operaciones de tareas)
src/components/    TaskCard, StatusTabs
src/utils/         filtros y validaciones
src/types/         tipos TypeScript
__tests__/         pruebas con Jest y Testing Library
eas.json           perfil preview para generar la APK
```

## Ejecutar
```powershell
npm install
copy .env.example .env
npx expo start --go
```
Escanear el QR con Expo Go (celular y PC en el mismo Wi-Fi).

## Pruebas
```powershell
npm test
npm run typecheck
```

## Generar la APK (perfil preview)
```powershell
npx eas-cli login
npx eas-cli build -p android --profile preview
```
Al terminar, EAS da un link para descargar e instalar la APK en Android.
