<script lang="ts">
	import { fetchRequest } from '$lib/FetchRequest';
	import { onMount } from 'svelte';
	import type { Group, Tag } from '$lib/Group/interface';
	import type { Delegate, DelegateRelation } from './interfaces';
	import { ErrorHandlerStore } from '$lib/Generic/ErrorHandlerStore';
	import ProfilePicture from '$lib/Generic/ProfilePicture.svelte';
	import Fa from 'svelte-fa';
	import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';
	import { userStore } from '$lib/User/interfaces';

	export let group: Group,
		delegates: Delegate[] = [];

	let tags: Tag[] = [],
		expandedSection: any = null,
		delegateRelations: DelegateRelation[] = [],
		delegationTagsStructure: { delegate_pool_id: number; tags: number[] }[] = [];

	onMount(async () => {
		initialSetup();
	});

	$: if (group) {
		initialSetup();
	}

	const initialSetup = async () => {
		await getGroupTags();
		await getDelegatePools();
		await getDelegateRelations();
		setupDelegationTagStructure();
	};

	const updateDelgation = async (delegate: Delegate, tag: Tag) => {
		await changeDelegation(delegate, tag);
		await createDelegateRelation(delegate.pool_id);
		await saveDelegation();

		// Refresh relations to ensure consistency with backend
		await getDelegateRelations();
		setupDelegationTagStructure();
	};

	const getGroupTags = async () => {
		// TODO: What happends when limit has been reached?
		// Potential fix here and at other places: Max number of tags per group?
		const { res, json } = await fetchRequest('GET', `group/${group.id}/tags?limit=1000`);
		if (!res.ok) return;
		tags = json?.results;
	};

	/*
		Temporary fix to make each delegate pool be associated with one user.
		TODO: Remove pools in the backend
	*/
	const getDelegatePools = async () => {
		const { json, res } = await fetchRequest('GET', `group/${group.id}/delegate/pools?limit=1000`);
		if (!res.ok) return;

		delegates = json?.results.map((delegatePool: any) => {
			return { ...delegatePool.delegates[0].group_user, pool_id: delegatePool.id };
		});
	};

	const getDelegateRelations = async () => {
		const { json, res } = await fetchRequest('GET', `group/${group.id}/delegates?limit=1000`);

		if (!res.ok) return;

		delegateRelations = json?.results;
	};

	const setupDelegationTagStructure = () => {
		delegationTagsStructure = delegateRelations.map(({ tags, delegate_pool_id }) => ({
			delegate_pool_id,
			tags: tags.map(({ id }) => id)
		}));
	};

	const toggleSection = (index: any) => {
		expandedSection = expandedSection === index ? null : index;
	};

	const changeDelegation = async (delegate: Delegate, tag: Tag) => {
		// Check if a relation exists for this delegate; if not, create one
		let relation = delegateRelations.find((r) => r.delegate_pool_id === delegate.pool_id);
		if (!relation) {
			relation = {
				delegate_pool_id: delegate.pool_id,
				tags: [],
				id: delegate.pool_id,
				delegates: []
			};
			delegateRelations = [...delegateRelations, relation];
		}

		// Update delegationTagsStructure
		let tagStructure = delegationTagsStructure.find((r) => r.delegate_pool_id === delegate.pool_id);
		if (!tagStructure) {
			tagStructure = { delegate_pool_id: delegate.pool_id, tags: [] };
			delegationTagsStructure = [...delegationTagsStructure, tagStructure];
		}

		// Remove tag from other delegates' relations
		delegationTagsStructure.forEach((r) => {
			const tagIndex = r.tags.findIndex((_tag) => _tag === tag.id);
			if (tagIndex !== -1) r.tags.splice(tagIndex, 1);
		});
		delegateRelations.forEach((r) => {
			const tagIndex = r.tags.findIndex((_tag) => _tag.id === tag.id);
			if (tagIndex !== -1) r.tags.splice(tagIndex, 1);
		});

		// Add tag to the selected delegate's relation
		if (!tagStructure.tags.includes(tag.id)) {
			tagStructure.tags.push(tag.id);
		}
		if (!relation.tags.some((t) => t.id === tag.id)) {
			relation.tags.push({ ...tag, active: true, name: tag.name });
		}

		// Update state
		delegationTagsStructure = [...delegationTagsStructure];
		delegateRelations = [...delegateRelations];
	};

	const createDelegateRelation = async (delegate_pool_id: number) => {
		const { json, res } = await fetchRequest('POST', `group/${group.id}/delegate/create`, {
			delegate_pool_id
		});

		if (!res.ok) return;

		delegates[delegates.findIndex((d) => d.pool_id === delegate_pool_id)].isInRelation = true;

		// Ensure a relation exists in delegateRelations
		if (!delegateRelations.some((r) => r.delegate_pool_id === delegate_pool_id)) {
			delegateRelations = [
				...delegateRelations,
				{ delegate_pool_id, tags: [], id: delegate_pool_id, delegates: [] }
			];
			setupDelegationTagStructure();
		}
	};

	const saveDelegation = async () => {
		const toSendDelegates = delegateRelations.map(({ tags, delegate_pool_id }) => ({
			delegate_pool_id,
			tags: tags.map(({ id }) => id)
		}))[0];

		const { res } = await fetchRequest(
			'POST',
			`group/${group.id}/delegate/update`,
			toSendDelegates
		);

		if (!res.ok) {
			ErrorHandlerStore.set({ message: 'Failed to save new delegation', success: false });
			return;
		}
		ErrorHandlerStore.set({ message: 'Successfully saved delegation', success: true });
	};

	const clearChoice = async (tag: Tag) => {
		delegationTagsStructure.forEach((delegate) => {
			delegate.tags = delegate.tags?.filter((_tag) => {
				return _tag !== tag.id;
			});
		});

		delegateRelations.forEach((delegate) => {
			delegate.tags = delegate.tags?.filter((_tag) => {
				return _tag.id !== tag.id;
			});
		});

		delegationTagsStructure = [...delegationTagsStructure];
		delegateRelations = [...delegateRelations];
		await saveDelegation();
		await getDelegateRelations();
	};

	$: console.log(delegationTagsStructure, delegateRelations);
	
