'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/board/free', label: '자유게시판' },
    { href: '/board/neighborhood', label: '동네정보' },
    { href: '/board/question', label: '질문' },
    { href: '/board/marketplace', label: '중고거래' },
    { href: '/gathering', label: '모임' },
    { href: '/chat', label: '채팅' },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'rgba(2, 6, 23, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 800,
            color: 'white',
          }}>L</div>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>LocalLink</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }} className="hidden-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  color: 'var(--color-surface-100)',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontWeight: 500 }}>{user?.nickname}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '180px',
                  background: 'var(--color-surface-900)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '14px',
                  padding: '8px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }} className="animate-fade-in">
                  <Link href="/profile" onClick={() => setShowDropdown(false)} style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--color-surface-200)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >👤 프로필</Link>
                  <button onClick={() => { logout(); setShowDropdown(false); router.push('/'); }} style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'var(--color-danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >🚪 로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem', textDecoration: 'none' }}>
                로그인
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', textDecoration: 'none' }}>
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
