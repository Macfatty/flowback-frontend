<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import type { StatusMessageInfo } from '$lib/Generic/GenericFunctions';
	import Loader from '$lib/Generic/Loader.svelte';
	import RadioButtons from '$lib/Generic/RadioButtons.svelte';
	import StatusMessage from '$lib/Generic/StatusMessage.svelte';
	import { _ } from 'svelte-i18n';
	import TextInput from '../Generic/TextInput.svelte';
	import { mailStore } from './stores';
	import TermsOfService from './TermsOfService.svelte';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';

	let email: string,
		status: StatusMessageInfo,
		loading = false,
		acceptedToS = false,
		usernameError: string = '',
		errorHandler: any;

	export let selectedPage: string;

	async function registerAccount() {
		if (!acceptedToS) {
			errorHandler.addPopup({
				message: 'You must accept terms of service to register',
				success: false
			});
			return;
		}

		if (usernameError) {
			errorHandler.addPopup({ message: usernameError, success: false });
			return;
		}

		loading = true;
		const { res, json } = await fetchRequest('POST', 'register', { email }, false);
		loading = false;

		console.log(res, json, 'RESJSON');

		if (!res.ok) {
			errorHandler.addPopup({
				message: json?.detail?.email[0] || json?.detail || json || 'Something went wrong',
				success: false
			});
			return;
		}

		mailStore.set(email);
		errorHandler.addPopup({ message: 'Successfully registered', success: true });
		selectedPage = 'Verify';
	}
</script>

<Loader bind:loading>
	<form class="p-6 gap-6 flex flex-col items-center" on:submit|preventDefault={registerAccount}>
		<TextInput label={'Email'} bind:value={email} required />
		<TermsOfService />
		<RadioButtons
			label="Do you accept terms and conditions?"
			centering={true}
			bind:Yes={acceptedToS}
		/>
		<Button type="submit">
			{$_('Send')}
		</Button>
	</form>
</Loader>

<ErrorHandler bind:this={errorHandler} />
