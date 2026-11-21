# SPEC 01 — Gestión y plano de mesas y zonas

> **Estado:** Aprobada
> **Depende de:** Ninguna
> **Fecha:** 2026-11-21
> **Objetivo:** Gestionar zonas y mesas y mostrar su distribución persistente según los permisos del personal.

## Alcance

**Incluye:**

- Un menú y plano de mesas agrupadas por zona, con la imagen proporcionada como referencia visual.
- Acceso al plano para `ADMIN`, `MOZO` y `COCINA`; los demás roles no pueden acceder.
- Creación, edición y desactivación lógica de zonas y mesas exclusivamente por `ADMIN`, con controles visibles solo para este rol y autorización también en la API.
- Cambio de disponibilidad fuera de servicio por el administrador, sin permitirlo mientras exista una atención abierta.
- Ubicación inicial automática de una mesa en un espacio libre y movimiento por arrastre exclusivo del administrador; la posición se guarda en la base de datos y se comparte entre usuarios y dispositivos.
- Mostrar estados disponible, ocupada y fuera de servicio conforme a las reglas del modelo existente.
- Persistencia, migración, servicios y endpoints necesarios y su integración en la interfaz.

**Fuera de alcance:**

- Tomar pedidos, abrir o cerrar atenciones, mostrar pedidos o implementar el flujo de cocina y cobro. Se definirán en otra especificación.
- Trasladar una mesa entre zonas o eliminar físicamente el historial.

## Modelo de datos

- Reutilizar `Zone` (`name`, `active`) y `DiningTable` (`zoneId`, `number`, `capacity`, `active`, `outOfService`) de `api-restaurante/src/dining/entities/`.
- Añadir a `DiningTable` coordenadas persistentes `positionX` y `positionY`, relativas al plano de su zona, mediante una migración que contemple las mesas existentes.
- El número de mesa es positivo y único por zona; la capacidad es positiva. La zona de una mesa no cambia después de crearla.
- La ocupación se deriva de una atención abierta. Una mesa activa sin atención abierta está disponible salvo que esté fuera de servicio.
- Una mesa con atención abierta no puede desactivarse ni ponerse fuera de servicio. Una zona solo puede desactivarse cuando todas sus mesas están desactivadas y no tienen atenciones abiertas. Las reglas entre registros se validan de forma transaccional.

## Plan de implementación

1. Añadir coordenadas y migración para mesas existentes, preservando las entidades y restricciones actuales.
2. Incorporar en la API operaciones de consulta y administración de zonas y mesas, con validación de roles y reglas de negocio.
3. Incorporar el acceso al plano y la consulta agrupada por zona para los tres roles autorizados, con estados de carga, vacío y error.
4. Añadir formularios y controles administrativos para crear, editar y desactivar zonas y mesas y cambiar su disponibilidad.
5. Añadir ubicación inicial y arrastre con persistencia de posiciones, recuperando la posición guardada al volver a cargar y comunicando errores de guardado.

## Criterios de aceptación

- [ ] `ADMIN`, `MOZO` y `COCINA` pueden consultar el plano; los demás roles reciben acceso denegado en interfaz y API.
- [ ] Solo `ADMIN` ve y puede ejecutar operaciones de creación, edición, desactivación, cambio de disponibilidad y movimiento; la API rechaza escrituras de otros roles.
- [ ] Una zona se crea con nombre y una mesa con zona, número y capacidad; se respetan la unicidad por zona y los valores positivos.
- [ ] Una mesa nueva aparece en un espacio libre y su posición movida se conserva tras recargar y consultar desde otro dispositivo.
- [ ] El plano agrupa las mesas por zona y muestra sus estados disponible, ocupada o fuera de servicio según el modelo.
- [ ] Una mesa ocupada no puede desactivarse ni ponerse fuera de servicio; una zona no puede desactivarse mientras tenga mesas activas o atenciones abiertas.
- [ ] No se permite cambiar de zona una mesa existente ni se elimina su historial.
- [ ] Los errores de carga y guardado se muestran al usuario y no se presenta un cambio fallido como guardado.
- [ ] La migración y las pruebas de API e interfaz verifican las reglas y permisos anteriores.

## Decisiones

- **Sí:** guardar posiciones en la base de datos para compartir la distribución entre dispositivos.
- **Sí:** reservar la configuración y el movimiento al administrador; mozo y cocina consultan el plano.
- **Sí:** conservar la zona fija y la desactivación lógica para proteger el historial.
- **No:** incluir la toma de pedidos en esta entrega; se definirá por separado.

## Riesgos

- Las operaciones simultáneas sobre disponibilidad y atención requieren validación transaccional para conservar las reglas de ocupación.
- La migración debe asignar posiciones iniciales a mesas existentes sin perder datos.

## Qué no incluye esta especificación

- Pedidos, gestión de atenciones, cocina operativa, cobros y traslado de mesas entre zonas.
