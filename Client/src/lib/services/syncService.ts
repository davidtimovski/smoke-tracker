import { synced } from '$lib/stores';
import DbService from './dbService';
import type AuthService from './authService';
import SmokesSync from '$lib/models/smokesSync';
import Variables from '$lib/variables';

export default class SyncService extends DbService {
	private readonly authService: AuthService;

	constructor(authService: AuthService) {
		super();

		this.authService = authService;
	}

	public async sync() {
		const unsyncedChanges = await this.db.unsyncedChanges.toArray();
		if (unsyncedChanges.length === 0) {
			synced.set(true);
			return;
		}

		if (!this.authService.loggedIn) {
			return;
		}

		const smokesSync = new SmokesSync();
		smokesSync.deleted = unsyncedChanges.filter((x) => x.changeType === 2).map((x) => x.id);

		const newIds = unsyncedChanges.filter((x) => x.changeType === 0).map((x) => x.id);
		const updatedIds = unsyncedChanges.filter((x) => x.changeType === 1).map((x) => x.id);

		const newSmokesPromise = this.db.smokes
			.where('id')
			.anyOfIgnoreCase(newIds)
			.toArray()
			.then((newSmokes) => {
				smokesSync.new = newSmokes;
			});
		const updatedSmokesPromise = this.db.smokes
			.where('id')
			.anyOfIgnoreCase(updatedIds)
			.toArray()
			.then((updatedSmokes) => {
				smokesSync.updated = updatedSmokes;
			});

		await Promise.all([newSmokesPromise, updatedSmokesPromise]);

		const response = await fetch(Variables.baseUri + 'smokes/sync', {
			method: 'post',
			body: JSON.stringify(smokesSync),
			headers: new Headers({
				Accept: 'application/json',
				Authorization: 'Bearer ' + this.authService.token,
				'X-Requested-With': 'Fetch'
			})
		});

		if (response.status !== 201) {
			synced.set(false);
			return;
		}

		const ids = unsyncedChanges.map((x) => x.id);
		await this.db.unsyncedChanges.bulkDelete(ids);

		synced.set(true);
	}

	public async check() {
		const unsyncedChangesCount = await this.db.unsyncedChanges.count();
		synced.set(unsyncedChangesCount === 0);
	}

	public async addUnsyncedChange(id: string, changeType: number) {
		await this.db.unsyncedChanges.add({ id: id, entityType: 0, changeType: changeType }, id);
	}
}