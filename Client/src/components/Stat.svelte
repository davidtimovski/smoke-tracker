<script lang="ts">
	import { slide } from 'svelte/transition';
	import type Stat from '$lib/models/statistic';

	export let stat: Stat;
</script>

{#if stat}
	<div in:slide class="stat-value">
		{#if stat.hasData}
			{#if stat.cigars > 0}
				<span class="cigars">{stat.cigars}</span>

				{#if stat.vapes + stat.heets > 0}
					<span> / </span>
				{/if}
			{/if}

			{#if stat.vapes > 0}
				<span class="vapes">{stat.vapes}</span>

				{#if stat.heets > 0}
					<span> / </span>
				{/if}
			{/if}

			{#if stat.heets > 0}
				<span class="heets">{stat.heets}</span>
			{/if}
		{:else}
			<span>-</span>
		{/if}
	</div>
{/if}

<style lang="scss">
	.stat-value {
		line-height: 52px;
		font-size: 36px;

		.cigars {
			color: #00d1b2;
		}
		.vapes {
			color: #485fc7;
		}
		.heets {
			color: #3e8ed0;
		}
	}
</style>
