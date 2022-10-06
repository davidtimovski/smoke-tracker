<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	import { online } from '$lib/stores';
	import AuthService from '$lib/services/authService';

	let authService: AuthService;

	let username = '';
	let password = '';
	let registrationRedirect = false;
	$: loginButtonDisabled = !authService || $online === false;
	let loading = false;

	let invalidLoginMessage: string;
	async function login() {
		if (loginButtonDisabled || loading) {
			return;
		}

		loading = true;
		invalidLoginMessage = null;

		if (username.trim() === '') {
			invalidLoginMessage = 'Username is required.';
			loading = false;
			return;
		}
		if (password.trim() === '') {
			invalidLoginMessage = 'Password is required.';
			loading = false;
			return;
		}

		try {
			const result = await authService.login(username, password);
			if (result.success) {
				await goto('/');
			} else {
				password = '';
				invalidLoginMessage = result.message;
				loading = false;
			}
		} catch {
			invalidLoginMessage = 'Something went wrong.';
			loading = false;
		}
	}

	onMount(async () => {
		authService = new AuthService();

		if (authService.loggedIn) {
			await goto('/');
		}

		const urlParams = new URLSearchParams(window.location.search);
		const queryUsername = urlParams.get('u');
		if (queryUsername) {
			username = queryUsername;
			registrationRedirect = true;
		}
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Login</title>
</svelte:head>

<section>
	<div class="page-title">Login</div>

	{#if $online === false}
		<div in:slide class="alert warning">You must be online in order to login.</div>
	{/if}

	{#if registrationRedirect}
		<div in:slide class="alert success">Your registration was completed.<br />You can now log in.</div>
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
			<a href="/" class="link-button">Back</a>
			<button on:click={login} class="button-with-loader" class:disabled={loginButtonDisabled || loading} class:loading>
				Login
				<div class="loader" />
			</button>
		</div>
	</form>

	<div class="register-alert">Don't have an account? <a href="/register">Register.</a></div>
</section>

<style lang="scss">
	.login-form {
		margin-top: 25%;
	}

	.register-alert {
		margin-top: 50px;
		text-align: center;
	}
</style>
