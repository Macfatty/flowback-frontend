<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { env } from '$env/dynamic/public';
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import TextInput from '$lib/Generic/TextInput.svelte';

	export let email: string = '';

	let password: string, password2: string, verification_code: string;

	const changePassword = async () => {
		verification_code = $page.url.searchParams.get('verification_code') ?? '';

		if (password !== password2) {
			ErrorHandlerStore.set({ message: 'Passwords do not match', success: false });
			return;
		}

		const { res, json } = await fetchRequest(
			'POST',
			'forgot_password/verify',
			{ verification_code, password },
			false
		);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Could not register', success: false });
			return;
		}

		login();
	};

	const login = async () => {
		const { json, res } = await fetchRequest('POST', 'login', { username: email, password }, false);

		if (!res.ok) return;

		ErrorHandlerStore.set({ message: 'Successfully registered', success: true });

		localStorage.setItem('token', json.token);
		goto('/home');
	};
</script>

<form class="gap-6 p-6 flex flex-col items-center" on:submit|preventDefault={changePassword}>
	<TextInput label={'New Password'} bind:value={password} type="password" required />
	<TextInput label={'Confirm Password'} bind:value={password2} type="password" required />
	{#if !(env.PUBLIC_EMAIL_REGISTRATION === 'TRUE')}
		<TextInput label={'Verification Code'} bind:value={verification_code} required />
	{/if}

	<Button type="submit" label="Send" />
</form>
