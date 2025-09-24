<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import Loader from '$lib/Generic/Loader.svelte';
	import { _ } from 'svelte-i18n';
	import TextInput from '../Generic/TextInput.svelte';
	import { mailStore } from './stores';
	import RadioButtons from '$lib/Generic/RadioButtons.svelte';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	// TODO: Blockchain
	// import { becomeMemberOfGroup } from '$lib/Blockchain_v1_Ethereum/javascript/rightToVote';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	let verification_code: string,
		password: string,
		loading = false,
		acceptedEmailNotifications = false,
		username: string;

	const validateUsername = () => {
		if (!username) {
			// usernameError = '';
			return;
		}

		const regex = /^[a-zA-Z0-9@./+/_-]+$/;
		if (!username.match(regex)) {
			// usernameError =
			// 	'Username may only contain letters, numbers, and @/./+/-/_ characters. No spaces are allowed.';
		} else {
			// usernameError = '';
		}
	};

	async function verifyAccount() {
		loading = true;
		const { res, json } = await fetchRequest(
			'POST',
			'register/verify',
			{ verification_code, password, username },
			false
		);

		loading = false;
		if (!res.ok) {
			if (
				json?.detail?.verification_code ||
				json?.detail[0] === 'Not found.' ||
				json?.detail[0] === 'Verification code has already been used.'
			)
				ErrorHandlerStore.set({ message: 'Wrong verification code', success: false });
			else if (json?.detail?.non_field_errors)
				ErrorHandlerStore.set({ message: json?.detail?.non_field_errors[0], success: false });
			else if (json?.detail?.username)
				ErrorHandlerStore.set({ message: json?.detail?.username[0], success: false });
			else ErrorHandlerStore.set({ message: 'Something went wrong', success: false });

			return;
		}

		login();
	}

	const login = async () => {
		// Getting username which is stored in the store from Register.svelte
		// let email = '';
		// mailStore.subscribe((mail) => (email = mail));
		const { json, res } = await fetchRequest(
			'POST',
			'login',
			{ username, password },
			false
		);

		loading = false;

		if (!res.ok || !json.token) {
			ErrorHandlerStore.set({ message: 'Something went wrong', success: false });
			return;
		}

		//Done with account registration, redirect
		ErrorHandlerStore.set({ message: 'Success', success: true });
		localStorage.setItem('token', json.token);

		{
			const { res, json } = await fetchRequest('POST', 'user/update', {
				email_notifications: acceptedEmailNotifications
			});
		}

		//For one group flowback, immediately join the list of groups
		if (env.PUBLIC_ONE_GROUP_FLOWBACK === 'TRUE') {
			const { res } = await fetchRequest('POST', `group/1/join`, { to: 1 });
			if (!res.ok) return;

			// if (env.PUBLIC_BLOCKCHAIN_INTEGRATION === 'TRUE') becomeMemberOfGroup(group?.blockchain_id);

			goto('/home');

			return;
		}

		//If multi-group flowback, just go to home
		goto('/home');
	};

	const getVerificationCodeFromURL = () => {
		verification_code = $page.url.searchParams.get('verification_code') || '';
	};

	onMount(() => {
		getVerificationCodeFromURL();

		// For when users click the link in their verification email.
		const urlParams = new URLSearchParams(window.location.search);
		verification_code = urlParams.get('verification_code') || '';
	});

	$: {
		username;
		validateUsername();
	}
</script>

<Loader bind:loading>
	<form class="gap-6 p-6 mb-4 flex flex-col items-center" on:submit|preventDefault={verifyAccount}>
		
		<!-- <span
			>{$_(
				`We have sent a verification code to the provided email. Don't forget to check your junk mail!`
			)}</span
		> -->
		{#if !$page.url.searchParams.get('verification_code')}
			<TextInput label={'Verification Code'} bind:value={verification_code} required />
		{/if}

		<TextInput label={'Username'} bind:value={username} required />
		<!-- {#if usernameError}
			<p class="text-red-500 text-sm">{$_(usernameError)}</p>
		{/if} -->
		<TextInput label={'Choose a Password'} bind:value={password} type={'password'} required />
		<RadioButtons
			label="Do you want to receive Email Notifications?"
			centering={true}
			bind:Yes={acceptedEmailNotifications}
		/>
		 
		<Button type="submit">
			{$_('Send')}
		</Button>
	</form>
</Loader>

 
