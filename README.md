# Nexus Chat 💬

Aplicación de chat en tiempo real construida con Flask y WebSockets, inspirada en Discord.

## Características

- 🔐 Autenticación de usuarios (registro, login, logout)
- 💬 Mensajes en tiempo real con WebSockets
- 🏠 Múltiples salas de chat (general, programación, ajedrez)
- 📜 Historial de mensajes persistente en base de datos
- 🟢 Lista de usuarios conectados en tiempo real
- 🔔 Contador de mensajes no leídos por sala
- 👤 Avatares con iniciales por usuario
- ⌨️ Indicador de "está escribiendo..."
- 🌙 Modo oscuro / claro

## Stack tecnológico

**Backend**
- Python / Flask
- Flask-SocketIO
- Flask-Login
- SQLAlchemy
- SQLite

**Frontend**
- HTML / CSS / JavaScript
- Socket.IO client

## Instalación

1. Clona el repositorio
```bash
git clone https://github.com/chesspaul/Nexus-chat-.git
cd Nexus-chat-
```

2. Crea y activa el entorno virtual
```bash
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate
```

3. Instala las dependencias
```bash
pip install -r requirements.txt
```

4. Corre la aplicación
```bash
python app.py
```

5. Abre tu navegador en `http://localhost:5000`

## Estructura del proyecto
nexus-chat/
├── app.py              ← punto de entrada, rutas y eventos de socket
├── requirements.txt
├── /models
│   └── user.py         ← modelos de base de datos (User, Message)
├── /templates
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   └── chat.html
└── /static
├── style.css
└── chat.js

## Roadmap

- [ ] Compartir archivos e imágenes
- [ ] Soporte para PostgreSQL
- [ ] Docker
- [ ] Deploy en Render