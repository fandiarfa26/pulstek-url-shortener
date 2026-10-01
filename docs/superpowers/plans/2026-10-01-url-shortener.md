# URL Shortener Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun URL shortener SvelteKit monolith sambil belajar alur frontend → backend → database, satu fase satu waktu, asisten yang mengetik kode dan menjelaskan tiap step sampai user paham.

**Architecture:** SvelteKit fullstack monolith. UI `+page.svelte` fetch ke `+server.ts` API, redirect di `[shortCode]/+server.ts`, semua DB lewat `src/lib/server/db/` (Drizzle).

**Tech Stack:** Bun + TypeScript + SvelteKit + PostgreSQL (Docker) + Drizzle ORM + postgres driver + nanoid

**Spec:** `docs/superpowers/specs/2026-10-01-url-shortener-design.md`

## Global Constraints

- Bahasa Indonesia untuk pesan error user.
- Validasi server otoritatif: `new URL()`, hanya `http:`/`https:`.
- `shortCode` unik: `nanoid(7)` + retry + unique constraint.
- Tidak ada data hardcode pengganti database.
- Satu fase selesai + terverifikasi + dipahami user sebelum lanjut fase berikut.
- Asisten mengetik kode, user memahami tiap step (tanya sampai paham, jangan lanjut kalau belum).
- JANGAN commit tanpa izin eksplisit user. Tampilkan `git status` + `git diff` dulu untuk dipelajari.

## Review Focus

- URL `javascript:alert(1)` / `ftp://x` / `notaurl` harus 400, bukan tersimpan — uji via curl bypass UI.
- `POST /api/urls` dengan body kosong / bukan JSON harus 400 jelas, bukan 500.
- `GET /abcXYZngawur` harus 404 jelas, bukan redirect buta.
- `shortUrl` harus ikut origin request (localhost vs prod), bukan hardcode.
- Reload setelah restart DB harus tetap tampil (persistensi beneran).

---

### Task 0: Setup — Bun + SvelteKit + Docker Postgres

**Files:**
- Create: `docker-compose.yml`, `.env.example`, `README.md`
- Modify: `package.json` (scripts dev/db)

**Interfaces:**
- Consumes: tidak ada
- Produces: `DATABASE_URL=postgres://short:short@localhost:5432/shortdb`, `docker compose up -d db` jalan

- [x] **Step 1: Inisialisasi SvelteKit (asisten ketik + jelaskan)**

Run: `bunx sv create . --template minimal --types ts --no-add-ons --no-install` (atau manual bila dir sudah isi), lalu `bun install`
Expected: `bun run dev` membuka halaman default SvelteKit di `http://localhost:5173`

- [x] **Step 2: Buat docker-compose.yml untuk Postgres**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: short
      POSTGRES_PASSWORD: short
      POSTGRES_DB: shortdb
    ports: ["5432:5432"]
    volumes: ["shortdb-data:/var/lib/postgresql/data"]
volumes:
  shortdb-data:
```

- [ ] **Step 3: Verifikasi DB hidup**

Run: `docker compose up -d db && docker compose ps`
Expected: `db` status Up. `pg_isready -h localhost -U short` OK.

- [ ] **Step 4: Tulis README skeleton + commit**

Run: `cat README.md` berisi langkah fresh-setup. `git add -A && git commit -m "chore: setup sveltekit + postgres docker"` (atau `git init` dulu bila belum repo)
Expected: README bisa diikuti dari nol.

### Task 1: DB + Drizzle — schema urls + migrate

**Files:**
- Create: `drizzle.config.ts`, `src/lib/server/db/schema.ts`, `src/lib/server/db/index.ts`
- Test: manual via `drizzle-kit` + `psql`

**Interfaces:**
- Consumes: `DATABASE_URL` dari Task 0
- Produces: `urlsTable { id, originalUrl, shortCode, createdAt }`, `export const db` dari `src/lib/server/db/index.ts`

- [ ] **Step 1: Install deps (asisten ketik + jelaskan)**

Run: `bun add drizzle-orm postgres && bun add -d drizzle-kit`
Expected: `package.json` berisi ketiganya.

- [ ] **Step 2: Tulis schema sesuai spec**

```ts
// src/lib/server/db/schema.ts
export const urlsTable = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code", { length: 10 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
```

- [ ] **Step 3: Generate + migrate**

Run: `bunx drizzle-kit generate && bunx drizzle-kit migrate`
Expected: tabel `urls` ada. Cek: `docker exec -it <db> psql -U short -d shortdb -c "\d urls"`

- [ ] **Step 4: Verifikasi persist + commit**

Run: `docker compose restart db` lalu ulang `\d urls`
Expected: tabel tetap ada. Commit `feat: urls schema + migrate`.

**Belajar:** apa itu migration, kenapa unique constraint penting, beda `text` vs `varchar`.

### Task 2: Backend — POST create + GET list

**Files:**
- Create: `src/lib/server/urls.ts`
- Create: `src/routes/api/urls/+server.ts`
- Test: `curl`

**Interfaces:**
- Consumes: `db` dari Task 1
- Produces: `POST /api/urls -> 201 { shortCode, shortUrl }`, `GET /api/urls -> 200 [...]`
- `export function isValidHttpUrl(s: string): boolean`, `export async function createShortUrl(originalUrl: string): Promise<Row>`

- [ ] **Step 1: Tulis `isValidHttpUrl` + `createShortUrl` (nanoid 7 + retry 3x)**

Run: `bun run dev` tidak error import
Expected: compile OK.

- [ ] **Step 2: Tulis `+server.ts` GET + POST**

POST: parse `{ url }`, validasi → 400 `{ error }` bila gagal, else 201 JSON. GET: select order desc.

- [ ] **Step 3: Verifikasi via curl**

Run: `curl -i -X POST localhost:5173/api/urls -H 'Content-Type: application/json' -d '{"url":"https://example.com/article/very-long-url"}'`
Expected: `201` + `shortCode` 7 char.

Run: `curl -s localhost:5173/api/urls | head -c 500`
Expected: list berisi row tadi.

Run: `curl -i -X POST localhost:5173/api/urls -H 'Content-Type: application/json' -d '{"url":"notaurl"}'`
Expected: `400` + pesan Indonesia jelas.

- [ ] **Step 4: Commit**

`feat: api create + list urls`

**Belajar:** Request/Response JSON, status code 201/400, kenapa validasi di server.

### Task 3: Frontend — form create + list

**Files:**
- Modify: `src/routes/+page.svelte`
- Test: browser manual

**Interfaces:**
- Consumes: `GET/POST /api/urls` dari Task 2
- Produces: form input + tombol create + daftar + link pendek tampil

- [ ] **Step 1: Tulis form + script fetch POST**

Minimal: `<input bind:value>`, `<button>`, `<p>{error}</p>`, `fetch("/api/urls")` onMount untuk list.

- [ ] **Step 2: Verifikasi browser**

Buka `http://localhost:5173`, input `https://example.com/a`, klik create.
Expected: short URL muncul di list tanpa reload manual.

