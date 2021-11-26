import DateUtil from '$lib/utils/dateUtil';
import type ISmoke from './iSmoke';

export default class SmokesOnDate {
	public date: string;
	public isWeekend: boolean;
	public cigars: number;
	public vapes: number;
	public heets: number;
	public label: string;

	constructor(date: Date, smokes: ISmoke[]) {
		this.date = DateUtil.formatWeekday(date);
		this.isWeekend = DateUtil.isWeekend(date);

		this.cigars = smokes.filter((x) => x.type === 0).length;
		this.vapes = smokes.filter((x) => x.type === 1).length;
		this.heets = smokes.filter((x) => x.type === 2).length;

		this.label = `${this.cigars} cigars, ${this.vapes} vapes, ${this.heets} heets`;
	}
}
