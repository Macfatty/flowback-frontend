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

	let open = $state(false),
		startDate = $state(new Date().toISOString().slice(0, 16)),
		endDate = $state(new Date().toISOString().slice(0, 16));

	const userScheduleEventCreate = async () => {
		// const { res, json } = await fetchRequest('POST', 'user/schedule/event/create', {
		// 	title: 'Hello',
		// 	start_date: new Date().toISOString()
		// });

		{
			const { res, json } = await fetchRequest('GET', 'schedule/event/list');
		}
	};

	const renderCalendar = () => {
		let calendarEl = document.getElementById('calendar-2');
		if (!calendarEl) return;
		let calendar = new Calendar(calendarEl, {
			plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, multiMonthPlugin],
			initialView: 'dayGridMonth',
			height: 'calc(100vh - 2rem - 40px - 28px)',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth, timeGridDay, listWeek, multiMonthYear, dayGridYear, timeGridWeek'
			},

			selectable: true,
			selectMirror: true, // optional: shows a “mirror” placeholder during drag
			select: function (selectionInfo) {
				console.log(selectionInfo);

				open = true;
				startDate = selectionInfo.start.toISOString().slice(0, 16);
				endDate = selectionInfo.end.toISOString().slice(0, 16);
				// selectionInfo.start, selectionInfo.end, selectionInfo.allDay
				// your logic to prompt for a title and then call calendar.addEvent(...)
			},
			dateClick: function (clickInfo) {
				console.log(clickInfo);
				// clickInfo.date, clickInfo.allDay, etc.
				// alternate logic if you just want a click
			}
		});
		calendar.render();
	};

	onMount(() => {
		renderCalendar();
		userScheduleEventCreate();
	});
</script>

<div class="flex justify-center h-[100vh] w-full">
	<div class="w-full" id="calendar-2"></div>
</div>

<Modal bind:open>
	<div slot="body">
		<form>
			<input type="datetime-local" bind:value={startDate} />
			<input type="datetime-local" bind:value={endDate} />
		</form>
	</div>
</Modal>
