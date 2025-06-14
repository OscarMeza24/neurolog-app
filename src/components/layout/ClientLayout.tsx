// src/components/layout/ClientLayout.tsx
'use client';

import { AuthLayout } from './AuthLayout';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}
