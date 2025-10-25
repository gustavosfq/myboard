# MyBoard Backend

Backend para una aplicación de tableros colaborativos en tiempo real con post-its, construido con NestJS, MongoDB y Socket.IO.

## 🚀 Características

- ✅ Autenticación con Google OAuth 2.0 y JWT
- ✅ Gestión de tableros colaborativos
- ✅ Post-its con texto, posición y tamaño personalizables
- ✅ Colaboración en tiempo real con WebSockets (Socket.IO)
- ✅ Compartir tableros entre usuarios
- ✅ Base de datos MongoDB
- ✅ Dockerizado con Docker Compose

## 📋 Requisitos

- Node.js 20+
- Docker y Docker Compose
- Cuenta de Google Cloud Platform (para OAuth)

## 🔧 Configuración

### 1. Clonar el repositorio y configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### 2. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credenciales" y crea credenciales de OAuth 2.0
5. Configura las URIs autorizadas:
   - URI de origen autorizado: `http://localhost:3001`
   - URI de redirección autorizada: `http://localhost:3001/auth/google/callback`
6. Copia el Client ID y Client Secret al archivo `.env`

### 3. Editar el archivo `.env`

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_USERNAME=myboard_user
MONGO_PASSWORD=cambiar_esto_en_produccion
MONGO_DATABASE=myboard

# MongoDB Connection URI
MONGODB_URI=mongodb://myboard_user:cambiar_esto_en_produccion@localhost:27017/myboard?authSource=admin

# JWT
JWT_SECRET=tu-secreto-jwt-super-seguro-cambialo
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-de-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-secret-de-google
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

## 🐳 Instalación y Ejecución con Docker

### Modo Desarrollo

```bash
# Iniciar todos los servicios
docker-compose up

# O en modo detached (segundo plano)
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

La aplicación estará disponible en `http://localhost:3001`

### Modo Producción

```bash
# Build de la imagen de producción
docker-compose -f docker-compose.yml up --build

# O con variables de entorno de producción
NODE_ENV=production docker-compose up
```

## 💻 Instalación Local (sin Docker)

```bash
# Instalar dependencias
npm install

# Asegúrate de tener MongoDB corriendo localmente o usa una instancia remota

# Iniciar en modo desarrollo
npm run start:dev

# Build para producción
npm run build

# Iniciar en producción
npm run start:prod
```

## 📡 API Endpoints

### Autenticación

```
GET  /auth/google              - Iniciar login con Google
GET  /auth/google/callback     - Callback de Google OAuth
GET  /auth/test                - Test endpoint
```

### Usuarios

```
GET  /users/me                 - Obtener perfil del usuario autenticado
GET  /users                    - Listar todos los usuarios activos
```

### Tableros (Boards)

```
POST   /boards                 - Crear un nuevo tablero
GET    /boards                 - Listar tableros del usuario
GET    /boards/:id             - Obtener un tablero específico
PUT    /boards/:id             - Actualizar un tablero
DELETE /boards/:id             - Eliminar un tablero
POST   /boards/:id/share       - Compartir tablero con usuarios
```

Ejemplo de creación de tablero:
```json
{
  "name": "Mi Tablero",
  "description": "Descripción opcional"
}
```

Ejemplo de compartir tablero:
```json
{
  "userIds": ["userId1", "userId2"]
}
```

### Post-its

```
POST   /postits                - Crear un nuevo post-it
GET    /postits?boardId=xxx    - Listar post-its de un tablero
GET    /postits/:id            - Obtener un post-it específico
PUT    /postits/:id            - Actualizar un post-it
DELETE /postits/:id            - Eliminar un post-it
```

Ejemplo de creación de post-it:
```json
{
  "boardId": "board_id_here",
  "text": "Contenido del post-it",
  "x": 100,
  "y": 150,
  "width": 200,
  "height": 200,
  "color": "#FFE66D",
  "zIndex": 1
}
```

### Headers para endpoints protegidos

Todos los endpoints excepto `/auth/*` requieren autenticación JWT:

```
Authorization: Bearer <tu_jwt_token>
```

## 🔌 WebSocket Events

### Cliente → Servidor

```javascript
// Unirse a un tablero
socket.emit('join-board', { boardId: 'board_id' });

// Salir de un tablero
socket.emit('leave-board', { boardId: 'board_id' });

// Post-it creado
socket.emit('postit-created', { boardId: 'board_id', postit: {...} });

// Post-it actualizado
socket.emit('postit-updated', { 
  boardId: 'board_id', 
  postitId: 'postit_id',
  updates: { x: 100, y: 200 }
});

// Post-it eliminado
socket.emit('postit-deleted', { boardId: 'board_id', postitId: 'postit_id' });

// Post-it moviéndose en tiempo real
socket.emit('postit-moving', { 
  boardId: 'board_id',
  postitId: 'postit_id',
  x: 150,
  y: 250
});

// Movimiento del cursor
socket.emit('cursor-move', { boardId: 'board_id', x: 400, y: 300 });
```

