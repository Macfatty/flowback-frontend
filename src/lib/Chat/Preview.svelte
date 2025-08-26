<script lang="ts">
	import { type Direct, type GroupMembers, type invite, type PreviewMessage } from './interfaces';
	import { fetchRequest } from '$lib/FetchRequest';
	import type { Group } from '$lib/Group/interface';
	import { userStore } from '$lib/User/interfaces';
	import ProfilePicture from '$lib/Generic/ProfilePicture.svelte';
	import { onMount } from 'svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { chatPreview as chatLimit } from '../Generic/APILimits.json';
	import { chatPartner } from './functions';
	import Button from '$lib/Generic/Button.svelte';
	import { _ } from 'svelte-i18n';
	import { workGroupsStore, type WorkGroup } from '$lib/Group/WorkingGroups/interface';
	import { env } from '$env/dynamic/public';

	let groups: Group[] = [],
		directs: Direct[] = [],
		chatSearch = '',
		workGroupList: WorkGroup[] = [];

	export let selectedChat: number | null,
		selectedChatChannelId: number | null,
		creatingGroup: boolean,
		previewDirect: PreviewMessage[] = [],
		previewGroup: PreviewMessage[] = [],
		inviteList: invite[] = [],
		groupMembers: GroupMembers[] = [];

	// Fetch and set up preview messages
	const setUpPreview = async () => {
		previewDirect = await getPreview('user');
		previewGroup = await getPreview('group');
	};

	// Fetch preview messages and set notified based on localStorage timestamps
	const getPreview = async (selectedPage: 'user' | 'group') => {
		const { res, json } = await fetchRequest(
			'GET',
			`chat/message/channel/preview/list?origin_name=${selectedPage}`
		);
		if (!res.ok) return [];

		if (selectedPage === 'group') return json?.results;
		else {
			// Process messages to set notified based on last interaction timestamp
			return json?.results.map((message: PreviewMessage) => {
				const timestampKey = `lastInteraction_${message.channel_id}`;
				const lastInteraction = localStorage.getItem(timestampKey);
				// Set notified to true if message is newer than last interaction or no interaction exists
				message.notified = lastInteraction
					? new Date(message.created_at) > new Date(lastInteraction)
					: false;
				// console.log(timestampKey, new Date(message.created_at).toISOString(), new Date(lastInteraction).toISOString());
				return message;
			});
		}
	};

	// Fetch channel ID for a user
	const getChannelId = async (id: number) => {
		const { res, json } = await fetchRequest('GET', `user/chat?target_user_ids=${id}`);
		return json.id;
	};

	// Fetch list of chattable users and groups
	const getChattable = async () => {
		if (directs.length + groups.length !== 0) return;
		directs = await userList();
		groups = await groupList();
	};

	// Fetch list of groups
	const groupList = async () => {
		const { res, json } = await fetchRequest('GET', `group/list?joined=true&limit=${chatLimit}`);
		if (!res.ok) return [];
		return json?.results;
	};

	// Fetch list of users
	const userList = async () => {
		const { json, res } = await fetchRequest('GET', `users?limit=${chatLimit}`);
		if (!res.ok) return [];
		let chatters = json?.results.filter((chatter: any) => chatter.id !== $userStore?.id);
		chatters = await Promise.all(
			chatters.map(async (chatter: any) => {
				chatter.channel_id = await getChannelId(chatter.id);
				return chatter;
			})
		);
		return chatters;
	};

	// Handle chat selection and clear notifications
	const clickedChatter = async (chatterId: any) => {
		// Update server-side timestamp
		// await updateUserData(chatterId, new Date(), new Date());

		// Update localStorage timestamp to mark chat as read
		const timestampKey = `lastInteraction_${chatterId}`;
		localStorage.setItem(timestampKey, new Date().toISOString());

		// if (selectedPage === 'direct') {
		let message = previewDirect.find((message) => message.channel_id === chatterId);
		if (message) {
			message.timestamp = new Date().toString();
			message.notified = false;
			previewDirect = [...previewDirect];
		}
		// 	selectedChat = chatterId;
		// 	selectedChatChannelId = chatterId;
		// 	chatPartner.set(chatterId);
		// } else if (selectedPage === 'group') {
		// 	let message = previewGroup.find((message) => message.channel_id === chatterId);
		// 	if (message) {
		// 		message.timestamp = new Date().toString();
		// 		message.notified = false;
		// 		previewGroup = [...previewGroup];
		// 	}
		selectedChat = chatterId;
		chatPartner.set(chatterId);
		selectedChatChannelId = chatterId;
		// 	selectedPage = 'group';
		// }
	};

	// Sort chats by notification status
	const sort = (chatter: Group[] | any[], preview: PreviewMessage[]) => {
		return chatter.sort((a, b) => {
			let notifiedMsgA = preview.find(
				(notified) => notified.channel_id === (a.chat_id || a.channel_id)
			);
			let notifiedMsgB = preview.find(
				(notified) => notified.channel_id === (b.chat_id || b.channel_id)
			);
			let notifiedA = notifiedMsgA?.notified || false;
			let notifiedB = notifiedMsgB?.notified || false;
			if (notifiedA === notifiedB) return 0;
			return notifiedA ? -1 : 1;
		});
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

	// Fetch work groups for one group flowback
	const getWorkGroups = async () => {
		const { res, json } = await fetchRequest('GET', 'group/1/list');
		if (!res.ok) return;
		workGroupList = json?.results;
	};

	// Update chat title
	const updateChatTitle = async () => {
		if (selectedChatChannelId) {
			await fetchRequest('POST', 'user/chat/update', {
				channel_id: selectedChatChannelId,
				title: 'chat example'
			});
		}
	};

	onMount(async () => {
		if (env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE') getWorkGroups();
		await UserChatInviteList();
		await getChattable();
		// Initialize preview messages with notification status
		await setUpPreview();

		workGroupsStore.subscribe((_workGroups) => {
			workGroupList = _workGroups;
			selectedChat = null;
		});

		chatPartner.subscribe((partner) => {
			if (partner === null) return;
			// selectedPage = 'direct';
			selectedChat = partner;
			selectedChatChannelId = partner;
			clickedChatter(partner);
		});
	});

	$: groups = sort(groups, previewGroup);
	$: directs = sort(directs, previewDirect);
	$: if (selectedChatChannelId) updateChatTitle();

	$: console.log(previewDirect, 'PREVIEW');
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
				// selectedPage = 'direct';
				groupMembers = []; // Reset groupMembers
			}}
		>
			{$_('+ New Group')}
		</Button>
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
							{groups[0]?.name}

							{groupChat.message_channel_name}
						</span>
						<span class="text-gray-400 text-sm truncate h-[20px] overflow-x-hidden max-w-[10%]" />
					</div>
				</button>
			{/if}
		{/each}
	{/if}

	{#each previewDirect as chatter}
		<button
			class="w-full transition transition-color p-3 flex items-center gap-3 hover:bg-gray-200 active:bg-gray-500 cursor-pointer dark:bg-darkobject dark:hover:bg-darkbackground"
			class:bg-gray-200={selectedChat === chatter.channel_id}
			class:dark:bg-gray-700={selectedChat === chatter.channel_id}
			on:click={() => clickedChatter(chatter.channel_id)}
		>
			{#if chatter?.notified}
				<div class="p-1 rounded-full bg-purple-300" />
			{/if}

			<ProfilePicture profilePicture={chatter?.profile_image} />
			<div class="flex flex-col max-w-[40%]">
				<span class="max-w-full text-left overflow-x-hidden overflow-ellipsis">
					<!-- {chatter?.user.username} -->

					<!-- <EveryProperty obj={chatter} /> -->
					{chatter.channel_origin_name}
					<!-- {#if chatter?.channel_origin === 'group'}
						{groups.find((group) => group.chat_id === chatter.channel_id)?.name || 'Group Chat'}
					{/if} -->
				</span>
				<span class="text-gray-400 text-sm h-[20px]">
					{chatter?.message || ''}
				</span>
			</div>
		</button>
		{#if creatingGroup}
			<div>
				<Button
					onClick={() => {
						if (groupMembers.some((member) => member.id === chatter.id)) {
							return;
						}
						const newMember = {
							id: chatter.id,
							username: chatter.target_username || 'Unknown',
							profile_image: chatter.profile_image || null
						};
						//@ts-ignore
						groupMembers = [...groupMembers, newMember];
					}}
				>
					{$_('Add User')}
				</Button>
			</div>
		{/if}
	{/each}

</div>
