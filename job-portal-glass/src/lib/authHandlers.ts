/**
 * Auth handlers – callback registry for 401 Unauthorized.
 * Used by apiClient to trigger auth clear + redirect without circular deps.
 */

type UnauthorizedHandler = () => void;

const handlers: UnauthorizedHandler[] = [];

export function registerOnUnauthorized(handler: UnauthorizedHandler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.indexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

export function triggerUnauthorized(): void {
  handlers.forEach((h) => h());
}
