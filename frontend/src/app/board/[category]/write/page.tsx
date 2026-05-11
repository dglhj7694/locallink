'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BOARD_CATEGORY_LABELS, BoardCategory } from '@/types';

export default function WritePostPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const category = (params.category as string).toUpperCase() as BoardCategory;
  const [form, setForm] = useState({ title: '', content: '', price: '', tradeStatus: 'SELLING' });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push('/login'); }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const postData: any = { title: form.title, content: form.content, category };
      if (category === 'MARKETPLACE') {
        postData.price = parseInt(form.price) || 0;
        postData.tradeStatus = form.tradeStatus;
      }
      formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
      images.forEach(img => formData.append('images', img));

      await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      router.push(`/board/${params.category}`);
    } catch (err: any) {
      alert(err.response?.data?.message || '작성에 실패했습니다.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '28px' }} className="animate-fade-in">
        ✏️ {BOARD_CATEGORY_LABELS[category]} 글쓰기
      </h1>
      <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>제목</label>
          <input className="glass-input" placeholder="제목을 입력하세요" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>내용</label>
          <textarea className="glass-input" rows={10} placeholder="내용을 입력하세요" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required style={{ resize: 'vertical', minHeight: '200px' }} />
        </div>
        {category === 'MARKETPLACE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>가격 (원)</label>
              <input className="glass-input" type="number" placeholder="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>거래 상태</label>
              <select className="glass-input" value={form.tradeStatus} onChange={e => setForm({ ...form, tradeStatus: e.target.value })}>
                <option value="SELLING">판매중</option>
                <option value="RESERVED">예약중</option>
                <option value="SOLD">판매완료</option>
              </select>
            </div>
          </div>
        )}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>이미지</label>
          <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files || []))}
            style={{ color: 'var(--color-surface-300)', fontSize: '0.9rem' }} />
          {images.length > 0 && <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-surface-300)' }}>{images.length}개 파일 선택됨</p>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ flex: 1 }}>취소</button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>{loading ? '작성 중...' : '작성하기'}</button>
        </div>
      </form>
    </div>
  );
}
