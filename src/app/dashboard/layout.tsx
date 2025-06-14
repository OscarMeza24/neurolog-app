// src/app/dashboard/layout.tsx
// Layout del dashboard completamente responsivo

import { ClientLayout } from '@/components/layout/ClientLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <ClientLayout>
        {children}
      </ClientLayout>
    </div>
  );
}