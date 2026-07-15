<script lang="ts">
  import { getLocalStorageDraftCount, clearAllHighlights } from '$lib/Components/pages/adminMode';
  import ChangesBar from '$lib/Components/admin/ChangesBar.svelte';

  let { data } = $props();

  let device = $state<'mobile' | 'tablet' | 'desktop'>('desktop');
  let autoSave = $state(true);
  let draftCount = $state(data.draftCount);
  let showSaved = $state(false);
  let isPublishing = $state(false);
  let iframeEl: HTMLIFrameElement | undefined = $state();

  // Offline / sync state
  let isOffline = $state(!navigator.onLine);
  let showSyncPopup = $state(false);
  let syncCount = $state(0);
  let hasStagedImages = $state(false);

  // Changes panel state
  let showChangesBar = $state(true);
  let changesRefreshKey = $state(0);

  // Reactive hasDrafts — updates when draftCount or server data changes
  let hasDrafts = $state(data.hasDrafts || getLocalStorageDraftCount(data.pageName) > 0);

  const frameWidth = $derived(
    device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '100%'
  );

  const iframeSrc = $derived(`${data.pageDef.route}?admin=true`);

  // Online/offline detection
  $effect(() => {
    const handleOnline = () => {
      isOffline = false;
      iframeEl?.contentWindow?.postMessage({ type: 'sync-request' }, '*');
    };
    const handleOffline = () => {
      isOffline = true;
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  // Send autoSave toggle to iframe whenever it changes
  $effect(() => {
    iframeEl?.contentWindow?.postMessage({ type: 'autosave-toggle', autoSave }, '*');
  });

  function handleMessage(event: MessageEvent) {
    if (event.data?.type === 'draft-saved') {
      showSaved = true;
      draftCount = event.data.draftCount;
      hasDrafts = true;
      changesRefreshKey++;
      setTimeout(() => (showSaved = false), 2000);
    }

    if (event.data?.type === 'draft-removed') {
      draftCount = event.data.draftCount;
      hasDrafts = draftCount > 0;
      changesRefreshKey++;
    }

    if (event.data?.type === 'draft-changed') {
      draftCount = event.data.draftCount;
      hasDrafts = true;
      changesRefreshKey++;
    }

    if (event.data?.type === 'save-complete') {
      showSaved = true;
      draftCount = event.data.draftCount;
      hasDrafts = draftCount > 0;
      changesRefreshKey++;
      setTimeout(() => (showSaved = false), 2000);
    }

    if (event.data?.type === 'sync-complete') {
      syncCount = event.data.count;
      showSyncPopup = true;
      draftCount = getLocalStorageDraftCount(data.pageName);
      hasDrafts = draftCount > 0;
      changesRefreshKey++;
      setTimeout(() => (showSyncPopup = false), 3000);
    }

    if (event.data?.type === 'sync-failed') {
      console.error('Sync failed');
    }

    if (event.data?.type === 'drafts-cleaned') {
      changesRefreshKey++;
    }

    if (event.data?.type === 'image-staged') {
      hasStagedImages = true;
      hasDrafts = true;
      changesRefreshKey++;
    }

    // Images uploaded in iframe, now publish text content
    if (event.data?.type === 'images-uploaded') {
      publishTextContent();
    }

    // Image upload failed
    if (event.data?.type === 'publish-failed') {
      isPublishing = false;
      alert(`Publish failed: ${event.data.error}`);
    }
  }

  function revertField(fieldKey: string) {
    iframeEl?.contentWindow?.postMessage({ type: 'revert-field', fieldKey }, '*');
  }

  async function publishAll() {
    if (!navigator.onLine) {
      alert('Cannot publish while offline. Changes will sync when you reconnect.');
      return;
    }

    isPublishing = true;

    // First, tell iframe to upload any staged images (and sync localStorage)
    iframeEl?.contentWindow?.postMessage({ type: 'publish-request' }, '*');

    // If no staged images, iframe will immediately send 'images-uploaded'
    // which triggers publishTextContent()
  }

  async function publishTextContent() {
    try {
      const res = await fetch('/api/admin/content?publish=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageName: data.pageName }),
      });
      if (res.ok) {
        draftCount = 0;
        hasDrafts = false;
        isPublishing = false;
        hasStagedImages = false;
        showChangesBar = false;
        localStorage.removeItem('draft_' + data.pageName);
        clearAllHighlights();
        iframeEl?.contentWindow?.location.reload();
      } else {
        isPublishing = false;
        alert('Failed to publish content');
      }
    } catch (e) {
      console.error('Failed to publish:', e);
      isPublishing = false;
    }
  }

  async function discardAll() {
    if (!confirm('Discard all unpublished changes?')) return;
    try {
      await fetch(`/api/admin/content?page=${data.pageName}&all=true`, { method: 'DELETE' });
      localStorage.removeItem('draft_' + data.pageName);
      hasStagedImages = false;
      draftCount = 0;
      hasDrafts = false;
      showChangesBar = false;
      clearAllHighlights();
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
    {#if isOffline}
      <span class="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-700">
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        Offline
      </span>
    {/if}
    {#if hasStagedImages && isOffline}
      <span class="text-xs text-amber-600">Images will be lost on reload</span>
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

    <!-- Save button (manual, when auto-save is off) -->
    {#if !autoSave}
      <button
        class="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
        onclick={() => iframeEl?.contentWindow?.postMessage({ type: 'save-request' }, '*')}
      >Save</button>
    {/if}

    <!-- Changes button + Publish / Discard -->
    {#if hasDrafts}
      <button
        class="relative rounded-md px-2 py-1 transition-colors {showChangesBar ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}"
        onclick={() => (showChangesBar = !showChangesBar)}
        title="Toggle changes bar"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="10" y2="12" />
        </svg>
        {#if !showChangesBar && draftCount > 0}
          <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] text-white flex items-center justify-center">{draftCount}</span>
        {/if}
      </button>
      <button
        class="rounded-md px-3 py-1 text-xs text-white transition-colors {isPublishing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}"
        onclick={publishAll}
        disabled={isPublishing}
      >
        {#if isPublishing}
          Publishing...
        {:else}
          Publish
        {/if}
      </button>
      <button
        class="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
        onclick={discardAll}
      >Discard All</button>
    {:else}
      <span class="text-xs text-gray-400">No pending changes</span>
    {/if}
  </div>
</div>

<!-- Sync Popup -->
{#if showSyncPopup}
  <div class="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
    {syncCount} changes synced
  </div>
{/if}

<!-- Changes Panel -->
<ChangesBar
  open={showChangesBar}
  pageName={data.pageName}
  refreshKey={changesRefreshKey}
  onRevert={revertField}
/>

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
