'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={active ? '#c8ff00' : 'rgba(255,255,255,0.3)'} />
      </svg>
    ),
  },
  {
    href: '/workout',
    label: 'Entrena',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" fill={active ? '#c8ff00' : 'rgba(255,255,255,0.3)'} />
      </svg>
    ),
  },
  {
    href: '/nutrition',
    label: 'Nutrición',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z" fill={active ? '#c8ff00' : 'rgba(255,255,255,0.3)'} />
      </svg>
    ),
  },
  {
    href: '/progress',
    label: 'Progreso',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill={active ? '#c8ff00' : 'rgba(255,255,255,0.3)'} />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        display: 'flex',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 0 10px',
                gap: 4,
                textDecoration: 'none',
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 2,
                  background: '#c8ff00',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 0 8px rgba(200,255,0,0.6)',
                }} />
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 32,
                borderRadius: 10,
                background: active ? 'rgba(200,255,0,0.08)' : 'transparent',
                transition: 'background 0.2s',
              }}>
                {tab.icon(active)}
              </div>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: active ? '#c8ff00' : 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
