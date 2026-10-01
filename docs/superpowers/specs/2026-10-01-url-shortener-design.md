# URL Shortener — Design Spec (SvelteKit Monolith)

**Tanggal:** 2026-10-01
**Stack fix:** Bun + TypeScript + SvelteKit + PostgreSQL (Docker) + Drizzle ORM
**Tujuan belajar:** paham alur frontend → backend → database, CRUD, redirect, validasi server + client
**Mode belajar:** asisten yang mengetik kode, tiap step dijelaskan sampai user paham sebelum lanjut.
**Scope:** Core Features + DoD di CASE.md. Out of scope: auth, QR, analytics, expiration, rate limiting, custom domain, deploy.

## 1. Arsitektur

Satu repo SvelteKit, Bun sebagai runtime/package manager.

```
browser (+page.svelte)
  --fetch JSON--> /api/urls (GET, POST), /api/urls/[shortCode] (DELETE)
  --navigate--> /[shortCode] (redirect 302)
backend (+server.ts) --> src/lib/server/db (Drizzle + postgres driver) --> Postgres (Docker)
```

Keputusan: monolith SvelteKit, bukan split frontend/backend. Alasan: 1x dev server, tanpa CORS, alur belajar paling jelas. Docker hanya untuk Postgres.

## 2. Struktur Project (target)

```
docker-compose.yml
drizzle.config.ts
.env (DATABASE_URL, ORIGIN/APP_URL)
src/lib/server/db/schema.ts   # tabel urls
src/lib/server/db/index.ts    # drizzle client
src/lib/server/urls.ts        # logic: validasi + generate code + CRUD
src/lib/utils.ts              # (opsional) helper validasi client
src/routes/+page.svelte       # form + list + delete button
src/routes/api/urls/+server.ts            # GET list, POST create
src/routes/api/urls/[shortCode]/+server.ts # DELETE
src/routes/[shortCode]/+server.ts          # GET redirect 302 / 404
```

## 3. Data Model

Tabel `urls`:
- `id serial primary key`
- `originalUrl text not null`
- `shortCode varchar(10) unique not null`
- `createdAt timestamptz default now() not null`

Generate `shortCode`: `nanoid(7)`, cek eksistensi di DB, retry max 3x, unique constraint sebagai pengaman akhir.

## 4. API Contract

- `POST /api/urls` body `{ "url": "https://..." }` → `201 { id, originalUrl, shortCode, shortUrl, createdAt }` / `400 { error }`
- `GET /api/urls` → `200 [{ id, originalUrl, shortCode, shortUrl, createdAt }]` urut terbaru dulu
- `DELETE /api/urls/:shortCode` → `200 { ok: true }` / `404 { error }`
- `GET /:shortCode` → `302 Location: originalUrl` / `404 text "Short URL tidak ditemukan"`

`shortUrl` dibangun dari request origin (`http://localhost:5173/<code>` di dev), bukan hardcode domain prod.

## 5. Validasi & Error

- Server otoritatif: `new URL()`, scheme hanya `http:`/`https:`, trim, tolak string kosong / tanpa TLD jelas / non-http. Pesan Indonesia jelas, mis. `"URL tidak valid. Contoh: https://example.com/artikel"`.
- Client: validasi ringan yang sama untuk UX, tapi tidak dipercaya server.
- Redirect yang tidak ketemu: 404 dengan pesan jelas, bukan redirect buta / crash 500.
- Tidak ada data hardcode pengganti DB. Semua baca/tulis lewat Drizzle.

## 6. Verifikasi (DoD mapping)

- Buat dari URL valid → 201 + muncul di list
- shortCode unik (constraint + retry)
- Restart `docker compose restart db` data tetap ada
- List tampil setelah reload
- Buka `/:shortCode` → redirect benar (cek Network 302 + Location)
- Code ngawur → 404 jelas
- Delete → hilang dari list + redirect-nya jadi 404
- URL invalid (`notaurl`, `ftp://x`) → 400 jelas, dari curl maupun UI (bypass client)
- Fresh setup: `README.md` langkah `bun install → docker compose up → bun run db:migrate → bun dev` bisa jalan dari nol.
