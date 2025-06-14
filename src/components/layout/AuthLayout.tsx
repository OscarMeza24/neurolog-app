// src/components/layout/AuthLayout.tsx
'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthProvider>
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - Fixed at top */}
          <Header />
          
          {/* Page Content - Scrollable */}
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
                {/* Responsive content wrapper */}
                <div className="w-full">
                  {children}
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
