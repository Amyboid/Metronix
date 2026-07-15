// Staged files for deferred upload (not uploaded until publish)
const stagedFiles = new Map<string, { file: File; previewUrl: string }>();

// Module-level autoSave flag (can be toggled by parent via postMessage)
let currentAutoSave = true;

// ─── localStorage helpers ────────────────────────────────────────────────────

function getStorageKey(pageName: string) {
  return `draft_${pageName}`;
}

type DraftValue = { value: string; fieldType: string; fileId?: string };

function getDraftsFromStorage(pageName: string): Record<string, DraftValue> {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(pageName)) || '{}');
  } catch {
    return {};
  }
}

function saveDraftToStorage(pageName: string, fieldKey: string, value: string, fieldType: string, fileId?: string) {
  const drafts = getDraftsFromStorage(pageName);
  drafts[fieldKey] = { value, fieldType, fileId };
  try {
    localStorage.setItem(getStorageKey(pageName), JSON.stringify(drafts));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

function clearDraftsFromStorage(pageName: string) {
  localStorage.removeItem(getStorageKey(pageName));
}

function removeDraftFromStorage(pageName: string, fieldKey: string) {
  const drafts = getDraftsFromStorage(pageName);
  delete drafts[fieldKey];
  localStorage.setItem(getStorageKey(pageName), JSON.stringify(drafts));
}

function cleanOrphanedImageDrafts(pageName: string) {
  const drafts = getDraftsFromStorage(pageName);
  let changed = false;
  for (const [fieldKey, draft] of Object.entries(drafts)) {
    if (draft.value === '__staged_image__') {
      delete drafts[fieldKey];
      changed = true;
    }
  }
  if (changed) {
    localStorage.setItem(getStorageKey(pageName), JSON.stringify(drafts));
  }
}

export function getLocalStorageDraftCount(pageName: string): number {
  return Object.keys(getDraftsFromStorage(pageName)).length;
}

// ─── Highlight edited fields ─────────────────────────────────────────────────

const EDITED_OUTLINE = '2px dashed rgba(251, 191, 36, 0.8)';
const HOVER_OUTLINE = '2px dashed rgba(59, 130, 246, 0.5)';

function isFieldEdited(pageName: string, fieldKey: string): boolean {
  const drafts = getDraftsFromStorage(pageName);
  return !!drafts[fieldKey];
}

function highlightEditedFields(pageName: string) {
  const drafts = getDraftsFromStorage(pageName);
  document.querySelectorAll<HTMLElement>('[data-editable]').forEach((el) => {
    const fieldKey = el.dataset.editable;
    if (fieldKey && drafts[fieldKey]) {
      el.style.outline = EDITED_OUTLINE;
      el.style.outlineOffset = '2px';
    }
  });
}

export function clearAllHighlights() {
  document.querySelectorAll<HTMLElement>('[data-editable]').forEach((el) => {
    el.style.outline = 'none';
  });
}

// ─── Sync to server ──────────────────────────────────────────────────────────

export async function syncToServer(pageName: string): Promise<number> {
  const drafts = getDraftsFromStorage(pageName);
  const entries = Object.entries(drafts);
  if (entries.length === 0) return 0;

  const res = await fetch('/api/admin/content/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageName,
      drafts: entries.map(([fieldKey, { value, fieldType, fileId }]) => ({ fieldKey, value, fieldType, fileId })),
    }),
  });

  if (res.ok) {
    clearDraftsFromStorage(pageName);
    return entries.length;
  }
  throw new Error('Sync failed');
}

// ─── Init ────────────────────────────────────────────────────────────────────

export function initAdminMode(pageName: string, autoSave = true) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('admin')) return;

  currentAutoSave = autoSave;

  document.addEventListener('DOMContentLoaded', () => {
    setupEditableElements(pageName);
    setupEditableImages(pageName);
    setupPublishListener(pageName);
    restoreDraftsFromStorage(pageName);
    cleanOrphanedImageDrafts(pageName);
    window.parent.postMessage({ type: 'drafts-cleaned' }, '*');
  });

  if (document.readyState !== 'loading') {
    setupEditableElements(pageName);
    setupEditableImages(pageName);
    setupPublishListener(pageName);
    restoreDraftsFromStorage(pageName);
    cleanOrphanedImageDrafts(pageName);
    window.parent.postMessage({ type: 'drafts-cleaned' }, '*');
  }
}

// ─── Restore drafts from localStorage on init ────────────────────────────────

