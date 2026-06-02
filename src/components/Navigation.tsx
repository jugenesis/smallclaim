'use client'

import { colors, spacing, shadows } from '@/lib/design-tokens'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'chart.bar.doc.horizontal' },
  { href: '/debtors', label: 'Debtors', icon: 'person.2' },
  { href: '/cases', label: 'Cases', icon: 'folder.fill' },
  { href: '/calendar', label: 'Calendar', icon: 'calendar' },
  { href: '/settings', label: 'Settings', icon: 'gearshape.fill' },
]

function getIconSvg(icon: string): string {
  const icons: Record<string, string> = {
    'chart.bar.doc.horizontal': 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    'person.2': 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    'folder.fill': 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
    'calendar': 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z',
    'gearshape.fill': 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  }
  return icons[icon] || icons['folder.fill']
}

export default function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="tab-bar">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`tab-item ${isActive ? 'active' : ''}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d={getIconSvg(item.icon)} />
              </svg>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">SmallClaims</h2>
        </div>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d={getIconSvg(item.icon)} />
              </svg>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        /* Mobile Tab Bar */
        .tab-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: ${colors.surface};
          border-top: 1px solid ${colors.separator};
          z-index: 100;
        }

        .tab-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-decoration: none;
          color: ${colors.textSecondary};
          font-size: 10px;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .tab-item.active {
          color: ${colors.primary};
        }

        /* Desktop Sidebar */
        .sidebar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 240px;
          background: ${colors.surface};
          border-right: 1px solid ${colors.separator};
          padding: ${spacing.lg};
          z-index: 100;
        }

        .sidebar-header {
          margin-bottom: ${spacing.xl};
          padding-bottom: ${spacing.md};
          border-bottom: 1px solid ${colors.separator};
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: ${colors.primary};
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: ${spacing.sm};
          padding: ${spacing.sm} ${spacing.md};
          border-radius: 8px;
          text-decoration: none;
          color: ${colors.textSecondary};
          font-size: 15px;
          font-weight: 500;
          margin-bottom: ${spacing.xs};
          transition: background 0.15s ease, color 0.15s ease;
        }

        .sidebar-item:hover {
          background: ${colors.background};
        }

        .sidebar-item.active {
          background: ${colors.primary}15;
          color: ${colors.primary};
        }

        /* Responsive */
        @media (min-width: 1024px) {
          .tab-bar {
            display: none;
          }
          .sidebar {
            display: block;
          }
        }
      `}</style>
    </>
  )
}