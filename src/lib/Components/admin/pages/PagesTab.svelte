<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import PagesList from './PagesList.svelte';
	import PageEditor from './PageEditor.svelte';

	const currentView = $derived($adminNav);
</script>

{#if currentView.tab === 'pages'}
	{#if currentView.view === 'list'}
		<PagesList />
	{:else if currentView.view === 'update'}
		<PageEditor pageName={currentView.pageName ?? ''} />
	{/if}
{/if}
