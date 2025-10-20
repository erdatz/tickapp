# UniChat

Una aplicación de chat en tiempo real construida con Node.js, Socket.IO, MQTT y MySQL siguiendo principios de Clean Architecture.

## Descripción

UniChat es una plataforma de mensajería instantánea que permite comunicación en tiempo real entre usuarios. El proyecto implementa una arquitectura limpia y modular, con capacidades de autenticación de usuarios, mensajería instantánea a través de WebSockets, y un sistema de publicaciones tipo feed social.

## Características

- 🔐 **Autenticación segura** con JWT y bcrypt
- 💬 **Chat en tiempo real** usando Socket.IO
- 📡 **Integración MQTT** para comunicación entre servicios
- 📱 **API RESTful** para operaciones CRUD
- 🏗️ **Clean Architecture** para mantenibilidad y escalabilidad
- 🔒 **Seguridad robusta** con Helmet, CORS y rate limiting
- 📊 **Base de datos MySQL** con Sequelize ORM

## Arquitectura del Proyecto

```
src/
├── application/
│   └── use-cases/          # Casos de uso de la aplicación
├── config/                 # Configuración de la aplicación
├── domain/
│   ├── entities/          # Entidades del dominio
│   ├── repositories/      # Interfaces de repositorios
│   └── services/          # Servicios del dominio
├── infrastructure/
│   ├── db/               # Modelos de base de datos
│   ├── mqtt/             # Cliente MQTT
│   └── sockets/          # Configuración de WebSockets
└── interfaces/
    ├── http/             # Controladores y rutas HTTP
    └── sockets/          # Manejadores de WebSockets
```

## Tecnologías Utilizadas

### Backend

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Socket.IO** - WebSockets para tiempo real
- **MQTT** - Protocolo de mensajería
- **MySQL** - Base de datos relacional
- **Sequelize** - ORM para MySQL

### Seguridad

- **JWT** - Autenticación basada en tokens
- **bcrypt** - Hash de contraseñas
- **Helmet** - Headers de seguridad HTTP
- **CORS** - Control de acceso de origen cruzado
- **express-rate-limit** - Limitación de velocidad de requests

### Desarrollo

- **ESLint** - Linting de código
- **Nodemon** - Hot reload en desarrollo
- **dotenv** - Gestión de variables de entorno

## Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 8.0 o superior)
- npm o yarn

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://gitlab.com/jala-university-computer-networks-2-team-bolivia/unichat.git
   cd unichat
   ```
2. **Instalar dependencias**

   ```bash
   npm install
   ```
3. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz del proyecto:

   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=unichat
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña

   # JWT
   JWT_SECRET=tu_clave_secreta_jwt

   # Servidor
   PORT=3000

   # MQTT
   MQTT_HOST=localhost
   MQTT_PORT=1883
   ```
4. **Configurar la base de datos**

   Crear la base de datos en MySQL:

   ```sql
   CREATE DATABASE unichat;
   ```

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000` (o el puerto especificado en las variables de entorno).

## API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Mensajes

- `GET /api/messages` - Obtener mensajes
- `POST /api/messages` - Enviar mensaje

### Publicaciones

- `GET /api/posts` - Obtener publicaciones
- `POST /api/posts` - Crear publicación

## WebSocket Events

### Cliente → Servidor

- `join_room` - Unirse a una sala de chat
- `send_message` - Enviar mensaje
- `disconnect` - Desconectarse

### Servidor → Cliente

- `new_message` - Nuevo mensaje recibido
- `user_joined` - Usuario se unió a la sala
- `user_left` - Usuario abandonó la sala

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con hot reload
- `npm run lint` - Ejecutar ESLint para verificar código
- `npm test` - Ejecutar tests (por implementar)

## Estructura de la Base de Datos

### Tabla Users

- `id` - Identificador único
- `username` - Nombre de usuario único
- `email` - Correo electrónico único
- `password` - Hash de la contraseña
- `created_at` - Fecha de creación

### Tabla Messages

- `id` - Identificador único
- `content` - Contenido del mensaje
- `user_id` - ID del usuario emisor
- `room_id` - ID de la sala
- `created_at` - Fecha de envío

### Tabla Posts

- `id` - Identificador único
- `title` - Título de la publicación
- `content` - Contenido de la publicación
- `user_id` - ID del usuario autor
- `created_at` - Fecha de creación

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Contacto

- **Repositorio**: [GitLab](https://gitlab.com/jala-university-computer-networks-2-team-bolivia/unichat)
- **Issues**: [Reportar problemas](https://gitlab.com/jala-university-computer-networks-2-team-bolivia/unichat/issues)

## Estado del Proyecto

🚧 **En desarrollo activo** - Este proyecto está siendo desarrollado como parte del capstone de Computer Networks 2 en Jala University.

---

*Desarrollado por el equipo de Bolivia - Jala University Computer Networks 2*
