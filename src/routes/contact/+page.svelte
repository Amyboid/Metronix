<script>
	import ContactPage from '$lib/Components/pages/ContactPage.svelte';

	let { data } = $props();
</script>

<ContactPage content={data.content} imagekitUrl={data.imagekitUrl} />
