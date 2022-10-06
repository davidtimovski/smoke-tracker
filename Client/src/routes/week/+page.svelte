<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	import StatsService from '$lib/services/statsService';
	import type SmokesOnDate from '$lib/models/smokesOnDate';

	import CigarSvg from '$lib/components/CigarSvg.svelte';
	import VapeSvg from '$lib/components/VapeSvg.svelte';
	import HeetSvg from '$lib/components/HeetSvg.svelte';

	let smokesPerDay: SmokesOnDate[];

	onMount(async () => {
		const statsService = new StatsService();
		smokesPerDay = await statsService.smokesPerDayFromThePastWeek();
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Week</title>
</svelte:head>

<section>
	<div class="page-title">Week</div>

	<div class="page">
		{#if smokesPerDay}
			<table in:slide>
				{#each smokesPerDay as day}
					<tr class:weekend={day.isWeekend}>
						<td>{day.date}</td>
						<td title={day.label} aria-label={day.label}>
							{#each Array(day.cigars) as _}
								<CigarSvg size={26} fill="#00d1b2" />
							{/each}
							{#each Array(day.vapes) as _}
								<VapeSvg size={26} fill="#485fc7" />
							{/each}
							{#each Array(day.heets) as _}
								<HeetSvg size={26} fill="#3e8ed0" />
							{/each}
						</td>
					</tr>
				{/each}
			</table>
		{/if}

		<a href="/" class="link-button">Back</a>
	</div>
</section>

<style lang="scss">
	table {
		border-collapse: collapse;
		margin-bottom: 60px;

		tr.weekend {
			background: #f3fbfb;
		}

		td {
			border-bottom: 1px solid #ddd;

			&:first-child {
				padding: 10px 8px;
				text-align: left;
				white-space: nowrap;
			}

			&:last-child {
				padding: 5px 8px 0;
				text-align: right;
			}
		}
	}
</style>
