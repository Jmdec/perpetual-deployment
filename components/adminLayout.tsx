"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/adminHeader';
import { authClient } from '@/lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('AdminLayout: Checking authentication...');

        // Get user from cookie-based auth
        const currentUser = await authClient.getCurrentUser();

        console.log('AdminLayout: User data received:', currentUser);

        if (!currentUser) {
          console.log('AdminLayout: No user found, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user is an admin
        if (currentUser.role !== 'admin') {
          console.log('AdminLayout: User is not an admin, role:', currentUser.role);
          router.push('/login');
          return;
        }

        console.log('AdminLayout: Auth successful, user:', currentUser.name);
        setUser(currentUser);
      } catch (error) {
        console.error('AdminLayout: Auth check error:', error);
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
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">

      {/* Sidebar - Desktop only */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed} isMobileOpen={false} setIsMobileOpen={function (v: boolean): void {
          throw new Error('Function not implemented.');
        } }      />

      {/* Main Content */}
      <div className={`pb-20 lg:pb-0 transition-all duration-300  ${isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[300px]"}  `}>

        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

    </div>
  );
}