// The encrypted-channel feature is not part of this backend: these are no-op stand-ins so the
// API client keeps working unchanged.
export function resetSecureChannel() {}
export async function getXhrChannel() { return null; }
export function installSecureFetch() {}
