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
	import { groupStore, workgroupStore } from '$lib/Group/Kanban/Kanban';

	let open = $state(false),
		events: ScheduleItem2[] = $state([]),
		selectedEvent: ScheduleItem2 = $state(ScheduleItem2Default),
		//TODO get rid of groupid and use groupIds only
		groupId: null | number = $state(null),
		groupIds: number[] = $state([]),
		workgroupIds: number[] = $state([]),
		userChecked = $state(true),
		selectedWorkgroupId: number | null = $state(null),
		selectedGroupId: number | null = $state(null),
		calendar: Calendar;

	const scheduleEventList = async () => {
		let schedules: Schedule[] = [];
		// Before getting events, we need to get all schedules for the user, groups and workgroups
		// because events are tied to schedules.

		// Get user schedule
		if (userChecked) {
			let api = `schedule/list?limit=50&origin_name=user`;

			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results ?? []);
		}

		// Get group schedules
		if (groupIds.length > 0) {
			let api = `schedule/list?limit=50&`;
			api += `origin_ids=${groupIds.join(',')}&origin_name=group`;

			const { res, json } = await fetchRequest('GET', api);
			schedules.push(json.results ?? []);
		}

		// Get workgroup schedules
		if (workgroupIds.length > 0) {
			let api = `schedule/list?limit=50&origin_ids=${workgroupIds.join(',')}&origin_name=workgroup`;
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
			let api = `schedule/event/list?limit=50&schedule_ids=${schedules.map((s) => s.id).join(',')}`;
			const { res, json } = await fetchRequest('GET', api);

			events = json.results ?? [];
			events = events.map((e) =>
				e.schedule_origin_name === 'workgroup'
					? {
							...e,
							workgroup_id: e.schedule_origin_id
						}
					: e
			);

			// events = events.map((e) => ({
			// 	...e,
			// 	start_date: e.start_date.slice(0, 16),
			// 	end_date: e.end_date?.slice(0, 16)
			// }));
		}
	};

	const getAPI = (type = '') => {
		let api = '';
		if (selectedWorkgroupId !== null)
			api += `group/workgroup/${selectedWorkgroupId}/schedule/event/${type}`;
		else if (selectedGroupId !== null)
			api += `group/${selectedGroupId}/schedule/event/${type}`;
		else api += `user/schedule/event/${type}`;

		return api;
	};

	const scheduleEventCreate = async () => {
		let api = getAPI('create');

		const { res, json } = await fetchRequest('POST', api, {
			title: selectedEvent.title,
			description: selectedEvent.description,
			start_date: selectedEvent.start_date,
			end_date: selectedEvent.end_date,
			repeat_frequency: selectedEvent.repeat_frequency,
			meeting_link: selectedEvent.meeting_link
		});

		if (!res.ok) {
			//@ts-ignore
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

	const scheduleEventUpdate = async () => {
		let api = getAPI('update');

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

		// Scuffed solution to solve dates going on the wrong places when clicking and dragging
		// TODO: Find a better solution
		// scheduleEventList();
	};

	const ScheduleEventDelete = async (event_id: number) => {
		let api = getAPI('delete');

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

		ErrorHandlerStore.set({
			message: 'Successfully deleted event',
			success: true
		});

		events = events.filter((e) => e.id !== event_id);
		open = false;
		return;
	};

	// Read documentation for this calendar module: https://fullcalendar.io/
	const renderCalendar = () => {
		let calendarEl = document.getElementById('calendar-2');
		if (!calendarEl) return;

		calendar = new Calendar(calendarEl, {
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
			windowResize: () => {
				renderCalendar();
			},

			selectable: true,
			// selectMirror: true,
			select: (selectionInfo) => {
				open = true;
				selectedEvent = ScheduleItem2Default;
				selectedEvent.start_date = selectionInfo.start.toISOString();
				selectedEvent.end_date = selectionInfo.end.toISOString();
			},

			customButtons: {
				addEventButton: {
					text: '+',
					click: () => {
						open = true;
					}
				}
			},

			//@ts-ignore
			events: (() => {
				distributeEvents();
			})(),
			eventClick: (info) => {
				open = true;
				selectedEvent =
					events.find((e) => e.id.toString() === info.event.id) ??
					selectedEvent;
			},
			eventDrop: (info) => {
				selectedEvent =
					events.find((e) => e.id.toString() === info.event.id) ??
					selectedEvent;

				selectedEvent.start_date = info.event.start?.toISOString() ?? '';
				selectedEvent.end_date = info.event.end?.toISOString() ?? '';

				scheduleEventUpdate();
			},
			eventResize: (info) => {
				selectedEvent.title = info.event.title;
				selectedEvent.id = Number(info.event.id);
				selectedEvent.start_date = info.event.start?.toISOString() ?? '';
				selectedEvent.end_date = info.event.end?.toISOString() ?? '';
				scheduleEventUpdate();
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

	const distributeEvents = () => {
		let _events = [];

		events.forEach((event) => {
			// Daily Frequency
			if (event.repeat_frequency === 1) {
				for (let i = 1; i < 42; i++) {
					let date = new Date(
						new Date(event.start_date).setDate(
							new Date(event.start_date).getDate() + i
						)
					);

					_events.push({
						...event,
						start: date,
						end: date,
						allDay: true
					});
				}

				// Weekly Frequency
			} else if (event.repeat_frequency === 2) {
				for (let i = 0; i < 6; i++) {
					let date = new Date(
						new Date(event.start_date).setDate(
							new Date(event.start_date).getDate() + i * 7
						)
					);

					_events.push({
						...event,
						start: date,
						end: date,
						allDay: true
					});
				}
			} else
				_events.push({
					...event,
					start: event.start_date,
					end: event.end_date,
					allDay: true
				});
		});

		_events.push(
			events.map((event) => ({
				...event,
				start: event.start_date,
				end: event.end_date,
				allDay: true
			}))
		);

		return _events;
	};

	onMount(async () => {
		groupId =
			Number(new URLSearchParams(document.location.search).get('groupId')) ??
			null;
		if (groupId) groupIds.push(groupId);

		await scheduleEventList();
		renderCalendar();
	});

	$effect(() => {
		// Rerendering the calendar leads to issues with event changes changing the month one is one, instead we do this
		if (events) {
			calendar?.removeAllEvents();
			calendar?.addEventSource(distributeEvents());
		}
	});

	$effect(() => {
		if (groupIds || workgroupIds || userChecked) scheduleEventList();
	});
</script>

<AdvancedFiltering bind:groupIds bind:workgroupIds bind:userChecked />

<div class="flex justify-center w-full">
	<div class="w-full bg-white dark:bg-darkbackground" id="calendar-2"></div>
</div>

<!-- Modal for displaying, creating and editing schedule events -->
<Modal
	bind:open
	buttons={[
		{
			label: 'Submit',
			onClick: async () => {
				selectedEvent.schedule_id === 0
					? await scheduleEventCreate()
					: await scheduleEventUpdate();
				scheduleEventList();
				selectedEvent = ScheduleItem2Default;
				open = false;
			},
			type: 'default',
			submit: true
		},
		{
			label: 'Delete',
			onClick: () => ScheduleEventDelete(selectedEvent.id),
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
			{selectedEvent.start_date}
			<input type="datetime-local" bind:value={selectedEvent.start_date} />
			<input type="datetime-local" bind:value={selectedEvent.end_date} />
			<input type="number" bind:value={selectedEvent.repeat_frequency} />

			<!-- Select Groups -->
			<Select
				disableFirstChoice
				labels={[
					'user',
					...$groupStore.filter((g) => g.joined).map((g) => g.name)
				]}
				values={[null, ...$groupStore.filter((g) => g.joined).map((g) => g.id)]}
				bind:value={selectedGroupId}
				label="Group"
			/>

			<!-- Select Workgroups -->
			<Select
				disableFirstChoice
				labels={[
					'none',
					...$workgroupStore
						.filter(
							(w) =>
								w.joined &&
								$groupStore.find(
									(g) =>
										g.id === selectedGroupId && g.joined && g.id === w.group_id
								)
						)
						.map((w) => w.name)
				]}
				values={[
					null,
					...$workgroupStore
						.filter(
							(w) =>
								w.joined &&
								$groupStore.find(
									(g) =>
										g.id === selectedGroupId && g.joined && g.id === w.group_id
								)
						)
						.map((w) => w.id)
				]}
				bind:value={selectedWorkgroupId}
				label="WorkGroup"
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
