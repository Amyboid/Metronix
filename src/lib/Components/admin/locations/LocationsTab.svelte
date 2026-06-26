<script lang="ts">
	import { adminNav } from '$lib/stores/adminNav';
	import LocationList from './LocationList.svelte';
	import LocationForm from './LocationForm.svelte';

	const currentView = $derived($adminNav);
</script>

{#if currentView.tab === 'locations'}
	{#if currentView.view === 'list'}
		<LocationList />
	{:else if currentView.view === 'new' || currentView.view === 'update'}
		<LocationForm locationId={currentView.view === 'update' ? currentView.id : null} />
	{/if}
{/if}
