import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from './db/index.js';
import { urlsTable } from './db/schema.js';

export function isValidHttpUrl(s: string): boolean {
	const t = s.trim();
	if (!t) return false;
	try {
		const u = new URL(t);
		return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
		return false;
	}
}

export async function createShortUrl(originalUrl: string) {
	const url = originalUrl.trim();
	if (!isValidHttpUrl(url)) {
		throw new Error('URL tidak valid. Contoh: https://example.com/artikel');
	}
	for (let i = 0; i < 3; i++) {
		const shortCode = nanoid(7);
		const existing = await db
			.select()
			.from(urlsTable)
			.where(eq(urlsTable.shortCode, shortCode))
			.limit(1);
		if (existing.length === 0) {
			const [row] = await db.insert(urlsTable).values({ originalUrl: url, shortCode }).returning();
			return row;
		}
	}
	throw new Error('Gagal membuat kode unik, coba lagi.');
}
