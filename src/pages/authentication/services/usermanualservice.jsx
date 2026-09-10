import api from 'api/api';

// All calls go through the shared axios instance, so the bearer token is attached and an expired
// session is handled the same way as everywhere else in the app.
const BASE = '/user-access/user-manuals';
const ADMIN = `${BASE}/admin`;

const message = (err, fallback) => err.response?.data?.message || fallback;

// The shared client allows 15s, which is fine for JSON but not for moving a 20 MB PDF over a slow
// link, so the two calls that carry a file get their own allowance.
const FILE_TRANSFER_TIMEOUT_MS = 120000;

const userManualService = {
  /**
   * The manuals the signed-in user may read, and whether they may manage manuals.
   *
   * The list is filtered by the backend from the caller's roles. The UI never receives a manual
   * the user is not entitled to, so there is nothing to filter here.
   */
  async fetchMyManuals() {
    try {
      const response = await api.get(BASE);
      const payload = response.data?.payload ?? {};
      return { canManage: !!payload.canManage, manuals: payload.manuals ?? [] };
    } catch (err) {
      return { error: message(err, 'Could not load user manuals.') };
    }
  },

  /**
   * Downloads a manual as a blob.
   *
   * Fetched through the API client rather than linked to directly: the endpoint needs the bearer
   * token, and there is no public URL for a stored manual by design.
   */
  async downloadManual(manualId) {
    try {
      const response = await api.get(`${BASE}/${manualId}/download`, {
        responseType: 'blob',
        timeout: FILE_TRANSFER_TIMEOUT_MS
      });
      return {
        blob: response.data,
        fileName: fileNameFromDisposition(response.headers?.['content-disposition'])
      };
    } catch (err) {
      return { error: await blobErrorMessage(err, 'Could not open this manual.') };
    }
  },

  // ----------------------------- administration -----------------------------

  async fetchAllManuals({ page = 0, size = 10, search = '', isActive = null } = {}) {
    try {
      const response = await api.get(ADMIN, {
        params: {
          page,
          size,
          ...(search ? { search } : {}),
          ...(isActive === null || isActive === '' ? {} : { isActive })
        }
      });
      return response.data?.payload ?? { content: [], totalElements: 0 };
    } catch (err) {
      return { error: message(err, 'Could not load manuals.') };
    }
  },

  async fetchAssignableRoles() {
    try {
      const response = await api.get(`${ADMIN}/roles`);
      return response.data?.payload ?? [];
    } catch (err) {
      // The status is reported back so the screen can tell "you may not manage manuals" apart
      // from "the request failed"; a network blip must not be shown as a refusal.
      return { error: message(err, 'Could not load roles.'), status: err.response?.status };
    }
  },

  /**
   * Creates a manual, or updates the one identified by id.
   *
   * Sent as multipart because of the PDF. The file is optional when editing, so a title or role
   * change does not require re-uploading it.
   */
  async saveManual({ id, title, description, roleIds, isActive, file }) {
    const form = new FormData();
    if (id) form.append('id', id);
    form.append('title', title ?? '');
    if (description) form.append('description', description);
    (roleIds ?? []).forEach((roleId) => form.append('roleIds', roleId));
    if (isActive !== undefined && isActive !== null) form.append('isActive', isActive);
    if (file) form.append('file', file);

    try {
      const response = await api.post(`${ADMIN}/save`, form, {
        timeout: FILE_TRANSFER_TIMEOUT_MS
      });
      return { payload: response.data?.payload, message: response.data?.message };
    } catch (err) {
      return { error: message(err, 'Could not save the manual.') };
    }
  },

  async deactivateManual(manualId) {
    try {
      const response = await api.delete(`${ADMIN}/${manualId}`);
      return { message: response.data?.message };
    } catch (err) {
      return { error: message(err, 'Could not deactivate the manual.') };
    }
  }
};

/** Reads the served filename out of Content-Disposition, which the gateway exposes to the browser. */
function fileNameFromDisposition(disposition) {
  if (!disposition) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) return decodeURIComponent(utf8[1]);
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : null;
}

/**
 * Reads an error message out of a failed blob request.
 *
 * With responseType 'blob', an error body arrives as a Blob rather than parsed JSON, so it has to
 * be read back before the message can be shown.
 */
async function blobErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message || fallback;
}

export default userManualService;
