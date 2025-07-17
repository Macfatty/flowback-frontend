<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import Modal from '$lib/Generic/Modal.svelte';
	import { _ } from 'svelte-i18n';
	import TextInput from '$lib/Generic/TextInput.svelte';
	import TextArea from '$lib/Generic/TextArea.svelte';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';
	import Loader from '$lib/Generic/Loader.svelte';

	export let reportModalShow = false,
		post_type: 'poll' | 'thread' = 'poll',
		group_id: string | number = '',
		post_id: string | number = '';		

	let title: string,
		description: string,
		errorHandler: any,
		loading = false;

	const reportPoll = async () => {
		loading = true;
		let _api = 'report/create';

		let data = {
			title,
			description,
			post_type,
			post_id,
			group_id
		};

		const { res, json } = await fetchRequest('POST', _api, data);

		loading = false;

		if (!res.ok) {
			errorHandler.addPopup({
				message: 'An error occurred while reporting the poll.',
				success: false
			});
			return;
		}

		errorHandler.addPopup({
			message: 'Poll reported successfully.',
			success: true
		});
		reportModalShow = false;
		title = '';
		description = '';
	};

	
</script>

<Modal bind:open={reportModalShow} Class="max-w-[500px]">
	<div slot="header">{post_type === 'poll' ? $_('Report Poll') : $_('Report Thread')}</div>
	<div class="flex flex-col gap-3" slot="body">
		<Loader bind:loading>
			<TextInput inputClass="bg-white" required label="Title" bind:value={title} />

			<TextArea
				label="Description"
				required
				bind:value={description}
				inputClass="whitespace-pre-wrap"
			/>
		</Loader>
	</div>
	<div slot="footer">
		<div class="flex justify-center gap-2">
			<Button onClick={reportPoll} type="submit" Class="bg-red-500 w-1/2">{$_('Report')}</Button
			><Button onClick={() => (reportModalShow = false)} Class="bg-gray-400 w-1/2"
				>{$_('Cancel')}</Button
			>
		</div>
	</div>
</Modal>

<ErrorHandler bind:this={errorHandler} />