### Servidor → Cliente

```javascript
// Usuario se unió al tablero
socket.on('user-joined', (data) => {
  console.log(`${data.email} se unió`);
});

// Usuario salió del tablero
socket.on('user-left', (data) => {
  console.log(`${data.email} salió`);
});

// Otros eventos espejo de los del cliente
socket.on('postit-created', (data) => { ... });
socket.on('postit-updated', (data) => { ... });
socket.on('postit-deleted', (data) => { ... });
socket.on('postit-moving', (data) => { ... });
socket.on('cursor-move', (data) => { ... });
```

### Conexión WebSocket

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'tu_jwt_token'
  }
});
```

## 🗄️ Modelos de Datos

### User
```typescript
{
  email: string;          // Email del usuario (único)
  name: string;           // Nombre completo
  picture?: string;       // URL de la foto de perfil
  googleId: string;       // ID de Google (único)
  isActive: boolean;      // Estado del usuario
  createdAt: Date;
  updatedAt: Date;
}
```

### Board
```typescript
{
  name: string;           // Nombre del tablero
  description?: string;   // Descripción opcional
  owner: ObjectId;        // ID del propietario
  sharedWith: ObjectId[]; // IDs de usuarios con acceso
  isActive: boolean;      // Estado del tablero
  createdAt: Date;
  updatedAt: Date;
}
```

### Postit
```typescript
{
  boardId: ObjectId;      // ID del tablero
  text: string;           // Contenido del post-it
  x: number;              // Posición X en el canvas
  y: number;              // Posición Y en el canvas
  width: number;          // Ancho (default: 200)
  height: number;         // Alto (default: 200)
  color: string;          // Color (default: #FFE66D)
  zIndex: number;         // Orden de apilamiento
  createdBy: ObjectId;    // Usuario que lo creó
  lastModifiedBy?: ObjectId; // Último usuario que lo modificó
  isActive: boolean;      // Estado del post-it
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠️ Scripts Disponibles

```bash
npm run start          # Iniciar en modo normal
npm run start:dev      # Iniciar en modo desarrollo (watch)
npm run start:prod     # Iniciar en modo producción
npm run build          # Build del proyecto
npm run format         # Formatear código con Prettier
npm run lint           # Linter con ESLint
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:cov       # Tests con cobertura
```

## 🔒 Seguridad

- Autenticación OAuth 2.0 con Google
- Tokens JWT con expiración configurable
- Validación de acceso a tableros (propietario o compartido)
- Guards de NestJS para proteger rutas
- Validación de WebSocket con JWT
- Variables de entorno para secretos
- CORS configurado

## 📦 Estructura del Proyecto

```
backend/
├── src/
│   ├── auth/                  # Módulo de autenticación
│   │   ├── guards/            # Guards de autenticación
│   │   ├── strategies/        # Estrategias Passport
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                 # Módulo de usuarios
│   │   ├── schemas/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── boards/                # Módulo de tableros
│   │   ├── schemas/
│   │   ├── dto/
│   │   ├── boards.controller.ts
│   │   ├── boards.service.ts
│   │   └── boards.module.ts
│   ├── postits/               # Módulo de post-its
│   │   ├── schemas/
│   │   ├── dto/
│   │   ├── postits.controller.ts
│   │   ├── postits.service.ts
│   │   └── postits.module.ts
│   ├── gateway/               # WebSocket Gateway
│   │   └── board.gateway.ts
│   ├── app.module.ts          # Módulo principal
│   └── main.ts                # Punto de entrada
├── docker-compose.yml         # Configuración Docker Compose
├── Dockerfile                 # Dockerfile para el backend
├── .env.example               # Ejemplo de variables de entorno
└── package.json
```

## 🐛 Troubleshooting

### Error de conexión a MongoDB
```bash
# Verificar que el contenedor de MongoDB esté corriendo
docker-compose ps

# Ver logs de MongoDB
docker-compose logs mongodb
```

### Error de autenticación con Google
- Verifica que las URIs de redirección en Google Cloud Console coincidan exactamente
- Asegúrate de que el GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET sean correctos
- Verifica que la API de Google+ esté habilitada

### Error de conexión WebSocket
- Verifica que el token JWT sea válido
- Asegúrate de enviar el token en `auth.token` al conectar
- Verifica que el CORS esté configurado correctamente

## 📝 Licencia

MIT

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.
