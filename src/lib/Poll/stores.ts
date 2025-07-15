import { writable } from 'svelte/store';
import type { Post } from './interface';

function createPostsStore() {
    const { subscribe, set, update } = writable<Post[]>([]);

    return {
        subscribe,
        set,
        update,
        reset: () => set([])
    };
}

export const posts = createPostsStore();
