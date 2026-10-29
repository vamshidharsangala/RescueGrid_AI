import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import {
  LayoutDashboard, AlertTriangle, MapPin, Users, BarChart2,
  Settings, LogOut, Radio, Shield, Bell
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Command Center' },
  { to: '/admin/incidents',  icon: AlertTriangle,   label: 'Incidents' },
  { to: '/admin/map',        icon: MapPin,          label: 'Live Map' },
  { to: '/admin/resources',  icon: Users,           label: 'Resources' },
  { to: '/admin/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/admin/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { connected }    = useSocket();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <aside
      className="w-56 flex flex-col h-screen sticky top-0 shrink-0"
      style={{ backgroundColor: '#181818', color: '#fff' }}
    >
      {/* ── Logo ── */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #2D2D2D' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#C62828' }}
        >
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm leading-tight tracking-wide">
            RescueGrid
          </div>
          <div className="text-xs" style={{ color: '#B7B5B0' }}>AI Command Center</div>
        </div>
      </div>

      {/* ── Live connection status ── */}
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #2D2D2D' }}>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: connected ? '#C62828' : '#4A4A4A' }}
          />
          <span style={{ color: connected ? '#E7E5E0' : '#77746F' }}>
            {connected ? 'Live Feed Active' : 'Connecting...'}
          </span>
          <Radio
            size={10}
            className="ml-auto"
            style={{ color: connected ? '#C62828' : '#4A4A4A' }}
          />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive ? 'active-nav' : 'inactive-nav'
              }`
            }
            style={({ isActive }) => isActive
              ? { backgroundColor: 'rgba(198,40,40,0.15)', color: '#fff' }
              : { color: '#B7B5B0' }
            }
            onMouseEnter={e => {
              const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }
            }}
            onMouseLeave={e => {
              const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#B7B5B0';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  style={{ color: isActive ? '#C62828' : '#77746F' }}
                />
                <span style={{ color: isActive ? '#fff' : 'inherit' }}>{label}</span>
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#C62828' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Divider + Emergency Report */}
        <div className="pt-3 mt-1" style={{ borderTop: '1px solid #2D2D2D' }}>
          <NavLink
            to="/report"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{ backgroundColor: '#C62828', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#A61F24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C62828'; }}
          >
            <AlertTriangle size={16} />
            Report Emergency
          </NavLink>
        </div>
      </nav>

      {/* ── User footer ── */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid #2D2D2D' }}>
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ backgroundColor: '#2D2D2D', border: '1px solid #383838' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</div>
            <div className="text-[10px] capitalize truncate" style={{ color: '#77746F' }}>
              {user?.role?.toLowerCase()}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
          style={{ color: '#77746F' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(198,40,40,0.15)';
            (e.currentTarget as HTMLElement).style.color = '#F8A0A0';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#77746F';
          }}
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
