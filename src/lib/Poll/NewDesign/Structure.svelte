<script lang="ts">
	import type { Phase, poll } from '../interface';
	import Timeline from './Timeline.svelte';

	export let poll: poll | null = null,
		Class = '',
		innerClassLeft = '',
		innerClassRight = '',
		phase: Phase = 'area_vote',
		resetScroll = false;

	// 'bg-white h-[490px] max-h-[490px] dark:bg-darkobject dark:text-darkmodeText p-4 rounded shadow-md',
	let genericStyle =
			'h-full bg-white dark:bg-darkobject dark:text-darkmodeText p-4 rounded shadow-md',
		right: HTMLDivElement | null = null;

	$: if (resetScroll) {
		right?.children[0].scrollTo(0, 0);
		right?.scrollTo(0, 0);
		resetScroll = false;
	}
</script>

<div
	class={`${Class} ${
		poll ? 'poll-grid' : 'poll-grid-no-timeline'
	} p-3 md:p-6 lg:p-12 max-w-[1200px] w-full gap-4 lg:gap-6`}
	id="poll-structure"
>
	{#if poll}
		<Timeline
			bind:phase
			bind:poll
			enableDetails={false}
			Class={'!absolute md:!relative left-4 md:left-0 h-[490px]'}
		/>
	{/if}

	{#if $$slots.left}
		<div class={`${genericStyle} ${innerClassLeft}`}>
			<slot name="left" class="h-full" />
		</div>
	{/if}

	{#if $$slots.right}
		<div bind:this={right} class={`${genericStyle} ${innerClassRight}`}>
			<slot name="right" class="h-full" />
		</div>
	{/if}

	{#if $$slots.bottom}
		<div class={`${genericStyle} overflow-auto bottom-grid h-fit`}>
			<slot name="bottom" />
		</div>
	{/if}
</div>

<style>
	@media (min-width: 768px) {
		.poll-grid {
			grid-template-columns: 0.1fr repeat(2, minmax(0, 1fr));
			grid-template-rows: repeat(3, minmax(0, 55vh));
			display: grid;
			max-height: 2000px;
		}

		.poll-grid-no-timeline {
			grid-template-columns: 1fr 1fr;
			display: grid;
		}

		.timeline-grid {
			grid-area: 1 / 1 / 3 / 1;
		}

		.bottom-grid {
			grid-area: 2 / 2 / 2 / 4;
		}
	}
</style>
