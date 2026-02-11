export type AuthSnapshot = {
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
};

let snapshot: AuthSnapshot = {
  isLoadingAuth: true,
  isAuthenticated: false,
};

const listeners = new Set<() => void>();

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

export function setAuthSnapshot(next: Partial<AuthSnapshot>) {
  const merged: AuthSnapshot = { ...snapshot, ...next };

  if (merged.isLoadingAuth === snapshot.isLoadingAuth && merged.isAuthenticated === snapshot.isAuthenticated) {
    return;
  }

  snapshot = merged;
  listeners.forEach((l) => l());
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
