import Statistic from '$lib/models/statistic';
import DateUtil from '$lib/utils/dateUtil';
import DbService from './dbService';

export default class StatsService extends DbService {
	public async getSmokesFromThePastWeek() {
		const aWeekAgo = new Date();
		aWeekAgo.setDate(aWeekAgo.getDate() - 7);
		DateUtil.resetHours(aWeekAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aWeekAgo).toArray();

		return new Statistic(smokes);
	}

	public async getSmokesFromThePastMonth() {
		const aMonthAgo = new Date();
		aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);
		DateUtil.resetHours(aMonthAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aMonthAgo).toArray();

		return new Statistic(smokes);
	}
}
