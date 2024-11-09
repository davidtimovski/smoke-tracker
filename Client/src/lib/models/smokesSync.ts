import type ISmoke from './iSmoke';

export default class SmokesSync {
	public new: ISmoke[] = [];
	public updated: ISmoke[] = [];
	public deleted: string[] = [];
}
