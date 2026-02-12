<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Loader from '$lib/Generic/Loader.svelte';
	import { page } from '$app/state';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import { _ } from 'svelte-i18n';
	import type { KPI, KPIEvaluation } from './interface';
	import { onMount } from 'svelte';
	import type { proposal } from '../interface';

	let loading = $state(false),
		kpis: KPI[] = $state([]),
		kpiEvaluations: KPIEvaluation[] = $state([]);

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

	const getKPIVoteList = async () => {
		loading = true;
		const { res, json } = await fetchRequest(
			'GET',
			`group/${page.params.groupId}/poll/proposal/kpi/vote/list`
		);

		loading = false;

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not get KPIs', success: false });
			return;
		}
		kpiEvaluations = json.results ?? [];
	};

	const evaluateKPI = async (kpi: KPI, value: number) => {
		loading = true;
		const { res, json } = await fetchRequest(
			'POST',
			`group/poll/proposal/${proposal.id}/kpi/vote`,
			{
				kpi_id: kpi.id,
				vote: value
			}
		);

		loading = false;

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Could not submit KPI evaluation',
				success: false
			});
			return;
		}
	};
	onMount(() => {
		getGroupKPIs();
		getKPIVoteList();
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
						{#each kpi.values as value}
							<div
								class="flex items-center gap-2 w-full group"
								class:bg-purple-500={kpiEvaluations.find(
									(e) => e.vote === value && e.vote === 1
								)}
							>
								<button
									onclick={() => evaluateKPI(kpi)}
									class="text-xs w-6 text-right dark:text-darkmodeText"
									>{value}</button
								>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Loader>
