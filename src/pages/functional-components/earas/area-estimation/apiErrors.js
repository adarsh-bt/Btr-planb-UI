/**
 * One place that turns an Area Estimation API failure into something a user can act on.
 *
 * The backend returns a consistent body for every deliberate failure:
 *   { payload: null, message, errorCode, timestamp }
 * plus, on some, `requiredPermission` or `previousStage`.
 *
 * The backend's message is preferred wherever it exists, because it is written for the operator —
 * "12 zones have not completed Form-1 submission", not "Request failed with status code 422". The
 * mapping below is the fallback for the cases where there is no body at all: a network failure, a
 * gateway timeout, or an unexpected 500.
 *
 * A stack trace is never surfaced. The service already withholds internal detail on a 500, and
 * nothing here reintroduces it.
 */

/** What each status means in this module, used when the response carries no message of its own. */
const STATUS_FALLBACKS = {
  400: 'The request was not valid. Check the selected year, season and land type.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The estimation run or record could not be found.',
  409: 'This record changed since it was loaded, or the action is not allowed in its current state. Reload and try again.',
  422: 'The data required for this action is incomplete.',
  500: 'An unexpected error occurred. Please contact support if it persists.',
  502: 'A dependent service (BTR, Form-1 or User Access) could not be reached. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The request took too long. Please try again.'
};

/**
 * Normalises any thrown API error into a predictable shape.
 *
 * Returns `{ status, code, message, requiredPermission, previousStage, isAuthError, isConflict }`.
 */
export const toApiError = (error) => {
  // No response at all: the request never reached the gateway.
  if (!error?.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'The server could not be reached. Check your connection and try again.',
      isAuthError: false,
      isConflict: false
    };
  }

  const { status, data } = error.response;

  return {
    status,
    code: data?.errorCode || `HTTP_${status}`,
    // The backend's own wording first: it is written for the person reading it.
    message: data?.message || STATUS_FALLBACKS[status] || 'The request could not be completed.',
    requiredPermission: data?.requiredPermission,
    previousStage: data?.previousStage,
    isAuthError: status === 401 || status === 403,
    isConflict: status === 409
  };
};

/** The message alone, for a toast or an inline alert. */
export const apiErrorMessage = (error) => toApiError(error).message;

/**
 * True when the failure means "this user may not", rather than "this went wrong".
 *
 * Worth distinguishing: a 403 is a legitimate outcome the screen should explain calmly, not an
 * error state to apologise for.
 */
export const isPermissionError = (error) => toApiError(error).status === 403;

/** True when a run or record does not exist — the screen shows an empty state, not a failure. */
export const isNotFound = (error) => toApiError(error).status === 404;
