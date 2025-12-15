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
	import { ScheduleItem2Default, type Schedule, type ScheduleItem2 } from '$lib/Schedule/interface';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import TextArea from '$lib/Generic/TextArea.svelte';
	import NotificationOptions from '$lib/Generic/NotificationOptions.svelte';
	import { elipsis } from '$lib/Generic/GenericFunctions';
	import type { Group } from '$lib/Group/interface';
	import Button from '$lib/Generic/Button.svelte';
	import type { WorkGroup } from '$lib/Group/WorkingGroups/interface';

	let open = $state(false),
		openFilter = $state(false),
		events: ScheduleItem2[] = $state([]),
		selectedEvent: ScheduleItem2 = $state(ScheduleItem2Default),
		//TODO get rid of groupid and use groupIds only
		groupId: null | number = $state(null),
		groupIds: number[] = $state([]),
		groups: Group[] = $state([]),
		workgroupIds: number[] = $state([]),
		workgroups: WorkGroup[] = $state([]);

	const scheduleEventList = async () => {
		let api = `schedule/list?limit=50&`;
		if (groupIds.length > 0) api += `origin_ids=${groupIds.join(',')}&origin_name=group`;
		else api += `origin_name=user`;

		let schedules: Schedule[] = [];

		// Get group or user schedules
		{
			const { res, json } = await fetchRequest('GET', api);
			schedules = json.results ?? null;
		}

		// Get workgroup schedules
		{
			let api = `schedule/list?limit=50&origin_ids=${workgroupIds.join(',')}&origin_name=workgroup`;
			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results);
		}

		if (!schedules) {
			events = [];
			return;
		}

		let api2 = `schedule/event/list?limit=50&schedule_ids=${schedules.map((s) => s.id).join(',')}`;

		{
			const { res, json } = await fetchRequest('GET', api2);
			events = json.results;
		}
	};

	const scheduleEventCreate = async () => {
		let api =
			groupIds.length > 0
				? `group/${groupIds[0]}/schedule/event/create`
				: `user/schedule/event/create`;

		const { res, json } = await fetchRequest('POST', api, selectedEvent);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to create event', success: false });
			return;
		}
		ErrorHandlerStore.set({ message: 'Successfully created event', success: true });
	};

	const userScheduleEventEdit = async () => {
		let api = groupId ? `group/${groupId}/schedule/event/update` : `user/schedule/event/update`;
		const { res, json } = await fetchRequest('POST', api, {
			...selectedEvent,
			event_id: selectedEvent.id
		});

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to edit event', success: false });
			return;
		}

		ErrorHandlerStore.set({ message: 'Successfully edited event', success: true });
	};

	const userScheduleEventDelete = async (event_id: number) => {
		let api = groupId ? `group/${groupId}/schedule/event/delete` : `user/schedule/event/delete`;

		const { res, json } = await fetchRequest('POST', api, {
			event_id
		});

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to delete event', success: false });
			return;
		}

		events = events.filter((e) => e.id !== event_id);
		open = false;
	};

	const getGroups = async () => {
		// let urlFilter = 'joined=true';
		let urlFilter = '';
		// loading = true;
		const { res, json } = await fetchRequest('GET', `group/list?limit=50&${urlFilter}`);
		// loading = false;

		if (!res.ok) return;

		groups = json?.results;
	};

	const getWorkgroups = async () => {
		// Creates a list of promises to fetch workgroups for each groupId
		const workgroupsPromise = groups.map((g) => fetchRequest('GET', `group/${g.id}/list`));
		let hasError = false;

		console.log(workgroupsPromise, "PROMISE");
		
		// Fetches all workgroups concurrently and makes sure all events are in one neat array
		workgroups = (await Promise.all(workgroupsPromise))
			.map(({ res, json }) => {
				if (!res.ok) hasError = true;
				return json.results;
			})
			.flat(1);

		// If any of the workgroup fetches failed, we set an error message
		if (hasError)
			ErrorHandlerStore.set({ message: 'Failed to fetch atleast some workgroups', success: false });
	};

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
				left: 'prev,next today',
				center: 'title, addEventButton',
				right: 'dayGridMonth, timeGridDay, listWeek, multiMonthYear, dayGridYear, timeGridWeek'
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
			// @ts-ignore
			events: events.map((e) => ({
				...e,
				start: e.start_date,
				end: e.end_date,
				allDay: true
			})),
			eventClick: (info) => {
				open = true;
				selectedEvent = ScheduleItem2Default;
				let _selectedEvent = events.find((e) => e.id.toString() === info.event.id);
				if (_selectedEvent) selectedEvent = _selectedEvent;
				selectedEvent.start_date = info.event.start?.toLocaleString().slice(0, 16) ?? '';
				selectedEvent.end_date = info.event.end?.toLocaleString().slice(0, 16) ?? '';
			},
			eventDrop: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date = info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date = info.event.end?.toISOString().slice(0, 16) ?? '';
				userScheduleEventEdit();
			},
			eventResize: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date = info.event.start?.toISOString().slice(0, 16) ?? '';
				selectedEvent.end_date = info.event.end?.toISOString().slice(0, 16) ?? '';
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

	onMount(async () => {
		groupId = Number(new URLSearchParams(document.location.search).get('groupId')) ?? null;
		if (groupId) groupIds.push(groupId);

		scheduleEventList();

		await getGroups();
		getWorkgroups();
	});

	$effect(() => {
		if (events) renderCalendar();
	});

	$effect(() => {
		if (groupId) scheduleEventList();
	});

	$effect(() => {
		if (groupIds) scheduleEventList();
	});
