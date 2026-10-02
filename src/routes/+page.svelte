<script lang="ts">
	import { onMount } from 'svelte';

	type UrlRow = {
		id: number;
		originalUrl: string;
		shortCode: string;
		shortUrl: string;
		createdAt: string;
	};

	let url = $state('');
	let error = $state('');
	let urls: UrlRow[] = $state([]);

	async function load() {
		const res = await fetch('/api/urls');
		urls = await res.json();
	}

	onMount(load);

	async function create(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		const res = await fetch('/api/urls', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url })
		});
		const data = await res.json();
		if (!res.ok) {
			error = data.error ?? 'Gagal membuat short URL.';
			return;
		}
		url = '';
		await load();
	}

	async function remove(shortCode: string) {
		const res = await fetch(`/api/urls/${shortCode}`, { method: 'DELETE' });
		if (!res.ok) {
			const data = await res.json();
			error = data.error ?? 'Gagal menghapus short URL.';
			return;
		}
		await load();
	}
</script>

<h1>Pemendek URL</h1>

<form onsubmit={create}>
	<input bind:value={url} placeholder="https://example.com/artikel" />
	<button type="submit">Create</button>
</form>

{#if error}
	<p>{error}</p>
{/if}

<ul>
	{#each urls as u (u.id)}
		<li>
			<a href={u.shortUrl}>{u.shortUrl}</a> → {u.originalUrl}
			<button onclick={() => remove(u.shortCode)}>Delete</button>
		</li>
	{/each}
</ul>
