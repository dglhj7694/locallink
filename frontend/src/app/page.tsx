'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { GATHERING_CATEGORY_LABELS, GatheringCategory } from '@/types';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  const categories = Object.entries(GATHERING_CATEGORY_LABELS) as [GatheringCategory, string][];

  const boardLinks = [
    { href: '/board/free', label: '자유게시판', icon: '💬', desc: '자유롭게 소통해요' },
    { href: '/board/neighborhood', label: '동네정보', icon: '📍', desc: '우리 동네 꿀정보' },
    { href: '/board/question', label: '질문게시판', icon: '❓', desc: '궁금한 건 물어보세요' },
    { href: '/board/marketplace', label: '중고거래', icon: '🛒', desc: '이웃과 거래해요' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '60px 0 80px' }} className="animate-fade-in">
        <div style={{
          display: 'inline-flex',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: 'var(--color-primary-400)',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: '24px',
        }}>
          ✨ 관심사 기반 동네 커뮤니티
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c4b5fd 50%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          우리 동네에서<br />함께할 사람을 찾아보세요
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-surface-300)',
          maxWidth: '550px',
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          맛집 탐방, 러닝, 보드게임, 스터디까지<br />
          같은 관심사를 가진 이웃들과 모임을 만들어보세요
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/gathering" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
            🎯 모임 둘러보기
          </Link>
          {!isAuthenticated && (
            <Link href="/signup" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', textDecoration: 'none' }}>
              회원가입하기
            </Link>
          )}
        </div>
      </section>

      {/* Gathering Categories */}
      <section style={{ marginBottom: '80px' }} className="animate-slide-up">
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '24px',
          color: 'var(--color-surface-100)',
        }}>
          🎲 모임 카테고리
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '14px',
        }}>
          {categories.map(([key, label]) => (
            <Link
              key={key}
              href={`/gathering?category=${key}`}
              className="glass-card"
              style={{
                padding: '24px 20px',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                {label.split(' ')[0]}
              </div>
              <div style={{
                color: 'var(--color-surface-200)',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}>
                {label.split(' ').slice(1).join(' ')}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Board Links */}
      <section className="animate-slide-up">
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '24px',
          color: 'var(--color-surface-100)',
        }}>
          📋 게시판
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
        }}>
          {boardLinks.map((board) => (
            <Link
              key={board.href}
              href={board.href}
              className="glass-card"
              style={{
                padding: '24px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {board.icon}
              </div>
              <div>
                <div style={{
                  color: 'var(--color-surface-100)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  marginBottom: '4px',
                }}>
                  {board.label}
                </div>
                <div style={{
                  color: 'var(--color-surface-300)',
                  fontSize: '0.85rem',
                }}>
                  {board.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
