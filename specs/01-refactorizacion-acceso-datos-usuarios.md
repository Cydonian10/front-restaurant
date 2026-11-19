# SPEC 01 — Refactorización del acceso a datos de usuarios

> **Estado:** Aprobado
> **Dependencias:** Ninguna
> **Fecha:** 2026-11-18
> **Objetivo:** Reorganizar el listado de usuarios para separar el acceso a datos, los tipos y las constantes sin cambiar su comportamiento.

## Alcance

**Incluye:**

- Extraer la consulta existente `GET /users` a un servicio reutilizable en `src/app/usuarios/access-data/` que cree el recurso con `httpResource` y reciba los parámetros reactivos necesarios.
- Mantener en `UsuariosPage` los estados de búsqueda, filtros, paginación y permisos.
- Dividir cada tipo e interfaz de `usuarios.types.ts` en su propio archivo dentro de `src/app/usuarios/interfaces/` y actualizar sus importaciones.
- Trasladar `USUARIOS_ROLES` y `USUARIOS_LIMITES` a archivos separados en `src/app/usuarios/constants/`.
- Adaptar las pruebas existentes y verificar el comportamiento del listado.

**Fuera de alcance:**

- Crear, editar o eliminar usuarios, tanto en el servicio como en la interfaz.
- Cambiar la API, el aspecto visual, las rutas o el comportamiento del listado.
- Refactorizar otras funcionalidades del frontend.

## Modelo de datos

Se conservan las estructuras y los valores existentes, sin cambios de contrato:

- `UsuarioListado`: identificador, correo, rol, verificación y datos opcionales de la persona.
- `UsuariosListado`: elementos, página, límite, total y total de páginas.
- `UsuariosLimite`: unión derivada de `USUARIOS_LIMITES`.
- `UsuariosVerificacion`: unión `'' | 'true' | 'false'`.
- `USUARIOS_ROLES` y `USUARIOS_LIMITES` conservan sus valores actuales; `UserRole` sigue definido en autenticación.

## Plan de implementación

1. Crear `src/app/usuarios/constants/` e `interfaces/`, separar las constantes y los tipos actuales en archivos individuales y actualizar las importaciones de la página, los componentes y las pruebas. Eliminar `usuarios.types.ts` cuando ya no tenga consumidores.
2. Crear un servicio en `src/app/usuarios/access-data/` que reciba parámetros reactivos y cree el `httpResource<UsuariosListado>` para `GET /users`. Mantener la construcción de la URL y de los parámetros de consulta existentes.
3. Conectar `UsuariosPage` al servicio y conservar en la página los filtros, la búsqueda con espera de 300 ms, la paginación, la comprobación de administrador y los estados de presentación y reintento.
4. Ajustar las pruebas afectadas y cubrir el servicio en la medida necesaria para verificar sus parámetros y su reutilización sin alterar el comportamiento de la página.

Cada paso debe dejar la aplicación compilable y funcional.

## Criterios de aceptación

- [ ] La página consume el listado mediante el servicio de `access-data` y no construye directamente la petición HTTP.
- [ ] El servicio utiliza `httpResource` para `GET /users`, acepta parámetros reactivos y permite desactivar la consulta cuando no corresponde.
- [ ] La búsqueda, los filtros, el límite y la paginación producen los mismos parámetros que antes; cambiar un filtro vuelve a la página 1.
- [ ] La búsqueda conserva el recorte de espacios y la espera de 300 ms.
- [ ] Una persona sin rol administrador no genera una solicitud al listado y ve el estado de acceso denegado.
- [ ] Se conservan los estados de carga, vacío, error, reintento y respuesta 403, así como el foco del paginador durante la carga de otra página.
- [ ] Cada tipo e interfaz extraído tiene su propio archivo en `interfaces/`, las constantes están separadas en `constants/` y no quedan referencias a `usuarios.types.ts`.
- [ ] Las pruebas pertinentes del listado pasan mediante el ejecutor de Angular y `npm run build` termina correctamente.

## Decisiones tomadas y descartadas

- **Se mantiene `httpResource`:** preserva el modelo reactivo y el comportamiento de carga y reintento existentes.
- **La página mantiene los estados:** el servicio se ocupa de acceder a los datos y puede utilizarse desde otros consumidores.
- **Constantes separadas de interfaces:** distingue valores ejecutables de declaraciones de tipos.
- **Se descartan creación, edición y eliminación en esta spec:** exceden el refactor del listado; la API actual no ofrece rutas de edición ni eliminación.

## Riesgos

| Riesgo                                                                                 | Mitigación                                                                                          |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Mover el recurso cambia el momento de las solicitudes o pierde la restricción por rol. | Conservar los parámetros reactivos y comprobar las solicitudes y el acceso denegado en las pruebas. |
| La reorganización rompe importaciones o altera constantes compartidas.                 | Actualizar todos los consumidores y ejecutar las pruebas pertinentes y la compilación.              |

## Qué no incluye esta especificación

- Operaciones o pantallas de creación, edición y eliminación de usuarios.
- Cambios de API, diseño visual, rutas u otras áreas del frontend.
