<!--
Author: Domonick Mack
Date: 2026-11-02
Description: Project overview, architecture, setup guide, and documentation for Apex iOS.
-->

# Apex iOS - Mobile App & Containerized Development Environment

Apex iOS is a modern iOS mobile application crafted with React Native and Expo, styled strictly according to Apple's Human Interface Guidelines (HIG), and backed by a containerized Fastify (Node.js/TypeScript) REST API and PostgreSQL database orchestrated with Docker Compose.

---

## Architecture Overview

```
                                +---------------------------+
                                |      Apex iOS Client      |
                                | (React Native + Expo SDK) |
                                |  NativeWind HIG Styling   |
                                +-------------+-------------+
                                              |
                                     HTTP API | Requests
                                              v
+-----------------------------------------------------------------------------------+
| Docker Compose Development Environment                                            |
|                                                                                   |
|  +-------------------------------------+   +------------------------------------+  |
|  |             backend-api             |   |              postgres              |  |
|  |       Fastify + TypeScript API      |-->|       PostgreSQL 16 Database       |  |
|  |         (Port 8003:8000)            |   |          (Port 5433:5432)          |  |
|  +-------------------------------------+   +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## Directory Structure

```
.
├── .gitignore               # Ignored files, credentials, dependencies, and build artifacts
├── .env.example             # Template for local environment variables
├── README.md                # Project documentation and quickstart instructions
├── docker-compose.yml       # Docker Compose definition for backend and database services
├── backend/                 # Containerized Fastify API service
│   ├── Dockerfile           # Multi-stage production Dockerfile
│   ├── package.json         # Node.js dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   └── src/                 # Fastify application source code
└── mobile/                  # React Native / Expo iOS client
    ├── app/                 # Expo Router file-based screens
    ├── components/          # Apple HIG design system components
    ├── constants/           # HIG system colors, typography, and API config
    ├── tailwind.config.js   # NativeWind HIG style configuration
    └── package.json         # Expo dependencies and scripts
```

---

## Tech Stack

- **Mobile Client**: React Native, Expo SDK, Expo Router, TypeScript
- **Design System**: Apple Human Interface Guidelines (HIG) with NativeWind (Tailwind CSS) & SF-compatible iconography
- **Backend Service**: Fastify, TypeScript, Node.js 20
- **Database**: PostgreSQL 16 (Alpine)
- **Containerization**: Docker & Docker Compose v2

---

## Quickstart Guide

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running locally)
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Expo Go](https://expo.dev/go) on your iOS physical device or iOS Simulator via Xcode

### 2. Start the Containerized Backend Environment
```bash
# Copy the environment configuration
cp .env.example .env

# Build and start services in detached mode
docker compose up -d --build

# Verify container health
docker compose ps
curl http://localhost:8003/health
```

### 3. Start the Mobile Client
```bash
cd mobile
npm install
npx expo start --ios
```

---

## Development Standards
- **File Headers**: Every file contains standard author attribution (`Author: Domonick Mack`), creation date, and brief functional description.
- **Error Handling**: Production-ready code with graceful shutdowns, health check endpoints, and structured logging.
