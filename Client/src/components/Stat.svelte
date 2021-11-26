<script lang="ts">
	import { slide } from 'svelte/transition';
	import type Statistic from '$lib/models/statistic';

	export let data: Statistic;
</script>

{#if data}
	<div in:slide class="stat-value">
		{#if data.hasData}
			{#if data.cigars > 0}
				<span class="cigars">{data.cigars}</span>

				{#if data.vapes + data.heets > 0}
					<span> / </span>
				{/if}
			{/if}

			{#if data.vapes > 0}
				<span class="vapes">{data.vapes}</span>

				{#if data.heets > 0}
					<span> / </span>
				{/if}
			{/if}

			{#if data.heets > 0}
				<span class="heets">{data.heets}</span>
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