</script>

<div>
	{#if delegates.length > 0}
		{#each tags as tag, index}
			<div class="section">
				<button
					type="button"
					class="transition-all flex text-primary dark:text-secondary justify-between w-full section-title"
					on:click={() => toggleSection(index)}
				>
					<span class="break-word text-left">{tag.name}</span>

					<!-- Always use chevron-down and rotate when expanded -->
					<div class="chevron {expandedSection === index ? 'expanded' : ''}">
						<Fa icon={faChevronDown} />
					</div>
				</button>

				{#if expandedSection === index}
					<div class="voter-list">
						{#each delegates as delegate}
							<div class="voter-item">
								<ProfilePicture
									displayName
									username={delegate.user.username}
									userId={delegate.user.id}
									profilePicture={delegate.user.profile_image}
									href={`/user?id=${delegate.user.id}&delegate_id=${delegate.id}&group_id=${group.id}&is_admin=${delegate.is_admin}`}
								/>
								<!-- {delegate.user.username}
								{delegate.delegates[0]} -->
								<span>
									<input
										disabled={delegate.user.id === ($userStore?.id || -1)}
										on:input={() => {
											updateDelgation(delegate, tag);
											setTimeout(() => {
												setupDelegationTagStructure();
											}, 1000);
										}}
										type="radio"
										name={tag.name}
										checked={delegationTagsStructure
											.find((relation) => relation.delegate_pool_id === delegate.pool_id)
											?.tags.find((_tag) => _tag === tag.id) !== undefined}
									/>
								</span>
							</div>
						{/each}
					</div>
					<button class="text-red-700 hover:underline" on:click={() => clearChoice(tag)}
						>{$_('Clear Choice')}</button
					>
				{:else}
					<!-- <div class="voter-list">Inga rekommenderade väljare.</div> -->
				{/if}
			</div>
		{/each}
	{:else}
		<span>{$_('There are currently no delegates for this group')}</span>
	{/if}
</div>

<style>
	.section {
		margin-bottom: 1rem;
		border-bottom: 1px solid #ccc;
	}
	.section-title {
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.voter-list {
		padding-left: 1rem;
	}
	.voter-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
	}
	.voter-item input[type='radio'] {
		margin-left: 0.5rem;
	}

	.chevron {
		transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
	}

	.expanded {
		transform: rotate(180deg);
	}
</style>
