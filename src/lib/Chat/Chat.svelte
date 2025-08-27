<script lang="ts">
	import ChatWindow from './ChatWindow.svelte';
	import Preview from './Preview.svelte';
	import { onMount } from 'svelte';
	import type { GroupMembers, PreviewMessage } from './interfaces';
	import { _ } from 'svelte-i18n';
	import { env } from '$env/dynamic/public';
	import Fa from 'svelte-fa';
	import Button from '$lib/Generic/Button.svelte';
	import { faCog } from '@fortawesome/free-solid-svg-icons';
	import ChatIcon from '$lib/assets/Chat_fill.svg';
	import { darkModeStore, getIconFilter } from '$lib/Generic/DarkMode';
	import { chatPartner, isChatOpen } from './functions';
	import { goto } from '$app/navigation';
	import CreateChatGroup from '$lib/Chat/CreateChatGroup.svelte';
	import CrossButton from '$lib/Generic/CrossButton.svelte';

	let chatOpen = env.PUBLIC_MODE === 'DEV' ? false : false,
		selectedPage: 'direct' | 'group' = 'direct',
		selectedChat: number | null,
		previewDirect: PreviewMessage[] = [],
		previewGroup: PreviewMessage[] = [],
		isLookingAtOlderMessages = false,
		chatDiv: HTMLDivElement,
		selectedChatChannelId: number | null,
		creatingGroup = false,
		groupMembers: GroupMembers[] = [];

	// Reactive variables to track unread messages
	$: displayNotification = previewDirect.some((p) => p.notified);

	// Clear notification and update localStorage timestamp when a chat is opened
	const clearChatNotification = async (chatterId: number | null) => {
		if (!chatterId) return;

		// Store the current timestamp in localStorage to mark the chat as read
		const timestampKey = `lastInteraction_${chatterId}`;
		const now = new Date().toISOString();
		localStorage.setItem(timestampKey, now);

		// Clear notification for messages
		let message = previewDirect.find((message) => message.channel_id === chatterId);
		if (message) {
			message.timestamp = new Date().toString();
			message.notified = false;
			previewDirect = [...previewDirect];
		}
	};

	onMount(async () => {
		// Adjust chat window margin based on header height
		correctMarginRelativeToHeader();
		window.addEventListener('resize', correctMarginRelativeToHeader);
		// Subscribe to chat open state
		isChatOpen.subscribe((open) => (chatOpen = open));
	});

	// Adjust chat window margin dynamically
	const correctMarginRelativeToHeader = () => {
		const _headerHeight = document.querySelector('#header')?.clientHeight;
		if (_headerHeight && chatDiv) chatDiv.style.marginTop = `${_headerHeight.toString()}px`;
	};

	// Automatically select the first chat when the chat window opens
	//TODO Make it work
	$: if (
		chatOpen &&
		selectedChat === null &&
		selectedChatChannelId === null &&
		previewDirect.length > 0
	) {
		const firstDirectChat = previewDirect[0];
		selectedChat = firstDirectChat.channel_id || null;
		// selectedChatChannelId = firstDirectChat.channel_id || null;
		chatPartner.set(firstDirectChat.channel_id || -1);
		// Clear notification and update timestamp for the selected chat
		clearChatNotification(firstDirectChat.channel_id || -1);
	}

	// Reset chat partner when chat is closed
	// TODO fix issues with this
	$: if (!chatOpen) {
		chatPartner.set(0);
	}
</script>

<svelte:head>
	<title>
		{`${displayNotification ? '🟣' : ''}`}
	</title>
</svelte:head>

<div
	bind:this={chatDiv}
	class:invisible={!chatOpen}
	class="bg-background dark:bg-darkbackground dark:text-darkmodeText fixed z-40 w-full h-[100vh]"
>
	<div class="w-full flex justify-between mr-6">
		<Button
			onClick={() => {
				chatOpen = false;
				isChatOpen.set(false);
				goto('/user/settings');
			}}
			Class="px-6 my-3 dark:bg-darkbackground hover:brightness-95 active:brightness-90"
		>
			<div class="text-gray-800 dark:text-gray-200">
				<Fa icon={faCog} />
			</div>
		</Button>

		<Button Class="px-6 my-3 dark:bg-darkbackground hover:brightness-95 active:brightness-90" />
		<CrossButton
			action={() => {
				chatOpen = false;
				isChatOpen.set(false);
			}}
		/>
	</div>
	<div class="flex w-full gap-6 max-w-[1200px] h-[80vh]">
		<div class="bg-white w-[40%] overflow-y-auto flex-grow ml-6 dark:bg-darkobject p-2">
			{#key creatingGroup}
				<Preview
					bind:selectedChat
					bind:previewDirect
					bind:selectedChatChannelId
					bind:creatingGroup
					bind:groupMembers
				/>
			{/key}
		</div>
		<div class="bg-white w-[60%] flex-grow mr-6 dark:bg-darkobject p-2">
			{#if creatingGroup}
				<CreateChatGroup bind:creatingGroup bind:groupMembers />
			{:else}
				<ChatWindow
					bind:selectedChat
					bind:selectedChatChannelId
					bind:selectedPage
					bind:previewDirect
					bind:previewGroup
					bind:isLookingAtOlderMessages
				/>
			{/if}
		</div>
	</div>
</div>

<button
	on:click={() => {
		chatOpen = !chatOpen;
		isChatOpen.set(chatOpen);
	}}
	class:small-notification={displayNotification}
	class="dark:text-white transition-all fixed z-50 bg-white dark:bg-darkobject shadow-md border p-5 bottom-6 ml-5 rounded-full cursor-pointer hover:shadow-xl hover:border-gray-400 active:shadow-2xl active:p-6"
>
	{#key $darkModeStore}
		<img
			src={ChatIcon}
			class="text-white"
			style="filter: {getIconFilter(true, 'white', $darkModeStore)}"
			alt={chatOpen ? 'close chat' : 'open chat'}
		/>
	{/key}
</button>

<style>
	.small-notification:before {
		position: absolute;
		content: '';
		top: 0;
		right: 0;
		background-color: rgb(167, 139, 250);
		border-radius: 100%;
		padding: 10px;
		z-index: 10;
	}
</style>
