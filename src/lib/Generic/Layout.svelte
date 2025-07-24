<script lang="ts">
	import { onMount } from 'svelte';
	import Cookies from './Cookies.svelte';
	import { TriggerDarkMode } from './DarkMode';
	import ErrorHandler from './ErrorHandler.svelte';

	export let centered = false,
		Class = '',
		errorHandler: any = null;

	onMount(() => {
		TriggerDarkMode();
	});
</script>

<div class={`${centered ? 'flex justify-center flex-col items-center' : ''} ${Class}`}>
	<slot />
</div>

<Cookies />

<ErrorHandler bind:this={errorHandler} />
