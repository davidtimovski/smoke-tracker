<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../css/modern-normalize.css';
	import '../css/app.css';
</script>

<main>
	<div class="container">
		<Header />

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
			width: auto;
		}
	}
</style>
