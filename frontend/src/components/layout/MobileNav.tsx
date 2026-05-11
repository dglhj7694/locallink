'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/board/free', label: '게시판', icon: '📋' },
    { href: '/gathering', label: '모임', icon: '👥' },
    { href: '/chat', label: '채팅', icon: '💬' },
    { href: '/profile', label: '프로필', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'rgba(2, 6, 23, 0.9)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'none',
      padding: '6px 0 env(safe-area-inset-bottom, 6px)',
    }} className="mobile-nav-container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-nav-container { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