- [ ] **Step 3: Commit**

`feat: ui form + list urls`

**Belajar:** fetch, state Svelte (`let`), rendering list `{#each}`.

### Task 4: Redirect — GET /:shortCode

**Files:**
- Create: `src/routes/[shortCode]/+server.ts`
- Test: browser Network tab + curl

**Interfaces:**
- Consumes: `db` lookup `where eq(urlsTable.shortCode, params.shortCode)`
- Produces: `302 Location: originalUrl` atau `404 "Short URL tidak ditemukan"`

- [ ] **Step 1: Tulis handler redirect**

```ts
// GET(src/routes/[shortCode]/+server.ts): redirect(302, row.originalUrl) atau error(404)
```

- [ ] **Step 2: Verifikasi**

Run: `curl -i localhost:5173/<codeDariTask2>`
Expected: `302` + `Location: https://example.com/...`

Run: `curl -i localhost:5173/ngawur123`
Expected: `404`.

Buka di browser → harus landing ke URL asli.

- [ ] **Step 3: Commit**

`feat: redirect shortCode`

**Belajar:** HTTP redirect 302 vs 301, route params SvelteKit.

### Task 5: Delete — API + tombol

**Files:**
- Create: `src/routes/api/urls/[shortCode]/+server.ts` (DELETE)
- Modify: `src/routes/+page.svelte` (tombol delete)
- Test: browser + curl

**Interfaces:**
- Consumes: list dari Task 3
- Produces: `DELETE /api/urls/:shortCode -> 200 { ok:true }` / `404`

- [ ] **Step 1: Tulis DELETE handler + tombol di UI**

- [ ] **Step 2: Verifikasi**

Klik delete di UI → row hilang. `curl -i localhost:5173/<codeYangDihapus>` → `404`.
Expected: list konsisten setelah reload.

- [ ] **Step 3: Commit**

`feat: delete short url`

**Belajar:** HTTP DELETE, optimistic vs refetch UI.

### Task 6: Hardening — validasi + error + README fresh-setup (DoD lock)

**Files:**
- Modify: `src/lib/server/urls.ts`, `src/routes/api/urls/+server.ts`, `+page.svelte`, `README.md`
- Test: curl bypass + restart proof

**Interfaces:**
- Consumes: semua task sebelumnya
- Produces: DoD CASE.md semua centang

- [ ] **Step 1: Tolak `ftp://`, `javascript:`, string kosong, spasi — server + client message sama jelas**

Run:
`curl -X POST localhost:5173/api/urls -H 'Content-Type: application/json' -d '{"url":"ftp://x"}'`
`curl -X POST localhost:5173/api/urls -H 'Content-Type: application/json' -d '{}'`
Expected: keduanya `400` jelas, bukan 500.

- [ ] **Step 2: Proof persist setelah restart**

Run: `docker compose restart db` → reload `/` + `curl GET /api/urls`
Expected: data tetap ada.

- [ ] **Step 3: Proof fresh-setup dari README**

Run di folder clone baru (atau hapus `node_modules` + `docker compose down -v` di branch test — hati-hati): `bun install && docker compose up -d db && bunx drizzle-kit migrate && bun run dev`
Expected: app jalan, checklist DoD 11 item lolos.

- [ ] **Step 4: Commit final**

`chore: hardening + docs DoD pass`

**Belajar:** beda 400/404/500, kenapa API tidak boleh percaya frontend, cara tulis README yang bisa diulang orang lain.

---

## Cara jalan (aturan belajar)

1. Asisten kerjakan satu Task/Step → jelaskan apa + kenapa (file:line) → tampilkan `git status` / `git diff` → user pelajari dulu.
2. JANGAN `git commit` otomatis. Commit hanya setelah user bilang "ok commit" / "lanjut".
3. User boleh minta breakdown lebih detail / analogi / contoh sebelum lanjut.
4. Kalau belum paham, stop dan bahas dulu, jangan lanjut ke step berikut.
5. Stretch goals (click count, custom code, expire) hanya setelah Task 6 lolos semua.
