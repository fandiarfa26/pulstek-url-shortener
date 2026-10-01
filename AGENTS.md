# AGENTS.md — pulstek-url-shortener

SvelteKit monolith (Bun + TS). UI `src/routes/+page.svelte` fetch ke `+server.ts` API, redirect di `src/routes/[shortCode]/+server.ts`, semua DB lewat `src/lib/server/db/` (Drizzle + `postgres` driver). Docker hanya untuk Postgres. Spec: `docs/superpowers/specs/2026-10-01-url-shortener-design.md`. Plan: `docs/superpowers/plans/2026-10-01-url-shortener.md`.

## Workflow (wajib)

- Asisten yang mengetik kode, satu Task/Step dalam satu waktu.
- Tiap step: jelaskan apa + kenapa dengan `path:line`, tampilkan `git status` + `git diff`.
- Tiap step selesai: update checklist `- [x]` di `docs/superpowers/plans/2026-10-01-url-shortener.md` sebelum commit, biar user tidak manual checklist.
- JANGAN `git commit` tanpa izin eksplisit ("ok commit"). Lanjut step berikut hanya setelah user paham.
- Out of scope CASE.md: auth, QR, analytics, expiration, rate limiting, custom domain, deploy, UI kompleks.

## Commands

- Setup: `bun install && docker compose up -d db && bunx drizzle-kit migrate && bun run dev` (dev di `http://localhost:5173`)
- DB cek: `docker compose ps`, `docker exec -it <db> psql -U short -d shortdb -c "\d urls"`
- Deps: `bun add drizzle-orm postgres nanoid && bun add -d drizzle-kit`
- Verifikasi API: `curl -i -X POST localhost:5173/api/urls -H 'Content-Type: application/json' -d '{"url":"https://example.com/x"}'` → 201; `curl -s localhost:5173/api/urls`; `curl -i localhost:5173/<code>` → 302

## Konvensi kode

- Validasi server otoritatif: `new URL()`, hanya `http:`/`https:`. Pesan error user Bahasa Indonesia yang jelas.
- `shortCode`: `nanoid(7)` + retry max 3x + kolom `.unique()`. `shortUrl` dari request origin, bukan hardcode.
- Kontrak: `POST /api/urls` 201/400, `GET /api/urls` 200 terbaru dulu, `DELETE /api/urls/:shortCode` 200/404, `GET /:shortCode` 302/404 dengan pesan jelas.
- `DATABASE_URL=postgres://short:short@localhost:5432/shortdb`. `.env` di-ignore, contoh di `.env.example`.
