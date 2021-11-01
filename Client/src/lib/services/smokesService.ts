import Database from './database';
import { v4 as uuidv4 } from 'uuid';

export default class SmokesService {
	private readonly baseUri = 'http://localhost:5100';
	private db: Database;

	constructor() {
		this.db = new Database();
		this.db.open();
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

		if (navigator.onLine) {
			await fetch(this.baseUri + '/api/smokes', {
				method: 'post',
				body: JSON.stringify([smoke])
			});
			return true;
		}

		return false;
	}

	public async undoLastCreate() {
		const count = await this.db.smokes.count();
		if (count == 0) {
			return;
		}

		const lastSmoke = (await this.db.smokes.reverse().sortBy('date'))[0];
		this.db.smokes.delete(lastSmoke.id);

		if (navigator.onLine) {
			await fetch(this.baseUri + `/api/smokes?ids=${lastSmoke.id}`, {
				method: 'delete'
			});
			return true;
		}

		return false;
	}

	private dateIsToday(date: Date) {
		const today = new Date().setHours(0, 0, 0, 0);
		return date.setHours(0, 0, 0, 0) === today;
	}
}
