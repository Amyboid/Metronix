<script lang="ts">
	import { permissionDenied } from '$lib/stores/permissionDenied';

	let open = $state(false);
	let message = $state('');

	permissionDenied.subscribe((v) => {
		open = v.open;
		message = v.message;
	});

	function close() {
		permissionDenied.hide();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[200] bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-6"
		onclick={close}
		onkeydown={(e) => { if (e.key === 'Escape') close(); }}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="bg-neutral border border-subtle rounded-xl p-6 w-full max-w-[400px] flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
			onkeydown={(e) => e.stopPropagation()}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-3">
				<div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#fff7ed] shrink-0">
					<span class="icon-[lucide--shield-off] w-5 h-5 text-[#f97316]"></span>
				</div>
				<h3 class="text-base font-bold text-gray-900 m-0">Permission Denied</h3>
			</div>
			<p class="text-sm text-copy m-0">{message}</p>
			<div class="flex gap-2 justify-end">
				<button
					class="font-inter text-[13px] font-semibold py-[7px] px-4 rounded-[7px] border-none bg-surface text-copy cursor-pointer transition-colors hover:bg-canvas"
					onclick={close}
				>OK</button>
			</div>
		</div>
	</div>
{/if}
