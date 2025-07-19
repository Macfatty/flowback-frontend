<!-- Event.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { _ } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import type { scheduledEvent } from '$lib/Schedule/interface';
	import { fetchRequest } from '$lib/FetchRequest';
	import { page } from '$app/stores';
	import CreateEventModal from './Modals/CreateEventModal.svelte';
	import EditEventModal from './Modals/EditEventModal.svelte';
	import ViewEventModal from './Modals/ViewEventModal.svelte';

	export let advancedTimeSettingsDates: Date[] = [],
		showCreateScheduleEvent = false,
		showEvent = false,
		showEditScheduleEvent = false,
		month: number,
		year: number,
		events: scheduledEvent[] = [],
		selectedEvent: scheduledEvent,
		workGroups: any[] = [],
		type: 'user' | 'group',
		scheduleEventCreate: (event: scheduledEvent) => Promise<void>,
		scheduleEventEdit: (event: scheduledEvent) => Promise<void>,
		scheduleEventDelete: (eventId: number) => Promise<void>;

	// Members list and selections
	let members: { id: number; name: string }[] = [],
		selectedMembers: number[] = [],
		selectedReminders: number[] = [],
		// Default to Daily
		selectedFrequency: number = 1,
		choicesOpenMembers = false,
		choicesOpenReminders = false;

	const groupId = $page.params.groupId || '1';

	onMount(async () => {
		const today = new Date();
		let tomorrow = new Date();
		tomorrow.setDate(today.getDate());
		advancedTimeSettingsDates = [today, tomorrow];
		if (type === 'group') {
			await fetchMembers();
		}
		window.addEventListener('click', handleOutsideClick);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('click', handleOutsideClick);
		restoreBackgroundScroll();
	});

	$: if (showEvent || showCreateScheduleEvent || showEditScheduleEvent) {
		preventBackgroundScroll();
	} else {
		restoreBackgroundScroll();
	}

	const firstDayInMonthWeekday = () => {
		return new Date(year, month, 0).getDay();
	};

	const getDay = (x: number, y: number) => {
		return -firstDayInMonthWeekday() + x + 7 * (y - 1);
	};

	// Frequency options
	let frequencyOptions = [
		{ id: 0, name: 'Once' },
		{ id: 1, name: 'Daily' },
		{ id: 2, name: 'Weekly' },
		{ id: 3, name: 'Monthly' },
		{ id: 4, name: 'Yearly' }
	];

	// Reminder options (in seconds)
	let reminderOptions = [
		{ id: 300, name: '5 minutes before' },
		{ id: 600, name: '10 minutes before' },
		{ id: 1800, name: '30 minutes before' },
		{ id: 3600, name: '1 hour before' },
		{ id: 86400, name: '1 day before' }
	];

	const getGroupUsers = async () => {
		let api = `group/${groupId}/users?limit=100`;
		const { json, res } = await fetchRequest('GET', api);
		if (!res.ok) return [];
		return json.results;
	};

	const fetchMembers = async () => {
		if (type === 'group') {
			const users = await getGroupUsers();
			members = users.map((user: any) => ({
				id: user.id,
				name: user.user?.username || `User ${user.id}`
			}));
		}
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (!browser) return;

		const modal = document.querySelector('.modal-content');
		const membersRegion = document.querySelector('.members-clickable-region');
		const remindersRegion = document.querySelector('.reminders-clickable-region');

		if (modal && !modal.contains(e.target as Node)) {
			choicesOpenMembers = false;
			choicesOpenReminders = false;
			return;
		}

		if (choicesOpenMembers && membersRegion && !membersRegion.contains(e.target as Node)) {
			choicesOpenMembers = false;
		}
		if (choicesOpenReminders && remindersRegion && !remindersRegion.contains(e.target as Node)) {
			choicesOpenReminders = false;
		}
	};

	const preventBackgroundScroll = () => {
		if (!browser) return;
		document.body.style.overflow = 'hidden';
	};

	const restoreBackgroundScroll = () => {
		if (!browser) return;
		document.body.style.overflow = '';
	};

	// Initialize values when opening modals
	const initializeModalValues = () => {
		if (showCreateScheduleEvent) {
			selectedFrequency = 1;
			selectedMembers = [];

		} else if (showEditScheduleEvent || showEvent) {
			selectedFrequency =
				selectedEvent.repeat_frequency &&
				frequencyOptions.some((opt) => opt.id === selectedEvent.repeat_frequency)
					? selectedEvent.repeat_frequency
					: 1;
			selectedMembers =
				selectedEvent.assignee_ids?.map((member: any) => {
					return member.id;
				}) || [];

		}
	};

	$: if (showCreateScheduleEvent || showEditScheduleEvent || showEvent) {
		initializeModalValues();
	}

	const handleSubmit = async () => {
		const updatedEvent = {
			...selectedEvent,
			assignee_ids: type === 'group' ? selectedMembers : undefined,
			reminders: selectedReminders,
			repeat_frequency: type === 'group' ? selectedFrequency : undefined,

		};

		try {
			if (showCreateScheduleEvent) {
				await scheduleEventCreate(selectedEvent);
				showCreateScheduleEvent = false;
			} else if (showEditScheduleEvent) {
				await scheduleEventEdit(selectedEvent);
				showEditScheduleEvent = false;
			}
		} catch (error) {
			console.error('Error submitting event:', error);
		}
	};
</script>

<!-- Modal 1: Create Event Modal -->
{#if showCreateScheduleEvent}
	<CreateEventModal
		bind:selectedEvent
		bind:showCreateScheduleEvent
		bind:selectedReminders
		on:submit={handleSubmit}
		{type}
		{workGroups}
		{members}
		{reminderOptions}
		{frequencyOptions}
	/>
{/if}
<!-- Modal 2: Edit Event Modal -->
{#if showEditScheduleEvent}
	<EditEventModal
		bind:selectedEvent
		bind:showEditScheduleEvent
		bind:showEvent
		bind:events
		{type}
		{workGroups}
		{reminderOptions}
		{frequencyOptions}
	/>
{/if}

<!-- Modal 3: View Event Modal -->
{#if showEvent}
	<ViewEventModal
		bind:selectedEvent
		bind:showEvent
		bind:showEditScheduleEvent
		on:delete={() => scheduleEventDelete(selectedEvent.event_id)}
		{type}
		{scheduleEventDelete}
	/>
{/if}
