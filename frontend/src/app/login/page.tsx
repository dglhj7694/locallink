'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
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
        maxWidth: '420px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
            color: 'white',
            margin: '0 auto 16px',
          }}>L</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>
            로그인
          </h1>
          <p style={{ color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>
            LocalLink에 돌아오신 걸 환영합니다
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
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--color-surface-200)',
            }}>이메일</label>
            <input
              type="email"
              className="glass-input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--color-surface-200)',
            }}>비밀번호</label>
            <input
              type="password"
              className="glass-input"
              placeholder="6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.9rem',
          color: 'var(--color-surface-300)',
        }}>
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" style={{
            color: 'var(--color-primary-400)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>회원가입</Link>
        </p>
      </div>
    </div>
  );
}
