# Nexus Chat 💬

A real-time chat application built with Flask and WebSockets, inspired by Discord.

## Features

- 🔐 User authentication (register, login, logout)
- 💬 Real-time messaging with WebSockets
- 🏠 Multiple chat rooms (general, programming, chess)
- 📜 Message history persistent in database
- 🟢 Online users list
- 🔔 Unread message badges per room
- 👤 User avatars with initials
- ⌨️ Typing indicator
- 🌙 Dark theme UI

## Tech Stack

**Backend**
- Python / Flask
- Flask-SocketIO
- Flask-Login
- SQLAlchemy
- SQLite

**Frontend**
- HTML / CSS / JavaScript
- Socket.IO client

## Installation

1. Clone the repository
```bash
git clone https://github.com/chesspaul/Nexus-chat-.git
cd Nexus-chat-
```

2. Create and activate virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Run the app
```bash
python app.py
```

5. Open your browser at `http://localhost:5000`

## Project Structure
nexus-chat/
├── app.py              ← entry point, routes and socket events
├── requirements.txt
├── /models
│   └── user.py         ← database models (User, Message)
├── /templates
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   └── chat.html
└── /static
├── style.css
└── chat.js

## Roadmap

- [ ] File and image sharing
- [ ] PostgreSQL support
- [ ] Docker
- [ ] Deploy on Render
- [ ] Light/Dark mode toggle