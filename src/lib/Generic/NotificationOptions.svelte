<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
	import { faBellSlash } from '@fortawesome/free-solid-svg-icons/faBellSlash';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { _ } from 'svelte-i18n';
	import { darkModeStore } from '$lib/Generic/DarkMode';
	import { ErrorHandlerStore } from './ErrorHandlerStore';

	export let notificationOpen = false,
		categories: string[],
		type: 'poll' | 'group' | 'thread',
		labels: string[],
		api: string,
		id: number,
		Class = '',
		ClassOpen = '',
		hoverEffect = true;

	let notifications: NotificationObject[] = [],
		notificationsList: string[] = [];

	interface NotificationObject {
		channel_category: string;
		channel_sender_id: number;
		channel_sender_type: string;
	}

	const closeWindowWhenClickingOutside = () => {
		window.addEventListener('click', function (e) {
			if (
				notificationOpen &&
				//@ts-ignore
				![...document.getElementsByClassName(`notifications-clickable-region`)]?.find((element) =>
					//@ts-ignore
					element.contains(e.target)
				)
			) {
				notificationOpen = false;
			}
		});
	};

	const getNotifications = async () => {
		const { res, json } = await fetchRequest('GET', 'notification/subscription');
		// notifications = json?.results.filter(
		// 	(notificationObject: any) => notificationObject.channel_sender_id === id
		// );

		if (!res.ok) return;

		// notificationsList = json.results.map(
		// 	(notification: NotificationListObject) => notification.channel_name
		// );
	};

	const notificationSubscription = async (category: string, method: 'add' | 'remove' = 'add') => {
		method === 'add'
			? (notificationsList = [...notificationsList, category])
			: (notificationsList = notificationsList.filter((item) => item !== category));

		const { res, json } = await fetchRequest('POST', `${api}`, {
			tags: notificationsList
		});
		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to subscribe', success: false });
			return;
		}

		method === 'add'
			? notifications.push({
					channel_category: category,
					channel_sender_id: id,
					channel_sender_type: type
				})
			: (notifications = notifications.filter(
					(notification) => notification.channel_category !== category
				));

		ErrorHandlerStore.set({ message: 'Subscribed', success: true });

		notifications = notifications;
	};

	const subscribeToAll = async () => {
		const { res, json } = await fetchRequest('POST', `${api}`, {
			tags: categories
		});

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to subscribe to all', success: false });
			return;
		}

		ErrorHandlerStore.set({ message: 'Subscribed to all', success: true });

		notifications = categories.map((category) => ({
			channel_category: category,
			channel_sender_id: id,
			channel_sender_type: type
		}));
	};
	onMount(() => {
		closeWindowWhenClickingOutside();
		getNotifications();
	});

	$: if (notificationOpen) {
		getNotifications();
	}
</script>

<div class={`${Class} notifications-clickable-region`}>
	<button
		class={``}
		on:click={() => {
			notificationOpen = !notificationOpen;
		}}
		on:keydown
	>
		{#key darkModeStore}
			<Fa
				class={'hover:cursor-pointer hover:text-primary dark:text-secondary'}
				icon={faBell}
				size={'1.2x'}
			/>
		{/key}
	</button>

	{#if notificationOpen && categories}
		<div class={`z-40 absolute mt-2 bg-white dark:bg-darkobject shadow-xl text-sm ${ClassOpen}`}>
			<div class="text-xs p-2">{$_('Manage Subscriptions')}</div>
			<button on:click={subscribeToAll} class="text-xs p-2">{$_('Subscribe to All')}</button>
			{#each categories as category, i}
				<button
					class="bg-gray-200 dark:bg-gray-700 w-full p-2 px-5 flex justify-between items-center transition-all"
					class:active:bg-gray-400={hoverEffect}
					class:dark:active:bg-slate-700={hoverEffect}
					class:dark:active:bg-slate-900={hoverEffect}
					class:hover:bg-gray-300={hoverEffect}
					class:hover:cursor-pointer={hoverEffect}
					class:dark:hover:bg-slate-800={hoverEffect}
					class:!bg-white={notifications?.find(
						(notificationObject) => notificationObject.channel_category === category
					)}
					class:dark:!bg-slate-400={notifications?.find(
						(notificationObject) => notificationObject.channel_category === category
					)}
					on:click={() => {
						if (!notifications.find((object) => object.channel_category === category))
							notificationSubscription(category, 'add');
						else notificationSubscription(category, 'remove');
					}}
				>
					{$_(labels[i])}
					<Fa
						class=""
						color={notifications?.find(
							(notificationObject) => notificationObject.channel_category === category
						)
							? 'black'
							: 'white'}
						swapOpacity
						icon={notifications?.find(
							(notificationObject) => notificationObject.channel_category === category
						)
							? faBell
							: faBellSlash}
						size={'1.4x'}
					/>
				</button>
			{/each}
		</div>
	{/if}
</div>
