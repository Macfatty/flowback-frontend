<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import { fetchRequest } from '$lib/FetchRequest';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import multiMonthPlugin from '@fullcalendar/multimonth';
	import interactionPlugin from '@fullcalendar/interaction';
	import Modal from '$lib/Generic/Modal.svelte';
	import {
		ScheduleItem2Default,
		type Schedule,
		type ScheduleItem2
	} from '$lib/Schedule/interface';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import TextArea from '$lib/Generic/TextArea.svelte';
	import NotificationOptions from '$lib/Generic/NotificationOptions.svelte';
	import AdvancedFiltering from '$lib/Generic/AdvancedFiltering.svelte';
	import Select from '$lib/Generic/Select.svelte';
	import { groupStore } from '$lib/Group/Kanban/Kanban';

	let open = $state(false),
		events: ScheduleItem2[] = $state([]),
		selectedEvent: ScheduleItem2 = $state(ScheduleItem2Default),
		//TODO get rid of groupid and use groupIds only
		groupId: null | number = $state(null),
		groupIds: number[] = $state([]),
		workgroupIds: number[] = $state([]),
		userChecked = $state(true);

	const scheduleEventList = async () => {
		let schedules: Schedule[] = [];

		// Before getting events, we need to get all schedules for the user, groups and workgroups
		// because events are tied to schedules

		// Get user schedule
		if (userChecked) {
			let api = `schedule/list?limit=50&origin_name=user`;

			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results ?? []);
		}

		// Get group schedules
		if (groupIds.length > 0) {
			let api = `schedule/list?limit=50&`;
			api += `origin_ids=0,${groupIds.join(',')}&origin_name=group`;

			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results ?? []);
		}

		// Get workgroup schedules
		if (workgroupIds.length > 0) {
			let api = `schedule/list?limit=50&origin_ids=0,${workgroupIds.join(',')}&origin_name=workgroup`;
			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results ?? []);
		}

		if (schedules.length === 0) {
			events = [];
			return;
		}
		schedules = schedules.flat(1);

		// Finally, get the events from every schedule
		{
			let api = `schedule/event/list?limit=50&schedule_ids=0,${schedules.map((s) => s.id).join(',')}`;
			const { res, json } = await fetchRequest('GET', api);
			events = json.results ?? [];
		}
	};

	const scheduleEventCreate = async () => {
		let api =
			// 0 Is currently stand in for user, TODO: Change this so it's not scuffed
			selectedEvent.origin_id !== 0
				? `group/${selectedEvent.origin_id}/schedule/event/create`
				: `user/schedule/event/create`;

		const { res, json } = await fetchRequest('POST', api, selectedEvent);

		if (!res.ok) {
			if (res.status === 403) {
				ErrorHandlerStore.set({
					message: 'You do not have permission to create events for this group',
					success: false
				});
				return;
			}

			ErrorHandlerStore.set({
				message: 'Failed to create event',
				success: false
			});
			return;
		}

		ErrorHandlerStore.set({
			message: 'Successfully created event',
			success: true
		});
	};

	const userScheduleEventEdit = async () => {
		let api = groupId
			? `group/${groupId}/schedule/event/update`
			: `user/schedule/event/update`;
		const { res, json } = await fetchRequest('POST', api, {
			...selectedEvent,
			event_id: selectedEvent.id
		});

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Failed to edit event',
				success: false
			});
			return;
		}

		ErrorHandlerStore.set({
			message: 'Successfully edited event',
			success: true
		});
	};

	const userScheduleEventDelete = async (event_id: number) => {
		let api = groupId
			? `group/${groupId}/schedule/event/delete`
			: `user/schedule/event/delete`;

		const { res, json } = await fetchRequest('POST', api, {
			event_id
		});

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Failed to delete event',
				success: false
			});
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
			plugins: [
				dayGridPlugin,
				interactionPlugin,
				timeGridPlugin,
				listPlugin,
				multiMonthPlugin
			],
			initialView: 'dayGridMonth',
			// TODO: Rework the calculation so these calculations don't need to be rerun at header changes
			height: 'calc(100vh - 2rem - 40px - 28px)',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title, addEventButton',
				right:
					'dayGridMonth, timeGridDay, listWeek, multiMonthYear, dayGridYear, timeGridWeek'
			},

			selectable: true,
			// selectMirror: true,
			select: (selectionInfo) => {
				open = true;
				selectedEvent = ScheduleItem2Default;
				selectedEvent.start_date = selectionInfo.start
					.toISOString()
					.slice(0, 16);
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
			// @ts-ignore
			events: events.map((e) => ({
				...e,
				start: e.start_date,
				end: e.end_date,
				allDay: true
			})),
			eventClick: (info) => {
				open = true;
				// selectedEvent = ScheduleItem2Default;
				// let _selectedEvent = events.find(
				// 	(e) => e.id.toString() === info.event.id
				// );
				// if (_selectedEvent) selectedEvent = _selectedEvent;
				// selectedEvent.start_date =
				// 	info.event.start?.toLocaleString().slice(0, 16) ?? '';
				// selectedEvent.end_date =
				// 	info.event.end?.toLocaleString().slice(0, 16) ?? '';
			},
			eventDrop: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date =
					info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date =
					info.event.end?.toISOString().slice(0, 16) ?? '';
				userScheduleEventEdit();
			},
			eventResize: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date =
					info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date =
					info.event.end?.toISOString().slice(0, 16) ?? '';
				userScheduleEventEdit();
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
		groupId =
			Number(new URLSearchParams(document.location.search).get('groupId')) ??
			null;
		if (groupId) groupIds.push(groupId);

		scheduleEventList();
	});

	$effect(() => {
		if (events) renderCalendar();
	});

	$effect(() => {
		if (groupIds || workgroupIds || userChecked) scheduleEventList();
	});
