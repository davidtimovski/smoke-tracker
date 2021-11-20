<script lang="ts">
	import { synced } from '../lib/stores';
</script>

<header>
	<div class="status-indicators">
		<div class="synced" class:inactive={!$synced} />
		<div class="unsynced" class:inactive={$synced} />
	</div>
	<a href="/stats" class="">Stats</a>
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
				&.unsynced {
					background: #3e8ed0;
					margin-left: 15px;
				}

				&.inactive {
					opacity: 0.4;
				}
			}
		}
	}

	a {
		border: 2px solid #00d1b2;
		border-radius: 5px;
		padding: 3px 15px;
		text-decoration: none;
	}
</style>
