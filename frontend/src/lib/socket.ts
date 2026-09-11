import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { tokenStore } from '@/auth/tokenStore';
import { useEffect, useState } from 'react';

const socketInstances = new Map<string, Socket>();

export function getSocket(namespace = ''): Socket {
  const existing = socketInstances.get(namespace);
  if (existing && existing.connected) return existing;

  const url = `${env.NEXT_PUBLIC_SOCKET_URL || env.NEXT_PUBLIC_API_BASE_URL}${namespace}`;
  const token = tokenStore.get() || '';

  const socket = io(url, {
    auth: { token },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    transports: ['websocket', 'polling'],
  });

  socketInstances.set(namespace, socket);
  return socket;
}

export function disconnectSocket() {
  socketInstances.forEach((socket) => {
    try {
      socket.disconnect();
    } catch {}
  });
  socketInstances.clear();
}

export function useSocketEvent<T = any>(namespace: string, event: string, handler: (data: T) => void) {
  useEffect(() => {
    if (env.NEXT_PUBLIC_ENABLE_REAL_TIME !== 'true') return;
    try {
      const socket = getSocket(namespace);
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    } catch (e) {
      console.warn('Socket connection skipped', e);
    }
  }, [namespace, event, handler]);
}
