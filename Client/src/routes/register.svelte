<script context="module">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import AuthService from '$lib/services/authService';

	let username = '';
	let usernameIsTaken = false;
	let password = '';

	let authService: AuthService;

	let timer: number;
	const checkUsernameAvailability = () => {
		if (!authService) {
			return;
		}

		clearTimeout(timer);
		timer = window.setTimeout(() => {
			authService.checkIfUsernameAvailable(username).then((available) => {
				usernameIsTaken = !available;
			});
		}, 800);
	};

	let offline: boolean;
	onMount(async () => {
		authService = new AuthService();

		if (authService.loggedIn) {
			await goto('/');
		} else {
			offline = !navigator.onLine;
		}
	});

	let registrationErrorMessage: string;
	async function register() {
		if (!authService) {
			return;
		}

		registrationErrorMessage = null;

		if (username.trim() === '') {
			registrationErrorMessage = 'Username is required.';
			return;
		}
		if (password.trim() === '') {
			registrationErrorMessage = 'Password is required.';
			return;
		}

		const result = await authService.register(username, password);
		if (result.success) {
			goto('login');
		} else {
			password = '';
			registrationErrorMessage = result.message;
		}
	}
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<section>
	{#if offline === true}
		<div in:slide class="warning-alert">You must be online in order to register.</div>
	{/if}

	{#if registrationErrorMessage}
		<div in:slide class="validation-alert">{registrationErrorMessage}</div>
	{/if}

	<form on:submit|preventDefault={register} class="registration-form">
		<div class="form-control">
			<label for="username">Username</label>
			<div class="username-input-wrap">
				<input
					type="text"
					id="username"
					bind:value={username}
					on:keyup={() => checkUsernameAvailability()}
					maxlength="25"
				/>
				<span class="availability-indicator">{usernameIsTaken ? 'taken' : ''}</span>
			</div>
		</div>

		<div class="form-control">
			<label for="password">Password</label>
			<input type="password" id="password" bind:value={password} />
		</div>

		<div class="form-control submit">
			<input type="submit" value="Register" disabled={!authService || offline === true || usernameIsTaken} />
		</div>
	</form>
</section>

<style lang="scss">
	.registration-form {
		margin-top: 25%;
	}

	.username-input-wrap {
		position: relative;

		input {
			padding-right: 75px;
		}

		.availability-indicator {
			position: absolute;
			top: 0;
			right: 0;
			padding: 5px 10px;
			color: #f14668;
		}
	}
</style>
