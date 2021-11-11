<script lang="ts">
	import '../css/modern-normalize.css';
	import '../css/app.css';

	import { onMount } from 'svelte';
	import { online } from '../lib/stores';

	onMount(() => {
		online.set(navigator.onLine);

		window.addEventListener('online', () => {
			online.set(true);
		});
		window.addEventListener('offline', () => {
			online.set(false);
		});
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
		padding: 0 20px;
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
