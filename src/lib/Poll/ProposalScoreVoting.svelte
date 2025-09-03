<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { fetchRequest } from '$lib/FetchRequest';
	import type { Comment, Phase, proposal } from '$lib/Poll/interface';
	import Proposal from './Proposal.svelte';
	import { proposals as proposalsLimit } from '../Generic/APILimits.json';
	import { onMount } from 'svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import VotingSlider from './VotingSlider.svelte';
	import { groupUserStore, groupUserPermissionStore } from '$lib/Group/interface';
	import Button from '$lib/Generic/Button.svelte';

	export let proposals: proposal[],
		selectedProposal: proposal | null = null,
		phase: Phase,
		proposalsToPredictionMarket: proposal[] = [],
		Class = '',
		comments: Comment[];

	let voting: { score: number; proposal: number }[] = [],
		needsReload = 0,
		errorHandler: any,
		commentFilterProposalId: number | null = null,
		delegateVoting: { score: number; proposal: number; raw_score: number }[] = [],
		style: 'purple' | 'gray' = 'purple';

	onMount(async () => {
		await getProposals();

		voting = proposals.map((proposal) => ({
			score: 0,
			proposal: proposal.id
		}));

		console.log(voting, 'voting');

		if (phase === 'delegate_vote' || phase === 'vote' || phase === 'result') {
			await getDelegateVotes();
		}

		if (phase === 'vote' || phase === 'result') {
			await getVotes();
		}

		needsReload++;
	});

	const getProposals = async () => {
		const { res, json } = await fetchRequest(
			'GET',
			`group/poll/${$page.params.pollId}/proposals?limit=${proposalsLimit}`
		);

		if (!res.ok) return;

		proposals = json?.results;
	};

	const getVotes = async () => {
		const { json, res } = await fetchRequest(
			'GET',
			`group/poll/${$page.params.pollId}/proposal/votes?limit=${proposalsLimit}`
		);

		if (!res.ok) return;

		if (json.results.length === 0) return;

		voting = voting.map((vote) => ({
			score: (vote.score = json?.results?.find(
				(score: { score: number; proposal: number }) => score.proposal === vote.proposal
			).raw_score),
			proposal: vote.proposal
		}));
		voting = voting;
	};

	const getDelegateVotes = async () => {
		const { res, json } = await fetchRequest(
			'GET',
			`group/poll/pool/votes?group_id=${$page.params.groupId}&poll_id=${$page.params.pollId}`
		);

		if (!res.ok) {
			console.error('Error fetching votes:', json.detail);
			return;
		}

		delegateVoting = json?.results[0]?.vote.map((vote: any) => ({
			score: vote.raw_score,
			proposal: vote.proposal_id
		}));

		// voting = delegateVoting;
	};

	const delegateVote = async () => {
		const { json, res } = await fetchRequest(
			`POST`,
			`group/poll/${$page.params.pollId}/proposal/vote/delegate/update`,
			{
				proposals: voting?.map((vote) => vote.proposal),
				scores: voting?.map((vote) => vote.score)
			}
		);

		if (!res.ok) {
			if (json?.detail[0] === 'groupuserdelegatepool does not exist')
				ErrorHandlerStore.set({
					message: 'You cannot vote on this poll since you are not a delegate',
					success: false
				});
			else
				ErrorHandlerStore.set({
					message: 'Vote Failed',
					success: false
				});
			return;
		}
		ErrorHandlerStore.set({
			message: 'Successfully voted',
			success: true
		});
	};

	const vote = async () => {
		const { res, json } = await fetchRequest(
			`POST`,
			`group/poll/${$page.params.pollId}/proposal/vote/update`,
			{
				proposals: voting?.map((vote) => vote.proposal),
				scores: voting?.map((vote) => vote.score)
			}
		);

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Vote Failed',
				success: false
			});
			return;
		}

		ErrorHandlerStore.set({
			message: 'Successfully voted',
			success: true
		});
	};

	const changingVote = (score: number | string, proposalId: number) => {
		console.log(voting, 'voting');

		if (!voting) return;
		const i = voting?.findIndex((vote) => vote.proposal === proposalId);
		voting[i].score = Number(score);
		voting = voting;
	};

	const getScore = (proposal: proposal) => {
		if (phase === 'delegate_vote') {
			return delegateVoting?.find((vote) => vote.proposal === proposal.id)?.score;
		} else if (phase === 'vote') {
			return voting?.find((vote) => vote.proposal === proposal.id)?.score;
		}
	};
</script>

<div class={`box-border ${Class}`}>
	<div class="mt-4 h-[100%]">
		{#if proposals}
			{#key needsReload}
				{#each proposals as proposal}
					<div class="border-b-2 border-gray-300 select-none">
						<Proposal
							bind:proposalsToPredictionMarket
							bind:commentFilterProposalId
							bind:selectedProposal
							bind:filteredComments={comments}
							bind:phase
							{proposal}
						>
							{#if phase === 'delegate_vote' || phase === 'vote'}
								{@const score = getScore(proposal)}

								{#key voting}
									<VotingSlider
										bind:phase
										onSelection={(pos) => {
											console.log(pos);

											//@ts-ignore
											changingVote(pos, proposal.id);
											if (phase === 'delegate_vote') delegateVote();
											else if (phase === 'vote') vote();
										}}
										disabled={(phase === 'delegate_vote' &&
											$groupUserStore?.delegate_pool_id === null) ||
											(phase === 'vote' && !$groupUserPermissionStore?.allow_vote)}
										{score}
										delegateScore={delegateVoting?.find((vote) => vote.proposal === proposal.id)
											?.raw_score}
										style={(() => {
											if (phase === 'vote' && voting === delegateVoting) return 'gray';
											else return 'purple';
										})()}
									/>
								{/key}
							{/if}
							{#if phase === 'vote'}
								<Button
									onClick={() => {
										const dVote = delegateVoting.find((vote) => vote.proposal === proposal.id);
										if (dVote) changingVote(dVote.score, dVote.proposal);
										vote();
									}}>{$_('Reset to delegate votes')}</Button
								>
							{/if}
						</Proposal>
					</div>
				{/each}
			{/key}
		{/if}
	</div>
</div>

 
