import Statistic from '$lib/models/statistic';
import Database from './database';

export default class StatsService {
	private db: Database;

	constructor() {
		this.db = new Database();
		this.db.open();
	}

	public async getSmokesFromThePastWeek() {
		const aWeekAgo = new Date();
		aWeekAgo.setDate(aWeekAgo.getDate() - 7);
		aWeekAgo.setHours(0, 0, 0, 0);

		const smokes = await this.db.smokes.filter((x) => x.date > aWeekAgo).toArray();

		return new Statistic(smokes);
	}

	public async getSmokesFromThePastMonth() {
		const aMonthAgo = new Date();
		aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);
		aMonthAgo.setHours(0, 0, 0, 0);

		const smokes = await this.db.smokes.filter((x) => x.date > aMonthAgo).toArray();

		return new Statistic(smokes);
	}
}
