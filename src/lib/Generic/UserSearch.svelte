<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { fetchRequest } from '$lib/FetchRequest';
	import type { User } from '$lib/User/interfaces';
	import Modal from './Modal.svelte';
	import ProfilePicture from './ProfilePicture.svelte';
	import TextInput from './TextInput.svelte';
	let showUsers = false,
		searchedUsers: User[] = [],
		search = '';

	const searchUser = async (username: string) => {
		if (username === '') {
			searchedUsers = [];
			return;
		}

		const { json } = await fetchRequest('GET', `users?username=${username}`);
		searchedUsers = json?.results;
	};
</script>

<Modal bind:open={showUsers} Class="bg-white dark:bg-darkobject !cursor-default">
	<div slot="body">
		<TextInput
			onInput={() => searchUser(search)}
			bind:value={search}
			label={$_('User to invite')}
			placeholder="Username"
		/>
		<ul>
			{#each searchedUsers as searchedUser}
				<li class="flex justify-between mt-6">
					<ProfilePicture
						displayName
						username={searchedUser.username}
						profilePicture={searchedUser.profile_image}
					/>

					<slot name="action" />
				</li>
			{/each}
		</ul>
	</div>
</Modal>
