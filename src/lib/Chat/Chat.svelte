<script lang="ts">
	import ChatWindow from './ChatWindow.svelte';
	import Preview from './Preview.svelte';
	import { onMount } from 'svelte';
	import type { GroupMembers, PreviewMessage } from './interfaces';
	import { _ } from 'svelte-i18n';
	import Fa from 'svelte-fa';
	import Button from '$lib/Generic/Button.svelte';
	import { faCog } from '@fortawesome/free-solid-svg-icons';
	import ChatIcon from '$lib/assets/Chat_fill.svg';
	import { darkModeStore, getIconFilter } from '$lib/Generic/DarkMode';
	import { chatPartnerStore, chatOpenStore } from './functions';
	import { goto } from '$app/navigation';
	import CreateChatGroup from '$lib/Chat/CreateChatGroup.svelte';
	import CrossButton from '$lib/Generic/CrossButton.svelte';
	import { fetchRequest } from '$lib/FetchRequest';

	let chatOpen = false,
		selectedPage: 'direct' | 'group' = 'direct',
		selectedChat: number | null,
		previewDirect: PreviewMessage[] = [],
		isLookingAtOlderMessages = false,
		chatDiv: HTMLDivElement,
		selectedChatChannelId: number | null,
		creatingGroup = false,
		groupMembers: GroupMembers[] = [];

	// Fetch preview messages and set notified based on localStorage timestamps
	const getPreview = async () => {
		const { res, json } = await fetchRequest('GET', `chat/message/channel/preview/list`);
		if (!res.ok) return [];

		previewDirect = json?.results;
	};

	// Adjust chat window margin dynamically
	const correctMarginRelativeToHeader = () => {
		const _headerHeight = document.querySelector('#header')?.clientHeight;
		if (_headerHeight && chatDiv) chatDiv.style.marginTop = `${_headerHeight.toString()}px`;
	};

	// Clear notification and update localStorage timestamp when a chat is opened
	const clearChatNotification = async (chatterId: number | null) => {
		if (!chatterId) return;

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
		chatOpenStore.subscribe((open) => (chatOpen = open));
		getPreview();
		window.addEventListener('popstate', () => {
			let url = new URL(window.location.toString());
			// if (url.searchParams.get('chatOpen') === 'true') chatOpen = true;
			// else chatOpen = false;
		});
	});

	// Reactive variables to track unread messages
	$: displayNotification = previewDirect.some((p) => p.notified);

	//Handles the chatOpen=true in the URL for correct "going back in history" behaviour
	$: (() => {
		const url = new URL(window.location.toString());
		// url.searchParams.set('chatOpen', chatOpen.toString());
		window.history.pushState({}, '', url);
	})();

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
		chatPartnerStore.set(firstDirectChat.channel_id || -1);
		// Clear notification and update timestamp for the selected chat
		clearChatNotification(firstDirectChat.channel_id || -1);
	}

	// Reset chat partner when chat is closed
	// TODO fix issues with this
	$: if (!chatOpen) {
		chatPartnerStore.set(0);
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
	class="bg-background dark:bg-darkbackground dark:text-darkmodeText fixed z-[50] w-[100vw] h-[100vh] flex flex-col items-center"
>
	<div class="w-full flex justify-between mr-6">
		<Button
			onClick={() => {
				chatOpen = false;
				chatOpenStore.set(false);
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
				chatOpenStore.set(false);
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
					bind:isLookingAtOlderMessages
				/>
			{/if}
		</div>
	</div>
</div>

	<button
		on:click={() => {
			chatOpen = !chatOpen;
			chatOpenStore.set(chatOpen);
		}}
		class:small-notification={displayNotification}
		class="dark:text-white transition-all fixed z-50 bg-white dark:bg-darkobject shadow-md border p-5 bottom-6 ml-5 rounded-full cursor-pointer hover:shadow-xl hover:border-gray-400 active:shadow-2xl active:p-6"
	>
		<img
			src={ChatIcon}
			class="text-white"
			style="filter: {getIconFilter(true, 'white', $darkModeStore)}"
			alt={chatOpen ? 'close chat' : 'open chat'}
		/>
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
