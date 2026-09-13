import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/auth/AuthProvider';
import { TanStackProvider } from '@/contexts/providers/TanStackProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
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

const THEME_INIT = `(function(){try{var t=localStorage.getItem('netra_theme');if(t==='dark'){document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${inter.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className={`${inter.className} bg-page text-main light antialiased`}>
        <TanStackProvider>
          <ThemeProvider>
            <AuthProvider>
              <RoleLayout>{children}</RoleLayout>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}
