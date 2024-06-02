import SumByType from '$lib/models/sumByType';
import SmokesOnDate from '$lib/models/smokesOnDate';
import SmokesPerYear from '$lib/models/smokesPerYear';
import DateUtil from '$lib/utils/dateUtil';
import DbService from './dbService';

export default class StatsService extends DbService {
	async getSmokesFromThePastWeek() {
		const aWeekAgo = new Date();
		aWeekAgo.setDate(aWeekAgo.getDate() - 7);
		DateUtil.resetHours(aWeekAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aWeekAgo).toArray();

		return new SumByType(smokes);
	}

	async getSmokesFromThePastMonth() {
		const aMonthAgo = new Date();
		aMonthAgo.setMonth(aMonthAgo.getMonth() - 1);
		DateUtil.resetHours(aMonthAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aMonthAgo).toArray();

		return new SumByType(smokes);
	}

	async getSmokesFromThePastYear() {
		const aYearAgo = new Date();
		aYearAgo.setFullYear(aYearAgo.getFullYear() - 1);
		DateUtil.resetHours(aYearAgo);

		const smokes = await this.db.smokes.filter((x) => x.date > aYearAgo).toArray();

		return new SumByType(smokes);
	}

	async smokesPerDayFromThePastWeek() {
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

	async smokesPerMonthFromThePastYear() {
		const now = new Date();
		const aYearAgo = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1, 0, 0, 0, 0);

		const smokes = await this.db.smokes.filter((x) => x.date > aYearAgo).toArray();

		const result = new Array<number>();
		for (let i = 0; i < 12; i++) {
			result[i] = smokes.filter((x) => DateUtil.monthsAreEqual(x.date, aYearAgo)).length;

			aYearAgo.setMonth(aYearAgo.getMonth() + 1);
		}

		return result;
	}

	async smokesPerYear() {
		const now = new Date();
		const smokes = await this.db.smokes.toCollection().sortBy('date');

		const startingYear = smokes[0].date.getFullYear();
		const currentYear = now.getFullYear();

		const result = new Array<SmokesPerYear>();
		for (let year = startingYear; year <= currentYear; year++) {
			const smokesInYear = smokes.filter((x) => x.date.getFullYear() === year).length;
			result.push(new SmokesPerYear(year, smokesInYear));
		}

		return result;
	}
}
