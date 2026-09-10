import './globals.css';
import { AuthProvider } from '@/auth/AuthProvider';
import { ColorblindProvider } from '@/contexts/providers/ColorblindProvider';
import { TanStackProvider } from '@/contexts/providers/TanStackProvider';
import { Toaster } from 'react-hot-toast';
import { RoleLayout } from '@/components/layout/RoleLayout';

export const metadata = {
  title: 'NETRA — National Emergency & Transport Risk Analytics',
  description: 'Freight Intelligence & Predictive Logistics Control Tower',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-primary font-sans antialiased">
        <TanStackProvider>
          <ColorblindProvider>
            <AuthProvider>
              <RoleLayout>{children}</RoleLayout>
              <Toaster position="top-right" />
            </AuthProvider>
          </ColorblindProvider>
        </TanStackProvider>
      </body>
    </html>
  );
}