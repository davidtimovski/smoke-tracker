<script lang="ts">
	import { onMount } from 'svelte';

	import StatsService from '$lib/services/statsService';
	import type Statistic from '$lib/models/statistic';

	import Stat from '$lib/components/Stat.svelte';

	let inThePastWeek: Statistic;
	let inThePastMonth: Statistic;

	onMount(() => {
		const statsService = new StatsService();

		statsService.getSmokesFromThePastWeek().then((result) => {
			inThePastWeek = result;
		});
		statsService.getSmokesFromThePastMonth().then((result) => {
			inThePastMonth = result;
		});
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Week & month</title>
</svelte:head>

<section>
	<div class="page-title">Week & month</div>

	<div class="page">
		<div class="stat">
			<div class="stat-title">In the past week</div>
			<Stat data={inThePastWeek} />
		</div>

		<div class="stat">
			<div class="stat-title">In the past month</div>
			<Stat data={inThePastMonth} />
		</div>

		<a href="/" class="link-button">Back</a>
	</div>
</section>

<style lang="scss">
	.stat {
		margin: 60px 0;
		line-height: 32px;
		font-size: 24px;

		&-title {
			margin-bottom: 30px;
		}
	}
</style>
