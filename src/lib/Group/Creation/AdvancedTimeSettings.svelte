<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { maxDatePickerYear } from '$lib/Generic/DateFormatter';
	import TimelineTemplate from './TimelineTemplate.svelte';
	import type { pollType, template } from './interface';
	import MonthView from '$lib/Generic/Schedules/MonthView.svelte';
	import RadioButtons2 from '$lib/Generic/RadioButtons2.svelte';
	import { formatDateToLocalTime } from '$lib/Generic/GenericFunctions';

	export let selected_poll: pollType,
		start_date = new Date(),
		area_vote_end_date = new Date(),
		proposal_end_date = new Date(),
		prediction_statement_end_date = new Date(),
		prediction_bet_end_date = new Date(),
		delegate_vote_end_date = new Date(),
		vote_end_date = new Date(),
		end_date = new Date(),
		daysBetweenPhases = 1;

	let calendarView = '0',
		templateCounter = 0; // Add counter

	$: console.log(start_date);

	// This might look tautologous (exluded middle) but the code says that whenever "daysBetweenPhases" changes, the dates are updated.
	$: (daysBetweenPhases || !daysBetweenPhases) && changeDaysBetweenPhases();

	const handleSelectTemplate = (template: template) => {
		const now = new Date().getTime();
		start_date = new Date();
		start_date.setHours(0, 0, 0, 0);
		area_vote_end_date = new Date(now + template.area_vote_time_delta);
		proposal_end_date = new Date(area_vote_end_date.getTime() + template.proposal_time_delta);
		prediction_statement_end_date = new Date(
			proposal_end_date.getTime() + template.prediction_statement_time_delta
		);
		prediction_bet_end_date = new Date(
			prediction_statement_end_date.getTime() + template.prediction_bet_time_delta
		);
		delegate_vote_end_date = new Date(
			prediction_bet_end_date.getTime() + template.delegate_vote_time_delta
		);
		vote_end_date = new Date(delegate_vote_end_date.getTime() + template.vote_time_delta);
		end_date = new Date(vote_end_date.getTime() + template.end_time_delta);

		templateCounter++; // Increment counter
	};

	const changeDaysBetweenPhases = () => {
		start_date = new Date();
		start_date.setHours(0, 0, 0, 0);
		//Time incrementer
		const inc = new Date();

		if (selected_poll === 'Text Poll')
			if (daysBetweenPhases === 0) {
				//For debug purposes this puts one minute delay between each phase.
				area_vote_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				proposal_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				prediction_statement_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				prediction_bet_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				delegate_vote_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				vote_end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
				end_date = new Date(inc.setSeconds(inc.getSeconds() + 1));
			} else {
				//For users to select over multiple days
				area_vote_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				proposal_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				prediction_statement_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				prediction_bet_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				delegate_vote_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				vote_end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
				end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
			}
		else if (selected_poll === 'Date Poll') {
			if (daysBetweenPhases === 0) {
				area_vote_end_date = inc;
				proposal_end_date = inc;
				prediction_statement_end_date = inc;
				prediction_bet_end_date = inc;
				delegate_vote_end_date = inc;
				vote_end_date = inc;
				end_date = new Date(inc.setMinutes(inc.getMinutes() + 1));
			} else {
				area_vote_end_date = inc;
				proposal_end_date = inc;
				prediction_statement_end_date = inc;
				prediction_bet_end_date = inc;
				delegate_vote_end_date = inc;
				vote_end_date = inc;
				end_date = new Date(inc.setDate(inc.getDate() + daysBetweenPhases));
			}
		}
	};
</script>

<div>
	<RadioButtons2
		name="advancedTimeSettingChoice"
		bind:value={calendarView}
		values={['0', '1']}
		labels={['List', 'Calendar']}
	/>
	{#if calendarView === '1'}
		{#key [daysBetweenPhases, templateCounter]}
			<MonthView
				bind:start_date
				bind:area_vote_end_date
				bind:proposal_end_date
				bind:prediction_statement_end_date
				bind:prediction_bet_end_date
				bind:delegate_vote_end_date
				bind:vote_end_date
				bind:end_date
			/>
		{/key}
	{:else if calendarView === '0'}
		<div class="grid grid-cols-2 gap-6 justify-center">
			<div>
				<span class="mt-4">{$_('Poll start')}</span>

				<input
					id="start_date"
					type="datetime-local"
					min={new Date().toString()}
					max={maxDatePickerYear.toString()}
					value={formatDateToLocalTime(start_date).slice(0, 16)}
					class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					required
					on:input={(e) => {
						//@ts-ignore
						let date = new Date(e.target.value);

						// End date needs to be after start date to be valid
						if (new Date() <= date) start_date = date;
						//@ts-ignore
						else e.target.value = formatDateToLocalTime(start_date).slice(0, 16);
					}}
				/>
			</div>

			{#if selected_poll !== 'Date Poll'}
				<div>
					<span class="mt-4">{$_('Area voting end')}</span>
					<input
						id="area-vote-end-date"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(area_vote_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) area_vote_end_date = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(area_vote_end_date).slice(0, 16);
						}}
					/>
				</div>

				<div>
					<span class="mt-4">{$_('Proposal end')}</span>

					<input
						id="proposal_end"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(proposal_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) proposal_end_date = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(proposal_end_date).slice(0, 16);
						}}
					/>
				</div>

				<div>
					<span class="mt-4">{$_('Consequences creation end')}</span>

					<input
						id="consequence-creation"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(prediction_statement_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) prediction_statement_end_date = date;
							//@ts-ignore
							else
								e.target.value = formatDateToLocalTime(prediction_statement_end_date).slice(0, 16);
						}}
					/>
				</div>
				<div>
					<span class="mt-4">{$_('Consequence bet end')}</span>

					<input
						id="consequence-creation"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(prediction_bet_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) prediction_bet_end_date = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(prediction_bet_end_date).slice(0, 16);
						}}
					/>
				</div>
				<div>
					<span class="mt-4">{$_('Delegate voting end date')}</span>

					<input
						id="consequence-creation"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(delegate_vote_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) delegate_vote_end_date = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(delegate_vote_end_date).slice(0, 16);
						}}
					/>
				</div>
				<div>
					<span class="mt-4">{$_('Voting end date')}</span>

					<input
						id="consequence-creation"
						type="datetime-local"
						min={new Date().toString()}
						max={maxDatePickerYear.toString()}
						value={formatDateToLocalTime(vote_end_date).slice(0, 16)}
						class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
						required
						on:input={(e) => {
							//@ts-ignore
							let date = new Date(e.target.value);

							// End date needs to be after start date to be valid
							if (new Date() <= date) vote_end_date = date;
							//@ts-ignore
							else e.target.value = formatDateToLocalTime(vote_end_date).slice(0, 16);
						}}
					/>
				</div>
			{/if}
			<div>
				<span class="mt-4">{$_('End date')}</span>

				<input
					id="consequence-creation"
					type="datetime-local"
					min={new Date().toString()}
					max={maxDatePickerYear.toString()}
					value={formatDateToLocalTime(end_date).slice(0, 16)}
					class="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
					required
					on:input={(e) => {
						//@ts-ignore
						let date = new Date(e.target.value);

						// End date needs to be after start date to be valid
						if (new Date() <= date) end_date = date;
						//@ts-ignore
						else e.target.value = formatDateToLocalTime(end_date).slice(0, 16);
					}}
				/>
			</div>
		</div>
	{/if}
</div>
{#if selected_poll === 'Text Poll'}
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
{/if}