function restoreDraftsFromStorage(pageName: string) {
  const drafts = getDraftsFromStorage(pageName);
  for (const [fieldKey, { value }] of Object.entries(drafts)) {
    const el = document.querySelector(`[data-editable="${fieldKey}"]`);
    if (el instanceof HTMLElement) {
      el.innerText = value;
      // DON'T overwrite originalText — keep it as the published value for revert
    }
  }
  highlightEditedFields(pageName);
}

// ─── Text editing ────────────────────────────────────────────────────────────

function setupEditableElements(pageName: string) {
  const elements = document.querySelectorAll<HTMLElement>('[data-editable]');

  elements.forEach((el) => {
    el.contentEditable = 'true';
    el.style.cursor = 'text';

    // Store original text for change detection
    el.dataset.originalText = el.innerText;

    el.addEventListener('mouseenter', () => {
      el.style.outline = HOVER_OUTLINE;
      el.style.outlineOffset = '2px';
    });

    el.addEventListener('mouseleave', () => {
      // Restore yellow outline if field has edits, otherwise remove
      const fieldKey = el.dataset.editable!;
      if (isFieldEdited(pageName, fieldKey)) {
        el.style.outline = EDITED_OUTLINE;
        el.style.outlineOffset = '2px';
      } else {
        el.style.outline = 'none';
      }
    });

    el.addEventListener('blur', () => {
      if (!currentAutoSave) return;
      const fieldKey = el.dataset.editable!;
      const newValue = el.innerText;
      const originalText = el.dataset.originalText || '';

      if (newValue !== originalText) {
        saveDraft(pageName, fieldKey, newValue, 'text');
        el.style.outline = EDITED_OUTLINE;
        el.style.outlineOffset = '2px';
        const draftCount = Object.keys(getDraftsFromStorage(pageName)).length;
        window.parent.postMessage({ type: 'draft-changed', fieldKey, draftCount }, '*');
      } else {
        // Reverted to original — remove draft and highlight
        removeDraftFromStorage(pageName, fieldKey);
        el.style.outline = 'none';
        const draftCount = Object.keys(getDraftsFromStorage(pageName)).length;
        window.parent.postMessage({ type: 'draft-removed', fieldKey, draftCount }, '*');
      }
    });
  });
}

// ─── Image editing ───────────────────────────────────────────────────────────

function setupEditableImages(pageName: string) {
  const images = document.querySelectorAll<HTMLElement>('[data-editable-image]');

  images.forEach((el) => {
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.className = 'image-edit-overlay';
    overlay.innerHTML = '<span style="background: rgba(59,130,246,0.9); color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-family: system-ui;">Change Image</span>';
    overlay.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: none; z-index: 10;';
    el.appendChild(overlay);

    el.addEventListener('mouseenter', () => {
      el.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
      el.style.outlineOffset = '2px';
      overlay.style.display = 'flex';
    });

    el.addEventListener('mouseleave', () => {
      // Restore yellow outline if image was staged, otherwise remove
      if (el.dataset.staged === 'true') {
        el.style.outline = '2px dashed rgba(251, 191, 36, 0.8)';
        el.style.outlineOffset = '2px';
      } else {
        el.style.outline = 'none';
      }
      overlay.style.display = 'none';
    });

    // Store original image src for revert
    const img = el.querySelector('img');
    if (img instanceof HTMLImageElement) {
      el.dataset.originalSrc = img.src;
    }

    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openImageUpload(pageName, el);
    });
  });
}

function openImageUpload(pageName: string, el: HTMLElement) {
  const fieldKey = el.dataset.editableImage!;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Stage the file locally (no upload to ImageKit yet)
    const previewUrl = URL.createObjectURL(file);
    stagedFiles.set(fieldKey, { file, previewUrl });

    // Update the image src with local preview
    const img = el.querySelector('img');
    if (img instanceof HTMLImageElement) {
      img.src = previewUrl;
    }

    // Show staged indicator
    el.style.outline = '2px dashed rgba(251, 191, 36, 0.8)';
    el.dataset.staged = 'true';

    // Save draft with pending markers (not the actual filePath/fileId)
    saveDraft(pageName, fieldKey, '__staged_image__', 'image', '__staged_fileid__');

    // Notify parent
    window.parent.postMessage({ type: 'image-staged', fieldKey }, '*');
  };

  input.click();
}

// ─── Publish / sync / control listeners ──────────────────────────────────────

