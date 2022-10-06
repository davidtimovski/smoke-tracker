export default class DateUtil {
	static resetHours(date: Date) {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	static datesAreEqual(date1: Date, date2: Date) {
		return this.resetHours(date1).getTime() === this.resetHours(date2).getTime();
	}

	static monthsAreEqual(date1: Date, date2: Date) {
		return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
	}

	static formatMMDD(date: Date) {
		const month = date.toLocaleString('en-US', { month: 'short' });
		return `${month} ${date.getDate()}`;
	}

	static formatWeekday(date: Date) {
		return date.toLocaleDateString('en-US', {
			weekday: 'short'
		});
	}

	static isWeekend(date: Date) {
		const weekday = date.getDay();
		return weekday === 0 || weekday === 6;
	}
}
