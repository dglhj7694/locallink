'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ChatMessage, ApiResponse, PageResponse } from '@/types';
import { connectWebSocket, subscribeToChatRoom, sendChatMessage, disconnectWebSocket } from '@/lib/websocket';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const roomId = Number(params.roomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isLoading, isAuthenticated, router]);

  // Load history
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<ApiResponse<PageResponse<ChatMessage>>>(`/chat/rooms/${roomId}/messages`, { params: { page: 0, size: 50 } })
      .then(res => setMessages(res.data.data.content.reverse()));
  }, [roomId, isAuthenticated]);

  // Connect WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;
    const client = connectWebSocket(() => {
      setConnected(true);
      subscribeToChatRoom(roomId, (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
      });
    });
    return () => { disconnectWebSocket(); };
  }, [roomId, isAuthenticated]);

  // Auto scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !connected) return;
    sendChatMessage(roomId, input.trim());
    setInput('');
  };

  const fmt = (d: string) => {
    const date = new Date(d);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Chat Header */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(2,6,23,0.5)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => router.push('/chat')} style={{ background: 'none', border: 'none', color: 'var(--color-surface-200)', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>채팅방 #{roomId}</div>
          <div style={{ fontSize: '0.75rem', color: connected ? 'var(--color-success)' : 'var(--color-surface-300)' }}>{connected ? '● 연결됨' : '연결 중...'}</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-surface-300)', padding: '40px', fontSize: '0.9rem' }}>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender.id === user?.id;
          if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
            return (
              <div key={msg.id || i} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-surface-300)', padding: '8px' }}>
                {msg.sender.nickname}님이 {msg.type === 'JOIN' ? '입장' : '퇴장'}했습니다
              </div>
            );
          }
          return (
            <div key={msg.id || i} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px' }}>
              {!isMine && (
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {msg.sender.nickname.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                {!isMine && <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-300)', marginBottom: '4px', marginLeft: '4px' }}>{msg.sender.nickname}</div>}
                <div className={isMine ? 'chat-bubble chat-bubble-mine' : 'chat-bubble chat-bubble-other'}>{msg.content}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-surface-300)', marginTop: '4px', textAlign: isMine ? 'right' : 'left', paddingInline: '4px' }}>{fmt(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '14px 24px', borderTop: '1px solid rgba(148,163,184,0.1)', background: 'rgba(2,6,23,0.5)', backdropFilter: 'blur(10px)', display: 'flex', gap: '8px' }}>
        <input className="glass-input" placeholder="메시지를 입력하세요" value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} autoFocus />
        <button type="submit" className="btn-primary" disabled={!connected || !input.trim()} style={{ padding: '12px 24px' }}>전송</button>
      </form>
    </div>
  );
}
