import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { urlsTable } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const rows = await db
		.select()
		.from(urlsTable)
		.where(eq(urlsTable.shortCode, params.shortCode))
		.limit(1);
	const row = rows[0];
	if (!row) {
		throw error(404, 'Short URL tidak ditemukan');
	}
	throw redirect(302, row.originalUrl);
};
