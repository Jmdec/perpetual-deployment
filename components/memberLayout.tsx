"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/MemberSidebar';
import MemberHeader from '@/components/memberHeader';
import { authClient } from '@/lib/auth';

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('MemberLayout: Checking authentication...');

        // Get user from cookie-based auth
        const currentUser = await authClient.getCurrentUser();

        console.log('MemberLayout: User data received:', currentUser);

        if (!currentUser) {
          console.log('MemberLayout: No user found, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user is a member
        if (currentUser.role !== 'member') {
          console.log('MemberLayout: User is not a member, role:', currentUser.role);
          router.push('/register');
          return;
        }

        console.log('MemberLayout: Auth successful, user:', currentUser.name);
        setUser(currentUser);
      } catch (error) {
        console.error('MemberLayout: Auth check error:', error);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []); // Run only once on mount

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render content if no user (will redirect anyway)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar - Desktop only */}
      <MemberSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`pb-20 lg:pb-0 transition-all duration-300  ${isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[300px]"}  `}>
        {/* Header */}
        <MemberHeader />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}