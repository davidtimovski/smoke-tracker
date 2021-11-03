import { goto } from '$app/navigation';
import Database from './database';
import { v4 as uuidv4 } from 'uuid';
import type AuthService from './authService';

export default class SmokesService {
	private readonly baseUri = 'http://localhost:5100/';
	private db: Database;
	private readonly authService: AuthService;

	constructor(authService: AuthService) {
		this.db = new Database();
		this.db.open();
		this.authService = authService;
	}

	public async getTodaysSmokes() {
		return await this.db.smokes.filter((x) => this.dateIsToday(x.date)).toArray();
	}

	public async createSmoke(type: number) {
		const smoke = {
			id: uuidv4(),
			type: type,
			date: new Date()
		};

		await this.db.smokes.add(smoke);

		if (!navigator.onLine) {
			return false;
		}

		if (!this.authService.loggedIn) {
			goto('login');
			return false;
		}

		const response = await fetch(this.baseUri + 'api/smokes', {
			method: 'post',
			body: JSON.stringify([smoke]),
			headers: new Headers({
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.authService.token,
				'X-Requested-With': 'Fetch'
			})
		});
		return response.status === 201;
	}

	public async undoLastCreate() {
		const count = await this.db.smokes.count();
		if (count == 0) {
			return;
		}

		const lastSmoke = (await this.db.smokes.reverse().sortBy('date'))[0];
		await this.db.smokes.delete(lastSmoke.id);

		if (!navigator.onLine) {
			return false;
		}

		if (!this.authService.loggedIn) {
			goto('login');
			return false;
		}

		const response = await fetch(this.baseUri + `api/smokes?ids=${lastSmoke.id}`, {
			method: 'delete',
			headers: new Headers({
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.authService.token,
				'X-Requested-With': 'Fetch'
			})
		});
		return response.status === 204;
	}

	private dateIsToday(date: Date) {
		const today = new Date().setHours(0, 0, 0, 0);
		return date.setHours(0, 0, 0, 0) === today;
	}
}
