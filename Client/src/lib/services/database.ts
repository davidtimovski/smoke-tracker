import type ISmoke from '$lib/models/iSmoke';
import type IUnsyncedChange from '$lib/models/iUnsyncedChange';
import Dexie from 'dexie';

export default class Database extends Dexie {
	smokes: Dexie.Table<ISmoke, string>;
	unsyncedChanges: Dexie.Table<IUnsyncedChange, string>;

	constructor() {
		super('Database');

		this.version(1).stores({
			smokes: 'id,type,date',
			unsyncedChanges: 'id,entityType,changeType'
		});

		this.smokes = this.table('smokes');
		this.unsyncedChanges = this.table('unsyncedChanges');
	}
}
