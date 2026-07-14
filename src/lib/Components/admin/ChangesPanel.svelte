<script lang="ts">
  import SidePanel from '$lib/Components/admin/catalog/SidePanel.svelte';

  let { open, pageName, refreshKey = 0, onClose, onRevert, onPublish, onDiscardAll }: {
    open: boolean;
    pageName: string;
    refreshKey?: number;
    onClose: () => void;
    onRevert: (fieldKey: string) => void;
    onPublish: () => void;
    onDiscardAll: () => void;
  } = $props();

  type Change = { fieldKey: string; type: string; preview: string };

  let changes = $state<Change[]>([]);

  function loadChanges() {
    try {
      const drafts = JSON.parse(localStorage.getItem('draft_' + pageName) || '{}');
      changes = Object.entries(drafts).map(([fieldKey, draft]: [string, any]) => ({
        fieldKey,
        type: draft.fieldType || 'text',
        preview: draft.fieldType === 'image' ? 'Image changed' : String(draft.value || '').slice(0, 80),
      }));
    } catch {
      changes = [];
    }
  }

  $effect(() => {
    if (open) {
      void refreshKey;
      loadChanges();
    }
  });

  function formatFieldKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
</script>

<SidePanel {open} title="Changes ({changes.length})" onsave={onPublish} ondiscard={onClose}>
  {#snippet children()}
    {#if changes.length === 0}
      <p class="text-sm text-gray-400 text-center py-8">No pending changes</p>
    {:else}
      <div class="flex flex-col gap-3">
        {#each changes as change}
          <div class="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-900 truncate">{formatFieldKey(change.fieldKey)}</span>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium {change.type === 'image' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                  {change.type === 'image' ? 'Image' : 'Text'}
                </span>
              </div>
              <p class="text-xs text-gray-500 truncate m-0">{change.preview}</p>
            </div>
            <button
              class="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              onclick={() => onRevert(change.fieldKey)}
            >Revert</button>
          </div>
        {/each}
      </div>
    {/if}
  {/snippet}
</SidePanel>
