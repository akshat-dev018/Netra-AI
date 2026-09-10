import axios from 'axios';
import { tokenStore } from '@/auth/tokenStore';
import { refreshClient } from './refreshClient';
import { env } from '@/lib/env';

export const client = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 10_000,
});

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.error?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        const token = data.data.accessToken;
        tokenStore.set(token);
        refreshQueue.forEach((p) => p.resolve(token));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      } catch {
        refreshQueue.forEach((p) => p.reject(new Error('Refresh failed')));
        refreshQueue = [];
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
