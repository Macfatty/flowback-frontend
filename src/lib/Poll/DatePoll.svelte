<script lang="ts">
	import { ProposalsApi } from '$lib/api/proposals';
	import Button from '$lib/Generic/Button.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import { DateInput } from 'date-picker-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import WeekView from '$lib/Generic/Schedules/WeekView.svelte';
	import Structure from './NewDesign/Structure.svelte';
	import Comments from '$lib/Comments/Comments.svelte';
	import type { timeProposal } from './interface';

	let open = false;
	let date: Date;
	let proposals: timeProposal[] = [];

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
		await createProposal(date);
		open = false;
	}

	onMount(async () => {});
</script>

<!-- <Structure Class="!max-w-[1400px]" poll={null}> -->
<!-- <div slot="left"> -->
<div>
	<WeekView bind:proposals x={7} y={24} />
</div>
<!-- </div> -->

<!-- <div slot="bottom">-->
<Comments api="poll" />
<!-- </div> -->
<!-- </Structure> -->

<Modal bind:open onSubmit={handleProposalSubmit}>
	<div slot="body" class="">
		<DateInput bind:value={date} />
	</div>
	<div slot="footer">
		<Button type="submit">{$_('Submit')}</Button>
	</div>
</Modal>
