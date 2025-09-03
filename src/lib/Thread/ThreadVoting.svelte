<script lang="ts">
	import { fetchRequest } from "$lib/FetchRequest";
	import ErrorHandler from "$lib/Generic/ErrorHandler.svelte";
import type { Thread } from "$lib/Group/interface";
	import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";

    export let thread:Thread

    let errorHandler:any;
    	//Launches whenever the user clicks upvote or downvote on a thread
	const threadVote = async (_thread: Thread, clicked: 'down' | 'up') => {
		let vote: null | false | true = null;

		// TODO: There's gotta be a more elegant way to do this
		if (_thread?.user_vote === null && clicked === 'up') {
			vote = true;
			thread.score++;
		} else if (_thread?.user_vote === null && clicked === 'down') {
			vote = false;
			thread.score--;
		} else if (_thread?.user_vote === false && clicked === 'up') {
			vote = true;
			thread.score += 2;
		} else if (_thread?.user_vote === false && clicked === 'down') {
			vote = null;
			thread.score++;
		} else if (_thread?.user_vote === true && clicked === 'up') {
			vote = null;
			thread.score--;
		} else if (_thread?.user_vote === true && clicked === 'down') {
			vote = false;
			thread.score -= 2;
		}

		const { res, json } = await fetchRequest('POST', `group/thread/${_thread?.id}/vote`, { vote });

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not vote on thread', success: false });
			return;
		}

		thread.user_vote = vote;
	};
</script>

<div>
    <div class="flex items-center gap-2">
        <button
            class:text-primary={thread?.user_vote === true}
            on:click={() => threadVote(thread, 'up')}
        >
            <Fa icon={faThumbsUp} />
        </button>
        {thread?.score}
        <button
            class:text-primary={thread?.user_vote === false}
            on:click={() => threadVote(thread, 'down')}
        >
            <Fa class="pl-0.5" icon={faThumbsDown} />
        </button>
    </div>
</div>

<ErrorHandler bind:this={errorHandler}/>