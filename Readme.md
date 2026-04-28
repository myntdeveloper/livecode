# LiveCode

A real-time collaborative coding platform with shared rooms, WebSocket sync, GitHub OAuth, and sandboxed code execution.

[![Go](https://img.shields.io/badge/Go-1.26+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

**Русская версия README:** [`docs/README.ru.md`](docs/README.ru.md)

## Features

- Real-time collaborative code editing in rooms
- Join by room ID/link and work together instantly
- WebSocket-based synchronization
- GitHub OAuth authentication and user profile
- Isolated code execution through a dedicated executor service
- Multi-language UI support (EN/RU) and theme switching

## Usage

### Quick Start (Docker)

1. **Clone this repository**
   ```shell
   git clone https://github.com/myntdeveloper/livecode.git
   cd livecode
   ```

2. **Configure environment variables**

   Update `.env` files in:
   - `infra/.env`
   - `services/api/.env`
   - `services/executor/.env`
   - `frontend/.env`

3. **Run all services**
   ```shell
   cd infra
   docker compose up --build
   ```

4. **Open the app**

   - Frontend: `http://localhost`
   - Backend API: `http://localhost/api`
   - Executor API: `http://localhost/executor`
   - Backend Swagger: `http://localhost/swagger/index.html`


## Screenshots

### 1) Home Page
<img width="50%" height="1280" alt="image_1" src="https://github.com/user-attachments/assets/554282dc-0080-4961-bed3-7e9555048037" />

### 2) Auth
<table>
  <tr>
<img width="50%" alt="image_2" src="https://github.com/user-attachments/assets/a568e3fb-93f7-46b2-abfb-e7b9515150b4" />
<img width="50%"  alt="image_3" src="https://github.com/user-attachments/assets/f0a2b099-da58-440a-b4f4-0835e75d8719" />
  </tr>
</table>

### 2) Profile

<table>
  <tr>
<img width="50%" height="1236" alt="image_4" src="https://github.com/user-attachments/assets/93205bb2-21f7-47ac-9842-813a03cceaf7" />
<img width="50%" height="1280" alt="image_5" src="https://github.com/user-attachments/assets/df816a4a-299c-4b77-84bc-57e1d31376e2" />
  </tr>
</table>

### 3) Lobby examples (1, 2, 3, 4, 5)
<table>
  <tr>
<img width="50%" height="1280" alt="image_6" src="https://github.com/user-attachments/assets/3162a711-13a8-40d6-9e81-95fd1d51840f" />
<img width="50%" height="1280" alt="image_7" src="https://github.com/user-attachments/assets/8270ce37-b416-4352-9ca5-e1b172e22cd4" />
     <table>
  <tr>
<img width="50%" height="1280" alt="image_8" src="https://github.com/user-attachments/assets/04f34ac3-95a8-4afe-9eec-7d9eb2b00c98" />
<img width="50%" height="1280" alt="image_9" src="https://github.com/user-attachments/assets/3f4a68b7-2535-4fe2-a641-b58ba961c236" />
       </tr>
</table>
     <table>
  <tr>
<img width="50%" height="1280" alt="image_10" src="https://github.com/user-attachments/assets/c6921488-1031-4217-b23c-2183a2f93ecd" />
  </tr>
</table>


## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **API Service:** Go, Gin, JWT, WebSocket, Swagger
- **Executor Service:** Go, Gin, Docker-based sandbox
- **Database:** PostgreSQL
- **Infrastructure:** Docker Compose, Nginx

## Directory Structure

```text
livecode/
├── frontend/              # React + Vite client application
├── services/
│   ├── api/               # Core backend (auth, rooms, ws, user)
│   └── executor/          # Code execution service
├── infra/                 # Docker Compose, Nginx, infrastructure config
├── docs/
│   ├── README.ru.md       # Russian documentation
│   └── screenshots/       # Project screenshots
└── Readme.md              # Main English README
```

## Prerequisites

- Docker + Docker Compose (recommended)
- Or for local run:
  - Go 1.26+
  - Node.js + npm
  - PostgreSQL 15+

---

Built with ❤️ by **mynt**
