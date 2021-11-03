<script lang="ts">
	import { syncing } from '../lib/stores';
</script>

<header>
	<div>
		<div class="status-indicator synced" class:inactive={$syncing} />
		<div class="status-indicator syncing" class:inactive={!$syncing} />
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
		&.syncing {
			background: #3e8ed0;
			margin-left: 15px;
		}

		&.inactive {
			opacity: 0.4;
		}
	}
</style>
