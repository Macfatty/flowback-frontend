<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';

	export let deletePollModalShow = false,
		pollId: string | number,
		type: 'poll' | 'thread' = 'poll';

	let errorHandler: any;

	const deletePoll = async () => {
		let _api = type === 'poll' ? `group/poll/${pollId}/delete` : `group/thread/${pollId}/delete`;

		const { res, json } = await fetchRequest('POST', _api);

		if (!res.ok) {
			errorHandler.addPopup({ message: 'Could not delete poll', success: false });
			return;
		}

		goto(`/groups/${$page.params.groupId}`);
		deletePollModalShow = false;
	};
</script>

<Modal bind:open={deletePollModalShow} Class="max-w-[400px]">
	<div slot="header">{$_('Deleting Poll')}</div>
	<div slot="body">
		{$_('Are you sure you want to delete this poll?')}
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
