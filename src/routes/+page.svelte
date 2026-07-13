<script>
	import HomePage from '$lib/Components/pages/HomePage.svelte';

	let { data } = $props();
</script>

<HomePage content={data.content} imagekitUrl={data.imagekitUrl} />
