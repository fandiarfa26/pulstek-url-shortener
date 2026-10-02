import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { urlsTable } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	const rows = await db
		.select()
		.from(urlsTable)
		.where(eq(urlsTable.shortCode, params.shortCode))
		.limit(1);
	if (!rows[0]) {
		return json({ error: 'Short URL tidak ditemukan' }, { status: 404 });
	}
	await db.delete(urlsTable).where(eq(urlsTable.shortCode, params.shortCode));
	return json({ ok: true });
};
