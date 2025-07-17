<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';
	import { posts } from './stores';
	import Loader from '$lib/Generic/Loader.svelte';

	export let deletePollModalShow = false,
		pollId: string | number,
		loading = false,
		type: 'poll' | 'thread' = 'poll';

	let errorHandler: any;

	const deletePoll = async () => {
		loading = true;
		let _api = type === 'poll' ? `group/poll/${pollId}/delete` : `group/thread/${pollId}/delete`;

		const { res, json } = await fetchRequest('POST', _api);

		if (!res.ok) {
			errorHandler.addPopup({ message: 'Could not delete poll', success: false });
			return;
		}

		loading = false;

		// If looking at thread and poll thumbnails
		if ($page.params.threadId === pollId || $page.params.pollId === pollId) {
			// If the current page is the one being deleted, redirect to the group page
			goto(`/groups/${$page.params.groupId}?page=flow`);
			return;
		} else {
			// If at a thread or poll page
			posts.update((currentPosts) => {
				return currentPosts.filter((post) => post.id !== pollId);
			});
		}

		errorHandler.addPopup({ message: 'Poll deleted successfully', success: true });

		deletePollModalShow = false;
	};
</script>

<Modal bind:open={deletePollModalShow} Class="max-w-[400px]">
	<div slot="header">{$_('Deleting Poll')}</div>
	<div slot="body">
		<Loader bind:loading>
			{$_('Are you sure you want to delete this poll?')}
		</Loader>
	</div>
	<div slot="footer">
		<div class="flex justify-center gap-2">
			<Button onClick={deletePoll} Class="bg-red-500 w-1/2">{$_('Yes')}</Button><Button
				onClick={() => (deletePollModalShow = false)}
				Class="bg-gray-400 w-1/2">{$_('Cancel')}</Button
			>
		</div>
	</div>
</Modal>

<ErrorHandler bind:this={errorHandler} />
