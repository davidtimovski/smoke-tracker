import Dexie from 'dexie';

export default class Database extends Dexie {
	smokes: Dexie.Table<ISmoke, string>;

	constructor() {
		super('Database');

		this.version(1).stores({
			smokes: 'id,type,date'
		});

		this.smokes = this.table('smokes');
	}
}

interface ISmoke {
	id: string;
	type: number;
	date: Date;
}
