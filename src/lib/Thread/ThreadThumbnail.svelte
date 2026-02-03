<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import ChatIcon from '$lib/assets/Chat_fill.svg';
	import { page } from '$app/state';
	import NotificationOptions from '$lib/Generic/NotificationOptions.svelte';
	import Fa from 'svelte-fa';
	import {
		faThumbTack,
		faGlobe,
		faLock
	} from '@fortawesome/free-solid-svg-icons';
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
	import DefaultBanner from '$lib/assets/default_banner_group.png';
	import { onThumbnailError } from '$lib/Generic/GenericFunctions';
	import { env } from '$env/dynamic/public';
	import PostThumbnail from '$lib/Generic/PostThumbnail.svelte';

	export let thread: Thread;

	let reportModalShow = false,
		deleteModalShow = false,
		choicesOpen = false,
		darkMode: boolean = false;

	//When adminn presses the pin tack symbol, pin the thread
	const pinThread = async (_thread: Thread) => {
		const { json, res } = await fetchRequest(
			'POST',
			`group/thread/${_thread?.id}/update`,
			{
				pinned: !_thread?.pinned
			}
		);
		if (!res.ok) return;

		_thread.pinned = !_thread?.pinned;
		thread = { ..._thread };
	};

	onMount(() => {
		darkModeStore.subscribe((dark) => (darkMode = dark));
	});
</script>

<PostThumbnail post={thread}>
	<ThreadVoting bind:thread />
</PostThumbnail>
