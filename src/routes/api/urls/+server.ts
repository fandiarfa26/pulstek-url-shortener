import { json } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { urlsTable } from '$lib/server/db/schema.js';
import { createShortUrl, isValidHttpUrl } from '$lib/server/urls.js';
import type { RequestHandler } from './$types';

function toResponse(row: typeof urlsTable.$inferSelect, origin: string) {
	return { ...row, shortUrl: `${origin}/${row.shortCode}` };
}

export const GET: RequestHandler = async ({ request }) => {
	const origin = new URL(request.url).origin;
	const rows = await db.select().from(urlsTable).orderBy(desc(urlsTable.id));
	return json(rows.map((r) => toResponse(r, origin)));
};

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Body harus JSON dengan field "url".' }, { status: 400 });
	}
	const url =
		typeof body === 'object' && body !== null ? (body as { url?: unknown }).url : undefined;
	if (typeof url !== 'string' || !isValidHttpUrl(url)) {
		return json({ error: 'URL tidak valid. Contoh: https://example.com/artikel' }, { status: 400 });
	}
	try {
		const row = await createShortUrl(url);
		const origin = new URL(request.url).origin;
		return json(toResponse(row, origin), { status: 201 });
	} catch (e) {
		return json(
			{ error: e instanceof Error ? e.message : 'Gagal membuat short URL.' },
			{ status: 400 }
		);
	}
};
