<script lang="ts">
	import TextInput from '$lib/Generic/TextInput.svelte';
	import type { Filter } from './Kanban';
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { elipsis } from '$lib/Generic/GenericFunctions';
	import type { WorkGroup } from '../WorkingGroups/interface';
	import type { Group } from '$lib/Group/interface';
	import { fetchRequest } from '$lib/FetchRequest';
	import { groupMembers as groupMembersLimit } from '$lib/Generic/APILimits.json';
	import type { StatusMessageInfo } from '$lib/Generic/GenericFunctions';
	import { statusMessageFormatter } from '$lib/Generic/StatusMessage';
	import Select from '$lib/Generic/Select.svelte';

	export let filter: Filter,
		handleSearch: () => Promise<void>,
		Class = '',
		workGroups: WorkGroup[] = [];

	let searched = true;
	let groupList: Group[] = [],
		status: StatusMessageInfo,
		loading = false;

	const onGroupChange = async (id: string) => {
		filter.group = id;
		filter.workgroup = null;
		searched = false;
		await handleSearch();
	};

	const onWorkGroupChange = async (workGroupId: string) => {
		filter.workgroup = workGroupId ? Number(workGroupId) : null;
		searched = false;
		await handleSearch();
	};

	onMount(() => {
		getGroups();
	});

	const getGroups = async () => {
		loading = true;
		let urlFilter = '&joined=true';

		urlFilter = `${urlFilter}&name__icontains=${filter.search}`;

		const { res, json } = await fetchRequest(
			'GET',
			`group/list?limit=${groupMembersLimit}` + urlFilter
		);
		status = statusMessageFormatter(res, json);

		if (!res.ok) return;

		groupList = json?.results
			.reverse()
			.sort((group1: any, group2: any) => +group2.joined - +group1.joined);

		loading = false;
	};

	$: console.log(filter, 'TYPE');
</script>

<form
	class="bg-white dark:bg-darkobject dark:text-darkmodeText shadow rounded p-4 flex flex-col w-full gap-4 ${Class}"
	on:submit|preventDefault={async () => {
		searched = true;
		await handleSearch();
	}}
>
	<div class="w-full items-end gap-4">
		<TextInput
			Class="flex-1 h-full placeholder-gray-600 rounded text-gray-500 bg-gray-100 dark:bg-darkobject dark:text-darkmodeText"
			inputClass="placeholder-gray-600 text-gray-500 border-0 bg-gray-100 dark:bg-darkobject dark:text-darkmodeText"
			placeholder={$_('Search tasks')}
			on:change={async () => {
				searched = false;
				await handleSearch();
			}}
			label=""
			max={null}
			search={true}
			bind:value={filter.search}
		/>

		<Select
			labels={['home', 'group']}
			values={['home', 'group']}
			bind:value={filter.type}
			label="Select Type"
			disableFirstChoice
		/>

		{#if filter.type === 'group'}
			<div class="flex items-center justify-center gap-16 px-2 mt-2">
				<div class="flex flex-row flex-1 gap-2 items-center">
					<label class="block text-md whitespace-nowrap" for="group">
						{$_('Group')}:
					</label>
					
					<select
						style="width:100%"
						class="rounded p-1 dark:border-gray-600 dark:bg-darkobject text-gray-700 dark:text-darkmodeText font-semibold"
						on:change={(e) => onGroupChange(e?.target?.value)}
						id="group"
						bind:value={filter.group}
					>
						<option value={null}>{$_('None')}</option>
						{#each groupList as group}
							<option value={group.id.toString()}>{elipsis(group.name)}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-row flex-1 gap-2 items-center">
					<label class="block text-md whitespace-nowrap" for="work-group">
						{$_('Work Group')}:
					</label>
					<select
						style="width:100%"
						class="rounded p-1 dark:border-gray-600 dark:bg-darkobject text-gray-700 dark:text-darkmodeText font-semibold"
						on:change={(e) => onWorkGroupChange(e?.target?.value)}
						id="work-group"
					>
						<option value="">{$_('All')}</option>
						{#each workGroups as group}
							<option value={group.id}>{elipsis(group.name)}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}
	</div>
</form>
