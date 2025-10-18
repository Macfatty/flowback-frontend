<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import Layout from '$lib/Generic/Layout.svelte';
	import Loader from '$lib/Generic/Loader.svelte';
	import GroupFiltering from '$lib/Group/GroupFiltering.svelte';
	import GroupThumbnail from '$lib/Group/GroupThumbnail.svelte';
	import type { Group, GroupFilter } from '$lib/Group/interface';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { groups as groupsLimit } from '$lib/Generic/APILimits.json';
	import { env } from '$env/dynamic/public';
	import { goto } from '$app/navigation';

	let groupList: Group[] = [],
		filter: GroupFilter = { joined: 'all', search: '' },
		loading = false,
		next = '';

	onMount(() => {
		if (env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE' && location.href.includes('/groups'))
			goto('/home');
		getGroups();
	});

	const getGroups = async () => {
		if (next !== '' && next !== null) {
			loading = true;
			const { res, json } = await fetchRequest('GET', next);

			loading = false;
			if (!res.ok) return;

			next = json.next;
			console.log(groupList, json.results);
			
			groupList = [...groupList, ...json.results];
		} else if (next === null) return;
		else {
			console.log('HERERE DOWN');

			let urlFilter = '';

			if (filter.joined === 'member') urlFilter += '&joined=true';
			else if (filter.joined === 'not-member') urlFilter += '&joined=false';

			urlFilter = `${urlFilter}&name__icontains=${filter.search}`;

			loading = true;
			const { res, json } = await fetchRequest(
				'GET',
				`group/list?limit=${groupsLimit}` + urlFilter
			);
			loading = false;

			if (!res.ok) return;

			next = json.next;
			groupList = json?.results
				.reverse()
				.sort((group1: any, group2: any) => +group2.joined - +group1.joined);
		}
	};

	const lazyLoading = async () => {
		let scrolledToBottom =
			document.body.scrollHeight - document.body.clientHeight <= document.body.scrollTop + 1;

		if (scrolledToBottom) getGroups();
	};
</script>

<svelte:body onscroll={() => lazyLoading()} />

<svelte:head>
	<title>Groups</title>
</svelte:head>

<Layout centered>
	<Loader bind:loading Class="w-full flex flex-col items-center">
		<div id="groups-list" class="max-w-[1000px] flex flex-col items-center mt-6 gap-6 mb-6 w-full">
			{#if !(env.PUBLIC_DISABLE_GROUP_CREATION === 'TRUE')}
				<Button href="creategroup" Class="w-[90%] md:w-[40%] rounded-2xl"
					>{$_('Create Group')}</Button
				>
			{/if}

			<GroupFiltering bind:filter {getGroups} />

			{#each groupList as group}
				<GroupThumbnail {group} />
			{/each}
		</div>
	</Loader>
</Layout>
