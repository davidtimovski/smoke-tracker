<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	import { todaysSmokes } from '$lib/stores';
	import AuthService from '$lib/services/authService';
	import SyncService from '$lib/services/syncService';
	import SmokesService from '$lib/services/smokesService';
	
	import Header from '$lib/components/Header.svelte';
	import CigarSvg from '$lib/components/CigarSvg.svelte';
	import VapeSvg from '$lib/components/VapeSvg.svelte';
	import HeetSvg from '$lib/components/HeetSvg.svelte';

	let loggedIn: boolean;
	let username: string;
	let hasAccount: boolean;

	const btnAnimationDuration = 1000;

	let authService: AuthService;
	let smokesService: SmokesService;

	let creatingCigar = false;
	async function createCigar() {
		if (creatingCigar) {
			return;
		}

		creatingCigar = true;

		$todaysSmokes.cigars++;
		await smokesService.createSmoke(0);

		window.setTimeout(() => {
			creatingCigar = false;
		}, btnAnimationDuration);
	}

	let creatingVape = false;
	async function createVape() {
		if (creatingVape) {
			return;
		}

		creatingVape = true;
		$todaysSmokes.vapes++;
		await smokesService.createSmoke(1);

		window.setTimeout(() => {
			creatingVape = false;
		}, btnAnimationDuration);
	}

	let creatingHeet = false;
	async function createHeet() {
		if (creatingHeet) {
			return;
		}

		creatingHeet = true;
		$todaysSmokes.heets++;
		await smokesService.createSmoke(2);

		window.setTimeout(() => {
			creatingHeet = false;
		}, btnAnimationDuration);
	}

	let undoButtonLabel = 'Undo';
	let undoing = false;
	async function undo() {
		if (creatingCigar || creatingVape || creatingHeet || undoing) {
			return;
		}

		undoing = true;
		await smokesService.undoLastCreate();

		undoButtonLabel = 'Undone!';
		window.setTimeout(() => {
			undoButtonLabel = 'Undo';
			undoing = false;
		}, btnAnimationDuration);
	}

	function logout() {
		authService.logout();
		loggedIn = false;
		username = null;
	}

	onMount(() => {
		authService = new AuthService();

		loggedIn = authService.loggedIn;
		username = authService.username;
		hasAccount = authService.hasAccount;

		const syncService = new SyncService(authService);
		smokesService = new SmokesService(authService, syncService);

		syncService.sync();
	});
</script>

<svelte:head>
	<title>Smoke Tracker</title>
</svelte:head>

{#if hasAccount === true && loggedIn === false}
	<div in:slide class="alert warning">
		You're not logged in currently.<br /><a href="/login">Log back in</a> if you want your changes to be synced.
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
		<CigarSvg size={50} />

		{#if $todaysSmokes.initialized}
			<span class="smoke-count">{$todaysSmokes.cigars}</span>
		{/if}
	</div>

	<div
		on:click={createVape}
		class="create-smoke-button vape"
		class:creating={creatingVape}
		role="button"
		aria-label="Add vape"
	>
		<VapeSvg size={50} />

		{#if $todaysSmokes.initialized}
			<span class="smoke-count">{$todaysSmokes.vapes}</span>
		{/if}
	</div>

	<div
		on:click={createHeet}
		class="create-smoke-button heet"
		class:creating={creatingHeet}
		role="button"
		aria-label="Add heet"
	>
		<HeetSvg size={50} />

		{#if $todaysSmokes.initialized}
			<span class="smoke-count">{$todaysSmokes.heets}</span>
		{/if}
	</div>

	{#if $todaysSmokes.initialized && $todaysSmokes.sum > 0}
		<button type="button" in:slide on:click={undo} class="undo-smoke-button" class:undoing>{undoButtonLabel}</button>
	{/if}

	<footer>
		{#if loggedIn === true}
			<div in:slide class="logged-in-menu">
				<div class="logged-in-menu-message">Hello, {username}</div>
				<button type="button" on:click={logout}>Logout</button>
			</div>
		{:else}
			<a href="/login" in:slide>Login</a>
		{/if}
	</footer>
</section>

<style lang="scss">
	section {
		text-align: center;
	}

	.create-smoke-button {
		display: inline-block;
		width: 80%;
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
			font-size: 50px;
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
		background: #fff;
		border: 2px solid #f14668;
		border-radius: 10px;
		padding: 8px 25px;
		margin-top: 30px;
		font-size: 22px;
		user-select: none;
		text-align: center;
		color: #f14668;
		cursor: pointer;
		transition: background 200ms ease-out, color 200ms ease-out;

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

		.logged-in-menu {
			text-align: center;

			&-message {
				margin-bottom: 15px;
			}
		}

		button {
			background: #fff;
			border: 2px solid #555;
			border-radius: 10px;
			padding: 5px 15px;
			font-size: 18px;
			user-select: none;
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
			user-select: none;
			color: #555;
			cursor: pointer;
		}
	}
</style>
