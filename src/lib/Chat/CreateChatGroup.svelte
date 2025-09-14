<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import { _ } from 'svelte-i18n';
	import type { GroupMembers } from './interfaces';
	
	import { userStore } from '$lib/User/interfaces';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	export let creatingGroup: boolean,
		groupMembers: GroupMembers[] = [];

	const groupChatCreate = async () => {
		const { res, json } = await fetchRequest(
			'GET',
			`user/chat?target_user_ids=${$userStore?.id || -1}&${groupMembers
				.map((member) => `target_user_ids=${member.id}`)
				.join('&')}`
		);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to created group chat', success: false });
			return;
		}

		//Poppup doesn't work because this goes to false
		//TODO: Redo the poppup system to have a poppup queue that's always rendered and which is accessed via svelte store
		creatingGroup = false;
		groupMembers = [];
		ErrorHandlerStore.set({ message: 'Successfully created group chat', success: true });
	};

	const cancelGroupChatCreate = () => {
		creatingGroup = false;
		groupMembers = [];
	};
</script>

<form on:submit={groupChatCreate}>
	<!-- <TextInput autofocus required bind:value={name} label="Chatgroup Name" /> -->

	{$_('Members')}
	<div>
		{#each groupMembers as member}
			{member.username}
		{/each}
	</div>

	<Button buttonStyle="primary-light" type="submit">{$_('Confirm')}</Button>
	<Button buttonStyle="warning-light" onClick={cancelGroupChatCreate}>{$_('Cancel')}</Button>
</form>
