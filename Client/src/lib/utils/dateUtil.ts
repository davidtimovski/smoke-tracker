export default class DateUtil {
	private static readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	static resetHours(date: Date) {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	static datesAreEqual(date1: Date, date2: Date) {
		return this.resetHours(date1).getTime() === this.resetHours(date2).getTime();
	}

	static formatMMDD(date: Date) {
		const month = date.toLocaleString('default', { month: 'short' });
		return `${month} ${date.getDate()}`;
	}

	static formatWeekday(date: Date) {
		return this.weekdays[date.getDay()];
	}

	static isWeekend(date: Date) {
		const weekday = date.getDay();
		return weekday === 0 || weekday === 6;
	}
}
