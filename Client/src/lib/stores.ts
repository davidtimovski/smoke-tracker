import { writable } from 'svelte/store';
import TodaysSmokes from './models/todaysSmokes';

export const online = writable(null);
export const synced = writable(false);
export const todaysSmokes = writable(new TodaysSmokes());
