<!--
Author: Domonick Mack
Date: 2026-11-05
Description: Project overview, architecture, API reference, and quickstart guide for Apex Vault Sneaker Inventory iOS app.
-->

# Apex Vault — Sneaker Collection Inventory App (iOS)

Apex Vault is a full-stack iOS Sneaker Collection Inventory Application built with React Native (Expo SDK) and a containerized Fastify + PostgreSQL 16 backend orchestrated via Docker Compose.

## Key Features

- **Cross-Fade Sneaker Photography Slideshow**: Full-bleed background cycling smoothly through custom sneaker photography (`SneakerSlideshow`) with an Editorial Hero cover (`EditorialHeroOverlay`).
- **Camera & Photo Library Capture**: Snap live sneaker photos or import shots from the iOS Photo Library via `expo-image-picker`, compressed and persisted as base64 data URIs in PostgreSQL.
- **Automatic Printable QR Shoe-Box Tags**: Every pair in the collection automatically generates a vector QR code (`react-native-qrcode-svg`) encoding `apexvault://sneaker/<id>?sku=<sku>&size=<size>` inside a high-contrast printable label (`SneakerQRTag`) displaying Brand, Model, Colorway, SKU, US Size, and Storage Location.
- **Full Sneaker Collector Metadata**: Track Brand, Model, Colorway, SKU / Style Code, US Size, Condition (`DS`, `VNDS`, `Used`, `Beater`), Vault Status (`in_stock`, `reserved`, `sold`), Purchase Price, Market Value, Unrealized Gain/Loss, Purchase Date, Box Condition (`OG All`, `OG Box (Damaged)`, `Replacement Box`, `No Box`), Storage Location, and Collector Notes.
- **Portfolio Valuation Dashboard**: Dark portfolio summary card with unrealized gain/loss, interactive Mint (`In Stock`) and Lavender (`Reserved`) breakdown cards, real-time search & filtering, and full CRUD management.

---

## REST API Endpoints (`/api/v1/sneakers`)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/sneakers` | Returns `{ sneakers, metrics }` ordered by newest first, with portfolio valuation & status breakdown metrics. |
| `GET` | `/api/v1/sneakers/:id` | Returns a single sneaker entry by UUID. |
| `POST` | `/api/v1/sneakers` | Creates a sneaker record and auto-generates its `qrCodeData` URI. |
| `PUT` | `/api/v1/sneakers/:id` | Updates a sneaker record and refreshes its `qrCodeData` URI. |
| `DELETE` | `/api/v1/sneakers/:id` | Removes a sneaker record from the vault (`204 No Content`). |

---

## Quickstart Guide

### 1. Start the Containerized Backend & PostgreSQL Database
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:8003/api/v1/sneakers
```

### 2. Run the iOS App
```bash
cd mobile
npm install
npx expo start --ios
```
