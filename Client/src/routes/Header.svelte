<script lang="ts">
	import { synced } from '../lib/stores';

	$: syncLabel = $synced ? 'Synced with server' : "Some changes haven't been synced";
</script>

<header>
	<div class="status-indicators" title={syncLabel} aria-label={syncLabel}>
		<div class="synced" class:inactive={!$synced} />
		<div class="not-synced" class:inactive={$synced} />
	</div>
	<nav>
		<a href="/history">History</a>
		<a href="/stats">Stats</a>
	</nav>
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		padding: 25px 10px;
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

	nav a {
		display: inline-block;
		border: 2px solid #00d1b2;
		border-radius: 5px;
		padding: 3px 15px;
		text-decoration: none;
	}
</style>
