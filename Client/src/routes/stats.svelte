<script lang="ts">
	import { onMount } from 'svelte';
	import StatsService from '$lib/services/statsService';
	import type Statistic from '$lib/models/statistic';
	import Stat from '../components/stat.svelte';

	let inThePastWeek: Statistic = null;
	let inThePastMonth: Statistic = null;

	onMount(async () => {
		const statsService = new StatsService();

		statsService.getSmokesFromThePastWeek().then((stats) => {
			inThePastWeek = stats;
		});
		statsService.getSmokesFromThePastMonth().then((stats) => {
			inThePastMonth = stats;
		});
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Stats</title>
</svelte:head>

<section class="stats">
	<div class="stat">
		<div class="stat-title">In the past week</div>
		<Stat stat={inThePastWeek} />
	</div>

	<div class="stat">
		<div class="stat-title">In the past month</div>
		<Stat stat={inThePastMonth} />
	</div>

	<a href="/" class="link-button">Back</a>
</section>

<style lang="scss">
	.stats {
		margin-top: 25%;
		text-align: center;

		.stat {
			margin-bottom: 60px;
			line-height: 32px;
			font-size: 24px;

			&-title {
				margin-bottom: 30px;
			}
		}
	}
</style>
