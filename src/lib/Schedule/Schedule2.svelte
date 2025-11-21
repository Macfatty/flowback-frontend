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

	let open = $state(false),
		events: ScheduleItem2[] = $state([]),
		startDate = $state(new Date().toISOString().slice(0, 16)),
		endDate = $state(new Date().toISOString().slice(0, 16)),
		title = $state('');

	const userScheduleEventCreate = async () => {
		const { res, json } = await fetchRequest('POST', 'user/schedule/event/create', {
			title,
			start_date: startDate,
			end_date: endDate
		});
	};

	const userScheduleEventList = async () => {
		const { res, json } = await fetchRequest('GET', 'schedule/event/list?limit=50');
		events = json.results;
	};

	const userScheduleEventDelete = async () => {
		const { res, json } = await fetchRequest('POST', 'user/schedule/event/delete', {
			// event_id: events[0].id
		});
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
			select: function (selectionInfo) {
				console.log(selectionInfo);

				open = true;
				startDate = selectionInfo.start.toISOString().slice(0, 16);
				endDate = selectionInfo.end.toISOString().slice(0, 16);
			},
			dateClick: function (clickInfo) {
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
			events: events.map((e) => ({ start: e.start_date, end: e.end_date, title: e.title }))
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
			label: 'submit',
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
			<TextInput label="Title" bind:value={title} />
			<input type="datetime-local" bind:value={startDate} />
			<input type="datetime-local" bind:value={endDate} />
		</form>
	</div>
</Modal>
