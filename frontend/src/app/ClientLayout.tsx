'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { useAuthStore } from '@/store/authStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Header />
      <main style={{
        paddingTop: '64px',
        paddingBottom: '80px',
        minHeight: '100vh',
      }} className="bg-gradient-main">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
