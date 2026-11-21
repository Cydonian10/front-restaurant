# CRUD administrativo de productos

**Estado: Borrador**

El administrador puede crear, editar y dar de baja productos desde la carta. El listado conserva la paginación, el filtro por tipo y el control de disponibilidad, y presenta un marcador cuando falta la imagen. Tras crear un producto se vuelve al listado con una confirmación; los errores conservan los datos ingresados.

La edición permite cambiar nombre, descripción, precio y tipo, y agregar o reemplazar una imagen JPG, PNG o WebP de hasta 5 MB. Se aplican las validaciones existentes. La baja requiere confirmación, es lógica y oculta el producto de los listados públicos y administrativos sin borrar el historial. Los productos dados de baja no pueden modificarse ni reactivarse. Las operaciones de escritura requieren rol ADMIN.

Quedan fuera la restauración, la búsqueda por nombre y la eliminación individual de imágenes.
