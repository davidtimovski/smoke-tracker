import type LoginResult from '$lib/models/loginResult';
import type RegisterResult from '$lib/models/registerResult';

export default class AuthService {
	private readonly baseUri = 'http://localhost:5100/';
	private expires: Date = null;
	private loginCheckInterval: number;
	public token: string = null;
	public hasAccount: boolean;

	constructor() {
		const tokenExpires = window.localStorage.getItem('expires');
		this.hasAccount = tokenExpires !== null;

		if (tokenExpires) {
			const expires = new Date(window.parseInt(tokenExpires, 10));
			if (expires > new Date()) {
				this.expires = expires;
				this.token = window.localStorage.getItem('token');

				this.setupLoginCheck();
			} else {
				this.logout();
			}
		}
	}

	public get loggedIn() {
		if (!this.token) {
			return false;
		}

		return this.expires > new Date();
	}

	public async login(username: string, password: string) {
		const response = await fetch(this.baseUri + 'api/token', {
			method: 'post',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: new Headers({
				Accept: 'application/json',
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

			this.setupLoginCheck();
		}

		return result;
	}

	public async checkIfUsernameAvailable(username: string) {
		if (username.trim() === '') {
			return true;
		}

		const response = await fetch(this.baseUri + `api/username-available/${username}`, {
			headers: new Headers({
				Accept: 'application/json',
				'X-Requested-With': 'Fetch'
			})
		});

		return <boolean>await response.json();
	}

	public async register(username: string, password: string) {
		const response = await fetch(this.baseUri + 'api/register', {
			method: 'post',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: new Headers({
				Accept: 'application/json',
				'X-Requested-With': 'Fetch'
			})
		});

		return <RegisterResult>await response.json();
	}

	public logout() {
		window.localStorage.setItem('token', '');
		window.localStorage.setItem('expires', '');

		this.token = this.expires = null;

		window.clearInterval(this.loginCheckInterval);
		this.loginCheckInterval = null;
	}

	private setupLoginCheck() {
		this.loginCheckInterval = window.setInterval(() => {
			if (this.expires < new Date()) {
				this.logout();
			}
		}, 5000);
	}
}
