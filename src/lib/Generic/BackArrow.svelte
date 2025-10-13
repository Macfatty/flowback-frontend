<script>
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import Button from './Button.svelte';
	import Fa from 'svelte-fa';

	const directedGraph = {
		Delegation: ['Group', 'Dack'],
		'Delegate History': ['Delegation'],
		Poll: ['Delegate History', 'Group'],
		Group: ['Group Settings', 'Group Schedule', 'Group Kanban', 'Delegate History', 'Back'],
		'Group Settings': ['Group'],
		'Group Schedule': ['Group', 'Back'],
		'Group Kanban': ['Group', 'Back'],
		'User Settings': ['Back']
	};



	
</script>

<Button
	onClick={() => history.back()}
	Class="z-[60] fixed p-3 m-4 transition-all bg-gray-200 dark:bg-darkobject hover:brightness-95 active:brightness-90"
	id="back-button"
>
	<div class="text-gray-800 dark:text-gray-200">
		<Fa icon={faArrowLeft} />
	</div>
</Button>
