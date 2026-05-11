import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export function connectWebSocket(
  onConnect: () => void,
  onError?: (error: any) => void
) {
  if (stompClient?.active) return stompClient;

  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws') as any,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected');
      onConnect();
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
      onError?.(frame);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  client.activate();
  stompClient = client;
  return client;
}

export function disconnectWebSocket() {
  if (stompClient?.active) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function subscribeToChatRoom(
  roomId: number,
  callback: (message: any) => void
) {
  if (!stompClient?.active) return null;

  return stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
    const body = JSON.parse(message.body);
    callback(body);
  });
}

export function sendChatMessage(
  roomId: number,
  content: string,
  type: string = 'CHAT'
) {
  if (!stompClient?.active) return;

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  stompClient.publish({
    destination: `/app/chat/${roomId}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ roomId, content, type }),
  });
}

export function getStompClient() {
  return stompClient;
}
