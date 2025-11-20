<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import { onMount } from 'svelte';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import { fetchRequest } from '$lib/FetchRequest';

	const userScheduleEventCreate = async () => {
		const { res, json } = await fetchRequest('POST', 'user/schedule/event/create', {
			title: 'Hello',
			start_date: new Date().toISOString()
		});

		{
			const { res, json } = await fetchRequest('GET', 'schedule/event/list');
		}
	};

	const renderCalendar = () => {
		let calendarEl = document.getElementById('calendar-2');
		if (!calendarEl) return;
		let calendar = new Calendar(calendarEl, {
			initialView: 'dayGridMonth',
			plugins: [dayGridPlugin],
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth'
			}
		});
		calendar.render();
	};

	onMount(() => {
		renderCalendar();
		userScheduleEventCreate();
	});
</script>

<div class="flex justify-center">
	<div class="" id="calendar-2"></div>
</div>
