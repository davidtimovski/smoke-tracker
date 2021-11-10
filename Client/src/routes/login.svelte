<script context="module">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import AuthService from '$lib/services/authService';

	let username = '';
	let password = '';

	let offline: boolean;
	let authService: AuthService;
	onMount(async () => {
		authService = new AuthService();

		if (authService.loggedIn) {
			await goto('/');
		} else {
			offline = !navigator.onLine;
		}
	});

	let invalidLoginMessage: string;
	async function login() {
		if (!authService) {
			return;
		}

		invalidLoginMessage = null;

		if (username.trim() === '') {
			invalidLoginMessage = 'Username is required.';
			return;
		}
		if (password.trim() === '') {
			invalidLoginMessage = 'Password is required.';
			return;
		}

		const result = await authService.login(username, password);
		if (result.success) {
			goto('/');
		} else {
			password = '';
			invalidLoginMessage = result.message;
		}
	}
</script>

<svelte:head>
	<title>Smoke Tracker - Login</title>
</svelte:head>

<section>
	{#if offline === true}
		<div in:slide class="warning-alert">You must be online in order to login.</div>
	{/if}

	{#if invalidLoginMessage}
		<div in:slide class="validation-alert">{invalidLoginMessage}</div>
	{/if}

	<form on:submit|preventDefault={login} class="login-form">
		<div class="form-control">
			<label for="username">Username</label>
			<input type="text" id="username" bind:value={username} maxlength="25" />
		</div>

		<div class="form-control">
			<label for="password">Password</label>
			<input type="password" id="password" bind:value={password} />
		</div>

		<div class="form-control submit">
			<input type="submit" value="Login" disabled={!authService || offline === true} />
		</div>
	</form>
</section>

<style lang="scss">
	.login-form {
		margin-top: 25%;
	}
</style>
