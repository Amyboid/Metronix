<script lang="ts">
  let { open, pageName, refreshKey = 0, onRevert }: {
    open: boolean;
    pageName: string;
    refreshKey?: number;
    onRevert: (fieldKey: string) => void;
  } = $props();

  type Change = { fieldKey: string; type: string; preview: string };

  let changes = $state<Change[]>([]);
  let isHovered = $state(false);
  let focusedIndex = $state(-1);
  let barEl: HTMLDivElement | undefined = $state();
  let rowEls: HTMLDivElement[] = $state([]);

  function loadChanges() {
    try {
      const drafts = JSON.parse(localStorage.getItem('draft_' + pageName) || '{}');
      changes = Object.entries(drafts).map(([fieldKey, draft]: [string, any]) => ({
        fieldKey,
        type: draft.fieldType || 'text',
        preview: draft.fieldType === 'image' ? 'Image changed' : String(draft.value || '').slice(0, 60),
      }));
    } catch {
      changes = [];
    }
  }

  $effect(() => {
    void refreshKey;
    loadChanges();
  });

  // Scroll focused row into view when bar expands
  $effect(() => {
    if (isHovered && focusedIndex >= 0 && rowEls[focusedIndex]) {
      rowEls[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  function formatFieldKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function handleLineHover(index: number) {
    focusedIndex = index;
    isHovered = true;
  }

  function handleLineClick(index: number) {
    focusedIndex = index;
    isHovered = true;
  }

  function handleBarLeave() {
    isHovered = false;
    // Keep focusedIndex so it persists for next hover
  }
</script>

{#if open && changes.length > 0}
  <div
    bind:this={barEl}
    data-changes-bar
    class="fixed right-4 top-1/2 -translate-y-1/2 z-[100] rounded-xl border border-gray-200 bg-white shadow-lg"
    style="width: {isHovered ? '280px' : '40px'}; transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1); max-height: 300px; overflow: hidden;"
    onmouseenter={() => (isHovered = true)}
    onmouseleave={handleBarLeave}
    role="region"
    aria-label="Changes"
  >
    <!-- Content always rendered at full width, clipped by overflow -->
    <div class="w-[280px] overflow-y-auto" style="max-height: 300px;">
      {#each changes as change, i}
        <div
          bind:this={rowEls[i]}
          class="flex items-center gap-2 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors {focusedIndex === i && isHovered ? 'bg-amber-50' : ''}"
        >
          <!-- Description -->
          <span class="flex-1 text-xs text-gray-700 truncate">{formatFieldKey(change.fieldKey)}</span>
          <!-- Type badge -->
          <span class="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-medium {change.type === 'image' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
            {change.type === 'image' ? 'Img' : 'Text'}
          </span>
          <!-- Revert button -->
          <button
            class="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            onclick={() => onRevert(change.fieldKey)}
            title="Revert"
            aria-label="Revert {formatFieldKey(change.fieldKey)}"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      {/each}
    </div>

    <!-- Collapsed lines overlay (shown when not hovered) -->
    {#if !isHovered}
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-[3px] px-[7px] bg-white">
        {#each changes as change, i}
          <button
            class="w-full rounded-sm cursor-pointer border-none p-0 transition-opacity hover:opacity-100"
            style="height: 6px; background: {change.type === 'image' ? '#a855f7' : '#3b82f6'}; opacity: 0.8;"
            onmouseenter={() => handleLineHover(i)}
            onclick={() => handleLineClick(i)}
            aria-label="Change: {formatFieldKey(change.fieldKey)}"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
