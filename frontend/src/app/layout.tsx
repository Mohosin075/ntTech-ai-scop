import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

const sansFont = Lato({
  subsets: ['latin'],
  variable: '--font-source-sans',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScopeAI - Project Scoping & Milestone Cost Engine',
  description: 'Software scoping tool for calculating engineering hours, risk contingency, and milestone deliverables.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sansFont.variable} font-sans bg-[#f7f7f4] text-[#182b39] min-h-screen antialiased`}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