</script>

<AdvancedFiltering bind:groupIds bind:workgroupIds bind:userChecked />

<div class="flex justify-center w-full">
	<div class="w-full bg-white dark:bg-darkbackground" id="calendar-2"></div>
</div>
<Modal
	bind:open
	buttons={[
		{
			label: 'Submit',
			onClick: async () => {
				selectedEvent.schedule_id === 0
					? await scheduleEventCreate()
					: await userScheduleEventEdit();
				scheduleEventList();
				selectedEvent = ScheduleItem2Default;
				open = false;
			},
			type: 'default',
			submit: true
		},
		{
			label: 'Delete',
			onClick: () => userScheduleEventDelete(selectedEvent.id),
			type: 'warning',
			class: selectedEvent.id ? 'visible' : 'invisible'
		}
	]}
	onClose={() => {
		selectedEvent = ScheduleItem2Default;
	}}
	stopAtPropagation={false}
>
	<div slot="body">
		<div role="form">
			<TextInput label="Title" bind:value={selectedEvent.title} />
			<TextArea label="Description" bind:value={selectedEvent.description} />
			<input type="datetime-local" bind:value={selectedEvent.start_date} />
			<input type="datetime-local" bind:value={selectedEvent.end_date} />
			<input type="number" bind:value={selectedEvent.repeat_frequency} />

			<Select
				labels={[
					'user',
					...$groupStore.filter((g) => g.joined).map((g) => g.name)
				]}
				values={[0, ...$groupStore.filter((g) => g.joined).map((g) => g.id)]}
				bind:value={selectedEvent.origin_id}
				label="Group"
			/>

			<TextInput label="Meeting Link" bind:value={selectedEvent.meeting_link} />
			<TextInput label="Tag" bind:value={selectedEvent.tag_name} />
			{selectedEvent.id}
			<NotificationOptions
				type="event"
				id={selectedEvent.id}
				api={`schedule/${selectedEvent.schedule_id}/event/subscribe`}
				labels={['subsc']}
				categories={['subsc']}
			/>
		</div>
	</div>
</Modal>
