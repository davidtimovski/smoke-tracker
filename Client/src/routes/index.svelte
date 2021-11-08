<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import AuthService from '$lib/services/authService';
	import SyncService from '$lib/services/syncService';
	import SmokesService from '$lib/services/smokesService';
	import Header from './Header.svelte';

	let loggedIn: boolean;
	let hasAccount: boolean;

	let todaysCigars = 0;
	let todaysVapes = 0;
	let todaysHeets = 0;
	let todaysSmokesSum = 0;

	let authService: AuthService;
	let smokesService: SmokesService;

	async function load() {
		await smokesService.getTodaysSmokes().then((smokes) => {
			todaysCigars = smokes.filter((x) => x.type === 0).length;
			todaysVapes = smokes.filter((x) => x.type === 1).length;
			todaysHeets = smokes.filter((x) => x.type === 2).length;

			todaysSmokesSum = todaysCigars + todaysVapes + todaysHeets;
		});
	}

	let creatingCigar = false;
	async function createCigar() {
		if (creatingCigar) {
			return;
		}

		creatingCigar = true;
		await smokesService.createSmoke(0);

		load();

		window.setTimeout(() => {
			creatingCigar = false;
		}, 2000);
	}

	let creatingVape = false;
	async function createVape() {
		if (creatingVape) {
			return;
		}

		creatingVape = true;
		await smokesService.createSmoke(1);

		load();

		window.setTimeout(() => {
			creatingVape = false;
		}, 2000);
	}

	let creatingHeet = false;
	async function createHeet() {
		if (creatingHeet) {
			return;
		}

		creatingHeet = true;
		await smokesService.createSmoke(2);

		load();

		window.setTimeout(() => {
			creatingHeet = false;
		}, 2000);
	}

	let undoButtonLabel = 'Undo last';
	let undoing = false;
	async function undoLastSmoke() {
		if (undoing) {
			return;
		}

		undoing = true;
		await smokesService.undoLastCreate();

		await load();

		undoButtonLabel = 'Undone!';
		window.setTimeout(() => {
			undoButtonLabel = 'Undo last';
			undoing = false;
		}, 2000);
	}

	function logout() {
		authService.logout();
		loggedIn = false;
	}

	onMount(async () => {
		authService = new AuthService();

		loggedIn = authService.loggedIn;
		hasAccount = authService.hasAccount;

		const syncService = new SyncService(authService);
		smokesService = new SmokesService(authService, syncService);

		syncService.sync();
		load();
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

{#if hasAccount === true && loggedIn === false}
	<div in:slide class="warning-alert">
		You're not logged in currently. <a sveltekit:prefetch href="/login">Log back in</a> if you want your changes to be synced.
	</div>
{/if}

<Header />

<section>
	<div
		on:click={createCigar}
		class="create-smoke-button cigar"
		class:creating={creatingCigar}
		role="button"
		aria-label="Add cigar"
	>
		<img src="images/cigar.svg" alt="Cigar" />
		<span class="smoke-count">{todaysCigars}</span>
	</div>

	<div
		on:click={createVape}
		class="create-smoke-button vape"
		class:creating={creatingVape}
		role="button"
		aria-label="Add vape"
	>
		<img src="images/vape.svg" alt="Vape" />
		<span class="smoke-count">{todaysVapes}</span>
	</div>

	<div
		on:click={createHeet}
		class="create-smoke-button heet"
		class:creating={creatingHeet}
		role="button"
		aria-label="Add heet"
	>
		<img src="images/heet.svg" alt="Heet" />
		<span class="smoke-count">{todaysHeets}</span>
	</div>

	<button
		type="button"
		on:click={undoLastSmoke}
		disabled={todaysSmokesSum === 0}
		class="undo-smoke-button"
		class:undoing>{undoButtonLabel}</button
	>

	<footer>
		{#if loggedIn === true}
			<button type="button" on:click={logout}>Logout</button>
		{:else if hasAccount === false}
			<a sveltekit:prefetch href="/register">Register</a>
		{/if}
	</footer>
</section>

<style lang="scss">
	.create-smoke-button {
		height: 80px;
		border: 2px solid;
		border-radius: 10px;
		padding: 15px 15px 10px;
		margin-bottom: 20px;
		font-size: 30px;
		user-select: none;
		text-align: center;
		cursor: pointer;
		transition: background 300ms ease-out, color 300ms ease-out, font-size 300ms;

		&.creating {
			font-size: 46px;
			cursor: default;
		}

		&.cigar {
			background: #00d1b2;
			border-color: #00d1b2;
			color: #fff;

			&.creating {
				background: rgba(0, 209, 178, 0.2);
				color: #00d1b2;
			}
		}

		&.vape {
			background: #485fc7;
			border-color: #485fc7;
			color: #fff;

			&.creating {
				background: rgba(72, 95, 199, 0.2);
				color: #485fc7;
			}
		}

		&.heet {
			background: #3e8ed0;
			border-color: #3e8ed0;
			color: #fff;

			&.creating {
				background: rgba(62, 142, 208, 0.2);
				color: #3e8ed0;
			}
		}
	}

	.smoke-count {
		margin-left: 10px;
	}

	.undo-smoke-button {
		width: 100%;
		background: #fff;
		border: 2px solid #f14668;
		border-radius: 10px;
		padding: 15px;
		margin-top: 30px;
		font-size: 22px;
		user-select: none;
		text-align: center;
		color: #f14668;
		cursor: pointer;
		transition: background 200ms ease-out, color 200ms ease-out;

		&:disabled {
			opacity: 0.6;
			cursor: default;
		}

		&.undoing {
			background: #f14668;
			color: #fff;
			cursor: default;
		}
	}

	footer {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		margin: 35px 0;
		text-align: center;

		button {
			background: #fff;
			border: 2px solid #555;
			border-radius: 10px;
			padding: 5px 15px;
			font-size: 18px;
			text-align: center;
			color: #555;
			cursor: pointer;
		}

		a {
			background: #fff;
			border: 2px solid #555;
			border-radius: 10px;
			padding: 5px 15px;
			font-size: 18px;
			text-align: center;
			text-decoration: none;
			color: #555;
			cursor: pointer;
		}
	}

	@media screen and (min-width: 600px) {
		.create-smoke-button,
		.undo-smoke-button {
			width: 250px;
		}
	}
</style>
