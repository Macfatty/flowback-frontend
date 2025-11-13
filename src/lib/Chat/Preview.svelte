<script lang="ts">
	import { type GroupMembers, type invite } from './interfaces';
	import { fetchRequest } from '$lib/FetchRequest';
	import ProfilePicture from '$lib/Generic/ProfilePicture.svelte';
	import { onMount } from 'svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { chatOpenStore, chatPartnerStore, getUserChannelId, previewStore } from './functions';
	import Button from '$lib/Generic/Button.svelte';
	import { _ } from 'svelte-i18n';
	import { idfy } from '$lib/Generic/GenericFunctions2';
	import UserSearch from '$lib/Generic/UserSearch.svelte';
	import Fa from 'svelte-fa';
	import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
	import { userStore } from '$lib/User/interfaces';

	let chatSearch = '',
		openUserSearch = false;

	export let selectedChat: number | null,
		selectedChatChannelId: number | null,
		creatingGroup: boolean,
		inviteList: invite[] = [],
		groupMembers: GroupMembers[] = [];

	// Handle chat selection and clear notifications
	const clickedChatter = async (chatterId: any) => {
		let preview = $previewStore?.find((_preview) => _preview.channel_id === chatterId);

		const { res, json } = await fetchRequest('POST', `chat/message/channel/userdata/update`, {
			channel_id: chatterId,
			timestamp: new Date()
		});

		if (!res.ok) {
			return;
		}

		// Whenever the user clicks a chatter, remove notification
		if (preview && preview.recent_message) {
			preview.timestamp = new Date().toString();
			preview.recent_message = {
				...preview.recent_message,
				notified: true
			};

			preview = preview;
			previewStore.update((store) =>
				store ? store?.map((p) => (p.id === preview?.id ? preview : p)) : []
			);
		}

		selectedChat = chatterId;
		chatPartnerStore.set(chatterId);
		selectedChatChannelId = chatterId;
	};

	// Fetch chat invites
	const UserChatInviteList = async () => {
		const { res, json } = await fetchRequest('GET', `user/chat/invite/list`);
		if (!res.ok) return;
		inviteList = json?.results;
	};

	// Accept or reject chat invites
	const UserChatInvite = async (accept: boolean, invite_id: number) => {
		const { res, json } = await fetchRequest('POST', `user/chat/invite`, {
			invite_id,
			accept
		});

		if (!res.ok) return;
		inviteList = inviteList.map((invitee) => {
			if (invitee.id === invite_id) invitee.rejected = !accept;
			return invitee;
		});
	};

	// Update chat title
	const updateChatTitle = async () => {
		// if (selectedChatChannelId) {
		// 	await fetchRequest('POST', 'user/chat/update', {
		// 		channel_id: selectedChatChannelId,
		// 		title: 'chat example'
		// 	});
		// }
	};

	onMount(async () => {
		await UserChatInviteList();

		chatPartnerStore.subscribe((partner) => {
			if (partner === null) return;
			// selectedPage = 'direct';
			selectedChat = partner;
			selectedChatChannelId = partner;
			clickedChatter(partner);
		});
	});

	$: if (selectedChatChannelId) updateChatTitle();

	$: if ($previewStore) {
		// let previewsNotified = $previewStore.filter((preview) => preview.recent_message?.notified);
		// let previewsNotNotified = $previewStore.filter((preview) => !preview.recent_message?.notified);
		// previewsNotNotified = previewsNotNotified.sort(
		// 	(preview1, preview2) =>
		// 		new Date(preview2.timestamp).getDate() - new Date(preview1.timestamp).getDate()
		// );
		// previewsNotified = previewsNotified.sort(
		// 	(preview1, preview2) =>
		// 		new Date(preview2.timestamp).getDate() - new Date(preview1.timestamp).getDate()
		// );
		// $previewStore = [...previewsNotified, ...previewsNotNotified];
	}
</script>

