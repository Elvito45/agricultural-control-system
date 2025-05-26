# Agricultural Control System

Este proyecto es un Sistema de Control Agrícola diseñado para ayudar a productores a gestionar información de sus fincas y ganado de manera eficiente. Permite registrar fincas, asociarlas a propietarios, estados y municipios, y gestionar sellos únicos para el ganado, garantizando autenticidad y trazabilidad.

## Características principales

- Autenticación de usuarios (registro e inicio de sesión).
- Registro, consulta y actualización de información de fincas.
- Asociación de fincas a estados y municipios (con JOINs para mostrar nombres).
- Registro y gestión de ganado, incluyendo sellos únicos (imágenes).
- Subida y procesamiento de imágenes de sellos con validación de unicidad mediante hash perceptual.
- Visualización de la ubicación de la finca en mini-mapas de Google Maps.
- Acceso seguro a rutas protegidas mediante middleware de autenticación.

## Tecnologías utilizadas

- **Node.js** y **Express** para el backend.
- **EJS** para vistas dinámicas.
- **Sequelize** como ORM para MySQL.
- **Multer** para la subida de imágenes.
- **Sharp** para procesamiento de imágenes.
- **image-hash** para generación y comparación de hash perceptual de imágenes.
- **Google Maps Embed** para mostrar la ubicación de las fincas.

## Estructura del proyecto

```
agricultural-control-system
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── config
│   ├── middleware
│   ├── views
│   └── app.js
├── public
│   └── css
├── uploads
│   └── seals
├── package.json
├── schema.sql
├── README.md
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <repository-url>
   ```
2. Ingresa al directorio del proyecto:
   ```
   cd agricultural-control-system
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Uso

1. Inicia la aplicación en modo desarrollo (con recarga automática):
   ```
   npm run dev
   ```
2. Accede a la aplicación en `http://localhost:3000`.

## Configuración de la base de datos

- El proyecto utiliza MySQL. Asegúrate de tener un servidor MySQL en ejecución y actualiza los datos de conexión en `src/config/db.js`.
- Ejecuta el script `schema.sql` para crear las tablas necesarias.
- Puedes poblar los estados y municipios con los scripts `states-dataset.sql` y `towns-dataset.sql`.

## Flujo de registro y autenticidad de sellos

- Los sellos (imágenes) se suben usando `multer`.
- Se procesan con `sharp` para asegurar formato y tamaño.
- Se genera un hash perceptual con `image-hash` para validar unicidad y autenticidad.
- El hash se almacena en la base de datos y se compara para evitar duplicados.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.