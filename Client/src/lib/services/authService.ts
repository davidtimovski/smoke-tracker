import type LoginResult from '$lib/models/loginResult';
import type RegisterResult from '$lib/models/registerResult';
import Variables from '$lib/variables';

export default class AuthService {
	private expires: Date | null = null;
	private loginCheckInterval: number | undefined;
	token: string | null = null;
	username: string | null = null;
	hasAccount: boolean;

	constructor() {
		const tokenExpires = window.localStorage.getItem('expires');
		this.hasAccount = tokenExpires !== null;

		if (tokenExpires) {
			const expires = new Date(window.parseInt(tokenExpires, 10));
			if (expires > new Date()) {
				this.expires = expires;
				this.token = window.localStorage.getItem('token');
				this.username = window.localStorage.getItem('username');

				this.setupLoginCheck();
			} else {
				this.logout();
			}
		}
	}

	get loggedIn() {
		if (!this.token) {
			return false;
		}

		return !this.expires || this.expires > new Date();
	}

	async login(username: string, password: string) {
		const response = await window.fetch(Variables.baseUri + 'token', {
			method: 'post',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Requested-With': 'Fetch'
			})
		});

		const result = <LoginResult>await response.json();
		if (result.success) {
			const now = new Date();
			const expires = now.setMinutes(now.getMinutes() + result.expiresIn);

			this.token = result.token;
			this.expires = new Date(expires);

			window.localStorage.setItem('token', result.token);
			window.localStorage.setItem('expires', expires.toString());
			window.localStorage.setItem('username', result.username);

			this.setupLoginCheck();
		}

		return result;
	}

	async checkIfUsernameAvailable(username: string) {
		if (username.trim() === '') {
			return true;
		}

		const response = await window.fetch(Variables.baseUri + `username-available/${username}`, {
			headers: new Headers({
				Accept: 'application/json',
				'X-Requested-With': 'Fetch'
			})
		});

		return <boolean>await response.json();
	}

	async register(username: string, password: string) {
		const response = await window.fetch(Variables.baseUri + 'register', {
			method: 'post',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: new Headers({
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Requested-With': 'Fetch'
			})
		});

		return <RegisterResult>await response.json();
	}

	logout() {
		window.localStorage.setItem('token', '');
		window.localStorage.setItem('expires', '');
		window.localStorage.setItem('username', '');

		this.expires = this.token = this.username = null;

		window.clearInterval(this.loginCheckInterval);
		this.loginCheckInterval = undefined;
	}

	private setupLoginCheck() {
		this.loginCheckInterval = window.setInterval(() => {
			if (!this.expires || this.expires < new Date()) {
				this.logout();
			}
		}, 5000);
	}
}
