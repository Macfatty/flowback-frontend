<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		becomeMemberOfGroup,
		removeGroupMembership
	} from '$lib/Blockchain_v1_Ethereum/javascript/rightToVote';
	import { fetchRequest } from '$lib/FetchRequest';
	import Button from '$lib/Generic/Button.svelte';
	import type { Group } from './interface';
	import { _ } from 'svelte-i18n';
	import DefaultBanner from '$lib/assets/default_banner_group.png';
	import { onThumbnailError } from '$lib/Generic/GenericFunctions';
	import { env } from '$env/dynamic/public';
	import ErrorHandler from '$lib/Generic/ErrorHandler.svelte';
	import Modal from '$lib/Generic/Modal.svelte';

	export let group: Group;

	let errorHandler: any,
		areYouSureModal = false;

	const goToGroup = () => {
		if (group.joined) goto(`/groups/${group.id}`);
	};

	const subscribeToGroup = async () => {
		const { res, json } = await fetchRequest('POST', 'notification/group');
	};

	const joinGroup = async (directJoin: boolean) => {
		const { res } = await fetchRequest('POST', `group/${group.id}/join`, { to: group.id });

		if (!res.ok) {
			errorHandler.addPopup({
				message: 'An error occurred while joining the group',
				success: false
			});
			return;
		}

		if (!directJoin) {
			group.pending_join = true;
			errorHandler.addPopup({ message: 'Pending invite', success: true });
		} else group.joined = !group.joined;

		if (env.PUBLIC_BLOCKCHAIN_INTEGRATION === 'TRUE') becomeMemberOfGroup(group.blockchain_id);
	};

	const leaveGroup = async () => {
		const { res, json } = await fetchRequest('POST', `group/${group.id}/leave`);

		if (!res.ok) {
			errorHandler.addPopup({
				message: json.detail[0] || json.detail || 'An error occurred while leaving the group',
				success: false
			});
			return;
		}

		if (env.PUBLIC_BLOCKCHAIN_INTEGRATION === 'TRUE') removeGroupMembership(group.id);
		areYouSureModal = false;
		group.joined = false;
		group.pending_join = false;
	};
</script>

<button
	class={`w-4/6 md:w-2/5 max-w-[650px] bg-white relative shadow-md dark:bg-darkobject dark:text-darkmodeText ${
		group.joined && 'cursor-pointer hover:shadow-xl vote-thumbnail'
	} transition-shadow rounded-2xl`}
>
	<button on:click={goToGroup} class="w-full">
		<img
			src={`${env.PUBLIC_API_URL}${group.cover_image}`}
			class="cover rounded-t-2xl w-full"
			alt="cover"
			on:error={(e) => onThumbnailError(e, DefaultBanner)}
		/>
	</button>
	<img
		src={`${env.PUBLIC_API_URL}${group.image}`}
		class="bg-white rounded-full w-[100px] h-[100px] absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
		on:error={(e) => onThumbnailError(e, DefaultBanner)}
		alt="profile"
	/>

	<button on:click={goToGroup}>
		<h1 class="text-2xl p-4 mt-10 text-center break-words">
			{group.name}
		</h1>
	</button>

	{#if group.description.length > 0}
		<div class="my-2 mx-auto w-[85%] min-w-72 grid-area-description break-words">
			<p class="line-clamp-2">{group.description}</p>
		</div>
	{/if}

	<div class="flex justify-center mb-6">
		<Button
			disabled={group.pending_join}
			Class="hover:bg-blue-800 bg-blue-600"
			onClick={() => {
				if (group.joined) {
					areYouSureModal = true;
				} else {
					joinGroup(group.direct_join);
				}
			}}
		>
			{$_(
				group.joined
					? 'Leave'
					: group.direct_join
					? 'Join'
					: group.pending_join
					? 'Request sent'
					: 'Ask to join'
			)}
		</Button>
	</div>
</button>

<Modal
	bind:open={areYouSureModal}
	Class="max-w-[400px]"
	buttons={[
		{ label: 'Yes', type: 'warning', onClick: leaveGroup },
		{ label: 'No', type: 'default', onClick: () => (areYouSureModal = false) }
	]}
>
	>
	<div slot="header">{$_('Are you sure?')}</div>
	<div slot="body">{$_('You are about to leave the group!')}</div>
</Modal>

<ErrorHandler bind:this={errorHandler} />

<style>
	.vote-thumbnail:hover {
		outline: 2px #ccc solid;
	}

	img.cover {
		aspect-ratio: 5;
		width: 100%;
	}
</style>
