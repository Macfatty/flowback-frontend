<script lang="ts">
	import Button from './Button.svelte';
	import { _ } from 'svelte-i18n';
	import CrossButton from './CrossButton.svelte';
	import type { ModalButton } from './interface';
	//TODO: Make the design nicer and larger, make it draggable, add more options

	export let open = false,
		Class = '',
		onOpen = () => {},
		onClose = () => {},
		onSubmit = () => {},
		buttons: ModalButton[] = [];

	const closeModal = (event: MouseEvent) => {
		event.stopPropagation();
		open = false;
		hideScrollbar(false);
	};

	const stopPropagation = (event: MouseEvent) => {
		event.stopPropagation();
		onCloseModal();
	};

	const hideScrollbar = (hide: boolean) => {
		const html = document.querySelector('html');
		if (!html) return;

		html.style.overflowY = hide ? 'hidden' : 'scroll';
	};

	const onOpenModal = () => {
		hideScrollbar(true);
		onOpen();
	};

	const onCloseModal = () => {
		hideScrollbar(false);
		onClose();
	};

	// $: if (open) onOpenModal();
</script>

<div
	id="overlay"
	class="overlay"
	class:hidden={!open}
	on:click={closeModal}
	tabindex="0"
	on:keydown
	role="button"
>
	<div
		id="popup-modal"
		tabindex="-1"
		class={`w-[80%] max-h-[80vh] mt-10 dark:bg-darkbackground bg-white overflow-y-auto overflow-x-hidden border
		border-gray-300 rounded shadow-xl fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50 max-w-[400px] ${Class}`}
		on:click={stopPropagation}
		on:keydown
		role="button"
	>
		<div class="dark:text-darkmodeText relative p-4 w-full h-full">
			<!-- <div class="text-xl border-b-2 border-gray-300 border-solid  break-all"> -->
			<div class="text-xl break-all">
				<slot name="header" />
				<CrossButton action={() => (open = false)} />
			</div>
			{#if onSubmit !== (() => {})}
				<form on:submit|preventDefault={onSubmit}>
					<div class="p-6 text-center break-all">
						<slot name="body" />
					</div>
					<slot name="footer" />
				</form>
			{:else}
				<div class="p-6 text-center">
					<slot name="body" />
				</div>
				<slot name="footer" />
			{/if}
			<div class="flex justify-center gap-2">
				{#each buttons as button}
					<Button buttonStyle={button.type} Class={`flex-1 ${button.class || ''}`} onClick={button.onClick}>
						{$_(button.label)}
					</Button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed; /* Positioning and size */
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: rgba(128, 128, 128, 0.5); /* color */
		z-index: 49;
	}
</style>
