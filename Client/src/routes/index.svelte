<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { syncing } from '../lib/stores';
	import AuthService from '../lib/services/authService';
	import SmokesService from '../lib/services/smokesService';
	import Header from './Header.svelte';

	// fetch('http://localhost:5100/api/token', {
	// 	method: 'post',
	// 	body: JSON.stringify({
	// 		UserName: 'david',
	// 		Password: 'skopje12'
	// 	})
	// }).then(async (response) => {
	// 	var res = await response.json();
	// 	debugger;
	// 	fetch('http://localhost:5100/api/secured', {
	// 		headers: new Headers({
	// 			Authorization: 'Bearer ' + res.token
	// 		})
	// 	}).then((a) => {
	// 		debugger;
	// 	});
	// });

	let todaysCigars = 0;
	let todaysVapes = 0;
	let todaysHeets = 0;

	let smokesService: SmokesService;

	async function load() {
		await smokesService.getTodaysSmokes().then((smokes) => {
			todaysCigars = smokes.filter((x) => x.type === 0).length;
			todaysVapes = smokes.filter((x) => x.type === 1).length;
			todaysHeets = smokes.filter((x) => x.type === 2).length;
		});
	}

	let creatingCigar = false;
	async function createCigar() {
		if (creatingCigar) {
			return;
		}

		$syncing = creatingCigar = true;
		const synced = await smokesService.createSmoke(0);

		$syncing = !synced;
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

		$syncing = creatingVape = true;
		const synced = await smokesService.createSmoke(1);

		$syncing = !synced;
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

		$syncing = creatingHeet = true;
		const synced = await smokesService.createSmoke(2);

		$syncing = !synced;
		load();

		window.setTimeout(() => {
			creatingHeet = false;
		}, 2000);
	}

	let undoButtonLabel = 'Undo last';
	let undoing = false;
	function undoSmoke() {
		if (undoing) {
			return;
		}

		$syncing = undoing = true;
		smokesService.undoLastCreate().then(async (synced) => {
			$syncing = !synced;
			await load();

			undoButtonLabel = 'Undone!';
			window.setTimeout(() => {
				undoButtonLabel = 'Undo last';
				undoing = false;
			}, 2000);
		});
	}

	onMount(async () => {
		smokesService = new SmokesService(new AuthService());
		load();
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

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

	<div on:click={undoSmoke} class="undo-smoke-button" class:undoing role="button">{undoButtonLabel}</div>
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

		&.undoing {
			background: #f14668;
			color: #fff;
			cursor: default;
		}
	}

	@media screen and (min-width: 600px) {
		.create-smoke-button,
		.undo-smoke-button {
			width: 250px;
		}
	}
</style>
