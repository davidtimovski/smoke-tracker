<script lang="ts">
	import { synced } from '../lib/stores';
</script>

<header>
	<div>
		<div class="status-indicator synced" class:inactive={!$synced} />
		<div class="status-indicator unsynced" class:inactive={$synced} />
	</div>
</header>

<style lang="scss">
	header {
		padding: 20px 10px;
		margin-bottom: 20px;
	}

	.status-indicator {
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
</style>
