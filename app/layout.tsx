import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm' });

export const metadata: Metadata = {
  title: 'BURN GT PRO',
  description: 'Tu sistema completo de entrenamiento y nutrición',
};

const isDevMode = process.env.DEV_MODE === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${bebasNeue.variable} ${dmSans.variable} bg-[#0a0a0a] text-[#f2f0ea] antialiased min-h-screen`}>
        {isDevMode && (
          <div className="dev-banner">
            ⚡ MODO DESARROLLO — IA usa datos mock · Cambia DEV_MODE=false para producción
          </div>
        )}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
