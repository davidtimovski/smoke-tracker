import { writable } from 'svelte/store';

export const online = writable(null);
export const synced = writable(false);