</script>

<Modal bind:open={openFilter}>
	<div slot="body">
		{#each groups as group}
			<input
				type="checkbox"
				onchange={() => {
					if (groupIds.includes(group.id)) {
						groupIds = groupIds.filter((id) => id !== group.id);
					} else {
						groupIds = [...groupIds, group.id];
					}
				}}
				checked={groupIds.includes(group.id)}
			/>
			{group.name} <br />

			{#each workgroups.filter((wg) => wg.group_id === group.id) as workgroup}
				<input
					type="checkbox"
					onchange={() => {
						if (workgroupIds.includes(workgroup.id)) {
							workgroupIds = workgroupIds.filter((id) => id !== workgroup.id);
						} else {
							workgroupIds = [...workgroupIds, workgroup.id];
						}
					}}
					checked={workgroupIds.includes(workgroup.id)}
				/>
				{workgroup.name} <br />
			{/each}
		{/each}
	</div>
</Modal>

<Button onClick={() => (openFilter = true)}>Open Advanced Filter</Button>
<select
	style="width:100%"
	class="rounded p-1 dark:border-gray-600 dark:bg-darkobject text-gray-700 dark:text-darkmodeText font-semibold"
	onchange={(e) => {
		// @ts-ignore
		groupId = e?.target?.value;
	}}
	id="group"
>
	<option value={null}>{$_('None')}</option>
	{#each groups as group}
		<option value={group.id.toString()}>{elipsis(group.name)}</option>
	{/each}
</select>

<div class="flex justify-center w-full">
	<!-- <Select labels={groups}/> -->
	<div class="w-full bg-white dark:bg-darkbackground" id="calendar-2"></div>
</div>

<Modal
	bind:open
	buttons={[
		{
			label: 'Submit',
			onClick: async () => {
				selectedEvent.id === 0 ? await scheduleEventCreate() : await userScheduleEventEdit();
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
		<form>
			<TextInput label="Title" bind:value={selectedEvent.title} />
			<TextArea label="Description" bind:value={selectedEvent.description} />
			<input type="datetime-local" bind:value={selectedEvent.start_date} />
			<input type="datetime-local" bind:value={selectedEvent.end_date} />
			<input type="number" bind:value={selectedEvent.repeat_frequency} />
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
		</form>
	</div>
</Modal>
