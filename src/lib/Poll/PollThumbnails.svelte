<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import PollThumbnail from './PollThumbnail.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import PollFiltering from './PollFiltering.svelte';
	import type { Filter, poll as Poll } from './interface';
	import Loader from '$lib/Generic/Loader.svelte';
	import { pollThumbnails as pollThumbnailsLimit } from '../Generic/APILimits.json';
	import Pagination from '$lib/Generic/Pagination.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import type { DelegateMinimal } from '$lib/Group/interface';

	export let Class = '',
		infoToGet: 'group' | 'home' | 'public' | 'delegate' | 'user',
		delegate: DelegateMinimal = { id: 0, pool_id: 0, profile_image: '', tags: [], username: '' };

	let polls: Poll[] = [],
		filter: Filter = {
			search: '',
			finishedSelection: 'all',
			public: false,
			order_by: 'start_date_desc',
			tag: null,
			workgroup: null,
      from:"",
      to:"",
		},
		loading = false,
		next = '',
    prev = '';

	const getAPI = async () => {
		let API = '';

		if (infoToGet === 'home') API += `home/polls?`;
		else if (infoToGet === 'group') API += `group/${$page.params.groupId}/poll/list?`;
		else if (infoToGet === 'delegate') API += `group/poll/pool/${delegate.pool_id}/votes`;
		// else if (infoToGet === 'user') API += `user/home?`;
		else if (infoToGet === 'user') API += `home/polls?`;
		//TODO remove public
		else if (infoToGet === 'public') API += `home/polls?public=true`;

    API += `&order_by=pinned`;
		if (filter.order_by) API += `,${filter.order_by}`;

		// API += `&limit=${pollThumbnailsLimit}`
		API += `&limit=${pollThumbnailsLimit}`;

		if (filter.search.length > 0) API += `&title__icontains=${filter.search}`;

		if (filter.finishedSelection !== 'all')
			API += `&end_date${
				filter.finishedSelection === 'finished' ? '__lt' : '__gt'
			}=${new Date().toISOString()}`;

		if (filter.tag) API += `&tag_id=${filter.tag}`;

		if (filter.workgroup) API += `&work_group_ids=${filter.workgroup}`;

		return API;
	};

	const getPolls = async () => {
		loading = true;
		polls = [];

		const { json, res } = await fetchRequest('GET', await getAPI());

		loading = false;

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not get polls', success: false });
			return;
		}

		polls = json?.results;
		next = json.next;
		prev = json.previous;
	};

	onMount(async () => {
		await getPolls();
	});
</script>

<div class={`${Class} dark:text-darkmodeText`}>
	<Loader bind:loading>
		<div class={`flex flex-col gap-6 w-full`} id="thumbnails">
			<PollFiltering
				tagFiltering={infoToGet === 'group'}
				handleSearch={async () => {
					await getPolls();
					// amendWithPinnedPolls();
					return {};
				}}
				bind:filter
			/>
			{#if polls.length === 0 && !loading}
				<div class="bg-white dark:bg-darkobject rounded shadow p-8 mt-6">
					{$_('No polls currently here')}
				</div>
			{:else}
				<!-- <h1 class="text-3xl text-left">Flow</h1> -->
				{#key polls}
					{#if polls && polls?.length > 0}
						{#each polls as poll}
							<PollThumbnail {poll} />
						{/each}
					{:else if !loading}
						<div class="bg-white rounded shadow p-8 dark:bg-darkobject">
							{$_('No polls currently here')}
						</div>
					{/if}
				{/key}
			{/if}
		</div>
		<Pagination
			bind:next
			bind:prev
			bind:iterable={polls}
			Class={'flex gap-2 justify-around w-full mt-6'}
		/>
	</Loader>
</div>

 
