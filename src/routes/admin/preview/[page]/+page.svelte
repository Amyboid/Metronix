<script lang="ts">
  import { page } from '$app/state';

  let { data } = $props();

  let device = $state<'mobile' | 'tablet' | 'desktop'>('desktop');
  let autoSave = $state(true);
  let draftCount = $state(data.draftCount);
  let showSaved = $state(false);
  let iframeEl: HTMLIFrameElement | undefined = $state();

  const frameWidth = $derived(
    device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%'
  );

  const iframeSrc = $derived(`${data.pageDef.route}?admin=true`);

  function handleMessage(event: MessageEvent) {
    if (event.data?.type === 'draft-saved') {
      showSaved = true;
      draftCount += 1;
      setTimeout(() => (showSaved = false), 2000);
    }
  }

  async function publishAll() {
    try {
      const res = await fetch('/api/admin/content?publish=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageName: data.pageName }),
      });
      if (res.ok) {
        draftCount = 0;
        iframeEl?.contentWindow?.location.reload();
      }
    } catch (e) {
      console.error('Failed to publish:', e);
    }
  }

  async function discardAll() {
    if (!confirm('Discard all unpublished changes?')) return;
    try {
      await fetch(`/api/admin/content?page=${data.pageName}&all=true`, { method: 'DELETE' });
      iframeEl?.contentWindow?.location.reload();
    } catch (e) {
      console.error('Failed to discard:', e);
    }
  }
</script>

<svelte:head>
  <title>Preview: {data.pageDef.label}</title>
</svelte:head>

<svelte:window on:message={handleMessage} />

<!-- Admin Toolbar -->
<div class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
  <div class="flex items-center gap-4">
    <a href="/admin?tab=pages" class="text-sm text-gray-600 hover:text-gray-900">← Back to Admin</a>
    <span class="text-sm font-semibold text-gray-900">{data.pageDef.label} — Preview</span>
    {#if showSaved}
      <span class="text-xs text-green-600">Saved</span>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <!-- Device Preview -->
    <div class="flex rounded-md border border-gray-200">
      <button
        class="px-3 py-1 text-xs {device === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}"
        onclick={() => (device = 'mobile')}
      >Mobile</button>
      <button
        class="px-3 py-1 text-xs {device === 'tablet' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}"
        onclick={() => (device = 'tablet')}
      >Tablet</button>
      <button
        class="px-3 py-1 text-xs {device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}"
        onclick={() => (device = 'desktop')}
      >Desktop</button>
    </div>

    <!-- Auto-save toggle -->
    <label class="flex items-center gap-1.5 text-xs text-gray-600">
      <input type="checkbox" bind:checked={autoSave} class="h-3.5 w-3.5" />
      Auto-save
    </label>

    <!-- Publish / Discard -->
    {#if data.hasDrafts}
      <button
        class="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
        onclick={publishAll}
      >Publish ({draftCount})</button>
      <button
        class="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
        onclick={discardAll}
      >Discard All</button>
    {:else}
      <span class="text-xs text-gray-400">No pending changes</span>
    {/if}
  </div>
</div>

<!-- Preview Content via iframe -->
<div class="pt-12 w-full flex justify-center bg-gray-100" style="height: 100vh;">
  <iframe
    bind:this={iframeEl}
    src={iframeSrc}
    class="transition-all duration-300 bg-white"
    style="width: {frameWidth}; height: calc(100vh - 48px); border: none;"
    title="Page Preview"
  ></iframe>
</div>
