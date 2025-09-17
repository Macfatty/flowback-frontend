// Store for error hadling in Svelte
import { writable } from 'svelte/store';

export const ErrorHandlerStore = writable({
    message: "", success: false
});