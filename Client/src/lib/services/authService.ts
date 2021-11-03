import type LoginResult from '$lib/models/loginResult';

export default class AuthService {
	private readonly baseUri = 'http://localhost:5100/';
	private expires: Date;
	public token: string;

	constructor() {
		const expiresItem = window.localStorage.getItem('expires');
		if (expiresItem) {
			const expires = new Date(window.parseInt(expiresItem, 10));
			if (expires > new Date()) {
				this.expires = expires;
				this.token = window.localStorage.getItem('token');
			} else {
				window.localStorage.setItem('token', '');
				window.localStorage.setItem('expires', '');
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
		}

		return result;
	}
}
