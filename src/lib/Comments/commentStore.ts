import type { Comment, proposal } from '$lib/Poll/interface';
import { writable } from 'svelte/store';
import { getComments } from './functions';

function createCommentStore() {
    const { subscribe, set, update } = writable<{
        allComments: Comment[];
        filteredComments: Comment[];
        filterByProposal: proposal | null;
    }>({
        allComments: [],
        filteredComments: [],
        filterByProposal: null
    });

    return {
        subscribe,
        setAll: (comments: Comment[]) =>
            update(store => ({
                ...store,
                allComments: comments,
                filteredComments: store.filterByProposal
                    ? comments?.filter(comment =>
                        comment.message?.includes(`#${store.filterByProposal?.title.replaceAll(' ', '-')}`)
                    )
                    : comments
            })),
        add: (comment: Comment) =>
            update(store => ({
                ...store,
                allComments: insertFilteredComments(store.allComments, comment),
                filteredComments: store.filterByProposal && comment.message?.includes(`#${store.filterByProposal.title.replaceAll(' ', '-')}`)
                    ? insertFilteredComments(store.filteredComments, comment)
                    : insertFilteredComments(store.allComments, comment)
            })),
        filterByProposal: (proposal: proposal | null) =>
            update(store => ({
                ...store,
                filterByProposal: proposal || null,
                filteredComments: proposal
                    ? store.allComments.filter(comment =>
                        comment.message?.includes(`#${proposal.title.replaceAll(' ', '-')}`))
                    : store.allComments
            })),
        filterByProposals: (proposals: proposal[] | null, mode: 'and' | 'or' = 'or') =>
            update(store => ({
                ...store,
                filterProposals: proposals,
                filterMode: mode,
                filteredComments: applyFilters(store.allComments, proposals, mode)
            })),
        filterByProposalsIncludingParents: (proposals: proposal[] | null, mode: 'and' | 'or' = 'or') =>
            update(store => ({
                ...store,
                filterProposals: proposals,
                filterMode: mode,
                filteredComments: applyFilters(store.allComments, proposals, mode)
            })),

        getAll: () => {
            let allComments: Comment[] = [];
            update(store => {
                allComments = store.allComments;
                return store;
            });
            return allComments;
        },
        clear: () =>
            set({
                allComments: [],
                filteredComments: [],
                filterByProposal: null
            })
    };
}

function insertFilteredComments(comments: Comment[], newComment: Comment) {
    // Check if the comment already exists
    const existingComment = comments?.find(comment => comment.id === newComment.id);
    if (existingComment) {
        console.warn(`Comment with ID ${newComment.id} already exists. Skipping insertion.`);
        return comments; // Return the original array without changes
    }

    if (newComment.parent_id) {
        // Find the parent comment
        const parentIndex = comments?.findIndex(comment => comment.id === newComment.parent_id);

        if (parentIndex !== -1) {
            // Set the reply_depth to one more than the parent's reply_depth
            newComment.reply_depth = comments[parentIndex].reply_depth + 1;

            // Insert the new comment directly below the parent
            comments?.splice(parentIndex + 1, 0, newComment);
        }
    } else {
        // If it's a top-level comment, set reply_depth to 0 and add it to the beginning
        newComment.reply_depth = 0;
        comments?.unshift(newComment);
    }

    return comments;
}

function applyFilters(
    comments: Comment[],
    proposals: proposal[] | null,
    mode: 'and' | 'or'
): Comment[] {
    if (!proposals || proposals.length === 0) return comments;

    // Whenever a comment contains a proposal tag (such as #proposal-name), then only pick those
    const tags = proposals.map(p => `#${p.title.replaceAll(' ', '-')}`);

    return comments.filter(comment => {
        const msg = comment.message ?? '';
        return tags.some(tag => msg.includes(tag));
        // if (mode === 'or') {
        // } else {
        //     return tags.every(tag => msg.includes(tag));
        // }
    });
}

const newFilter = async (comments: Comment[],
    proposals: proposal[],
) => {
    if (proposals.length === 0) return comments;

    const tags = proposals.map(p => `#${p.title.replaceAll(' ', '-')}`);

    //Two arrays: One for yes, oien for maybe. The no pile will just be everything minus the yes pill as the maybe pile should be 0 at the end
    const yesPile: Comment[] = [];
    const maybePile: Comment[] = [];
    // const noPile: Comment[] = [];


    await comments.forEach(async comment => {
        const msg = comment.message ?? '';
        const hasTag = tags.some(tag => msg.includes(tag));
        if (hasTag) {
            yesPile.push(comment);
            const { comments } = await getComments(comment.parent_id, 'poll')
            yesPile.push(comments[0]);
            const parent = comments[0]
            {

                const { comments } = await getComments(parent.parent_id, 'poll')
            }
        }

    });


}

export const commentsStore = createCommentStore();