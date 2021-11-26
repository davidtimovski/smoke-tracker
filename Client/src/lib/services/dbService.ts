import Database from './database';

export default class DbService {
	protected db: Database;

	constructor() {
		this.db = new Database();
		this.db.open();
	}
}
