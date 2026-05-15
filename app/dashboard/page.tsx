'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Dashboard redirects to the main app (/)
export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
