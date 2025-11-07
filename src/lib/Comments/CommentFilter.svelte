<script lang="ts">
	import Select from '$lib/Generic/Select.svelte';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import type { Comment, proposal } from '$lib/Poll/interface';
	import { _ } from 'svelte-i18n';
	import { commentsStore } from './commentStore';
	import Modal from '$lib/Generic/Modal.svelte';
	import Button from '$lib/Generic/Button.svelte';
	import { fetchRequest } from '$lib/FetchRequest';
	import { page } from '$app/stores';

	export let sortBy: string | null = null,
		Class = '',
		searchString: string = '',
		proposals: proposal[] = [];

	let selectedProposals: number[] = [],
		displayProposalsModal = false;

	const filterByTags = async () => {
		let loading = true;
		let toKeep: Comment[] = [];
		const tags = proposals.map((p) => `#${p.title.replaceAll(' ', '-')}`);

		for (const comment of $commentsStore.allComments) {
			const { res, json } = await fetchRequest(
				'GET',
				`group/poll/${$page.params.pollId}/comment/${comment.id}/ancestor`
			);

			if (!res.ok) return;

			const ancestors: Comment[] = json.results;

			if (
				ancestors.find((_comment: Comment) => tags.some((tag) => _comment.message?.includes(tag)))
			)
				toKeep = [...toKeep, ...ancestors];
			console.log(toKeep);
		}
		// Filter Duplicates
		toKeep = toKeep.filter(
			(comment, index, self) => index === self.findIndex((c) => c.id === comment.id)
		);

		commentsStore.updates(toKeep);
		loading = false;
	};

	$: (async () => {
		// if (selectedProposals) await filterByTags();
	})();

	$: if (selectedProposals.length === 0) commentsStore.filterByProposal(null);
	else {
		const _proposals = proposals.filter((p) => selectedProposals.includes(p.id));
		commentsStore.filterByProposals(_proposals, 'or');
	}
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

		{#if proposals?.length > 0}
			<Button onClick={() => (displayProposalsModal = true)} Class="ml-2"
				>{$_('Filter by Proposal')}</Button
			>
		{/if}
	</div>
</div>

{#if proposals}
	<Modal bind:open={displayProposalsModal}>
		<div slot="body">
			<!-- Being able to select arbitrary numbers of proposals to filter on -->
			{#each proposals as proposal}
				<div class="flex items-center gap-2 mt-4">
					<input
						type="checkbox"
						name="proposals"
						id={`${proposal.id}`}
						value={proposal.id}
						bind:group={selectedProposals}
					/>
					<label class="text-left" for={`proposal-${proposal.id}`}>{proposal.title}</label>
				</div>
			{/each}
		</div>
	</Modal>
{/if}
