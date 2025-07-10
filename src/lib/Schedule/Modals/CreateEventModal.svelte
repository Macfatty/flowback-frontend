<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { createEventDispatcher } from 'svelte';
	import type { options, scheduledEvent } from '../interface';
	import type { GroupMembers } from '$lib/Chat/interfaces';

	export let showCreateScheduleEvent = false,
		selectedEvent: scheduledEvent,
		workGroups: any[] = [],
		loading = false,
		type: 'user' | 'group',
		members: { id: number; name: string }[] = [],
		frequencyOptions: options[] = [],
		reminderOptions: options[] = [];

	// Members list and selections
	let selectedMembers: number[] = [],
		selectedReminders: number[] = [],
		// Default to Daily
		selectedFrequency: number = 0,
		choicesOpenMembers = false,
		choicesOpenReminders = false;

	const dispatch = createEventDispatcher();

	const toggleSelection = (id: number, type: 'members' | 'reminders', event: Event) => {
		// ...existing code for toggling selection...
	};

	const handleSubmit = () => {
		selectedEvent = {
			...selectedEvent,
			assignee_ids: type === 'group' ? selectedMembers : undefined,
			reminders: type === 'group' ? selectedReminders : undefined,
			repeat_frequency: type === 'group' ? selectedFrequency : undefined
		};
		dispatch('submit');
	};

	const handleMemberSelect = (event: Event) => {
		const select = event.target as HTMLSelectElement;
		selectedMembers = Array.from(select.selectedOptions).map((option) => Number(option.value));
	};
</script>

<!-- Modal 1: Create Event Modal -->
{#if showCreateScheduleEvent}
	<button
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		on:click={() => (showCreateScheduleEvent = false)}
	>
		<button
			class="bg-white dark:bg-darkobject p-6 rounded-lg w-full max-w-md overflow-y-auto max-h-[90vh] modal-content"
			on:click|stopPropagation
		>
			<h2 class="text-xl mb-4 text-gray-900 dark:text-white">{$_('Create Event')}</h2>
			<form on:submit|preventDefault={handleSubmit}>
				<div class="mb-4">
					<label for="title" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Title')}</label
					>
					<input
						id="title"
						type="text"
						bind:value={selectedEvent.title}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="description" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Description')}</label
					>
					<textarea
						id="description"
						bind:value={selectedEvent.description}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					/>
				</div>
				<div class="mb-4">
					<label for="start_date" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Start Date')}</label
					>
					<input
						id="start_date"
						type="datetime-local"
						bind:value={selectedEvent.start_date}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="end_date" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('End Date')}</label
					>
					<input
						id="end_date"
						type="datetime-local"
						bind:value={selectedEvent.end_date}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="meeting_link" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Meeting Link')}</label
					>
					<input
						id="meeting_link"
						type="url"
						bind:value={selectedEvent.meeting_link}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					/>
				</div>

				<div class="mb-4">
					<label for="frequency" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Frequency')}</label
					>
					<select
						id="frequency"
						bind:value={selectedFrequency}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					>
						{#each frequencyOptions as option}
							<option value={option.id}>{$_(option.name)}</option>
						{/each}
					</select>
				</div>

				<div class="mb-4">
					<label for="reminder" class="block mb-1 text-gray-700 dark:text-gray-300"
						>{$_('Reminder')}</label
					>
					<select
						id="reminder"
						bind:value={selectedReminders}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					>
						{#each reminderOptions as option}
							<option value={option.id}>{$_(option.name)}</option>
						{/each}
					</select>
				</div>

				{#if type === 'group'}
					<div class="mb-4">
						<label for="work_group" class="block mb-1 text-gray-700 dark:text-gray-300"
							>{$_('Work Group')}</label
						>
						<select
							id="work_group"
							bind:value={selectedEvent.work_group}
							class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						>
							<option value={undefined}>{$_('None')}</option>
							{#each workGroups as group}
								<option value={group}>{group.name}</option>
							{/each}
						</select>
					</div>

					<div class="mb-4 members-clickable-region relative">
						<label for="assign_members" class="block mb-1 text-gray-700 dark:text-gray-300"
							>{$_('Assign Members')}</label
						>
						<select
							id="assign_members"
							on:change={handleMemberSelect}
							class="w-full p-2 border rounded flex justify-between items-center text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						>
							{#each members as member}
								<option value={member.id} selected={selectedMembers.includes(member.id)}>
									{member.name}
								</option>
							{/each}
						</select>
					</div>
				{/if}
				<div class="flex justify-end gap-2">
					<button
						type="button"
						on:click={() => (showCreateScheduleEvent = false)}
						class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
					>
						{$_('Cancel')}
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark"
						disabled={loading}
					>
						{$_('Create')}
					</button>
				</div>
			</form>
		</button>
	</button>
{/if}
