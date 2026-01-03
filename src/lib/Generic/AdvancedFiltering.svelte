<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { fetchRequest } from '$lib/FetchRequest';
	import Modal from '$lib/Generic/Modal.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import type { Group } from '$lib/Group/interface';
	import Button from '$lib/Generic/Button.svelte';
	import type { WorkGroup } from '$lib/Group/WorkingGroups/interface';
	import { onMount } from 'svelte';
	import { groupStore, workgroupStore } from '$lib/Group/Kanban/Kanban';

	interface Props {
		groupIds: number[];
		workgroupIds: number[];
		userChecked: boolean;
	}

	let {
		groupIds = $bindable(),
		workgroupIds = $bindable(),
		userChecked = $bindable()
	}: Props = $props();

	let openFilter = $state(false),
		groups: Group[] = $state([]),
		workgroups: WorkGroup[] = $state([]);

	const getGroups = async () => {
		// let urlFilter = 'joined=true';
		let urlFilter = '';
		// loading = true;
		const { res, json } = await fetchRequest('GET', `group/list?limit=50&${urlFilter}`);
		// loading = false;

		if (!res.ok) return;

		groups = json?.results;
		groupStore.set(groups);
	};

	const getWorkgroups = async () => {
		// Creates a list of promises to fetch workgroups for each groupId
		const workgroupsPromise = groups.map((g) => fetchRequest('GET', `group/${g.id}/list`));
		let hasError = false;

		// Fetches all workgroups concurrently and makes sure all events are in one neat array
		workgroups = (await Promise.all(workgroupsPromise))
			.map(({ res, json }) => {
				if (!res.ok) hasError = true;
				return json.results;
			})
			.flat(1);

		// If any of the workgroup fetches failed, we set an error message
		if (hasError)
			ErrorHandlerStore.set({ message: 'Failed to fetch atleast some workgroups', success: false });

		workgroupStore.set(workgroups);
	};

	onMount(async () => {
		await getGroups();
		await getWorkgroups();
	});
</script>

<Modal bind:open={openFilter}>
	<div slot="body">
		<input type="checkbox" bind:checked={userChecked} /> User Schedule <br />
		{#each groups as group}
			<input
				type="checkbox"
				onchange={() => {
					if (groupIds.includes(group.id)) {
						groupIds = groupIds.filter((id) => id !== group.id);
					} else {
						groupIds = [...groupIds, group.id];
					}
				}}
				checked={groupIds.includes(group.id)}
			/>
			{group.name} <br />

			{#each workgroups.filter((wg) => wg.group_id === group.id) as workgroup}
				<input
					type="checkbox"
					onchange={() => {
						if (workgroupIds.includes(workgroup.id)) {
							workgroupIds = workgroupIds.filter((id) => id !== workgroup.id);
						} else {
							workgroupIds = [...workgroupIds, workgroup.id];
						}
					}}
					checked={workgroupIds.includes(workgroup.id)}
				/>
				{workgroup.name} <br />
			{/each}
		{/each}
	</div>
</Modal>

<Button onClick={() => (openFilter = true)}>Open Advanced Filter</Button>
