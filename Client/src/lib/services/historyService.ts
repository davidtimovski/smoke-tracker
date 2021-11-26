import DbService from './dbService';
import SmokesOnDate from '$lib/models/smokesOnDate';
import DateUtil from '$lib/utils/dateUtil';

export default class HistoryService extends DbService {
	public async smokesPerDayFromThePastWeek() {
		const aWeekAgo = new Date();
		aWeekAgo.setDate(aWeekAgo.getDate() - 7);
		DateUtil.resetHours(aWeekAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aWeekAgo).toArray();

		const result = new Array<SmokesOnDate>(7);
		const date = new Date();
		for (let i = 0; i < 7; i++) {
			const smokesOnDate = smokes.filter((x) => DateUtil.datesAreEqual(x.date, date));

			result[i] = new SmokesOnDate(new Date(date), smokesOnDate);

			date.setDate(date.getDate() - 1);
		}

		return result;
	}
}
