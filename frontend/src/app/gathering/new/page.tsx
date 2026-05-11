'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { GATHERING_CATEGORY_LABELS, GatheringCategory, INTEREST_OPTIONS } from '@/types';

export default function NewGatheringPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [form, setForm] = useState({ 
    title: '', description: '', location: '', eventDate: '', maxParticipants: '5', category: 'FOOD',
    latitude: null as number | null, longitude: null as number | null,
    minAge: '', maxAge: '', targetGender: 'ANY' as 'ANY' | 'MALE_ONLY' | 'FEMALE_ONLY'
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/gatherings', { 
        ...form, 
        maxParticipants: parseInt(form.maxParticipants), 
        eventDate: new Date(form.eventDate).toISOString(), 
        interests,
        minAge: form.minAge ? parseInt(form.minAge) : null,
        maxAge: form.maxAge ? parseInt(form.maxAge) : null
      });
      router.push('/gathering');
    } catch (err: any) { alert(err.response?.data?.message || '생성에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  const categories = Object.entries(GATHERING_CATEGORY_LABELS) as [GatheringCategory, string][];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '28px' }} className="animate-fade-in">➕ 새 모임 만들기</h1>
      <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>카테고리 *</label>
          <select className="glass-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>모임 제목 *</label>
          <input className="glass-input" placeholder="예: 강남역 맛집 탐방!" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>설명</label>
          <textarea className="glass-input" rows={5} placeholder="모임에 대해 설명해주세요" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>장소 *</label>
          <input className="glass-input" placeholder="모임 장소" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>최소 나이 (선택)</label>
            <input className="glass-input" type="number" min="10" max="100" placeholder="제한 없음" value={form.minAge} onChange={e => setForm({ ...form, minAge: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>최대 나이 (선택)</label>
            <input className="glass-input" type="number" min="10" max="100" placeholder="제한 없음" value={form.maxAge} onChange={e => setForm({ ...form, maxAge: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>성별 제한</label>
            <select className="glass-input" value={form.targetGender} onChange={e => setForm({ ...form, targetGender: e.target.value as any })}>
              <option value="ANY">제한 없음</option>
              <option value="MALE_ONLY">남성만</option>
              <option value="FEMALE_ONLY">여성만</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>최대 인원 *</label>
            <input className="glass-input" type="number" min="2" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} required />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>일시 *</label>
          <input className="glass-input" type="datetime-local" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>관련 관심사</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {INTEREST_OPTIONS.map(i => (
              <button key={i} type="button" className={`interest-tag ${interests.includes(i) ? 'selected' : ''}`}
                onClick={() => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}>{i}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ flex: 1 }}>취소</button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>{loading ? '생성 중...' : '모임 만들기'}</button>
        </div>
      </form>
    </div>
  );
}
