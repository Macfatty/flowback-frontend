<script lang="ts">
	import { ProposalsApi } from '$lib/api/proposals';
	import Button from '$lib/Generic/Button.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import { DateInput } from 'date-picker-svelte';
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import DatePollSelection from '$lib/Generic/Schedules/DatePollSelection.svelte';
	import Comments from '$lib/Comments/Comments.svelte';
	import type { timeProposal } from './interface';

	let open = $state(false),
		date: Date | null = $state(null),
		proposals: timeProposal[] = $state([]);

	const pollId = $page.params.pollId;

	async function createProposal(date: Date) {
		const end_date = new Date(date);
		end_date.setHours(date.getHours() + 1);

		await ProposalsApi.createProposal(pollId ?? '', {
			start_date: date,
			end_date
		});
	}

	async function handleProposalSubmit() {
		if (date) await createProposal(date);
		open = false;
	}
</script>

<DatePollSelection bind:proposals x={7} y={24} />

<div
	class="p-6 bg-white dark:bg-darkbackground dark:text-darkmodeText w-[90%] lg:w-[70%] max-w-[1000px] shadow rounded my-6"
>
	<Comments api="poll" />
</div>

<Modal bind:open onSubmit={handleProposalSubmit}>
	<div slot="body" class="">
		<DateInput bind:value={date} />
	</div>
	<div slot="footer">
		<Button type="submit">{$_('Submit')}</Button>
	</div>
</Modal>
