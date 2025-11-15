<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import { onMount } from 'svelte';
	import dayGridPlugin from '@fullcalendar/daygrid';

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
	});
</script>

<div class="flex justify-center">
	<div class="" id="calendar-2"></div>
</div>
