import { writable, type Writable } from 'svelte/store';
import TodaysSmokes from './models/todaysSmokes';

export const online: Writable<boolean | null> = writable(null);
export const synced = writable(false);
export const todaysSmokes = writable(new TodaysSmokes());
export const statsDrawerIsOpen = writable(false);
