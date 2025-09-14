<script lang="ts">
	import '../app.css';
	import { initializeLocalization } from '$lib/Localization/i18n';
	import Header from '$lib/Header/Header.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { groupUserPermissionStore, groupUserStore } from '$lib/Group/interface';
	import Chat from '$lib/Chat/Chat.svelte';
	import { _ } from 'svelte-i18n';
	import { env } from '$env/dynamic/public';
	import { fetchRequest } from '$lib/FetchRequest';
	import { workGroupsStore } from '$lib/Group/WorkingGroups/interface';
	import LogBackInModal from '$lib/Generic/LogBackInModal.svelte';
	import { userStore } from '$lib/User/interfaces';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	let showUI = false,
		scrolledY = '',
		openLoginModal = false,
		isBrowser = false,
		errorhandler: any;

	const shouldShowUI = () => {
		let pathname = window?.location?.pathname;

		if (pathname.includes('/login')) return false;
		else if (pathname === '/') return false;
		else if (window.localStorage.getItem('token') === undefined) return false;

		return true;
	};

	//TODO: Avoid code duplication and introduce group stores for storing group data.
	const getGrouplist = async () => {
		const { res, json } = await fetchRequest('GET', 'group/list');
		console.log(res, 'Group-List');

		if (!res.ok) return;
		else return json?.results;
	};

	const redirect = async () => {
		if (!isBrowser) return;

		const relativePath = window.location.pathname;

		let pathname = window?.location?.pathname;

		const sessionExpirationTime = window.localStorage.getItem('sessionExpirationTime');
		if (
			sessionExpirationTime &&
			!relativePath.includes('/login') &&
			sessionExpirationTime < new Date().getTime().toString()
		) {
			localStorage.removeItem('token');
			goto('/login');
		} else if (!window.localStorage.getItem('token') && !relativePath.includes('/login'))
			goto('/login');
		else if (
			//For one group flowback, if no group has been setup, redirect to create group.
			env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE' &&
			relativePath !== '/creategroup'
		) {
			const groups = await getGrouplist();
			if (groups.length === 0) goto('/creategroup');
		} else if (pathname === '/') goto('/home');
	};

	const getWorkingGroupList = async () => {
		if (!$page.params.groupId) return;
		const { res, json } = await fetchRequest(
			'GET',
			`group/${$page.params.groupId}/list?limit=100&order_by=name_asc`
		);

		if (!res.ok) return;

		workGroupsStore.set(json?.results);
	};

	const checkSessionExpiration = () => {
		const sessionExpiration = window.localStorage.getItem('sessionExpirationTime');
		if (!sessionExpiration) return;

		const expirationTime = Number(sessionExpiration);
		const currentTime = new Date().getTime();

		// Check if it will expire within next hour
		if (expirationTime > currentTime && expirationTime - currentTime < 3600000) {
			openLoginModal = true;
		}
	};

	const setUserGroupInfo = async () => {
		if (!$page.params.groupId) return;

		const { res, json } = await fetchRequest(
			'GET',
			`group/${$page.params.groupId}/users?user_id=${$userStore?.id || -1}`
		);

		if (!res.ok || json?.results.length === 0) {
			groupUserStore.set(null);
			history.back();
			return;
		}

		groupUserStore.set(json?.results[0]);
	};

	const setUserGroupPermissionInfo = async () => {
		if (!$page.params.groupId) return;

		if ($groupUserStore?.is_admin) {
			const permissionInfo = {
				allow_delegate: true,
				allow_vote: true,
				ban_members: true,
				create_kanban_task: true,
				create_poll: true,
				create_proposal: true,
				delete_kanban_task: true,
				delete_proposal: true,
				force_delete_comment: true,
				force_delete_poll: true,
				force_delete_proposal: true,
				id: 0,
				invite_user: true,
				kick_members: true,
				poll_fast_forward: true,
				poll_quorum: true,
				prediction_bet_create: true,
				prediction_bet_delete: true,
				prediction_bet_update: true,
				prediction_statement_create: true,
				prediction_statement_delete: true,
				role_name: 'Admin',
				send_group_email: true,
				update_kanban_task: true,
				update_proposal: true
			};

			groupUserPermissionStore.set(permissionInfo);
			return;
		}

		const { res, json } = await fetchRequest(
			'GET',
			`group/${$page.params.groupId}/permissions?id=${$groupUserStore?.permission_id}`
		);
		if (!res.ok) return;
		const permissionInfo = json?.results ? json?.results[0] : null;
		groupUserPermissionStore.set(permissionInfo);
	};

	const setUserInfo = async () => {
		const { json } = await fetchRequest('GET', 'user');
		userStore.set(json);
	};

	beforeNavigate(() => {
		scrolledY = $page.params.pollId;
	});

	$: if ($page.url.pathname && isBrowser) onPathChange();

	const onPathChange = async () => {
		redirect();
		getWorkingGroupList();
		showUI = shouldShowUI();

		setTimeout(() => {
			const html = document.getElementById(`poll-thumbnail-${scrolledY}`);
			html?.scrollIntoView();
		}, 200);

		checkSessionExpiration();
		setUserInfo();
		await setUserGroupInfo();
		setUserGroupPermissionInfo();
	};

	//Initialize Translation, which should happen before any lifecycle hooks.
	initializeLocalization();

	onMount(() => {
		isBrowser = true;
		getWorkingGroupList();
		showUI = shouldShowUI();
		redirect();

		setTimeout(() => {
			const html = document.getElementById(`poll-thumbnail-${scrolledY}`);
			html?.scrollIntoView();
		}, 200);

		checkSessionExpiration();

		ErrorHandlerStore.subscribe((_errorhandler) => {
			if (!_errorhandler) return;
			if (_errorhandler.message === '') return;

			errorhandler.addPopup({
				message: _errorhandler.message,
				success: _errorhandler.success
			});
		});
	});
</script>

<main class="min-h-[100vh]">
	{#if showUI}
		<Chat />
		<Header />
	{/if}

	<slot />
</main>
<div id="mobile-support">
	{$_('No support for mobile devices yet, try Flowback on a non-mobile device')}
</div>

<LogBackInModal bind:open={openLoginModal} />

<ErrorHandler bind:this={errorhandler} />

<style>
	#mobile-support {
		display: none;
	}

	@media (max-width: 716px) {
		main {
			display: none !important;
		}

		#mobile-support {
			display: block !important;
		}
	}
</style>
