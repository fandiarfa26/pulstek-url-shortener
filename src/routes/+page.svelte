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

<main class="mx-auto max-w-xl px-4 py-10">
	<h1 class="text-2xl font-bold">Pemendek URL</h1>

	<form onsubmit={create} class="mt-4 flex gap-2">
		<input
			bind:value={url}
			placeholder="https://example.com/artikel"
			class="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
		/>
		<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			Create
		</button>
	</form>

	{#if error}
		<p class="mt-2 text-sm text-red-600">{error}</p>
	{/if}

	<ul class="mt-6 space-y-2">
		{#each urls as u (u.id)}
			<li class="flex items-center justify-between gap-2 rounded border border-gray-200 p-3">
				<span class="truncate">
					<a href={u.shortUrl} class="font-medium text-blue-600 hover:underline">{u.shortUrl}</a>
					<span class="block truncate text-sm text-gray-500">{u.originalUrl}</span>
				</span>
				<button
					onclick={() => remove(u.shortCode)}
					class="shrink-0 rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
				>
					Delete
				</button>
			</li>
		{/each}
	</ul>
</main>
