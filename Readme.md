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

### Local Development (without Docker)

1. **Start PostgreSQL** and configure `.env` files.
2. **Run API service**
   ```shell
   cd services/api
   go run ./cmd/api
   ```
3. **Run Executor service**
   ```shell
   cd services/executor
   go run ./cmd/executor
   ```
4. **Run Frontend**
   ```shell
   cd frontend
   npm install
   npm run dev
   ```

## Screenshots

### 1) Home Page

![Home Page](docs/screenshots/image_1.png)

### 2) Auth
![Home Page](docs/screenshots/image_2.png)
![Home Page](docs/screenshots/image_3.png)


### 2) Profile
![Home Page](docs/screenshots/image_4.png)
![Home Page](docs/screenshots/image_5.png)

### 3) Lobby examples (1, 2, 3, 4, 5)
![Home Page](docs/screenshots/image_6.png)
![Home Page](docs/screenshots/image_7.png)
![Home Page](docs/screenshots/image_8.png)
![Home Page](docs/screenshots/image_9.png)

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

## License

MIT