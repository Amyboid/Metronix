<script lang="ts">
	import type { PageProps } from './$types';
	import { fetchProductsFiltered } from '$lib/data/products.js';
	import AdminProductForm from '$lib/Components/AdminProductForm.svelte';
	import { setContext } from 'svelte';
	import AdminProductCard from '$lib/Components/AdminProductCard.svelte';

	let { data, form }: PageProps = $props();
	let showForm = $state({ show: false });
	setContext('showForm', showForm);

	let items = $state(data.items);
	let currentPage = $state(1);
	let isLoading = $state(false);
	let isLoadAllLoading = $state(false);
	let errorLoadingMore = $state();

	const totalProducts = $derived(data.totalProducts);
	const totalPages = $derived(data.totalPages);
	let currentLimit = $state(data.limit);

	let currentUser = $derived(data.user);

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
			// After loading all, if there are products, set currentPage to totalPages
			// to disable the "Load More" button.
			if (response.products.length > 0) {
				currentPage = totalPages;
			} else {
				currentPage = 1;
			}

			console.log(currentPage, totalPages, totalProducts);
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
			// Also check isLoadAllLoading
			return;
		}

		console.log(currentPage);

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
</script>

<header class="section-header mt-2 flex h-24 w-full items-center pl-6 sm:h-30 md:mt-0 md:pl-[8%]">
	<h1 class="text-lg font-semibold md:text-xl">Manage your products.</h1>
</header>

{#if showForm.show}
	<AdminProductForm {form} />
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
		onclick={() => (showForm.show = !showForm.show)}
		><span class="icon-[ic--round-plus]"></span> Add new</button
	>
</div>

<section class="grid w-full grid-cols-1 sm:grid-cols-2 md:min-w-[70vw] md:grid-cols-4">
	{#each items as item (item._id)}
		<AdminProductCard {item} />
	{/each}
</section>

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
