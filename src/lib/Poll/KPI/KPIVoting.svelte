<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import { page } from '$app/state';
	import { _ } from 'svelte-i18n';
	import Loader from '$lib/Generic/Loader.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import type { proposal } from '$lib/Poll/interface';
	import type { KPI, KPIBetProposal } from './interface';
	import { onMount } from 'svelte';

	let kpis: KPI[] = $state([]),
		loading = $state(false),
		kpiProbabilities: KPIBetProposal[] = $state([]);

	let { proposal }: { proposal: proposal } = $props();

	// TODO: Move into poll and just pass it into here.
	const getGroupKPIs = async () => {
		loading = true;
		const { res, json } = await fetchRequest(
			'GET',
			`group/${page.params.groupId}/kpi/list`
		);

		loading = false;

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not get KPIs', success: false });
			return;
		}

		kpis = json ?? [];
	};

	const getProposalKPIs = async () => {
		loading = true;
		const { res, json } = await fetchRequest(
			'GET',
			// TODO: Make this more efficient with a bulk endpoint
			`group/${page.params.groupId}/poll/proposal/kpi/bet/list?proposal_ids=${proposal.id}`
		);

		loading = false;

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not get KPIs', success: false });
			return;
		}

		kpiProbabilities = json.results ?? [];
	};

	const editProposalKPI = async (kpi: KPI, value: number, index: number) => {
		const { res } = await fetchRequest(
			'POST',
			`group/poll/proposal/${proposal.id}/kpi/bet`,
			{
				kpi_id: kpi.id,
				values: kpi.values,
				weights: kpiProbabilities.map((prob) =>
					prob.value === kpi.values[index] ? value : prob.weight
				)
			}
		);

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Could not submit KPI vote',
				success: false
			});
			return;
		}

		getProposalKPIs();
	};

	onMount(() => {
		getGroupKPIs();
		getProposalKPIs();
	});
</script>

<Loader bind:loading>
	{#if kpis.length > 0}
		<div class="flex flex-col gap-4">
			<span class="text-lg font-semibold text-primary dark:text-secondary">
				{$_('KPIs')}
			</span>
			{#each kpis as kpi}
				<div class="flex flex-col gap-1">
					<span class="font-medium text-sm dark:text-darkmodeText"
						>{kpi.name}</span
					>
					{#if kpi.description}
						<span class="text-xs text-gray-500">{kpi.description}</span>
					{/if}

					<div class="flex flex-col gap-1 mt-1">
						{#each kpi.values as value, i}
							<div class="flex items-center gap-2 w-full group">
								<span class="text-xs w-6 text-right dark:text-darkmodeText"
									>{value}</span
								>
								<button
									aria-label="Set KPI probability"
									onclick={(e) => {
										// Gets the position of the click relative to the button and converts it to a percentage, which will be the new weight for the KPI value.
										const rect = e.currentTarget.getBoundingClientRect();
										const xWithinElement = e.clientX - rect.left;
										const fraction = Math.floor(
											(xWithinElement / rect.width) * 100
										);
										editProposalKPI(kpi, fraction, i);
									}}
									class="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative"
								>
									<div
										class="bg-purple-400 h-full rounded transition-all duration-200"
										style="width: {kpiProbabilities.find(
											(_kpi) => _kpi.value === value
										)?.weight ?? 0}%"
									></div>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Loader>
