'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { INTEREST_OPTIONS } from '@/types';
import api from '@/lib/api';
import type { Post, Gathering, ApiResponse, PageResponse } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'posts' | 'gatherings'>('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    nickname: '', 
    bio: '', 
    neighborhood: '',
    age: '' as string | number,
    gender: 'SECRET' as 'MALE' | 'FEMALE' | 'SECRET',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myGatherings, setMyGatherings] = useState<Gathering[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm({ 
        nickname: user.nickname, 
        bio: user.bio || '', 
        neighborhood: user.neighborhood || '',
        age: user.age || '',
        gender: user.gender || 'SECRET'
      });
      setSelectedInterests(user.interests || []);
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'posts' && isAuthenticated) {
      api.get<ApiResponse<PageResponse<Post>>>('/posts/me').then(res => setMyPosts(res.data.data.content));
    }
    if (tab === 'gatherings' && isAuthenticated) {
      api.get<ApiResponse<PageResponse<Gathering>>>('/gatherings/me').then(res => setMyGatherings(res.data.data.content));
    }
  }, [tab, isAuthenticated]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({
        nickname: form.nickname,
        bio: form.bio,
        neighborhood: form.neighborhood,
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        interests: selectedInterests,
      } as any);
      setEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--color-surface-300)' }}>로딩 중...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Profile Header */}
      <div className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: 'white', flexShrink: 0,
          }}>
            {user.nickname?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{user.nickname}</h1>
            <p style={{ color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>{user.email}</p>
            {user.neighborhood && (
              <span className="badge badge-primary" style={{ marginTop: '6px', marginRight: '6px' }}>📍 {user.neighborhood}</span>
            )}
            {user.age && (
              <span className="badge badge-secondary" style={{ marginTop: '6px', marginRight: '6px' }}>{user.age}세</span>
            )}
            {user.gender !== 'SECRET' && (
              <span className="badge badge-secondary" style={{ marginTop: '6px' }}>{user.gender === 'MALE' ? '남성' : '여성'}</span>
            )}
          </div>
        </div>
        {user.bio && <p style={{ color: 'var(--color-surface-200)', fontSize: '0.9rem', lineHeight: 1.6 }}>{user.bio}</p>}
        {user.interests?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
            {user.interests.map((interest: string) => (
              <span key={interest} className="interest-tag">{interest}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(15, 23, 42, 0.5)', padding: '4px', borderRadius: '14px' }}>
        {[
          { key: 'profile' as const, label: '프로필 수정' },
          { key: 'posts' as const, label: '내 게시글' },
          { key: 'gatherings' as const, label: '내 모임' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            background: tab === t.key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: tab === t.key ? 'var(--color-primary-400)' : 'var(--color-surface-300)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Profile Edit */}
      {tab === 'profile' && (
        <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>닉네임</label>
            <input className="glass-input" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>자기소개</label>
            <textarea className="glass-input" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>동네</label>
            <input className="glass-input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>나이</label>
              <input type="number" className="glass-input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} min="10" max="100" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>성별</label>
              <select className="glass-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
                <option value="SECRET">비공개</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>관심사</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTEREST_OPTIONS.map((interest) => (
                <button key={interest} type="button"
                  className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest])}>
                  {interest}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
            {saving ? '저장 중...' : '프로필 저장'}
          </button>
        </div>
      )}

      {/* My Posts */}
      {tab === 'posts' && (
        <div className="animate-fade-in">
          {myPosts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-surface-300)' }}>
              작성한 게시글이 없습니다
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myPosts.map((post) => (
                <a key={post.id} href={`/board/${post.category.toLowerCase()}/${post.id}`}
                  className="glass-card" style={{ padding: '20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{post.category}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-100)' }}>{post.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--color-surface-300)', fontSize: '0.8rem' }}>
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                      <span>👁️ {post.viewCount}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Gatherings */}
      {tab === 'gatherings' && (
        <div className="animate-fade-in">
          {myGatherings.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-surface-300)' }}>
              참여한 모임이 없습니다
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myGatherings.map((g) => (
                <a key={g.id} href={`/gathering/${g.id}`}
                  className="glass-card" style={{ padding: '20px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <span className={`badge ${g.status === 'RECRUITING' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '8px' }}>{g.status === 'RECRUITING' ? '모집중' : '마감'}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-100)' }}>{g.title}</h3>
                      <p style={{ color: 'var(--color-surface-300)', fontSize: '0.85rem', marginTop: '4px' }}>📍 {g.location} · 👥 {g.currentParticipants}/{g.maxParticipants}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
