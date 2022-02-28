import { synced } from '$lib/stores';
import { v4 as uuid } from '@lukeed/uuid';
import DbService from './dbService';
import { get } from 'svelte/store';
import { todaysSmokes } from '../../lib/stores';
import type AuthService from './authService';
import type SyncService from './syncService';
import Variables from '$lib/variables';
import DateUtil from '$lib/utils/dateUtil';

export default class SmokesService extends DbService {
	private readonly authService: AuthService;
	private readonly syncService: SyncService;

	constructor(authService: AuthService, syncService: SyncService) {
		super();

		this.authService = authService;
		this.syncService = syncService;
	}

	public async getTodaysSmokes() {
		const today = new Date();
		return await this.db.smokes.filter((x) => DateUtil.datesAreEqual(x.date, today)).toArray();
	}

	public async loadTodays() {
		const todaysSmokesValue = get(todaysSmokes);
		if (todaysSmokesValue.initialized) {
			return;
		}

		this.getTodaysSmokes().then((smokes) => {
			todaysSmokes.update((x) => {
				x.initialize(smokes);
				return x;
			});
		});
	}

	public async createSmoke(type: number) {
		synced.set(false);

		const smoke = {
			id: uuid(),
			type: type,
			date: new Date()
		};

		await this.db.smokes.add(smoke);

		if (!navigator.onLine || !this.authService.loggedIn) {
			await this.syncService.addUnsyncedChange(smoke.id, 0);
			return;
		}

		const response = await fetch(Variables.baseUri + 'smokes', {
			method: 'post',
			body: JSON.stringify(smoke),
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

		await this.syncService.sync();
	}

	public async undoLastCreate() {
		const count = await this.db.smokes.count();
		if (count === 0) {
			return;
		}

		synced.set(false);

		const today = new Date();
		const lastSmokeToday = (
			await this.db.smokes.filter((x) => DateUtil.datesAreEqual(x.date, today)).sortBy('date')
		).reverse()[0];

		await this.db.smokes.delete(lastSmokeToday.id);
		await this.db.unsyncedChanges.delete(lastSmokeToday.id);

		todaysSmokes.update((x) => {
			switch (lastSmokeToday.type) {
				case 0:
					x.cigars--;
					break;
				case 1:
					x.vapes--;
					break;
				case 2:
					x.heets--;
					break;
			}
			return x;
		});

		if (!navigator.onLine || !this.authService.loggedIn) {
			await this.syncService.check();
			return;
		}

		const response = await fetch(Variables.baseUri + `smokes?id=${lastSmokeToday.id}`, {
			method: 'delete',
			headers: new Headers({
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.authService.token,
				'X-Requested-With': 'Fetch'
			})
		});

		if (response.status !== 204) {
			await this.syncService.addUnsyncedChange(lastSmokeToday.id, 2);
			return;
		}

		await this.syncService.sync();
	}
}
