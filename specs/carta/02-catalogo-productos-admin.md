# SPEC 02 — Catálogo de productos administrativo

> **Estado:** Aprobado
> **Dependencias:** SPEC 01 del API `app-api-resturante/specs/catalogo-productos/01-catalogo-productos.md` (Aprobado)
> **Fecha:** 2026-11-20
> **Objetivo:** Permitir a administradores gestionar el menú de productos desde Angular mediante los endpoints del catálogo definidos en la SPEC 01 del API.

## Alcance

**Incluye:**

- Añadir una sección Productos accesible desde el panel administrativo, con ruta protegida bajo `/admin` y autorización de rol `ADMIN`.
- Listar productos disponibles y no disponibles mediante el endpoint administrativo paginado del API, mostrando nombre, descripción, precio, tipo, disponibilidad e imagen cuando exista.
- Crear productos con nombre, tipo, precio, descripción opcional e imagen opcional, enviando multipart según el contrato del API.
- Filtrar el listado por tipo mediante el API y regresar a la primera página al cambiar el filtro.
- Agregar una imagen a un producto que aún no tenga una, después de crearlo.
- Cambiar la disponibilidad de un producto existente mediante el endpoint correspondiente.
- Incorporar una presentación adaptable a escritorio y móvil, usando `front-restaurant/pantallas/carta/` como referencia visual para representar la carta y sus productos, dentro del lenguaje del panel administrativo existente.
- Mostrar estados de carga, error con reintento, lista vacía y resultado de operaciones; validar campos y comunicar errores del servidor.
- Añadir pruebas de servicio, componentes/página y permisos para los flujos cubiertos.

**Fuera de alcance:**

- Cambios en la API o en el modelo de productos del backend.
- Buscar por nombre, editar los demás datos de un producto, eliminar productos, ver un detalle individual o gestionar inventario.
- Flujo público de pedidos y reglas de extras o postres.
- Reutilizar literalmente una interfaz existente en `pantallas/carta`; esos archivos son referencia visual, no implementación funcional.

## Modelo de datos

La interfaz consumirá el contrato de productos de la SPEC 01 sin redefinirlo: identificador, `nombre`, `descripcion` opcional, `precio`, `tipo` (`BEBIDA`, `EXTRA`, `PLATO_FONDO`, `POSTRE`), `disponible`, referencia/URL de imagen opcional y fechas si la respuesta las expone. Las respuestas de listado usan la forma paginada definida por el API. El listado administrativo usa `GET /products/admin` con `page`, `limit` y `tipo` opcional. La creación usa `POST /products` con `nombre`, `precio`, `tipo`, `descripcion` opcional e `imagen` opcional en `multipart/form-data`. La carga posterior usa `POST /products/:id/imagen` con el campo `imagen`; si el producto ya tiene imagen, el API responde 409. El cambio de disponibilidad usa `PATCH /products/:id/disponibilidad` con `{ "disponible": boolean }`.

## Plan de implementación

1. Confirmar en el código y documentación del API las rutas, parámetros y formas de respuesta de la SPEC 01; definir las interfaces Angular alineadas al contrato existente y la configuración de URL base ya usada por la aplicación.
2. Crear el área de productos con servicio de acceso a datos para listado paginado administrativo con filtro por tipo, creación multipart, carga posterior de imagen y cambio de disponibilidad; conservar el interceptor de autenticación actual.
3. Registrar la ruta `/admin/productos` y enlazar Productos en la navegación de Inventario del panel. Restringir su uso a administradores y presentar acceso denegado sin solicitar datos si el rol no es `ADMIN`.
4. Construir la página de catálogo con tarjetas de productos, filtro por tipo, paginación, formulario de alta, carga posterior de imagen y control de disponibilidad; mostrar correctamente carga, vacío, errores, validaciones y confirmación de operaciones.
5. Aplicar diseño responsive coherente con el panel y tomar la carta de `pantallas/carta/` solo como referencia para la presentación de los productos.
6. Añadir pruebas de acceso por rol, construcción de solicitudes, creación con y sin imagen, carga posterior y conflicto, listado/filtro/paginación, cambio de disponibilidad y estados de error; verificar compilación y pruebas del frontend.

Cada paso debe dejar la aplicación compilable y funcional.

## Criterios de aceptación

- [ ] Un administrador autenticado abre `/admin/productos` y ve productos disponibles y no disponibles obtenidos del API.
- [ ] El listado respeta paginación y presenta los campos disponibles en tarjetas, incluida la imagen cuando exista.
- [ ] Filtrar por cualquiera de los cuatro tipos consulta el API con `tipo` y vuelve a la página 1; también se puede mostrar todos los tipos.
- [ ] Un administrador puede agregar una imagen a un producto sin imagen; los errores de carga y el conflicto 409 se muestran sin indicar éxito.
- [ ] Un administrador puede crear un producto con los cuatro tipos permitidos, precio válido y descripción e imagen opcionales.
- [ ] La imagen se envía como multipart y los errores de tipo/tamaño o validación devueltos por el API se muestran de forma comprensible.
- [ ] Un administrador puede activar o desactivar un producto y la interfaz refleja la respuesta persistida del API.
- [ ] Un usuario sin rol `ADMIN` no envía solicitudes administrativas y recibe una vista de acceso denegado.
- [ ] La navegación del panel incluye Productos y lleva a `/admin/productos`.
- [ ] Hay estados visibles de carga, lista vacía, error con reintento y confirmación/error de operaciones.
- [ ] La vista funciona en anchos móviles y de escritorio y mantiene coherencia visual con el panel; las imágenes de la carta se usan como referencia.
- [ ] Las pruebas pertinentes pasan y `npm run build` termina correctamente.

## Decisiones tomadas y descartadas

- **Sí:** conectar directamente con los endpoints de la SPEC 01 del API; se descartan datos simulados.
- **Sí:** primera versión administrativa con listado, alta y disponibilidad; se descarta CRUD completo porque el API no contempla edición general ni borrado.
- **Sí:** reutilizar el panel, guard e interceptor existentes; no introducir otra estrategia de autenticación.
- **Sí:** usar `pantallas/carta/` como referencia visual para las tarjetas y los filtros del panel administrativo.
- **Sí:** permitir agregar posteriormente una imagen a productos que aún no tienen una.
- **Se posponen búsqueda por nombre y edición general:** el API actual no ofrece esas operaciones.

## Riesgos

| Riesgo                                                                           | Mitigación                                                                                                |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| La respuesta real del backend difiere de la forma asumida por el frontend.       | Verificar DTOs y controladores del API en el primer paso y alinear tipos y pruebas al contrato publicado. |
| El guard actual solo requiere sesión y no garantiza rol administrador.           | Añadir comprobación de rol para la ruta/página y comprobar que no se dispara la consulta si falta el rol. |
| La carga multipart o la autenticación falla por encabezados o tamaño de archivo. | Usar `FormData`, dejar que el navegador configure el boundary y probar los errores del servidor.          |

## Qué no incluye esta especificación

- Cambios de backend, pedidos, inventario, edición general o eliminación.
- Catálogo público de compra.
