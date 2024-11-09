<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	import { online } from '$lib/stores';
	import AuthService from '$lib/services/authService';

	let authService: AuthService | null = $state(null);

	let username = $state('');
	let checkingUsername = $state(false);
	let usernameIsTaken = $state(false);
	let password = $state('');
	let passwordConfirm = $state('');
	let registerButtonDisabled = $derived(!authService || $online === false || username.trim().length < 3 || checkingUsername || usernameIsTaken);
	let loading = $state(false);

	let timer: number;
	const checkUsernameAvailability = () => {
		if (!authService || username.trim().length < 3) {
			return;
		}

		checkingUsername = true;

		window.clearTimeout(timer);
		timer = window.setTimeout(async () => {
			try {
				const available = await authService!.checkIfUsernameAvailable(username);
				usernameIsTaken = !available;
				checkingUsername = false;
			} catch {
				checkingUsername = false;
			}
		}, 800);
	};

	let registrationErrorMessage: string | null = $state(null);
	async function register(event: any) {
		event.preventDefault();

		if (registerButtonDisabled || loading) {
			return;
		}

		loading = true;
		registrationErrorMessage = null;

		const trimmedUsername = username.trim();
		if (trimmedUsername === '') {
			registrationErrorMessage = 'Username is required.';
			loading = false;
			return;
		}
		if (password === '') {
			registrationErrorMessage = 'Password is required.';
			loading = false;
			return;
		}
		if (passwordConfirm === '') {
			registrationErrorMessage = 'Confirm password is required.';
			loading = false;
			return;
		}
		if (password !== passwordConfirm) {
			registrationErrorMessage = 'Passwords must match.';
			loading = false;
			return;
		}

		try {
			const result = await authService!.register(trimmedUsername, password);
			if (result.success) {
				await goto(`/login?u=${trimmedUsername}`);
			} else {
				password = passwordConfirm = '';
				registrationErrorMessage = result.message;
				loading = false;
			}
		} catch {
			registrationErrorMessage = 'Something went wrong.';
			loading = false;
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
	<div class="page-title">Register</div>

	<div class="page">
		{#if $online === false}
			<div in:slide class="alert warning">You must be online in order to register.</div>
		{/if}

		{#if registrationErrorMessage}
			<div in:slide class="validation-alert">{registrationErrorMessage}</div>
		{/if}

		<form onsubmit={register} class="registration-form">
			<div class="form-control">
				<label for="username">Username</label>
				<div class="username-input-wrap">
					<input type="text" id="username" bind:value={username} onkeyup={() => checkUsernameAvailability()} maxlength="25" />
					<span class="availability-loader" class:loading={checkingUsername}><div class="loader"></div></span>
					<span class="availability-indicator">{!checkingUsername && usernameIsTaken ? 'taken' : ''}</span>
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
				<a href="/" class="link-button">Back</a>
				<button onclick={register} class="button-with-loader" class:disabled={registerButtonDisabled || loading} class:loading>
					Register
					<div class="loader"></div>
				</button>
			</div>
		</form>
	</div>
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

		.availability-loader {
			position: absolute;
			top: 0;
			right: 0;
			padding: 4px 13px;

			.loader {
				display: none;

				&:after {
					border-color: #00d1b2 transparent #00d1b2 transparent;
				}
			}

			&.loading .loader {
				display: inline-block;
			}
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
