<script lang="ts">
	import { Calendar, type EventInput } from '@fullcalendar/core';
	import { onMount } from 'svelte';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import multiMonthPlugin from '@fullcalendar/multimonth';
	import interactionPlugin from '@fullcalendar/interaction';
	import { ScheduleItem2Default, type ScheduleItem2 } from '$lib/Schedule/interface';

	let { times = $bindable() } = $props();

	let open = $state(false),
		events: EventInput[] = $state([]),
		selectedEvent: ScheduleItem2 = $state(ScheduleItem2Default);

	// Read documentation for this calendar module: https://fullcalendar.io/
	const renderCalendar = () => {
		let calendarEl = document.getElementById('calendar-2');
		if (!calendarEl) return;
		let calendar = new Calendar(calendarEl, {
			plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, multiMonthPlugin],
			initialView: 'dayGridMonth',
			//TODO: Rework the calculation so these calculations don't need to be rerun at header changes
			height: 'calc(100vh - 2rem - 40px - 28px)',
			headerToolbar: {
				left: 'prev next today',
				center: 'title',
				right: ''
			},

			selectable: true,
			// selectMirror: true,
			select: (selectionInfo) => {
				open = true;
				selectedEvent = ScheduleItem2Default;
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
			events,
			eventDrop: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date = info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date = info.event.end?.toISOString().slice(0, 16) ?? '';
			},
			eventOverlap: true,
			eventResize: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date = info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date = info.event.end?.toISOString().slice(0, 16) ?? '';
			},
			eventConstraint: {
				start: new Date()
			},
			dayMaxEventRows: 3,
			eventInteractive: true,
			eventClassNames: 'cursor-pointer',
			editable: true,
			eventStartEditable: true,
			eventResizableFromStart: true,
			eventDurationEditable: true
		});
		calendar.render();
	};

	onMount(() => {
		times.forEach((time: number) => {
			events.push({
				allDay: true,
				start: time
			});
		});
		renderCalendar();
	});

	$effect(() => {
		if (events) renderCalendar();
	});
</script>

<div class="flex justify-center h-[100vh] w-full">
	<div class="w-full" id="calendar-2"></div>
</div>
