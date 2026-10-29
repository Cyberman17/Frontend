# AutoAndes Web

SPA empresarial para la gestión de un taller mecánico. Está construida con Angular 22 y consume el backend REST de AutoAndes; no utiliza listas ni servicios simulados.

## Requisitos

- Node.js compatible con Angular 22 y npm.
- Backend AutoAndes iniciado en `http://localhost:8080`.
- El backend debe permitir CORS desde `http://localhost:4200` (origen configurado para esta SPA).

## Iniciar la aplicación

Desde esta carpeta:

```powershell
npm install
npm start
```

Abrir `http://localhost:4200`. Para compilar y ejecutar las pruebas:

```powershell
npm run build
npm test
```

La URL del API se configura en `src/environments/environment.ts`:
`http://localhost:8080/api/v1`.

## Acceso de prueba

Utiliza las cuentas de prueba configuradas en el backend (`admin`, `asesor` y `jefe`). La autorización y los permisos efectivos siempre se validan en el backend.

## Funcionalidades

- Inicio de sesión JWT, expiración automática y almacenamiento de sesión en `sessionStorage`.
- Guards de sesión y permisos; menú y acciones según permisos.
- Interceptor para `Authorization: Bearer …` y manejo de 401 sin cerrar la sesión ante un 403.
- CRUD de servicios (incluye baja lógica) y vehículos con selección de clientes desde el API.
- Registro de órdenes con detalles dinámicos y subtotales orientativos; el precio final y el total los calcula el servidor.
- Consulta de órdenes con filtros, detalle y anulación con motivo.
- Reporte de ingresos agregados por servicio.
- Mensajes de validación y errores de negocio mostrados desde las respuestas del backend.

## Rutas del API utilizadas

`POST /auth/login`, `GET /servicios`, `POST|PUT|DELETE /servicios`, `PATCH /servicios/{id}/estado`, `GET /clientes`, `GET /vehiculos`, `POST|PUT|DELETE /vehiculos`, `POST|GET /ordenes`, `GET /ordenes/{id}`, `PATCH /ordenes/{id}/anular` y `GET /reportes/ingresos-por-servicio`.
