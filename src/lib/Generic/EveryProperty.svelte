<!-- This is for testing purposes to see what properties an object has -->
<script>
	export let obj = {};
</script>

<ul>
	{#each Object.entries(obj) as [k, v]}
		<li>{k}: {JSON.stringify(v)}</li>
	{/each}
</ul>
