<script lang="ts">
	import { onMount } from 'svelte';
	import { LineController, LineElement, CategoryScale, Chart, LinearScale, PointElement } from 'chart.js';
	import StatsService from '$lib/services/statsService';

	let canvas: HTMLCanvasElement;
	let canvasCtx: CanvasRenderingContext2D | null = null;
	let chart: Chart;

	Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement);
	Chart.defaults.font.family = '"Poppins", sans-serif';

	const labels = new Array<string>();
	const now = new Date();
	const current = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1, 0, 0, 0, 0);
	for (let i = 0; i < 12; i++) {
		const month = current.toLocaleString('en', { month: 'short' });
		labels.push(month);
		current.setMonth(current.getMonth() + 1);
	}

	onMount(async () => {
		const statsService = new StatsService();
		const data = await statsService.smokesPerMonthFromThePastYear();

		canvasCtx = canvas.getContext('2d');
		chart = new Chart(<CanvasRenderingContext2D>canvasCtx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						data: data,
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
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Per month</title>
</svelte:head>

<section>
	<div class="page-title">Per month</div>

	<div class="page">
		<canvas bind:this={canvas} class="canvas" />

		<a href="/" class="link-button">Back</a>
	</div>
</section>

<style lang="scss">
	.canvas {
		margin-bottom: 60px;
	}
</style>
