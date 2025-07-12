<script>
	import { env } from '$env/dynamic/public';
	import Button from '$lib/Generic/Button.svelte';
	import Layout from '$lib/Generic/Layout.svelte';
	import Kanban from '$lib/Group/Kanban/KanbanBoard.svelte';
	import { _ } from 'svelte-i18n';
	import Fa from 'svelte-fa';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
</script>

<svelte:head>
	<title>My Kanban</title>
</svelte:head>

<!-- This is for the personal kanban page. <Kanban /> is also used in groups, so this file is not reduntant -->
<Layout centered>
	<div class="relative w-full">
		<Button
			onClick={() => history.back()}
			Class="absolute top-0 left-0 p-3 m-4 transition-all bg-gray-200 dark:bg-darkobject hover:brightness-95 active:brightness-90"
		>
			<div class="text-gray-800 dark:text-gray-200">
				<Fa icon={faArrowLeft} />
			</div>
		</Button>
		<div class="flex justify-center">
			<Kanban type={env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE' ? 'group' : 'group'} Class="w-[1000px]" />
		</div>
	</div>
</Layout>
