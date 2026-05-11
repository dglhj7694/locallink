'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ChatRoom, ApiResponse } from '@/types';

export default function ChatListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get<ApiResponse<ChatRoom[]>>('/chat/rooms')
        .then(res => setRooms(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--color-surface-300)' }}>로딩 중...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '28px' }} className="animate-fade-in">💬 채팅</h1>
      {rooms.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-surface-300)' }}>
          <p style={{ marginBottom: '16px' }}>참여 중인 채팅방이 없습니다</p>
          <Link href="/gathering" className="btn-primary" style={{ textDecoration: 'none' }}>모임 참여하기</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rooms.map((room, i) => (
            <Link key={room.id} href={`/chat/${room.id}`} className="glass-card animate-fade-in"
              style={{ padding: '18px 22px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>💬</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-surface-100)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-surface-300)' }}>👥 {room.participantCount}명 참여중</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
