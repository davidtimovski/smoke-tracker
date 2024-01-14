import { synced } from '$lib/stores';
import DbService from './dbService';
import type AuthService from './authService';
import SmokesSync from '$lib/models/smokesSync';
import Variables from '$lib/variables';
import type ISmoke from '$lib/models/iSmoke';

export default class SyncService extends DbService {
	private readonly authService: AuthService;

	constructor(authService: AuthService) {
		super();

		this.authService = authService;
	}

	async sync() {
		try {
			if (!this.authService.loggedIn) {
				return;
			}

			const unsyncedChanges = await this.db.unsyncedChanges.toArray();
			if (unsyncedChanges.length > 0) {
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

				const response = await window.fetch(Variables.baseUri + 'smokes/sync', {
					method: 'post',
					body: JSON.stringify(smokesSync),
					headers: new Headers({
						Accept: 'application/json',
						Authorization: 'Bearer ' + this.authService.token,
						'Content-Type': 'application/json',
						'X-Requested-With': 'Fetch'
					})
				});

				if (response.status !== 201) {
					synced.set(false);
					return;
				}

				const ids = unsyncedChanges.map((x) => x.id);
				await this.db.unsyncedChanges.bulkDelete(ids);
			}

			let earliestLocalSmokeId = '00000000-0000-0000-0000-000000000000';
			const ordered = await this.db.smokes.toCollection().sortBy('date');
			if (ordered.length > 0) {
				earliestLocalSmokeId = ordered[0].id;
			}

			const serverSmokesBefore = await window.fetch(Variables.baseUri + `smokes/before/${earliestLocalSmokeId}`, {
				headers: new Headers({
					Accept: 'application/json',
					Authorization: 'Bearer ' + this.authService.token,
					'X-Requested-With': 'Fetch'
				})
			});

			if (serverSmokesBefore.status !== 200) {
				synced.set(false);
				return;
			}

			const smokesBefore: Array<ISmoke> = await serverSmokesBefore.json();
			if (smokesBefore.length > 0) {
				smokesBefore.forEach((x) => {
					x.date = new Date(x.date);
				});
				await this.db.smokes.bulkPut(smokesBefore);
			}

			synced.set(true);
		} catch (e) {
			window.alert(`An error occuring during syncing: ${e}`);
		}
	}

	async check() {
		const unsyncedChangesCount = await this.db.unsyncedChanges.count();
		synced.set(unsyncedChangesCount === 0);
	}

	async addUnsyncedChange(id: string, changeType: number) {
		await this.db.unsyncedChanges.add({ id: id, entityType: 0, changeType: changeType }, id);
	}
}
