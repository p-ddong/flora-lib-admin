"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loginTime = localStorage.getItem('loginTime');

    if (!token || !loginTime) {
      // Không có token hoặc chưa lưu loginTime
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      router.replace('/login');
      return;
    }

    const now = Date.now();
    const loginTimestamp = new Date(loginTime).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - loginTimestamp > oneDay) {
      // Đã quá 1 ngày
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      router.replace('/login');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return <div />;
}
