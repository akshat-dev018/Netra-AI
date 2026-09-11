let _token: string | null = null;

const STORAGE_KEY = 'netra_access_token';

export const tokenStore = {
  get: () => {
    if (_token) return _token;
    if (typeof window !== 'undefined') {
      _token = localStorage.getItem(STORAGE_KEY);
    }
    return _token;
  },
  set: (t: string) => {
    _token = t;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, t);
    }
  },
  clear: () => {
    _token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
