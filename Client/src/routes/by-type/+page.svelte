<script lang="ts">
	import { onMount } from 'svelte';

	import StatsService from '$lib/services/statsService';
	import type SumByType from '$lib/models/sumByType';

	import Stat from '$lib/components/Stat.svelte';

	let inThePastWeek: SumByType;
	let inThePastMonth: SumByType;
	let inThePastYear: SumByType;

	onMount(() => {
		const statsService = new StatsService();

		statsService.getSmokesFromThePastWeek().then((result) => {
			inThePastWeek = result;
		});
		statsService.getSmokesFromThePastMonth().then((result) => {
			inThePastMonth = result;
		});
		statsService.getSmokesFromThePastYear().then((result) => {
			inThePastYear = result;
		});
	});
</script>

<svelte:head>
	<title>Smoke Tracker - By type</title>
</svelte:head>

<section>
	<div class="page-title">By type</div>

	<div class="page">
		<div class="stat">
			<h1 class="stat-title">In the past week</h1>
			<Stat data={inThePastWeek} />
		</div>

		<div class="stat">
			<h1 class="stat-title">In the past month</h1>
			<Stat data={inThePastMonth} />
		</div>

		<div class="stat">
			<h1 class="stat-title">In the past year</h1>
			<Stat data={inThePastYear} />
		</div>

		<a href="/" class="link-button">Back</a>
	</div>
</section>

<style lang="scss">
	.stat {
		margin: 60px 0;
	}
</style>
