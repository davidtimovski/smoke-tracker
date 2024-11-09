<script lang="ts">
	import { synced } from '$lib/stores';
	import { slide } from 'svelte/transition';
	import { statsDrawerIsOpen } from '$lib/stores';

	let syncLabel = $derived($synced ? 'Synced with server' : "Some changes haven't been synced");

	function toggleStatItems() {
		statsDrawerIsOpen.set(!$statsDrawerIsOpen);
	}
</script>

<header>
	<div class="status-indicators" role="tooltip" title={syncLabel} aria-label={syncLabel}>
		<div class="synced" class:inactive={!$synced}></div>
		<div class="not-synced" class:inactive={$synced}></div>
	</div>
	<nav>
		<div class="stats-drawer" class:open={$statsDrawerIsOpen}>
			<button type="button" onclick={toggleStatItems} class="stats-button">Stats</button>
			{#if $statsDrawerIsOpen}
				<ul in:slide>
					<li><a href="/past-week">Past week</a></li>
					<li><a href="/graphs">Graphs</a></li>
					<li><a href="/by-type">By type</a></li>
				</ul>
			{/if}
		</div>
	</nav>
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		padding: 25px 30px;
		margin-bottom: 20px;

		.status-indicators {
			padding: 5px 0;

			> div {
				display: inline-block;
				width: 12px;
				height: 12px;
				border-radius: 50%;

				&.synced {
					background: #48c78e;
				}
				&.not-synced {
					background: #3e8ed0;
					margin-left: 15px;
				}

				&.inactive {
					opacity: 0.4;
				}
			}
		}
	}

	.stats-drawer {
		border: 2px solid #00d1b2;
		border-radius: 5px;
		color: #1e6eb0;

		&.open {
			.stats-button {
				background: #00d1b2;
				color: #fff;
			}
		}

		.stats-button {
			display: block;
			width: 100%;
			background: transparent;
			border: none;
			outline: none;
			padding: 5px 15px;
			color: #1e6eb0;
			transition:
				background 250ms,
				color 250ms;
		}

		ul {
			border-top: 1px solid #00d1b2;
			padding: 0;
			margin: 0;
			list-style: none;
		}

		a {
			display: block;
			padding: 5px 15px;
			text-decoration: none;
			text-align: center;
		}
	}
</style>
