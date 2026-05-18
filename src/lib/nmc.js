import { writable } from 'svelte/store';
export const nmcCount = writable(0);
export const paceDown = writable(0); // count of PACE tiers at DOWN status
