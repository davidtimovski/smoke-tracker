import { synced } from '$lib/stores';
import Database from './database';
import { v4 as uuidv4 } from 'uuid';
import type AuthService from './authService';
import type SyncService from './syncService';

export default class SmokesService {
	private readonly baseUri = 'http://localhost:5100/';
	private db: Database;
	private readonly authService: AuthService;
	private readonly syncService: SyncService;

	constructor(authService: AuthService, syncService: SyncService) {
		this.db = new Database();
		this.db.open();
		this.authService = authService;
		this.syncService = syncService;
	}

	public async getTodaysSmokes() {
		return await this.db.smokes.filter((x) => this.dateIsToday(x.date)).toArray();
	}

	public async createSmoke(type: number) {
		synced.set(false);

		const smoke = {
			id: uuidv4(),
			type: type,
			date: new Date()
		};

		await this.db.smokes.add(smoke);

		if (!navigator.onLine || !this.authService.loggedIn) {
			await this.syncService.addUnsyncedChange(smoke.id, 0);
			return;
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

		if (response.status !== 201) {
			await this.syncService.addUnsyncedChange(smoke.id, 0);
			return;
		}

		synced.set(true);
	}

	public async undoLastCreate() {
		const count = await this.db.smokes.count();
		if (count === 0) {
			return;
		}

		synced.set(false);

		const lastSmoke = (await this.db.smokes.reverse().sortBy('date'))[0];
		await this.db.smokes.delete(lastSmoke.id);
		await this.db.unsyncedChanges.delete(lastSmoke.id);

		if (!navigator.onLine || !this.authService.loggedIn) {
			await this.syncService.checkSync();
			return;
		}

		const response = await fetch(this.baseUri + `api/smokes?ids=${lastSmoke.id}`, {
			method: 'delete',
			headers: new Headers({
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.authService.token,
				'X-Requested-With': 'Fetch'
			})
		});

		if (response.status !== 204) {
			await this.syncService.addUnsyncedChange(lastSmoke.id, 2);
			return;
		}

		synced.set(true);
	}

	private dateIsToday(date: Date) {
		const today = new Date().setHours(0, 0, 0, 0);
		return date.setHours(0, 0, 0, 0) === today;
	}
}
