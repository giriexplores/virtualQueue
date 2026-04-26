import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export function useSocket(_queueId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [connect]);

  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    const handler = (data: unknown) => callback(data);
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return { subscribe, socket: socketRef.current };
}