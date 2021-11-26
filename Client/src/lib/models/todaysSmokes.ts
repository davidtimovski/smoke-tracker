import type ISmoke from './iSmoke';

export default class TodaysSmokes {
	public initialized = false;
	public cigars: number;
	public vapes: number;
	public heets: number;

	public initialize(smokes: ISmoke[]) {
		this.cigars = smokes.filter((x) => x.type === 0).length;
		this.vapes = smokes.filter((x) => x.type === 1).length;
		this.heets = smokes.filter((x) => x.type === 2).length;
		this.initialized = true;
	}

	get sum() {
		return this.cigars + this.vapes + this.heets;
	}
}
