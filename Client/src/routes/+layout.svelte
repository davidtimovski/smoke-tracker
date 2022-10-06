<script lang="ts">
	import '../css/modern-normalize.css';
	import '../css/app.css';

	import { onMount } from 'svelte';
	import { online } from '$lib/stores';

	import AuthService from '$lib/services/authService';
	import SyncService from '$lib/services/syncService';
	import SmokesService from '$lib/services/smokesService';

	onMount(() => {
		online.set(navigator.onLine);

		const authService = new AuthService();
		const syncService = new SyncService(authService);

		window.addEventListener('online', () => {
			online.set(true);
			syncService.sync();
		});
		window.addEventListener('offline', () => {
			online.set(false);
		});

		const smokesService = new SmokesService(authService, syncService);
		smokesService.loadTodays();
	});
</script>

<main>
	<div class="container">
		<slot />
	</div>
</main>

<style>
	.container {
		width: 100%;
	}

	@media screen and (min-width: 600px) {
		main {
			display: flex;
			justify-content: center;
			min-height: 90%;
		}

		.container {
			width: 400px;
		}
	}
</style>
