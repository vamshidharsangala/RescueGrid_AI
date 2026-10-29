import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationsApi } from '../services/api';
import { LoadingSpinner } from './shared';
import {
  LayoutDashboard, AlertTriangle, FileText, Bell,
  User, ShieldAlert, Settings, LogOut, Shield, Menu, X, ChevronDown
} from 'lucide-react';

/* ─── Nav definition ─────────────────────────────────────────────── */
const PRIMARY_NAV = [
  { to: '/dashboard',     label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/my-reports',    label: 'My Reports',      icon: FileText },
  { to: '/notifications', label: 'Notifications',   icon: Bell,         badge: true },
  { to: '/help-safety',   label: 'Help & Safety',   icon: ShieldAlert },
];

const SECONDARY_NAV = [
  { to: '/profile',   label: 'Profile',  icon: User },
  { to: '/settings',  label: 'Settings', icon: Settings },
];

/* ─── Token colours ──────────────────────────────────────────────── */
const C = {
  red:        '#C62828',
  redDark:    '#A61F24',
  redBg:      '#F8E8E7',
  redBorder:  '#E8C2C0',
  surface:    '#FFFFFF',
  bg:         '#F7F6F3',
  charcoal:   '#181818',
  dark:       '#292929',
  muted:      '#77746F',
  faint:      '#B7B5B0',
  border:     '#E7E5E0',
  hover:      '#F0EFEB',
};

export default function CitizenLayout() {
  const { user, token, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount]       = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* Fetch unread notifications */
  useEffect(() => {
    if (token) {
      notificationsApi.list()
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [token]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Close mobile menu on route change */
  const closeMobile = () => setMobileMenuOpen(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center space-y-3">
          <LoadingSpinner size={36} className="mx-auto" />
          <p className="text-sm" style={{ color: C.muted }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'C';

  /* Shared NavLink style factory */
  const desktopLinkStyle = (isActive: boolean, isEmergency?: boolean) => {
    if (isEmergency)
      return { backgroundColor: C.red, color: '#fff', borderRadius: '8px' };
    if (isActive)
      return { backgroundColor: C.redBg, color: C.red, borderRadius: '8px' };
    return { color: C.muted, borderRadius: '8px' };
  };

  const mobileLinkStyle = (isActive: boolean, isEmergency?: boolean) => {
    if (isEmergency)
      return { backgroundColor: C.red, color: '#fff', borderRadius: '10px' };
    if (isActive)
      return { backgroundColor: C.redBg, color: C.red, borderRadius: '10px' };
    return { color: C.dark, borderRadius: '10px' };
  };

  return (
    <div className="flex flex-col min-h-screen font-sans" style={{ backgroundColor: C.bg }}>

      {/* ═══════════════════ TOP NAVBAR ═══════════════════════════ */}
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: C.surface,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="mx-auto flex items-center h-16"
          style={{ maxWidth: '1440px', padding: '0 24px', gap: '0' }}
        >

          {/* ── Brand / Logo ───────────────────────────────────── */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center shrink-0 transition-opacity duration-150 hover:opacity-80"
            style={{ gap: '12px', marginRight: '32px' }}
            aria-label="Go to Dashboard"
          >
            <div
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{ width: '36px', height: '36px', backgroundColor: C.red }}
            >
              <Shield className="text-white" style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm leading-tight" style={{ color: C.charcoal }}>
                  RescueGrid
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight"
                  style={{ backgroundColor: C.redBg, color: C.red, border: `1px solid ${C.redBorder}` }}
                >
                  Citizen
                </span>
              </div>
              <div className="text-[11px]" style={{ color: C.muted }}>Emergency Response Network</div>
            </div>
          </button>

          {/* ── Desktop Primary Navigation ─────────────────────── */}
          <nav
            className="hidden lg:flex items-center flex-1 min-w-0"
            style={{ gap: '4px' }}
            aria-label="Primary navigation"
          >
            {PRIMARY_NAV.map(item => {
              const Icon = item.icon;
              const showBadge = item.badge && unreadCount > 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center whitespace-nowrap text-sm font-medium transition-all duration-150 relative"
                  style={({ isActive }) => ({
                    ...desktopLinkStyle(isActive),
                    gap: '7px',
                    padding: '7px 12px',
                  })}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    const active = el.getAttribute('aria-current') === 'page';
                    el.style.backgroundColor = active ? C.redBg : C.hover;
                    if (!active) el.style.color = C.dark;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    const active = el.getAttribute('aria-current') === 'page';
                    el.style.backgroundColor = active ? C.redBg : 'transparent';
                    el.style.color = active ? C.red : C.muted;
                  }}
                >
                  <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span
                      className="flex items-center justify-center text-[10px] font-bold rounded-full text-white"
                      style={{ minWidth: '18px', height: '18px', padding: '0 4px', backgroundColor: C.red }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Right Actions ──────────────────────────────────── */}
          <div className="flex items-center" style={{ gap: '8px', marginLeft: 'auto' }}>

            {/* Emergency Report CTA — desktop */}
            <NavLink
              to="/report"
              className="hidden lg:flex items-center text-sm font-semibold text-white transition-all duration-150"
              style={{ gap: '6px', padding: '8px 16px', borderRadius: '8px', backgroundColor: C.red, whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.redDark; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.red; }}
            >
              <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              Report Emergency
            </NavLink>

            {/* Profile Dropdown ── desktop ─────────────────── */}
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(v => !v)}
                className="flex items-center transition-all duration-150 rounded-lg"
                style={{
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: profileMenuOpen ? C.hover : 'transparent',
                  border: `1px solid ${profileMenuOpen ? C.border : 'transparent'}`,
                }}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                id="profile-menu-btn"
              >
                <div
                  className="flex items-center justify-center font-bold text-xs text-white rounded-md"
                  style={{ width: '28px', height: '28px', backgroundColor: '#2D2D2D', flexShrink: 0 }}
                >
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold" style={{ color: C.charcoal, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name}
                  </div>
                  <div className="text-[10px] capitalize" style={{ color: C.muted }}>
                    {user?.role?.toLowerCase()}
                  </div>
                </div>
                <ChevronDown
                  style={{
                    width: '14px', height: '14px', color: C.muted,
                    transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Profile dropdown panel */}
              {profileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 rounded-xl py-1.5 fade-in"
                  style={{
                    minWidth: '200px',
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '8px 14px 10px', borderBottom: `1px solid ${C.border}` }}>
                    <div className="text-xs font-semibold" style={{ color: C.charcoal }}>{user?.name}</div>
                    <div className="text-[11px]" style={{ color: C.muted }}>{user?.role?.toLowerCase()}</div>
                  </div>
                  {SECONDARY_NAV.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center text-sm transition-all duration-150"
                        style={{ gap: '10px', padding: '9px 14px', color: C.dark }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.hover; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      >
                        <Icon style={{ width: '15px', height: '15px', color: C.muted, flexShrink: 0 }} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                  <div style={{ borderTop: `1px solid ${C.border}`, marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center text-sm transition-all duration-150"
                      style={{ gap: '10px', padding: '9px 14px', color: C.red }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.redBg; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      id="logout-btn"
                    >
                      <LogOut style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="lg:hidden flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ width: '38px', height: '38px', color: C.muted }}
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              id="mobile-menu-btn"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.hover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              {mobileMenuOpen
                ? <X style={{ width: '20px', height: '20px' }} />
                : <Menu style={{ width: '20px', height: '20px' }} />
              }
            </button>
          </div>
        </div>

        {/* ═══ Mobile Slide-down Menu ════════════════════════════ */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fade-in"
            style={{
              borderTop: `1px solid ${C.border}`,
              backgroundColor: C.surface,
              padding: '12px 16px 16px',
            }}
          >
            {/* User info strip */}
            <div
              className="flex items-center mb-3 rounded-xl"
              style={{ gap: '12px', padding: '10px 12px', backgroundColor: C.hover }}
            >
              <div
                className="flex items-center justify-center font-bold text-xs text-white rounded-md shrink-0"
                style={{ width: '32px', height: '32px', backgroundColor: '#2D2D2D' }}
              >
                {initials}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: C.charcoal }}>{user?.name}</div>
                <div className="text-xs capitalize" style={{ color: C.muted }}>{user?.role?.toLowerCase()}</div>
              </div>
            </div>

            {/* Emergency CTA */}
            <NavLink
              to="/report"
              onClick={closeMobile}
              className="flex items-center w-full text-sm font-semibold text-white mb-2 rounded-xl"
              style={{ gap: '10px', padding: '11px 14px', backgroundColor: C.red }}
            >
              <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              Report Emergency
            </NavLink>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

            {/* Primary nav items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {PRIMARY_NAV.map(item => {
                const Icon = item.icon;
                const showBadge = item.badge && unreadCount > 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobile}
                    className="flex items-center text-sm font-medium transition-all duration-150"
                    style={({ isActive }) => ({
                      ...mobileLinkStyle(isActive),
                      gap: '12px',
                      padding: '10px 14px',
                    })}
                  >
                    <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span
                        className="flex items-center justify-center text-[10px] font-bold rounded-full text-white"
                        style={{ minWidth: '18px', height: '18px', padding: '0 4px', backgroundColor: C.red }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

            {/* Secondary nav (profile, settings) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {SECONDARY_NAV.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobile}
                    className="flex items-center text-sm font-medium transition-all duration-150"
                    style={({ isActive }) => ({
                      ...mobileLinkStyle(isActive),
                      gap: '12px',
                      padding: '10px 14px',
                    })}
                  >
                    <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />

            {/* Logout */}
            <button
              onClick={() => { closeMobile(); handleLogout(); }}
              className="w-full flex items-center text-sm font-medium transition-all duration-150 rounded-xl"
              style={{ gap: '12px', padding: '10px 14px', color: C.red }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.redBg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <LogOut style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* ═══════════ Main Content ═══════════════════════════════ */}
      <main className="flex-1 w-full mx-auto" style={{ maxWidth: '1440px', padding: '24px 24px 80px' }}>
        <Outlet />
      </main>

      {/* ═══════════ Mobile Bottom Navigation Bar ════════════════ */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center"
        style={{
          backgroundColor: C.surface,
          borderTop: `1px solid ${C.border}`,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
          padding: '6px 8px 10px',
          height: '64px',
        }}
      >
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center"
          style={({ isActive }) => ({ color: isActive ? C.red : C.muted, gap: '3px', minWidth: '44px' })}
        >
          <LayoutDashboard style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500 }}>Home</span>
        </NavLink>

        <NavLink
          to="/my-reports"
          className="flex flex-col items-center"
          style={({ isActive }) => ({ color: isActive ? C.red : C.muted, gap: '3px', minWidth: '44px' })}
        >
          <FileText style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500 }}>Reports</span>
        </NavLink>

        {/* Emergency centre FAB */}
        <NavLink to="/report" className="flex flex-col items-center" style={{ gap: '3px', minWidth: '56px' }}>
          <div
            className="flex items-center justify-center rounded-full -mt-5"
            style={{
              width: '48px', height: '48px',
              backgroundColor: C.red,
              boxShadow: `0 4px 14px rgba(198,40,40,0.45)`,
            }}
          >
            <AlertTriangle className="text-white" style={{ width: '20px', height: '20px' }} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: 500, color: C.muted }}>Report</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className="flex flex-col items-center relative"
          style={({ isActive }) => ({ color: isActive ? C.red : C.muted, gap: '3px', minWidth: '44px' })}
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          {unreadCount > 0 && (
            <span
              className="absolute flex items-center justify-center font-bold text-white rounded-full"
              style={{
                top: '-2px', right: '2px',
                width: '16px', height: '16px',
                fontSize: '9px',
                backgroundColor: C.red,
              }}
            >
              {unreadCount}
            </span>
          )}
          <span style={{ fontSize: '10px', fontWeight: 500 }}>Alerts</span>
        </NavLink>

        <NavLink
          to="/profile"
          className="flex flex-col items-center"
          style={({ isActive }) => ({ color: isActive ? C.red : C.muted, gap: '3px', minWidth: '44px' })}
        >
          <User style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '10px', fontWeight: 500 }}>Profile</span>
        </NavLink>
      </div>
    </div>
  );
}
