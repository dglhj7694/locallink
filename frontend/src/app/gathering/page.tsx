'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Gathering, ApiResponse, PageResponse, GATHERING_CATEGORY_LABELS, GatheringCategory } from '@/types';

function GatheringListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [recommended, setRecommended] = useState<Gathering[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGatherings(); if (isAuthenticated) loadRecommended(); }, [selectedCategory]);

  const loadGatherings = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<Gathering>>>('/gatherings', { params: { category: selectedCategory || undefined, page: 0, size: 20 } });
      setGatherings(res.data.data.content);
    } catch {} finally { setLoading(false); }
  };

  const loadRecommended = async () => {
    try {
      const res = await api.get<ApiResponse<PageResponse<Gathering>>>('/gatherings/recommended', { params: { page: 0, size: 6 } });
      setRecommended(res.data.data.content);
    } catch {}
  };

  const categories = Object.entries(GATHERING_CATEGORY_LABELS) as [GatheringCategory, string][];

  const fmt = (d: string) => { const date = new Date(d); return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`; };

  const renderCard = (g: Gathering) => (
    <Link key={g.id} href={`/gathering/${g.id}`} className="glass-card" style={{ padding: '24px', textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <span className={`badge ${g.status === 'RECRUITING' ? 'badge-success' : 'badge-warning'}`}>{g.status === 'RECRUITING' ? '모집중' : '마감'}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-surface-300)' }}>{GATHERING_CATEGORY_LABELS[g.category]}</span>
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', color: 'var(--color-surface-100)' }}>{g.title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-surface-300)', lineHeight: 1.5, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-surface-300)', marginBottom: '14px' }}>
        <span>📍 {g.location || '장소 미정'}</span>
        <span>📅 {fmt(g.eventDate)}</span>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
          <span style={{ color: 'var(--color-surface-300)' }}>참여 현황</span>
          <span style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>{g.currentParticipants}/{g.maxParticipants}</span>
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(g.currentParticipants / g.maxParticipants) * 100}%` }} /></div>
      </div>
      {g.interests?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {g.interests.slice(0, 4).map(i => <span key={i} className="interest-tag" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>{i}</span>)}
        </div>
      )}
    </Link>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>👥 모임</h1>
        {isAuthenticated && <Link href="/gathering/new" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.9rem' }}>➕ 모임 만들기</Link>}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }} className="animate-fade-in">
        <button onClick={() => setSelectedCategory('')} style={{ padding: '8px 18px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', background: !selectedCategory ? 'var(--color-primary-600)' : 'rgba(30,41,59,0.6)', color: !selectedCategory ? 'white' : 'var(--color-surface-300)' }}>전체</button>
        {categories.map(([key, label]) => (
          <button key={key} onClick={() => setSelectedCategory(key)} style={{ padding: '8px 18px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', background: selectedCategory === key ? 'var(--color-primary-600)' : 'rgba(30,41,59,0.6)', color: selectedCategory === key ? 'white' : 'var(--color-surface-300)' }}>{label}</button>
        ))}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && !selectedCategory && (
        <section style={{ marginBottom: '40px' }} className="animate-slide-up">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-accent-300)' }}>🎯 추천 모임</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {recommended.map(renderCard)}
          </div>
        </section>
      )}

      {/* All Gatherings */}
      <section className="animate-slide-up">
        {!selectedCategory && recommended.length > 0 && <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>📋 전체 모임</h2>}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '250px', borderRadius: '16px' }} />)}
          </div>
        ) : gatherings.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-surface-300)' }}>모임이 없습니다. 새 모임을 만들어보세요!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {gatherings.map(renderCard)}
          </div>
        )}
      </section>
    </div>
  );
}

export default function GatheringListPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px', color: 'var(--color-surface-300)' }}>로딩 중...</div>}>
      <GatheringListContent />
    </Suspense>
  );
}