<div class="max-h-[100%] pb-2">
	<div class="border-b-2 w-full">
		<TextInput
			placeholder={'Search chatters'}
			label=""
			max={null}
			bind:value={chatSearch}
			inputClass="mt-4 mb-2 placeholder-gray-600 py-1 pl-2 text-gray-500 border-0 bg-gray-100 dark:bg-darkobject"
		/>
	</div>

	<div class="flex justify-center">
		<Button
			Class="my-2"
			onClick={() => {
				creatingGroup = true;
				groupMembers = []; // Reset groupMembers
			}}
		>
			{$_('+ New Group')}
		</Button>

		<UserSearch bind:showUsers={openUserSearch} showSelf>
			<div slot="action" let:item>
				<button
					on:click={async () => {
						chatOpenStore.set(true);
						chatPartnerStore.set(await getUserChannelId(item.id));
						openUserSearch = false;
					}}
				>
					<Fa icon={faPaperPlane} rotate="60" />
				</button>
			</div>
		</UserSearch>
		<!-- <Button onClick={newDM}>New DM</Button> -->
	</div>

	{#if inviteList}
		{#each inviteList as groupChat}
			{#if !groupChat.rejected && groupChat?.title?.split(',')?.length > 2}
				{#if groupChat.rejected === null}
					<span>{$_("You've been invited to this chat:")}</span>
					<Button onClick={() => UserChatInvite(true, groupChat.id)}>{$_('Accept')}</Button>
					<Button onClick={() => UserChatInvite(false, groupChat.id)}>{$_('Deny')}</Button>
				{/if}
				<button
					class="w-full transition transition-color p-3 flex items-center gap-3 cursor-pointer dark:bg-darkobject"
					class:dark:bg-gray-700={selectedChat === groupChat.message_channel_id}
					class:dark:hover:bg-darkbackground={groupChat.rejected === false}
					class:hover:bg-gray-200={groupChat.rejected === false}
					class:active:bg-gray-500={groupChat.rejected === false}
					class:bg-gray-200={selectedChat === groupChat.message_channel_id}
					on:click={() => {
						if (groupChat.rejected === false) clickedChatter(groupChat.message_channel_id);
					}}
					disabled={groupChat.rejected === null}
				>
					<ProfilePicture username={groupChat.message_channel_name} profilePicture={null} />
					<div class="flex flex-col max-w-[40%]">
						<span class="max-w-full text-left overflow-x-hidden overflow-ellipsis">
							{groupChat.message_channel_name}
						</span>
					</div>
				</button>
			{/if}
		{/each}
	{/if}
	{#each $previewStore as chatter}
		{#if chatter.channel_title?.includes(chatSearch) && ((chatter?.recent_message?.channel_origin_name === 'user' && creatingGroup) || !creatingGroup)}
			<button
				class="w-full transition transition-color p-3 flex items-center gap-3 hover:bg-gray-200 active:bg-gray-500 cursor-pointer dark:bg-darkobject dark:hover:bg-darkbackground"
				class:bg-gray-200={selectedChat === chatter.channel_id}
				class:dark:bg-gray-700={selectedChat === chatter.channel_id}
				on:click={() => clickedChatter(chatter.channel_id)}
			>
				{#if chatter?.recent_message?.notified === false || new Date(chatter.timestamp) < new Date(chatter.recent_message?.updated_at)}
					<div class="p-1 rounded-full bg-purple-300"></div>
				{/if}

				<ProfilePicture profilePicture={chatter?.recent_message?.profile_image} />
				<div class="flex flex-col max-w-[40%]">
					<span class="max-w-full text-left overflow-x-hidden overflow-ellipsis">
						<!-- {chatter?.user.username} -->
						{chatter.channel_title ?? chatter.recent_message?.channel_title ?? 'Name not found'}
					</span>
					<span class="text-gray-400 text-sm h-[20px]">
						{chatter?.recent_message?.message || ''}
					</span>
				</div>
			</button>
			{#if creatingGroup}
				<div id={`chat-${idfy(chatter.channel_title ?? '')}`}>
					<Button
						onClick={() => {
							if (groupMembers.some((member) => member.id === chatter.id)) {
								return;
							}
							const newMember = chatter.participants.find((user) => user.id !== $userStore?.id);
							// @ts-ignore
							groupMembers = [...groupMembers, newMember];
						}}
					>
						{$_('Add User')}
					</Button>
				</div>
			{/if}
		{/if}
	{/each}
</div>
