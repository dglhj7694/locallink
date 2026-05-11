'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { INTEREST_OPTIONS } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    neighborhood: '',
    age: '' as string | number,
    gender: 'SECRET' as 'MALE' | 'FEMALE' | 'SECRET',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
        neighborhood: form.neighborhood || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: '24px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>
            회원가입
          </h1>
          <p style={{ color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>
            LocalLink에서 동네 이웃을 만나보세요
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
              이메일 *
            </label>
            <input type="email" className="glass-input" placeholder="example@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                비밀번호 *
              </label>
              <input type="password" className="glass-input" placeholder="6자 이상"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                비밀번호 확인 *
              </label>
              <input type="password" className="glass-input" placeholder="비밀번호 확인"
                value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                닉네임 *
              </label>
              <input type="text" className="glass-input" placeholder="2~30자"
                value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                동네
              </label>
              <input type="text" className="glass-input" placeholder="예: 강남구"
                value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                나이
              </label>
              <input type="number" className="glass-input" placeholder="예: 25" min="10" max="100"
                value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
                성별
              </label>
              <select className="glass-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
                <option value="SECRET">비공개</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-surface-200)' }}>
              관심사 (선택)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--color-surface-300)' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary-400)', textDecoration: 'none', fontWeight: 600 }}>로그인</Link>
        </p>
      </div>
    </div>
  );
}
