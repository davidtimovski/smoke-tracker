<script context="module">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import AuthService from '$lib/services/authService';

	let username = '';
	let password = '';

	let offline = true;
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

		if (!username) {
			invalidLoginMessage = 'Username is required.';
			return;
		}
		if (!password) {
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
	<title>Login</title>
</svelte:head>

<section>
	{#if invalidLoginMessage}
		<div in:slide class="invalid-login-message">{invalidLoginMessage}</div>
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
			<input type="submit" value="Login" disabled={offline} />
		</div>
	</form>
</section>

<style lang="scss">
	.invalid-login-message {
		background: #fdd;
		border-radius: 5px;
		padding: 15px;
		margin-top: 10%;
		text-align: center;
		font-size: 16px;
	}

	.login-form {
		margin-top: 25%;
	}

	label {
		display: block;
		margin-bottom: 5px;
	}

	.form-control {
		margin-bottom: 15px;

		input[type='text'],
		input[type='password'] {
			width: 100%;
			border: 1px solid #888;
			border-radius: 5px;
			outline: none;
			padding: 3px 8px;
		}

		&.submit {
			margin-top: 25px;
			text-align: right;
		}
	}

	input[type='submit'] {
		background: #00d1b2;
		border: 1px solid #00d1b2;
		border-radius: 5px;
		outline: none;
		padding: 6px 15px;
		color: #fff;

		&:disabled {
			opacity: 0.5;
		}
	}
</style>
