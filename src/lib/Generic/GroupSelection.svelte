<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Select from '$lib/Generic/Select.svelte';
	import { groupStore, workgroupStore } from '$lib/Group/Kanban/Kanban';

	let {
		selectedWorkgroupId = $bindable(null),
		selectedGroupId = $bindable(null)
	}: { selectedWorkgroupId: Number | null; selectedGroupId: Number | null } =
		$props();
</script>

<!-- Select Groups -->
<Select
	disableFirstChoice
	labels={['user', ...$groupStore.filter((g) => g.joined).map((g) => g.name)]}
	values={[null, ...$groupStore.filter((g) => g.joined).map((g) => g.id)]}
	bind:value={selectedGroupId}
	label="Group"
/>

<!-- Select Workgroups -->
<Select
	disableFirstChoice
	labels={[
		'none',
		...$workgroupStore
			.filter(
				(w) =>
					w.joined &&
					$groupStore.find(
						(g) => g.id === selectedGroupId && g.joined && g.id === w.group_id
					)
			)
			.map((w) => w.name)
	]}
	values={[
		null,
		...$workgroupStore
			.filter(
				(w) =>
					w.joined &&
					$groupStore.find(
						(g) => g.id === selectedGroupId && g.joined && g.id === w.group_id
					)
			)
			.map((w) => w.id)
	]}
	bind:value={selectedWorkgroupId}
	label="WorkGroup"
/>
