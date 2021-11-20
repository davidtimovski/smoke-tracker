import type ISmoke from './iSmoke';

export default class Statistic {
	public cigars: number;
	public vapes: number;
	public heets: number;

	constructor(smokes: ISmoke[]) {
		this.cigars = smokes.filter((x) => x.type === 0).length;
		this.vapes = smokes.filter((x) => x.type === 1).length;
		this.heets = smokes.filter((x) => x.type === 2).length;
	}

	get hasData() {
		return this.cigars + this.vapes + this.heets > 0;
	}
}
