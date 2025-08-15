<script lang="ts">
	import { formatDate } from '$lib/Generic/DateFormatter';
	import Modal from '$lib/Generic/Modal.svelte';
	import type { scheduledEvent } from '../interface';
	import { _ } from 'svelte-i18n';

	export let showEvent = false,
		showEditScheduleEvent = false,
		selectedEvent: scheduledEvent,
		type: 'user' | 'group',
		scheduleEventDelete: (eventId: number) => Promise<void>;

	// Members list and selections
	let members: { id: number; name: string }[] = [];
</script>

{#if showEvent}
	<Modal
		bind:open={showEvent}
		Class="max-w-[600px]"
		buttons={[
			{
				label: $_('Delete'),
				onClick: () => scheduleEventDelete(selectedEvent.event_id),
				type: 'warning'
			},
			{
				label: $_('Edit'),
				onClick: () => {
					showEvent = false;
					showEditScheduleEvent = true;
				},
				type: 'primary'
			},
			{
				label: $_('Close'),
				onClick: () => (showEvent = false),
				type: 'default'
			}
		]}
	>
		>
		<div slot="body">
			<h2 class="text-xl mb-4 text-gray-900 dark:text-white">{selectedEvent.title}</h2>
			<p>
				<strong class="text-gray-700 dark:text-gray-300">{$_('Description')}:</strong>
				{selectedEvent.description || 'N/A'}
			</p>
			<p>
				<strong class="text-gray-700 dark:text-gray-300">{$_('Start')}:</strong>
				{formatDate(selectedEvent.start_date)}
			</p>
			<p>
				<strong class="text-gray-700 dark:text-gray-300">{$_('End')}:</strong>
				{formatDate(selectedEvent.end_date)}
			</p>
			{#if selectedEvent.meeting_link}
				<p>
					<strong class="text-gray-700 dark:text-gray-300">{$_('Meeting Link')}:</strong>
					<a
						href={selectedEvent.meeting_link}
						target="_blank"
						class="text-blue-500 dark:text-blue-300">{selectedEvent.meeting_link}</a
					>
				</p>
			{/if}
			{#if type === 'group'}
				<!-- {#if selectedEvent.repeat_frequency !== undefined}
					<p>
						<strong class="text-gray-700 dark:text-gray-300">{$_('Frequency')}:</strong>
						{frequencyOptions.find((opt) => opt.id === selectedEvent.repeat_frequency)?.name ||
							'N/A'}
					</p>
				{/if} -->
				{#if selectedEvent.assignee_ids?.length}
					<p>
						<strong class="text-gray-700 dark:text-gray-300">{$_('Assigned Members')}:</strong>
						{selectedEvent.assignee_ids
							.map((id) => members.find((m) => m.id === id)?.name || `User ${id}`)
							.join(', ')}
					</p>
				{/if}
				<!-- {#if selectedEvent.reminders?.length}
					<p>
						<strong class="text-gray-700 dark:text-gray-300">{$_('Reminders')}:</strong>
						{selectedEvent.reminders
							.map((time) => reminderOptions.find((r) => r.id === time)?.name || `${time} seconds`)
							.join(', ')}
					</p>
				{/if} -->
			{/if}

			{#if selectedEvent.reminders?.length}
				<p>
					<strong class="text-gray-700 dark:text-gray-300">{$_('Reminders')}:</strong>
					{selectedEvent.reminders.map((time) => `${time} seconds`).join(', ')}
				</p>
			{/if}
		</div>
	</Modal>
{/if}
