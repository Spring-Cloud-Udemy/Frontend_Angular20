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

El servidor de desarrollo reenvía `/api` al gateway a través de `proxy.conf.json`, así que el navegador no necesita configuración CORS para el desarrollo local.

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
