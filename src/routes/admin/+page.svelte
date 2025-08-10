<script lang="ts">
	import type { PageProps } from './$types';
	import { fetchProductsFiltered } from '$lib/data/products.js';
	import AdminProductForm from '$lib/Components/AdminProductForm.svelte';
	import { setContext } from 'svelte';
	import AdminProductCard from '$lib/Components/AdminProductCard.svelte';
	import { fade, fly } from 'svelte/transition';

	let { data, form }: PageProps = $props();
	let showForm = $state(false);
	let showDeleteToast = $state(false);
	function closeForm() {
		showForm = false;
	}

	function handleDeleteToast() {
		showDeleteToast = true;
		setTimeout(() => {
			showDeleteToast = false;
		}, 1000);
	}
	let items = $state(data.items);

	let currentPage = $state(1);
	let isLoading = $state(false);
	let isLoadAllLoading = $state(false);
	let errorLoadingMore = $state();

	const totalProducts = $derived(data.totalProducts);
	const totalPages = $derived(data.totalPages);
	let currentLimit = $state(data.limit);

	async function loadAll(page: number, limit: number) {
		if (isLoadAllLoading) {
			return;
		}

		isLoadAllLoading = true;
		errorLoadingMore = null;

		try {
			items = [];
			currentPage = 1;
			currentLimit = limit;

			const response = await fetchProductsFiltered(fetch, undefined, undefined, page, limit);
			items = [...response.products];

			if (response.products.length > 0) {
				currentPage = totalPages;
			} else {
				currentPage = 1;
			}
		} catch (err) {
			console.error('Failed to load all products:', err);
			errorLoadingMore = 'Failed to load all products. Please try again.';
		} finally {
			isLoadAllLoading = false;
			isLoading = false;
		}
	}

	async function loadMore() {
		if (currentPage >= totalPages || isLoading || isLoadAllLoading) {
			return;
		}

		isLoading = true;
		errorLoadingMore = null;
		try {
			const nextPage = currentPage + 1;
			const response = await fetchProductsFiltered(
				fetch,
				undefined,
				undefined,
				nextPage,
				currentLimit
			);

			items = [...items, ...response.products];
			currentPage = nextPage;
		} catch (err) {
			console.error('Failed to load more products:', err);
			errorLoadingMore = 'Failed to load more products. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		items = data.items;
	});
</script>

<header class="section-header mt-1 flex h-24 w-full items-center pl-6 sm:h-30 md:mt-0 md:pl-[8%]">
	<h1 class="text-lg font-semibold md:text-xl">Manage your products.</h1>
</header>

{#if showForm}
	<AdminProductForm {closeForm} {form} />
{/if}

<div
	class="section-options flex h-10 w-full items-center justify-between gap-5 p-5 text-xs sm:h-12 md:mt-0 md:justify-end"
>
	<button
		class="load-all-btn border-primary-background bg-primary-background-dark cursor-pointer rounded-lg border p-1 px-2"
		onclick={() => loadAll(1, 99999)}
		disabled={isLoadAllLoading || (items.length === totalProducts && totalProducts > 0)}
	>
		{#if isLoadAllLoading}
			<div class="flex items-center gap-1">
				<span class="icon-[eos-icons--loading]"></span> loading
			</div>
		{:else}
			Load all
		{/if}
	</button>

	<button
		class="border-primary-background bg-primary-background-dark flex cursor-pointer items-center gap-1 rounded-lg border p-1 px-2"
		onclick={() => (showForm = !showForm)}
		><span class="icon-[ic--round-plus]"></span> Add new product</button
	>
</div>

<section class="grid w-full grid-cols-1 sm:grid-cols-2 md:min-w-[70vw] md:grid-cols-4">
	{#each items as item (item._id)}
		<AdminProductCard {form} {item} {handleDeleteToast} />
	{/each}
</section>
{#if showDeleteToast}
	<div
		in:fly={{ y: 200 }} out:fade
		class="border-primary-background bg-primary-background fixed left-[50%] -translate-[50%] -bottom-4 sm:left-auto sm:translate-0 sm:right-6 sm:bottom-6 h-auto w-[80%] rounded-lg border p-4 text-center text-sm sm:w-60"
	>
		<div class="bg-neutral w-full rounded-lg text-center p-2">Product deleted!</div>
	</div>
{/if}

<button
	disabled={isLoading || isLoadAllLoading}
	onclick={loadMore}
	class="load-more-container mt-6 flex w-[90%] cursor-pointer items-center justify-center p-2 text-sm sm:mt-12 sm:pr-4 sm:pl-4 md:w-[85%]"
>
	{#if errorLoadingMore}
		<p class="mb-4 text-red-500">{errorLoadingMore}</p>
	{/if}

	{#if currentPage < totalPages && items.length < totalProducts}
		{#if isLoading}
			<p class="text-gray-400">Loading...</p>
		{:else}
			<p class="flex items-center gap-1">
				Load more
				<span class="icon-[ri--arrow-down-s-line] -mb-1"></span>
			</p>
		{/if}
	{:else if totalProducts > 0}
		<p class="text-gray-400">You've reached the end of the products!</p>
	{/if}
</button>

<style>
	.section-header {
		border-bottom: 1px solid var(--primary-background);
		border-top: 1px solid var(--primary-background);
		background-color: #dcd8cd36;
	}
	.section-options {
		border-bottom: 1px solid var(--primary-background);
	}

	.load-all-btn:disabled {
		cursor: not-allowed;
		color: #6d6d6d;
	}
	.load-more-container:disabled {
		cursor: not-allowed;
	}
</style>
