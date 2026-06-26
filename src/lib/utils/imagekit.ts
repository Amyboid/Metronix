// src/lib/utils/imagekit.ts
// Shared ImageKit helpers used by all admin catalog components.

export type IKAuthResponse = {
    token:       string;
    expire:      number;
    signature:   string;
    publicKey:   string;
    urlEndpoint: string;
};

export type IKUploadResult = {
    fileId:   string;
    filePath: string; // e.g. "assets/brand-logo/samsung.png"
    url:      string;
};

// Cache ONLY the static fields that never change between requests:
// publicKey and urlEndpoint. Never cache token/signature/expire —
// IK tokens are one-time use and are consumed on every upload attempt.
let _publicKey:   string | null = null;
let _urlEndpoint: string | null = null;

export async function getIKAuth(): Promise<IKAuthResponse> {
    // Always fetch a fresh token — never cache it.
    const res = await fetch('/api/admin/imagekit-auth');
    if (!res.ok) throw new Error('ImageKit auth failed');
    const data: IKAuthResponse = await res.json();

    // Cache only the static fields for ikUrl() usage without a full auth call
    _publicKey   = data.publicKey;
    _urlEndpoint = data.urlEndpoint;

    return data;
}

// Lightweight helper for components that only need the urlEndpoint
// (e.g. to build thumbnail URLs on mount). Falls back to a fresh fetch
// if not yet cached.
export async function getIKEndpoint(): Promise<string> {
    if (_urlEndpoint) return _urlEndpoint;
    const auth = await getIKAuth();
    return auth.urlEndpoint;
}

/**
 * Upload a file directly to ImageKit from the browser.
 * Always fetches a fresh auth token — IK tokens are one-time use.
 * Returns { fileId, filePath } — store both in DB.
 */
export async function uploadToIK(
    file: File,
    folder: string,
    fileName?: string,
): Promise<IKUploadResult> {
    // Fresh token every time — never reuse
    const auth = await getIKAuth();

    const form = new FormData();
    form.append('file',      file);
    form.append('fileName',  fileName ?? file.name);
    form.append('folder',    folder);
    form.append('publicKey', auth.publicKey);
    form.append('signature', auth.signature);
    form.append('expire',    String(auth.expire));
    form.append('token',     auth.token);

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body:   form,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'ImageKit upload failed');
    }

    const data = await res.json();

    // IK returns filePath with a leading slash — strip it for clean storage
    const filePath = (data.filePath as string).replace(/^\//, '');

    return { fileId: data.fileId, filePath, url: data.url };
}

/**
 * Delete a file from ImageKit via the admin proxy endpoint.
 * Silent — logs but does not throw on failure.
 */
export async function deleteFromIK(fileId: string | null): Promise<void> {
    if (!fileId) return;
    try {
        await fetch(`/api/admin/imagekit-delete?fileId=${encodeURIComponent(fileId)}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.warn('[IK] delete failed for', fileId, e);
    }
}

/**
 * Build a rendered URL from a stored filePath.
 * filePath: "assets/brand-logo/samsung.png"
 * → https://ik.imagekit.io/yourid/assets/brand-logo/samsung.png?tr=...
 */
export function ikUrl(
    filePath: string | null,
    urlEndpoint: string,
    transform = 'w-64,h-64,fo-auto',
): string | null {
    if (!filePath || !urlEndpoint) return null;
    const base  = urlEndpoint.replace(/\/$/, '');
    const clean = filePath.replace(/^\//, '');
    return `${base}/${clean}?tr=${transform}`;
}