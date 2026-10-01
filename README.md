# pulstek-url-shortener

URL shortener mini (SvelteKit monolith) — belajar alur frontend → backend → database.

Stack: Bun + TypeScript + SvelteKit + PostgreSQL (Docker) + Drizzle ORM.

## Prasyarat

- Bun (>= 1.x)
- Docker + Docker Compose

## Fresh setup

```sh
# 1. Install deps
bun install

# 2. Siapkan env
cp .env.example .env

# 3. Nyalakan Postgres
docker compose up -d db

# 4. Migrate DB (mulai Task 1)
bunx drizzle-kit migrate

# 5. Jalanin dev
bun run dev
```

Buka `http://localhost:5173`.

## Cek DB

```sh
docker compose ps
docker exec pulstek-url-shortener-db-1 pg_isready -U short -d shortdb
```

## Kontrak API (target)

- `POST /api/urls` → 201 / 400
- `GET /api/urls` → 200 (terbaru dulu)
- `DELETE /api/urls/:shortCode` → 200 / 404
- `GET /:shortCode` → 302 / 404
