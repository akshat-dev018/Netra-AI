import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/auth/AuthProvider';
import { TanStackProvider } from '@/contexts/providers/TanStackProvider';
import { Toaster } from 'react-hot-toast';
import { RoleLayout } from '@/components/layout/RoleLayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'FreightIntel — AI Freight Command & Intelligence Platform',
  description: 'National Emergency & Transport Risk Analytics — Real-time freight intelligence, corridor monitoring, and predictive logistics control tower.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} bg-[#070B13] text-slate-100 antialiased`}>
        <TanStackProvider>
          <AuthProvider>
            <RoleLayout>{children}</RoleLayout>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0E1626',
                  color: '#F1F5F9',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '13px',
                },
              }}
            />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}