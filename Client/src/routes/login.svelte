<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { online } from '../lib/stores';
	import AuthService from '$lib/services/authService';

	let authService: AuthService;

	let username = '';
	let password = '';
	let registrationRedirect = false;
	$: loginButtonDisabled = !authService || $online === false;

	const queryUsername = $page.query.get('u');
	if (queryUsername) {
		username = queryUsername;
		registrationRedirect = true;
	}

	let invalidLoginMessage: string;
	async function login() {
		if (!authService) {
			return;
		}

		loginButtonDisabled = true;
		invalidLoginMessage = null;

		if (username.trim() === '') {
			invalidLoginMessage = 'Username is required.';
			loginButtonDisabled = false;
			return;
		}
		if (password.trim() === '') {
			invalidLoginMessage = 'Password is required.';
			loginButtonDisabled = false;
			return;
		}

		const result = await authService.login(username, password);
		if (result.success) {
			goto('/');
		} else {
			password = '';
			invalidLoginMessage = result.message;
			loginButtonDisabled = false;
		}
	}

	onMount(async () => {
		authService = new AuthService();

		if (authService.loggedIn) {
			await goto('/');
		}
	});
</script>

<svelte:head>
	<title>Smoke Tracker - Login</title>
</svelte:head>

<section>
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
			<a href="/">Back</a>
			<input type="submit" value="Login" disabled={loginButtonDisabled} />
		</div>
	</form>
</section>

<style lang="scss">
	.login-form {
		margin-top: 25%;
	}
</style>
