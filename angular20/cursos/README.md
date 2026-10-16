# Aula · Gestión de alumnos

Frontend en Angular 20 para consultar y administrar los alumnos del backend Spring Boot.

## Iniciar en desarrollo

1. Inicia Eureka, `microservicios-usuarios` y `microservicios-spring-gateway` desde el workspace Spring. El gateway debe estar disponible en `http://localhost:8090`.
2. Desde esta carpeta, instala dependencias si aún no lo has hecho y arranca Angular:

   ```bash
   npm install
   npm start
   ```

3. Abre `http://localhost:4200`.

El frontend usa `/api` como URL base para mantener las llamadas en el mismo origen. En desarrollo, Angular reenvía esa ruta al gateway mediante `proxy.conf.json`, así que el navegador no necesita configuración CORS local. En producción, configura el servidor web o el ingress para reenviar `/api` al gateway.

La URL base se configura en `src/environments/environment.development.ts` y `src/environments/environment.ts` (`apiUrl`). Angular incorpora estos valores durante el build: cambia el valor de desarrollo si el gateway usa otro host/ruta y el valor de producción si la API no está publicada bajo el mismo origen. No se debe usar `localhost` en el build de producción salvo que el backend realmente se ejecute en el equipo de cada usuario.

El CRUD de alumnos está aislado en `src/app/features/alumno`; `src/app/app.ts` queda como punto de entrada y `src/app/app.routes.ts` delega a las rutas de la funcionalidad.

## Endpoints utilizados

| Acción | Método y ruta |
| --- | --- |
| Listar alumnos | `GET /api/alumnos` |
| Registrar alumno | `POST /api/alumnos` |
| Actualizar alumno | `PUT /api/alumnos/{id}` |
| Eliminar alumno | `DELETE /api/alumnos/{id}` |

La búsqueda filtra localmente los alumnos ya cargados por nombre, apellido o correo. Los cambios CRUD se guardan en el backend a través del gateway.

## Validación

```bash
npm test -- --watch=false
npm run build
```
