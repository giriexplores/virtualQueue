# VirtualQueue

VirtualQueue is a **real-time, Redis-powered virtual queue management system** built as a **Turborepo monorepo**. It includes separate applications for admins, clients, and the backend server, all orchestrated using Docker for seamless development and deployment.

The system enables fair, transparent, and real-time queue handling for services like clinics, events, counters, and more.

---

## Architecture Overview

This project is structured as a **monorepo using Turborepo**, containing three main apps:

### Apps

* **admin** - Dashboard for managing the queue (call next, remove users, monitor flow)
* **client** - Interface for users to join and track their queue position
* **server** - Backend API + queue logic powered by Redis

### Core Infrastructure

* **Redis** - Used as the primary in-memory queue store
* **Docker + Docker Compose** - For local development and container orchestration
* **Turborepo** - Monorepo build system for optimized workflows

---

## Features

* Join and track a live virtual queue
* Real-time position updates
* Instant updates when your turn approaches
* Admin controls for queue management
* Add / remove / advance users in queue
* Redis-backed fast queue operations
* Real-time sync between admin, server, and clients
* Fully containerized development setup

---

## Tech Stack

* **Monorepo:** Turborepo
* **Frontend:** React (Admin UI, Client UI)
* **Backend:** Node.js / Express (Server)
* **Database / Queue:** Redis
* **Realtime Communication:** WebSockets / Socket.io
* **Containerization:** Docker, Docker Compose

---

## Running Locally with Docker

### 1. Clone the repository

```bash id="clone"
git clone https://github.com/giriexplores/virtualQueue.git
cd virtualQueue
```

---

### 2. Start Redis + all services

```bash id="docker-up"
docker-compose up --build
```

This will start:

* Redis instance (queue storage)
* Server app
* Admin UI
* Client UI

---

## How It Works

1. Client joins the queue via Client UI
2. Server stores queue state in Redis
3. Admin controls queue progression via Admin UI
4. Server updates all clients in real-time
5. Redis ensures fast and consistent queue operations

---

## Local Development (Without Docker)

### 1. Start Redis locally

Run Redis using Docker:

```bash id="redis-local"
docker run -p 6379:6379 redis
```

---

### 2. Install dependencies

```bash id="install"
npm install
```

---

### 3. Run all apps with Turborepo

```bash id="dev"
npm run dev
```

---

## Key Design Decisions

* **Redis-based queue** for speed, simplicity, and atomic operations
* **Monorepo architecture** to share logic and simplify deployments
* **Docker-first setup** for consistent environments
* **Separation of concerns** between admin, client, and server apps

---

## Use Cases

* Hospitals and clinics
* Government service queues
* Restaurants and reservations
* Event entry systems
* Token-based service counters

---

## Future Improvements

* Authentication & role-based access control
* SMS/email queue notifications
* Multi-queue support per service
* Persistent storage fallback (Redis → DB sync)
* Analytics dashboard for queue performance
* Mobile-first responsive redesign

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

---

## Author

Built by [@giriexplores](https://github.com/giriexplores)

