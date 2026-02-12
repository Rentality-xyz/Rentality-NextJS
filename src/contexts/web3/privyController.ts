let _login: null | (() => void) = null;
let _logout: null | (() => Promise<void>) = null;

export function registerPrivyLogin(fn: () => void) {
  _login = fn;
}

export function registerPrivyLogout(fn: () => Promise<void>) {
  _logout = fn;
}

export function openPrivyLogin() {
  _login?.();
}

export async function openPrivyLogout() {
  if (_logout) {
    await _logout();
  }
}
