<script lang="ts">
	import type { options, scheduledEvent } from '../interface';
	import { _ } from 'svelte-i18n';
	import { fetchRequest } from '$lib/FetchRequest';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';
	import type { poppup } from '$lib/Generic/Poppup';
	import Loader from '$lib/Generic/Loader.svelte';
	import Modal from '$lib/Generic/Modal.svelte';

	export let showEditScheduleEvent = false,
		selectedEvent: scheduledEvent,
		editedEvent: scheduledEvent = { ...selectedEvent },
		workGroups: any[] = [],
		loading = false,
		type: 'user' | 'group',
		errorHandler: any,
		showEvent = false,
		events: scheduledEvent[] = [],
		frequencyOptions: options[] = [],
		reminderOptions: options[] = [];

	// Members list and selections
	let members: { id: number; name: string }[] = [],
		selectedMembers: number[] = [],
		selectedReminders: number[] = [],
		// Default to Daily
		selectedFrequency: number[] = [],
		choicesOpenMembers = false;

	const toggleSelection = (id: number, type: 'members' | 'reminders', event: Event) => {
		event.stopPropagation();
		if (type === 'members') {
			if (selectedMembers.includes(id)) {
				selectedMembers = selectedMembers.filter((s) => s !== id);
			} else {
				selectedMembers = [...selectedMembers, id];
			}
		} else if (type === 'reminders') {
			if (selectedReminders.includes(id)) {
				selectedReminders = selectedReminders.filter((s) => s !== id);
			} else {
				selectedReminders = [...selectedReminders, id];
			}
		}
	};

	const handleSubmit = async () => {
		loading = true;

		let toSend = {
			...editedEvent,
			repeat_frequency: selectedFrequency,
			event_id: editedEvent.event_id
		};

		if (toSend.meeting_link === '') delete toSend.meeting_link;

		if (toSend.description === '') delete toSend.description;

		const { res } = await fetchRequest('POST', `user/schedule/update`, toSend);

		loading = false;

		if (!res.ok) {
			errorHandler.addPopup({ message: 'Failed to update event', success: false });
			return;
		}

		errorHandler.addPopup({ message: 'Event successfully updated', success: true });

		showEditScheduleEvent = false;
		showEvent = true;
		events = events.map((event) => (event.event_id === editedEvent.event_id ? editedEvent : event));
		events = events;
		selectedEvent = { ...editedEvent };
	};
</script>

<!-- Modal 2: Edit Event Modal -->
{#if showEditScheduleEvent}
	<form on:submit|preventDefault={handleSubmit}>
		<Modal bind:open={showEditScheduleEvent} Class="max-w-[600px]">
			<div slot="body">
				<h2 class="text-xl mb-4 text-gray-900 dark:text-white">{$_('Edit Event')}</h2>
				<Loader bind:loading>
					<div class="mb-4">
						<label for="title" class="block mb-1 text-gray-700 dark:text-gray-300"
							>{$_('Title')}</label
						>
						<input
							id="title"
							type="text"
							bind:value={editedEvent.title}
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
							bind:value={editedEvent.description}
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
							bind:value={editedEvent.start_date}
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
							bind:value={editedEvent.end_date}
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
							bind:value={editedEvent.meeting_link}
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
								<option value={option.id}>{option.name}</option>
							{/each}
						</select>
					</div>
					<div class="mb-4">
						<label for="reminder" class="block mb-1 text-gray-700 dark:text-gray-300"
							>{$_('reminder')}</label
						>
						<select
							id="reminder"
							bind:value={selectedReminders}
							class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
							multiple
						>
							{#each reminderOptions as option}
								<option value={option.id}>{option.name}</option>
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
								bind:value={editedEvent.work_group}
								class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
								disabled
							>
								<option value={undefined}>None</option>
								{#each workGroups as group}
									<option value={group}>{group.name}</option>
								{/each}
							</select>
						</div>

						<div class="mb-4 members-clickable-region relative">
							<label for="assign_members" class="block mb-1 text-gray-700 dark:text-gray-300"
								>{$_('Assign Members')}</label
							>
							<button
								id="assign_members"
								type="button"
								class="w-full p-2 border rounded flex justify-between items-center text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
								on:click|stopPropagation={() => (choicesOpenMembers = !choicesOpenMembers)}
							>
								<span
									>{selectedMembers.length > 0
										? `${selectedMembers.length} selected`
										: 'Select members'}</span
								>
								<span>{choicesOpenMembers ? '▲' : '▼'}</span>
							</button>
							{#if choicesOpenMembers}
								<button
									class="absolute mt-2 bg-white dark:bg-darkobject shadow-xl text-sm w-full z-[90] border border-gray-300 dark:border-gray-600 rounded max-h-48 overflow-y-auto"
									on:click|stopPropagation
								>
									<div class="text-xs p-2 border-b border-gray-200 dark:border-gray-600">
										{$_('Select Members')}
									</div>
									{#each members as member}
										<button
											type="button"
											on:click|stopPropagation={(e) => toggleSelection(member.id, 'members', e)}
											class="w-full hover:bg-gray-300 active:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-800 dark:active:bg-slate-900 p-2 px-5 flex justify-between items-center hover:cursor-pointer transition-all"
											class:bg-secondary={selectedMembers.includes(member.id)}
											class:text-white={selectedMembers.includes(member.id)}
										>
											{member.name}
											<input
												type="checkbox"
												checked={selectedMembers.includes(member.id)}
												on:change|stopPropagation={(e) => toggleSelection(member.id, 'members', e)}
												class="ml-2"
											/>
										</button>
									{/each}
								</button>
							{/if}
						</div>
					{/if}
					<div class="flex justify-end gap-2">
						<button
							type="button"
							on:click={() => {
								showEvent = true;
								showEditScheduleEvent = false;
							}}
							class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
						>
							{$_('Cancel')}
						</button>
						<button
							type="submit"
							on:click={handleSubmit}
							class="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark"
							disabled={loading}
						>
							{$_('Update')}
						</button>
					</div>
				</Loader>
			</div>
		</Modal>
	</form>
{/if}
<ErrorHandler bind:this={errorHandler} />
