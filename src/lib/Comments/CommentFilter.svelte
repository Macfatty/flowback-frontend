<script lang="ts">
	import Select from '$lib/Generic/Select.svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import type { proposal } from '$lib/Poll/interface';
	import { _ } from 'svelte-i18n';
	import { commentsStore } from './commentStore';

	export let sortBy: string | null = null,
		Class = '',
		searchString: string = '',
		proposals: proposal[] = [];

	let selectedProposal: string | null = null;

	const handleProposalChange = (proposalId: string | null) => {
		if (proposalId === null) {
			commentsStore.filterByProposal(null);
		} else {
			commentsStore.filterByProposal(proposals.find((p) => p.id === Number(proposalId)) || null);
		}
	};
</script>

<div class={Class}>
	<div class="">
		<TextInput
			label={''}
			search={true}
			max={null}
			Class="w-[100rem]"
			inputClass="placeholder-gray-600 pl-8 pr-6 text-gray-500 border-0 bg-gray-100 dark:bg-darkobject"
			bind:value={searchString}
			placeholder={$_('Search comments')}
		/>
	</div>

	<div class="w-auto max-w-xs flex flex-row items-center dark:text-darkmodeText">
		<p class="pr-2">{$_('Sort')}:</p>
		<Select
			innerLabel={null}
			values={[
				'created_at_asc',
				'created_at_desc',
				// 'total_replies_asc',
				// 'total_replies_desc',
				'score_asc',
				'score_desc',
				null
			]}
			bind:value={sortBy}
			labels={[$_('Recent'), $_('Oldest'), $_('Top'), $_('Controversial'), $_('Hot')]}
			Class="border-0 font-semibold"
		/>

		{#if proposals.length > 0}
			<Select
				onInput={(e) => handleProposalChange(e?.target?.value)}
				bind:value={selectedProposal}
				innerLabel={null}
				values={[null, ...proposals.map((proposal) => proposal.id)]}
				labels={[$_('All proposals'), ...proposals.map((proposal) => proposal.title)]}
				Class="border-0 font-semibold"
			/>
		{/if}
	</div>
</div>
