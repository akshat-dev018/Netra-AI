import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';

const socketInstances = new Map<string, Socket>();

export function getSocket(namespace = ''): Socket {
  const existing = socketInstances.get(namespace);
  if (existing) return existing;

  const socket = io(`${env.NEXT_PUBLIC_SOCKET_URL || env.NEXT_PUBLIC_API_BASE_URL}${namespace}`, {
    auth: async (cb: (token: string) => void) => {
      const { tokenStore } = await import('@/auth/tokenStore');
      cb(tokenStore.get() || '');
    },
    reconnection: true,
    reconnectionAttempts: 5,
  });
  socketInstances.set(namespace, socket);
  return socket;
}

export function disconnectSocket() {
  socketInstances.forEach((socket) => socket.disconnect());
  socketInstances.clear();
}
