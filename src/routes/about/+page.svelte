<script>
	import AboutPage from '$lib/Components/pages/AboutPage.svelte';

	let { data } = $props();
</script>

<AboutPage content={data.content} imagekitUrl={data.imagekitUrl} />
