<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import ChatIcon from '$lib/assets/Chat_fill.svg';
	import { page } from '$app/state';
	import NotificationOptions from '$lib/Generic/NotificationOptions.svelte';
	import Fa from 'svelte-fa';
	import { faThumbTack, faGlobe, faLock } from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';
	import NewDescription from '$lib/Poll/NewDescription.svelte';
	import { groupUserStore, type Thread } from '$lib/Group/interface';
	import MultipleChoices from '$lib/Generic/MultipleChoices.svelte';
	import HeaderIcon from '$lib/Header/HeaderIcon.svelte';
	import { darkModeStore } from '$lib/Generic/DarkMode';
	import { onMount } from 'svelte';
	import ReportPostModal from '$lib/Poll/ReportPostModal.svelte';
	import DeletePostModal from '$lib/Poll/DeletePostModal.svelte';
	import ThreadVoting from './ThreadVoting.svelte';
	import { goto } from '$app/navigation';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	export let thread: Thread;
	let threads: Thread[] = [],
		reportModalShow = false,
		deleteModalShow = false,
		choicesOpen = false,
		darkMode: boolean = false;

	//When adminn presses the pin tack symbol, pin the thread
	const pinThread = async (thread: Thread) => {
		const { json, res } = await fetchRequest('POST', `group/thread/${thread?.id}/update`, {
			pinned: !thread?.pinned
		});
		if (!res.ok) return;

		thread.pinned = !thread?.pinned;
		threads = threads;
	};

	onMount(() => {
		darkModeStore.subscribe((dark) => (darkMode = dark));
	});
</script>

<div
	class="bg-white dark:bg-darkobject dark:text-darkmodeText p-6 rounded-sm"
	class:poll-thumbnail-shadow={!darkMode}
>
	<div class="flex justify-between items-center">
		{#if !page.params.groupId}
			<a href={`/groups/${thread?.group_id}`} class="text-black flex items-center">
				<!-- <img
					class="h-6 w-6 mr-1 rounded-full break-word"
					src={`${
						thread?.group_image ? `${env.PUBLIC_API_URL}${thread?.group_image}` : DefaultBanner
					}`}
					alt={'thread Thumbnail'}
					on:error={(e) => onThumbnailError(e, DefaultBanner)}
				/> -->
				<span class="break-word text-sm text-gray-700">{thread?.group_name}</span>
			</a>
		{:else if thread?.created_by?.user}
			<div class="text-black flex items-center">
				<!-- TODO: add "if group doesn't hide displaying creators" condition -->
				<!-- <img
					class="h-6 w-6 mr-1 rounded-full break-word"
					src={`${
						thread?.created_by?.user?.profile_image
							? `${env.PUBLIC_API_URL}${thread?.created_by?.user?.profile_image}`
							: DefaultPFP
					}`}
					alt={'thread Thumbnail'}
					on:error={(e) => onThumbnailError(e, DefaultPFP)}
				/> -->
				<span class="break-word text-sm text-gray-700 dark:text-darkmodeText"
					>{thread?.created_by?.user?.username}</span
				>
			</div>
		{/if}

		{#if thread?.group_joined}
			<div class="inline-flex gap-4 items-baseline">
				<NotificationOptions
					type="thread"
					api={`group/thread/${thread?.id}`}
					categories={['comment']}
					id={thread?.id}
					labels={['comment']}
				/>
				{#if $groupUserStore?.is_admin || thread?.pinned}
					<button
						class:cursor-pointer={$groupUserStore?.is_admin}
						onclick={() => pinThread(thread)}
					>
						<Fa
							size="1.2x"
							icon={faThumbTack}
							color={thread?.pinned ? '#999' : '#CCC'}
							rotate={thread?.pinned ? '0' : '45'}
						/>
					</button>
				{/if}

				<MultipleChoices
					bind:choicesOpen
					labels={[$_('Delete Thread'), $_('Report Thread')]}
					functions={[
						() => (deleteModalShow = true),
						() => ((reportModalShow = true), (choicesOpen = false))
					]}
					Class="text-black justify-self-center"
				/>
			</div>
		{/if}
	</div>
	<button
		class="break-words cursor-pointer hover:underline text-primary dark:text-secondary text-xl text-left"
		onclick={() => {
			if (thread.group_joined)
				goto(
					`/groups/${thread?.group_id}/thread/${thread?.id}?source=${
						page.params.groupId ? 'group' : 'home'
					}`
				);
			else
				ErrorHandlerStore.set({
					message: 'You must join the group to access the thread',
					success: false
				});
		}}>{thread?.title}</button
	>

	<div>
		{#if thread?.work_group}
			<span class="text-sm text-gray-500 dark:text-darkmodeText">#{thread.work_group.name}, </span>
		{/if}
		{#if thread?.created_at}
			<span class="text-sm text-gray-500 dark:text-darkmodeText">
				{new Date(thread.created_at).toISOString().split('T')[0].replace(/-/g, '.')}
			</span>
		{/if}
	</div>

	{#if thread?.public}
		<HeaderIcon Class="!p-0 !cursor-default" icon={faGlobe} text={'Public Poll'} />
	{:else}
		<HeaderIcon Class="!p-0 !cursor-default" icon={faLock} text={'Private Poll'} />
	{/if}

	{#if thread?.description}
		<NewDescription limit={2} lengthLimit={700} description={thread?.description} />
	{/if}

	<hr class="my-3" />

	{#if thread?.group_joined}
		<div class="flex justify-between align-middle">
			<div
				class="hover:bg-gray-100 dark:hover:bg-slate-500 cursor-pointer text-sm text-gray-600 dark:text-darkmodeText"
			>
				<a
					class="text-black dark:text-darkmodeText flex justify-center gap-1"
					href={`groups/${thread?.group_id}/thread/${thread?.id}?source=${
						page.params.groupId ? 'group' : 'home'
					}`}
				>
					<img class="w-5" src={ChatIcon} alt="open chat" />
					<span class="inline">{thread?.total_comments} {'comments'}</span>
				</a>
			</div>
			<ThreadVoting bind:thread />
		</div>
	{/if}
</div>

<!-- TODO: Fix so group id is correct -->
<ReportPostModal
	post_type="thread"
	group_id={thread?.group_id}
	post_id={thread?.id}
	post_title={thread?.title}
	post_description={thread?.description}
	bind:reportModalShow
/>

<DeletePostModal bind:deleteModalShow postId={thread?.id} post_type="thread" />

<style>
	.poll-thumbnail-shadow {
		box-shadow: 0 0 5px rgb(203, 203, 203);
	}
</style>
