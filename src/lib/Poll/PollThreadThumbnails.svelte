<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { PollsApi } from '$lib/api/polls';
	import { pollThumbnails as pollThumbnailsLimit } from '../Generic/APILimits.json';
	import type { Filter, poll, Post } from './interface';
	import type { DelegateMinimal, Thread } from '$lib/Group/interface';
	import type { WorkGroup } from '$lib/Group/WorkingGroups/interface';
	import { env } from '$env/dynamic/public';
	import { ThreadsApi } from '$lib/api/threads';
	import PollThumbnail from './PollThumbnail.svelte';
	import PollFiltering from './PollFiltering.svelte';
	import Loader from '$lib/Generic/Loader.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import { posts } from './stores';
	import ThreadThumbnail from '$lib/Thread/ThreadThumbnail.svelte';
	import { deepCopy, lazyLoading } from '$lib/Generic/GenericFunctions';
	import { fetchRequest } from '$lib/FetchRequest';

	// Props
	export let Class = '',
		infoToGet: 'group' | 'home' | 'public' | 'delegate' | 'user',
		delegate: DelegateMinimal = {
			id: 0,
			pool_id: 0,
			profile_image: '',
			tags: [],
			username: ''
		};

	let polls: poll[] = [],
		threads: Thread[] = [],
		workGroups: WorkGroup[] = [],
		loading = false,
		next: null | undefined | string,
		filter: Filter = {
			search: '',
			finishedSelection: 'all',
			public: false,
			order_by: 'start_date_desc',
			tag: null,
			workgroup: null,
			from: new Date(0).toISOString().slice(0, 16),
			to: new Date(99999999999999).toISOString().slice(0, 16)
		},
		showThreads = true,
		showPolls = true;

	// Local sorting as fallback since server sorting isn't working correctly
	$: {
		if ($posts.length) {
			const sortedPosts = [...$posts].sort((a, b) => {
				switch (filter.order_by) {
					case 'start_date_desc':
						return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
					case 'start_date_asc':
						return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
					default:
						return 0;
				}
			});
			$posts = sortedPosts;
		}
	}

	async function fetchPolls() {
		console.log(filter.to, 'TO');
		console.log(filter.from, 'FREOM');

		let api_params = `
		
		group_ids=${$page.params.groupId ?? ''}&
		order_by=${filter.order_by ? `pinned,${filter.order_by}` : 'pinned'}&
		limit=${pollThumbnailsLimit}&
		title__icontains=${filter.search ?? ''}&
		tag_id=${filter.tag ?? ''}&
		work_group_ids=${filter.workgroup}&
		public=${infoToGet === 'public' ? 'true' : ''}&
		created_at__gt=${filter.from}&
		created_at__lt=${filter.to}
		`;

		// if (next === undefined) {
		if (true) {
			loading = true;

			const { res, json } = await fetchRequest('GET', `user/home?${api_params}`);

			loading = false;
			if (!res.ok) ErrorHandlerStore.set({ message: 'Could not get polls', success: false });

			$posts = json.results ?? [];
			next = json.next ?? null;
		} else if (next === null) return;
		else {
			loading = true;
			const { res, json } = await fetchRequest('GET', next ?? '');
			if (!res.ok) {
				ErrorHandlerStore.set({ message: 'Could not get polls', success: false });
			}
			$posts = [...$posts, ...json.results];
			next = json.next;
		}
		loading = false;
	}

	async function fetchRelatedContent() {
		const threadIds = $posts
			.filter((post) => post.related_model === 'thread')
			.map((post) => post.id);

		const { res, json } = await fetchRequest('GET', `home/polls?limit=1000`);
		polls = json.results;

		if (threadIds.length) {
			const response =
				infoToGet === 'home'
					? await ThreadsApi.getHomeThreads(filter.order_by)
					: await ThreadsApi.getGroupThreads($page.params.groupId, threadIds, filter.order_by);
			threads = response.results;
		}
	}

	async function fetchWorkGroups() {
		const { results } = await PollsApi.getWorkGroups();
		workGroups = results;
	}

	const matchesFilter = (post: Post): boolean => {
		// Find the corresponding thread (only needed for workgroup filtering on threads)
		const thread = post.related_model === 'thread' ? threads.find((t) => t.id === post.id) : null;

		// Check search filter (applies to both polls and threads, case-insensitive search on title)
		const matchesSearch =
			!filter.search || post.title?.toLowerCase().includes(filter.search.toLowerCase());

		// Check workgroup filter (only for threads, skipped if both showThreads and showPolls are true)
		const matchesWorkgroup =
			// post.related_model !== 'thread' || // Skip workgroup filter for polls
			// (showThreads && showPolls) || // Skip workgroup filter if both showThreads and showPolls are true
			!filter.workgroup || // If no workgroup filter, show all threads
			(thread && thread.work_group?.id === Number(filter.workgroup)); // Match thread workgroup

		// return false;
		return (matchesSearch && matchesWorkgroup) || false;
	}

	onMount(async () => {
		await fetchPolls();

		if (env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE') {
			await fetchWorkGroups();
		} else {
			await fetchRelatedContent();
		}
	});

	$: if (filter) {
		
		fetchPolls();
		fetchRelatedContent();
	}
</script>

<svelte:body onscroll={() => lazyLoading(fetchPolls)} />

<div class={`${Class} dark:text-darkmodeText`}>
	<Loader bind:loading>
		<div class={`flex flex-col gap-6 w-full`} id="thumbnails">
			<PollFiltering
				tagFiltering={infoToGet === 'group'}
				bind:filter
				bind:showThreads
				bind:showPolls
			/>

			{#if $posts?.length === 0 && !loading}
				<div class="bg-white dark:bg-darkobject rounded shadow p-8 mt-6">
					{$_('No posts currently here')}
				</div>
			{:else if $posts?.length > 0 && (polls?.length > 0 || threads?.length > 0)}
				{#each $posts as post}
					{#if post?.related_model === 'thread' && showThreads && matchesFilter(post)}
						<ThreadThumbnail
							thread={threads?.find((thread) => thread?.id === post?.id) || threads[0]}
						/>
					{:else if post?.related_model === 'poll' && showPolls && matchesFilter(post)}
						<PollThumbnail poll={polls?.find((poll) => poll?.id === post?.id) || polls[0]} />
					{/if}
				{/each}
			{:else if !loading}
				<div class="bg-white rounded shadow p-8 dark:bg-darkobject">
					{$_('No posts currently here')}
				</div>
			{/if}
		</div>
		<!-- <Pagination
			bind:next
			bind:prev
			bind:iterable={$posts}
			Class={'flex gap-2 justify-around w-full mt-6'}
		/> -->
	</Loader>
</div>
