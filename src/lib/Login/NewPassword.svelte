<script lang="ts">
	import { goto } from '$app/navigation';
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';

	import TextInput from '$lib/Generic/TextInput.svelte';
	export let email: string;
	let password: string;
	let verification_code: string;


	const registerAccount = async () => {
		const { res, json } = await fetchRequest(
			'POST',
			'forgot_password/verify',
			{ verification_code, password },
			false
		);
		if (res.ok) {
			const { json, res } = await fetchRequest(
				'POST',
				'login',
				{ username: email, password },
				false
			);
			ErrorHandlerStore.set({ message: 'Successfully registered', success: true });

			if (res.ok) {
				localStorage.setItem('token', json.token);
				goto('/home');
			}
		} else ErrorHandlerStore.set({ message: 'Could not register', success: false });
	};
</script>

<form class="gap-6 p-6 flex flex-col items-center" on:submit|preventDefault={registerAccount}>
	<TextInput label={'New Password'} bind:value={password} type="password" required />
	<TextInput label={'Verification Code'} bind:value={verification_code} required />

	 
	<Button type="submit" label="Send" />
</form>
