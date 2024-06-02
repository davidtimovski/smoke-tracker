<script lang="ts">
	import { onMount } from 'svelte';
	import { LineController, LineElement, CategoryScale, Chart, LinearScale, PointElement } from 'chart.js';
	import StatsService from '$lib/services/statsService';

	let perMonthCanvas: HTMLCanvasElement;
	let perMonthCanvasCtx: CanvasRenderingContext2D | null = null;
	let perMonthChart: Chart;

	let perYearCanvas: HTMLCanvasElement;
	let perYearCanvasCtx: CanvasRenderingContext2D | null = null;
	let perYearChart: Chart;

	Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement);
	Chart.defaults.font.family = '"Poppins", sans-serif';

	async function loadPerMonthGraph(statsService: StatsService) {
		const monthLabels = new Array<string>();
		const now = new Date();
		const current = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1, 0, 0, 0, 0);
		for (let i = 0; i < 12; i++) {
			const month = current.toLocaleString('en', { month: 'short' });
			monthLabels.push(month);
			current.setMonth(current.getMonth() + 1);
		}

		const perMonthData = await statsService.smokesPerMonthFromThePastYear();

		perMonthCanvasCtx = perMonthCanvas.getContext('2d');
		perMonthChart = new Chart(<CanvasRenderingContext2D>perMonthCanvasCtx, {
			type: 'line',
			data: {
				labels: monthLabels,
				datasets: [
					{
						data: perMonthData,
						borderColor: '#00d1b2'
					}
				]
			},
			options: {
				scales: {
					y: {
						min: 0,
						ticks: {
							stepSize: 1
						}
					}
				}
			}
		});
	}

	async function loadPerYearGraph(statsService: StatsService) {
		const perYearData = await statsService.smokesPerYear();
		const yearLabels = perYearData.map((x) => x.year);
		const smokesPerYear = perYearData.map((x) => x.smokes);

		perYearCanvasCtx = perYearCanvas.getContext('2d');
		perYearChart = new Chart(<CanvasRenderingContext2D>perYearCanvasCtx, {
			type: 'line',
			data: {
				labels: yearLabels,
				datasets: [
					{
						data: smokesPerYear,
						borderColor: '#3e8ed0'
					}
				]
			},
			options: {
				scales: {
					y: {
						min: 0,
						ticks: {
							stepSize: 1
						}
					}
				}
			}
		});
	}

	onMount(async () => {
		const statsService = new StatsService();

		loadPerMonthGraph(statsService);
		loadPerYearGraph(statsService);
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Graphs</title>
</svelte:head>

<section>
	<div class="page-title">Graphs</div>

	<div class="page">
		<h1 class="stat-title">Per month</h1>

		<canvas bind:this={perMonthCanvas} class="canvas" />

		<h1 class="stat-title">Per year</h1>

		<canvas bind:this={perYearCanvas} class="canvas" />

		<a href="/" class="link-button">Back</a>
	</div>
</section>

<style lang="scss">
	.canvas {
		margin-bottom: 60px;
	}
</style>
