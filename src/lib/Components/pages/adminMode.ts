export function initAdminMode(pageName: string, autoSave = true) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('admin')) return;

  document.addEventListener('DOMContentLoaded', () => {
    setupEditableElements(pageName, autoSave);
    setupEditableImages(pageName);
  });

  // Also run immediately in case DOM is already ready
  if (document.readyState !== 'loading') {
    setupEditableElements(pageName, autoSave);
    setupEditableImages(pageName);
  }
}

function setupEditableElements(pageName: string, autoSave: boolean) {
  const elements = document.querySelectorAll<HTMLElement>('[data-editable]');

  elements.forEach((el) => {
    el.contentEditable = 'true';
    el.style.cursor = 'text';

    el.addEventListener('mouseenter', () => {
      el.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
      el.style.outlineOffset = '2px';
    });

    el.addEventListener('mouseleave', () => {
      el.style.outline = 'none';
    });

    el.addEventListener('blur', () => {
      if (!autoSave) return;
      const fieldKey = el.dataset.editable;
      const newValue = el.innerText;
      saveDraft(pageName, fieldKey!, newValue, 'text');
    });
  });
}

function setupEditableImages(pageName: string) {
  const images = document.querySelectorAll<HTMLElement>('[data-editable-image]');

  images.forEach((el) => {
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    // Add edit overlay on hover
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
      el.style.outline = 'none';
      overlay.style.display = 'none';
    });

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

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Show loading state
    const img = el.querySelector('img') || el;
    const prevOutline = el.style.outline;
    el.style.outline = '2px solid rgba(59, 130, 246, 0.8)';
    el.style.opacity = '0.7';

    try {
      // Upload to ImageKit
      const { uploadToIK } = await import('$lib/utils/imagekit');
      const result = await uploadToIK(file, 'assets/page-contents/' + pageName);

      // Save the image path as draft
      await saveDraft(pageName, fieldKey, result.filePath, 'image');

      // Update the image src
      if (img instanceof HTMLImageElement) {
        img.src = URL.createObjectURL(file);
      }

      // Show success feedback
      el.style.outline = '2px solid rgba(34, 197, 94, 0.8)';
      setTimeout(() => {
        el.style.outline = prevOutline || 'none';
        el.style.opacity = '1';
      }, 1500);
    } catch (err) {
      console.error('Image upload failed:', err);
      el.style.outline = '2px solid rgba(239, 68, 68, 0.8)';
      setTimeout(() => {
        el.style.outline = prevOutline || 'none';
        el.style.opacity = '1';
      }, 1500);
    }
  };

  input.click();
}

async function saveDraft(pageName: string, fieldKey: string, value: string, fieldType: string = 'text') {
  try {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageName, fieldKey, value, fieldType }),
    });
    // Notify parent frame that a draft was saved
    window.parent.postMessage({ type: 'draft-saved', fieldKey }, '*');
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
}
