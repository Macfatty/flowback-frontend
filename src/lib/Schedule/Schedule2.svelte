<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import { onMount } from 'svelte';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import { fetchRequest } from '$lib/FetchRequest';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import multiMonthPlugin from '@fullcalendar/multimonth';
	import interactionPlugin from '@fullcalendar/interaction';
	import Modal from '$lib/Generic/Modal.svelte';
	import type { ScheduleItem2 } from '$lib/Schedule/interface';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	let open = $state(false),
		events: ScheduleItem2[] = $state([]),
		selectedEvent: ScheduleItem2 = $state({
			id: 0,
			schedule_id: 0,
			title: '',
			description: '',
			start_date: new Date().toISOString().slice(0, 16),
			end_date: new Date().toISOString().slice(0, 16),
			active: true,
			meeting_link: '',
			repeat_frequency: 0,
			tag_id: 0,
			tag_name: '',
			origin_name: '',
			origin_id: 0,
			schedule_origin_name: '',
			schedule_origin_id: 0,
			assignees: [],
			reminders: [],
			user_tags: [],
			locked: true,
			subscribed: false
		});

	const userScheduleEventCreate = async () => {
		const { res, json } = await fetchRequest('POST', 'user/schedule/event/create', selectedEvent);
	};

	const userScheduleEventList = async () => {
		const { res, json } = await fetchRequest('GET', 'schedule/event/list?limit=50');
		events = json.results;
	};

	const userScheduleEventDelete = async (event_id: number) => {
		const { res, json } = await fetchRequest('POST', 'user/schedule/event/delete', {
			event_id
		});

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to Delete event', success: false });
			return;
		}

		events = events.filter((e) => e.id !== event_id);
		open = false;
	};

	// Read documentation for this calendar module: https://fullcalendar.io/
	const renderCalendar = () => {
		let calendarEl = document.getElementById('calendar-2');
		if (!calendarEl) return;
		let calendar = new Calendar(calendarEl, {
			plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, multiMonthPlugin],
			initialView: 'dayGridMonth',
			height: 'calc(100vh - 2rem - 40px - 28px)',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title, addEventButton',
				right: 'dayGridMonth, timeGridDay, listWeek, multiMonthYear, dayGridYear, timeGridWeek'
			},

			selectable: true,
			// selectMirror: true,
			select: (selectionInfo) => {
				open = true;
				selectedEvent.start_date = selectionInfo.start.toISOString().slice(0, 16);
				selectedEvent.end_date = selectionInfo.end.toISOString().slice(0, 16);
			},
			dateClick: (clickInfo) => {
				console.log(clickInfo);
			},
			customButtons: {
				addEventButton: {
					text: '+',
					click: () => {
						open = true;
					}
				}
			},
			events: events.map((e) => ({
				...e,
				start: e.start_date,
				end: e.end_date
			})),
			eventClick: (info) => {
				open = true;
				let _selectedEvent = events.find((e) => e.id.toString() === info.event.id);
				if (_selectedEvent) selectedEvent = _selectedEvent;
			},
			dayMaxEventRows: 3,
			eventInteractive: true
		});
		calendar.render();
	};

	onMount(async () => {
		await userScheduleEventList();
		renderCalendar();
	});

	$effect(() => {
		if (events) renderCalendar();
	});
</script>

<div class="flex justify-center h-[100vh] w-full">
	<div class="w-full" id="calendar-2"></div>
</div>

<Modal
	bind:open
	buttons={[
		{
			label: 'Submit',
			onClick: async () => {
				await userScheduleEventCreate();
				userScheduleEventList();
			},
			type: 'default'
		}
	]}
>
	<div slot="body">
		<form>
			<TextInput label="Title" bind:value={selectedEvent.title} />
			<input type="datetime-local" bind:value={selectedEvent.start_date} />
			<input type="datetime-local" bind:value={selectedEvent.end_date} />
			{selectedEvent.id}
			<button type="button" onclick={() => userScheduleEventDelete(selectedEvent.id)}>Delete</button
			>
		</form>
	</div>
</Modal>
