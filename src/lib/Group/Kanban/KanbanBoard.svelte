<script lang="ts">
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import KanbanEntry from './KanbanEntry.svelte';
	import { fetchRequest } from '$lib/FetchRequest';
	import { _ } from 'svelte-i18n';
	import type { GroupUser } from '../interface';
	import { onDestroy, onMount } from 'svelte';
	import { kanban as kanbanLimit } from '../../Generic/APILimits.json';
	import CreateKanbanEntry from './CreateKanbanEntry.svelte';
	import type { WorkGroup } from '../WorkingGroups/interface';
	import Fa from 'svelte-fa';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { kanban, Filter } from './Kanban';
	import { page } from '$app/stores';
	import AdvancedFiltering from '$lib/Generic/AdvancedFiltering.svelte';

	const tags = ['', 'Backlog', 'To do', 'Current', 'Evaluation', 'Done'];

	let { Class = '' } = $props();

	let kanbanEntries: kanban[] = $state([]),
		users: GroupUser[] = $state([]),
		interval: any,
		open = $state(false),
		filter: Filter = $state({
			group: $page.url.searchParams.get('groupId'),
			assignee: null,
			search: '',
			workgroup: null,
			type: $page.url.searchParams.get('groupId') ? 'group' : 'home'
		}),
		workGroups: WorkGroup[] = $state([]),
		lane: number = $state(1),
		groupIds: number[] = $state([]),
		workgroupIds: number[] = $state([]),
		userChecked = $state(false);

	const getKanbanEntries = async () => {
		filter.type === 'group' ? await getKanbanEntriesGroup() : getKanbanEntriesHome();
	};

	const getKanbanEntriesGroup = async () => {
		if (!filter.group) {
			kanbanEntries = [];
			return;
		}

		let api = `group/${filter.group}/kanban/entry/list?limit=${kanbanLimit}&order_by=priority_desc`;
		if (filter.assignee) api += `&assignee=${filter.assignee}`;
		if (filter.search !== '') api += `&title__icontains=${filter.search}`;
		if (filter.workgroup) api += `&work_group_ids=${filter.workgroup}`;

		const { res, json } = await fetchRequest('GET', api);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to fetch kanban tasks', success: false });
			return;
		}

		kanbanEntries = json.results;
	};

	const getKanbanEntriesHome = async () => {
		let api = `user/kanban/entry/list?limit=${kanbanLimit}&order_by=priority_desc`;
		if (filter.search !== '')
			api += `&title__icontains=${filter.search}&description__icontains=${filter.search}`;

		const { res, json } = await fetchRequest('GET', api);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to fetch kanban tasks', success: false });
			return;
		}

		kanbanEntries = json.results;
	};

	const getGroupUsers = async () => {
		let api = `group/${filter.group}/users?limit=${kanbanLimit}`;

		const { json, res } = await fetchRequest('GET', api);
		if (!res.ok) return;

		users = json?.results;
	};

	const getWorkGroupList = async () => {
		const { res, json } = await fetchRequest('GET', `group/${filter.group}/list`);

		if (!res.ok) return;
		workGroups = json?.results.filter((group: WorkGroup) => group.joined === true);

		workGroups.forEach((workgroup) => {
			workgroup.group_id = Number(filter.group);
		});
	};

	const removeKanbanEntry = (id: number) => {
		kanbanEntries.filter((entry) => entry.id !== id);
	};

	const getKanbanEntries2 = async () => {
		let kanbanEntries2 = [];

		if (userChecked) {
			let api = `user/kanban/entry/list?limit=${kanbanLimit}&order_by=priority_desc`;
			const { res, json } = await fetchRequest('GET', api);
			if (res.ok) {
				kanbanEntries2.push(json.results ?? []);
			}
		}

		if (groupIds.length > 0) {
			let apis = groupIds.map((id) =>
				fetchRequest(
					'GET',
					`group/${id}/kanban/entry/list?limit=${kanbanLimit}&order_by=priority_desc`
				)
			);
			let response = (await Promise.all(apis))
				.map(({ res, json }) => {
					if (res.ok) return json.results ?? [];
				})
				.flat(1);
			kanbanEntries2.push(response);
		}

		kanbanEntries = kanbanEntries2.flat(1);
	};

	onMount(async () => {
		await getKanbanEntries2();
		// assignee = $userStore?.id || -1;
		// await getKanbanEntries();
		// await getWorkGroupList();
		// await getGroupUsers();

		// interval = setInterval(async () => {
		// 	await getKanbanEntries();
		// }, 20410);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	$effect(() => {
		// filter.group && getWorkGroupList();
	});

	$effect(() => {
		// filter.group && getGroupUsers();
	});

	$effect(() => {
		// if (filter.type) getKanbanEntries();
	});

	$effect(() => {
		if (groupIds || workgroupIds || userChecked) getKanbanEntries2();
	});
</script>

<div
	id="kanban-board"
	class={'dark:bg-darkobject dark:text-darkmodeText p-2 pt-4 break-words' + Class}
>
	<AdvancedFiltering bind:groupIds bind:workgroupIds bind:userChecked />
	<!-- <KanbanFiltering bind:workGroups bind:filter handleSearch={getKanbanEntries} Class="" /> -->
	<div class="flex overflow-x-auto py-3">
		{#each tags as _tag, i}
			{#if i !== 0}
				<div
					id={`${_tag}-kanban-lane`}
					class="bg-white w-[15vw] max-w-[250px] p-2 m-1 dark:bg-darkbackground dark:text-darkmodeText border-gray-200 rounded shadow flex flex-col"
				>
					<div class="flex justify-between pb-3">
						<span class="xl:text-md md:text-sm p-1 font-medium">{$_(_tag)}</span>
						<button
							id={`${_tag}-add`}
							class="text-sm p-1"
							onclick={() => {
								open = true;
								lane = i;
							}}><Fa icon={faPlus} size="12px" /></button
						>
					</div>
					<ul class="flex flex-col gap-2 flex-grow overflow-y-auto">
						{#each kanbanEntries as kanban, j}
							{#if kanban.lane === i}
								{kanban.title}
								<KanbanEntry
									bind:kanban={kanbanEntries[j]}
									bind:workGroups
									bind:filter
									{users}
									{removeKanbanEntry}
									{getKanbanEntries}
								/>
							{/if}
						{/each}
					</ul>
					<div class="flex justify-between pt-4">
						<button
							class="text-sm flex items-center gap-2"
							onclick={() => {
								open = true;
								lane = i;
							}}
						>
							<span class="text-gray-600 dark:text-darkmodeText">+ {$_('Add a task')}</span>
						</button>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<CreateKanbanEntry
	groupId={filter.group || ''}
	bind:open
	bind:filter
	bind:kanbanEntries
	bind:users
	bind:workGroups
	bind:lane
	{getKanbanEntries}
/>
