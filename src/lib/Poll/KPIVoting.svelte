<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import { page } from '$app/state';
	import { _ } from 'svelte-i18n';
	import Loader from '$lib/Generic/Loader.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import type { proposal } from './interface';

	interface KPI {
		id: number;
		name: string;
		description: string;
		active: boolean;
		values: number[];
	}

	interface KPIVote {
		kpi_id: number;
		values: number[];
		weights: number[];
	}

	let kpis: KPI[] = $state([]),
		votes: Map<number, number | null> = $state(new Map()),
		loading = $state(false);

	let { proposal }: { proposal: proposal } = $props();

	const getKPIs = async () => {
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

	const selectValue = async (kpi: KPI, value: number) => {
		const current = votes.get(kpi.id);
		const newValue = current === value ? null : value;
		votes.set(kpi.id, newValue);
		votes = new Map(votes);

		const { res } = await fetchRequest(
			'POST',
			`group/poll/proposal/${proposal.id}/kpi/bet`,
			{ value: newValue, kpi_id: kpi.id }
		);

		if (!res.ok) {
			ErrorHandlerStore.set({
				message: 'Could not submit KPI vote',
				success: false
			});
			votes.set(kpi.id, current ?? null);
			votes = new Map(votes);
		}
	};

	const getBarWidth = (kpi: KPI, value: number) => {
		const max = Math.max(...kpi.values);
		if (max === 0) return 0;
		return (value / max) * 100;
	};

	getKPIs();
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
							{@const selected = votes.get(kpi.id) === value}
							<button
								class="flex items-center gap-2 w-full group cursor-pointer"
								onclick={() => selectValue(kpi, value)}
							>
								<span class="text-xs w-6 text-right dark:text-darkmodeText"
									>{value}</span
								>
								<div
									class="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative"
								>
									<div
										class="h-full rounded transition-all duration-200"
										class:bg-purple-400={!selected}
										class:bg-purple-600={selected}
										style="width: {getBarWidth(kpi, 2)}%"
									/>
									{#if selected}
										<div
											class="absolute inset-0 border-2 border-purple-600 rounded"
										/>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Loader>