function setupPublishListener(pageName: string) {
  window.addEventListener('message', async (event) => {
    if (event.data?.type === 'publish-request') {
      await handlePublish(pageName);
    }

    if (event.data?.type === 'sync-request') {
      try {
        const count = await syncToServer(pageName);
        window.parent.postMessage({ type: 'sync-complete', count }, '*');
      } catch {
        window.parent.postMessage({ type: 'sync-failed' }, '*');
      }
    }

    if (event.data?.type === 'autosave-toggle') {
      currentAutoSave = event.data.autoSave;
    }

    if (event.data?.type === 'save-request') {
      let savedCount = 0;
      document.querySelectorAll<HTMLElement>('[data-editable]').forEach((el) => {
        const fieldKey = el.dataset.editable;
        if (!fieldKey) return;
        const newValue = el.innerText;
        const originalText = el.dataset.originalText || '';
        if (newValue !== originalText) {
          saveDraft(pageName, fieldKey, newValue, 'text');
          el.style.outline = EDITED_OUTLINE;
          el.style.outlineOffset = '2px';
          savedCount++;
        } else {
          removeDraftFromStorage(pageName, fieldKey);
          el.style.outline = 'none';
        }
      });
      const draftCount = Object.keys(getDraftsFromStorage(pageName)).length;
      window.parent.postMessage({ type: 'save-complete', draftCount }, '*');
    }

    if (event.data?.type === 'revert-field') {
      const fieldKey = event.data.fieldKey;

      // Handle text fields
      const textEl = document.querySelector(`[data-editable="${fieldKey}"]`);
      if (textEl instanceof HTMLElement) {
        textEl.innerText = textEl.dataset.originalText || '';
        textEl.style.outline = 'none';
      }

      // Handle image fields
      const imageEl = document.querySelector(`[data-editable-image="${fieldKey}"]`);
      if (imageEl instanceof HTMLElement) {
        const img = imageEl.querySelector('img');
        if (img instanceof HTMLImageElement && imageEl.dataset.originalSrc) {
          img.src = imageEl.dataset.originalSrc;
        }
        imageEl.style.outline = 'none';
        imageEl.dataset.staged = 'false';
        stagedFiles.delete(fieldKey);
      }

      removeDraftFromStorage(pageName, fieldKey);
      const draftCount = Object.keys(getDraftsFromStorage(pageName)).length;
      window.parent.postMessage({ type: 'draft-removed', fieldKey, draftCount }, '*');
    }
  });
}

async function handlePublish(pageName: string) {
  // Check online status
  if (!navigator.onLine) {
    window.parent.postMessage({ type: 'publish-failed', error: 'Cannot publish while offline' }, '*');
    return;
  }

  // Sync localStorage drafts to server first
  try {
    await syncToServer(pageName);
  } catch {
    window.parent.postMessage({ type: 'publish-failed', error: 'Failed to sync drafts' }, '*');
    return;
  }

  // Upload staged images
  if (stagedFiles.size === 0) {
    window.parent.postMessage({ type: 'images-uploaded' }, '*');
    return;
  }

  const { uploadToIK, deleteFromIK, deleteFromIKByPath } = await import('$lib/utils/imagekit');

  // Fetch old published fileIds to delete old images from ImageKit later
  let oldFileIds: Record<string, string> = {};
  try {
    const oldRes = await fetch('/api/admin/content?page=' + pageName);
    const data = await oldRes.json();
    oldFileIds = data.publishedFileIds || {};
  } catch {
    // Non-critical — proceed without old value cleanup
  }

  for (const [fieldKey, { file }] of stagedFiles) {
    try {
      const result = await uploadToIK(file, 'assets/page-contents/' + pageName);

      // Save image draft with real fileId directly to server (not localStorage)
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageName, fieldKey, value: result.filePath, fieldType: 'image', fileId: result.fileId }),
      });

      // Delete old image from ImageKit using fileId (preferred) or path (fallback)
      const oldFileId = oldFileIds[fieldKey];
      if (oldFileId) {
        await deleteFromIK(oldFileId);
      }
    } catch (err) {
      console.error(`Failed to upload ${fieldKey}:`, err);
      window.parent.postMessage({ type: 'publish-failed', fieldKey, error: String(err) }, '*');
      return;
    }
  }

  // Clean up staged files and preview URLs
  for (const { previewUrl } of stagedFiles.values()) {
    URL.revokeObjectURL(previewUrl);
  }
  stagedFiles.clear();

  window.parent.postMessage({ type: 'images-uploaded' }, '*');
}

// ─── Save draft to localStorage ──────────────────────────────────────────────

function saveDraft(pageName: string, fieldKey: string, value: string, fieldType: string = 'text', fileId?: string) {
  saveDraftToStorage(pageName, fieldKey, value, fieldType, fileId);
  const draftCount = Object.keys(getDraftsFromStorage(pageName)).length;
  window.parent.postMessage({ type: 'draft-saved', fieldKey, draftCount }, '*');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export function getStagedFilesCount() {
  return stagedFiles.size;
}
