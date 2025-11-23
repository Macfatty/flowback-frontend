<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { maxDatePickerYear } from '$lib/Generic/DateFormatter';
	import type { template } from './interface';
	import RadioButtons2 from '$lib/Generic/RadioButtons2.svelte';
	import { formatDateToLocalTime } from '$lib/Generic/GenericFunctions';
	import AdvancedCalendarSelector from './AdvancedCalendarSelector.svelte';
	import Fa from 'svelte-fa';
	import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';

	let { times = $bindable() } = $props();

	let calendarView = $state('0'),
		templateCounter = $state(0), // Add counter
		showAdvancedTimeSettings = $state(false),
		daysBetweenPhases = $state(2);

	const handleSelectTemplate = (template: template) => {
		const now = new Date().getTime();
		// start_date = new Date();
		// start_date.setHours(0, 0, 0, 0);
		// area_vote_end_date = new Date(now + template.area_vote_time_delta);
		// proposal_end_date = new Date(area_vote_end_date.getTime() + template.proposal_time_delta);
		// prediction_statement_end_date = new Date(
		// 	proposal_end_date.getTime() + template.prediction_statement_time_delta
		// );
		// prediction_bet_end_date = new Date(
		// 	prediction_statement_end_date.getTime() + template.prediction_bet_time_delta
		// );
		// delegate_vote_end_date = new Date(
		// 	prediction_bet_end_date.getTime() + template.delegate_vote_time_delta
		// );
		// vote_end_date = new Date(delegate_vote_end_date.getTime() + template.vote_time_delta);
		// end_date = new Date(vote_end_date.getTime() + template.end_time_delta);

		// templateCounter++; // Increment counter
	};

	const changeDaysBetweenPhases = (days: number | string) => {
		days = Number(days);
		times[0] = new Date();
		times[0].setHours(0, 0, 0, 0);
		//Time incrementer
		const inc = new Date();

		if (daysBetweenPhases === 0) {
			//For debug purposes this puts one second delay between each phase. Useful for playwright testing.
			times.forEach((_: Date, i: number) => {
				if (i !== 0) times[i] = new Date(inc.setSeconds(inc.getSeconds() + 1));
			});
		} else {
			//For users to select over multiple days
			times.forEach((_: Date, i: number) => {
				if (i !== 0) times[i] = new Date(inc.setDate(inc.getDate() + days));
			});
		}
	};

	onMount(() => {
		changeDaysBetweenPhases(2);
	});

	$inspect(times)
</script>

<div class="flex justify-between">
	<h2>{$_('Days between phases')}:</h2>
	<input
		type="number"
		class="dark:bg-darkbackground show-buttons-all-times text-right"
		bind:value={daysBetweenPhases}
		oninput={(e) => changeDaysBetweenPhases(e.target?.value)}
		min="0"
		max="1000"
	/>
</div>

<button
	class="w-full flex justify-center items-center border-t-2"
	type="button"
	onclick={() => (showAdvancedTimeSettings = !showAdvancedTimeSettings)}
>
	<Fa icon={faChevronDown} rotate={showAdvancedTimeSettings ? 180 : 0} />
	{#if !showAdvancedTimeSettings}
		<p>{$_('Display advanced time settings')}</p>
	{:else}
		<p>{$_('Hide advanced time settings')}</p>
	{/if}
</button>

<div class:hidden={!showAdvancedTimeSettings}>
	<RadioButtons2
		name="advancedTimeSettingChoice"
		bind:value={calendarView}
		values={['0', '1']}
		labels={['List', 'Calendar']}
	/>
	{#if calendarView === '1'}
		{#key [daysBetweenPhases, templateCounter]}
			<AdvancedCalendarSelector bind:times />
		{/key}
	{:else if calendarView === '0'}
		<div class="grid grid-cols-2 gap-6 justify-center">
			{#each times as time, i}
				<div>
					<span class="mt-4">{$_('Poll start')}</span>
					<input
						id="start_date"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(time).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						oninput={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) times[i] = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(start_date).slice(0, 16);
						}}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
<!-- {#if selected_poll === 'Text Poll'}
	<TimelineTemplate
		area_vote_time_delta={area_vote_end_date.getTime() - start_date.getTime()}
		proposal_time_delta={proposal_end_date.getTime() - area_vote_end_date.getTime()}
		prediction_statement_time_delta={prediction_statement_end_date.getTime() -
			proposal_end_date.getTime()}
		prediction_bet_time_delta={prediction_bet_end_date.getTime() -
			prediction_statement_end_date.getTime()}
		delegate_vote_time_delta={delegate_vote_end_date.getTime() - prediction_bet_end_date.getTime()}
		vote_time_delta={vote_end_date.getTime() - delegate_vote_end_date.getTime()}
		end_time_delta={end_date.getTime() - vote_end_date.getTime()}
		poll_type={selected_poll === 'Text Poll' ? 4 : 3}
		{handleSelectTemplate}
	/>
{/if}  -->
