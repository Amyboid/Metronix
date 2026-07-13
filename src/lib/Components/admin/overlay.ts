interface OverlayOptions {
  autoSave?: boolean;
  onSaved?: (fieldKey: string, value: string) => void;
}

interface OverlayHandle {
  destroy: () => void;
}

export function initOverlay(pageName: string, options: OverlayOptions = {}): OverlayHandle {
  const { autoSave = true, onSaved } = options;
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
      saveDraft(pageName, fieldKey!, newValue).then(() => {
        onSaved?.(fieldKey!, newValue);
      });
    });
  });

  return {
    destroy() {
      elements.forEach((el) => {
        el.contentEditable = 'false';
        el.style.cursor = '';
        el.style.outline = '';
      });
    },
  };
}

async function saveDraft(pageName: string, fieldKey: string, value: string): Promise<void> {
  try {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageName, fieldKey, value, fieldType: 'text' }),
    });
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
}
