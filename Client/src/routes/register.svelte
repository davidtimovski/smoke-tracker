<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { online } from '../lib/stores';
	import AuthService from '$lib/services/authService';

	let username = '';
	let checkingUsername = false;
	let usernameIsTaken = false;
	let password = '';
	let passwordConfirm = '';

	let authService: AuthService;

	let timer: number;
	const checkUsernameAvailability = () => {
		if (!authService || username.trim().length < 3) {
			return;
		}

		checkingUsername = true;

		window.clearTimeout(timer);
		timer = window.setTimeout(() => {
			authService.checkIfUsernameAvailable(username).then((available) => {
				usernameIsTaken = !available;
				checkingUsername = false;
			});
		}, 800);
	};

	let registrationErrorMessage: string;
	async function register() {
		if (!authService) {
			return;
		}

		registrationErrorMessage = null;

		const trimmedUsername = username.trim();
		if (trimmedUsername === '') {
			registrationErrorMessage = 'Username is required.';
			return;
		}
		if (password === '') {
			registrationErrorMessage = 'Password is required.';
			return;
		}
		if (passwordConfirm === '') {
			registrationErrorMessage = 'Confirm password is required.';
			return;
		}
		if (password !== passwordConfirm) {
			registrationErrorMessage = 'Passwords must match.';
			return;
		}

		const result = await authService.register(trimmedUsername, password);
		if (result.success) {
			goto(`/login?u=${trimmedUsername}`);
		} else {
			password = '';
			registrationErrorMessage = result.message;
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
	<title>Smoke Tracker - Register</title>
</svelte:head>

<section>
	{#if $online === false}
		<div in:slide class="alert warning">You must be online in order to register.</div>
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

		<div class="form-control">
			<label for="password-confirm">Confirm password</label>
			<input type="password" id="password-confirm" bind:value={passwordConfirm} />
		</div>

		<div class="form-control submit">
			<a href="/">Back</a>
			<input
				type="submit"
				value="Register"
				disabled={!authService ||
					$online === false ||
					username.trim().length < 3 ||
					checkingUsername ||
					usernameIsTaken}
			/>
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
