import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Eye, EyeOff, Shield, ShieldAlert } from 'lucide-react';

const CAPABILITIES = [
  'Report Emergency or Distress Situations',
  'AI Context & Evidence Extraction',
  'Multi-Factor Priority Scoring',
  'Instant Dispatching & Resource Tracking',
  'Real-Time Citizen Notifications',
];

export default function LoginPage() {
  const [loginId, setLoginId]           = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(loginId, password);
      if (u.role === 'ADMIN' || u.role === 'AUTHORITY' || u.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds: Record<string, { id: string; pass: string }> = {
      admin:     { id: 'admin@rescuegrid.dev',     pass: 'admin123' },
      authority: { id: 'authority@rescuegrid.dev', pass: 'admin123' },
      rescuer:   { id: 'rescuer@rescuegrid.dev',   pass: 'user123' },
      citizen:   { id: 'citizen@rescuegrid.dev',   pass: 'user123' },
    };
    if (creds[role]) {
      setLoginId(creds[role].id);
      setPassword(creds[role].pass);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">

      {/* ── Left panel — deep charcoal brand ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] p-10 shrink-0"
        style={{ backgroundColor: '#181818' }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#C62828' }}
            >
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg leading-tight">RescueGrid AI</div>
              <div className="text-xs" style={{ color: '#B7B5B0' }}>Citizen Emergency Portal</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-base font-semibold text-white leading-snug mb-1">
              Emergency response, powered by AI.
            </p>
            <p className="text-sm" style={{ color: '#B7B5B0' }}>
              A platform built to help citizens report disasters instantly and connect with trained response teams.
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #2D2D2D', marginBottom: '24px' }} />

          {/* Capability list */}
          <div className="space-y-4">
            {CAPABILITIES.map((cap, i) => (
              <div key={cap} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: '#C62828', color: '#fff' }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: '#D8D5CF' }}>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety note */}
        <div
          className="rounded-lg p-4 text-xs space-y-1 mt-8"
          style={{ backgroundColor: '#242424', border: '1px solid #383838' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#C62828' }}
            >
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold uppercase tracking-wider text-white">
              Citizen Safety Protocol
            </span>
          </div>
          <p style={{ color: '#B7B5B0' }}>
            Always move to a safe location before reporting emergency data. Your safety is the first priority.
          </p>
        </div>
      </div>

      {/* ── Right panel — background image + form card ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/indian-rescue-scene.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Warm-white tint overlay — guarantees text readability */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(247, 246, 243, 0.72)', backdropFilter: 'blur(1px)' }}
        />

        {/* Form content — above the overlay */}
        <div className="relative z-10 w-full max-w-md space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#C62828' }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: '#181818' }}>RescueGrid AI</span>
          </div>

          {/* Form card — crisp white surface */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{
              border: '1px solid #E7E5E0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3"
                style={{ backgroundColor: '#F8E8E7', color: '#C62828', border: '1px solid #E8C2C0' }}
              >
                Citizen Portal
              </span>
              <h1 className="text-2xl font-bold" style={{ color: '#181818' }}>Sign in to RescueGrid</h1>
              <p className="text-sm mt-1" style={{ color: '#77746F' }}>
                Enter your registered email or mobile phone number.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="form-label">Email or Mobile Phone Number</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  className="form-input"
                  placeholder="email@example.com or +91 9876543210"
                  required
                  id="login-id"
                />
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="••••••••••••"
                    required
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#B7B5B0' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#77746F'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B7B5B0'; }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 text-xs rounded-lg p-3"
                  style={{ backgroundColor: '#F8E8E7', border: '1px solid #E8C2C0', color: '#A61F24' }}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                id="login-submit"
                className="btn-primary w-full py-3 text-sm font-semibold justify-center"
              >
                {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid #E7E5E0' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#77746F' }}>
                Demo Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['admin', 'authority', 'rescuer', 'citizen'].map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className="px-3 py-2 text-xs font-medium rounded-lg capitalize transition-all duration-150"
                    style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0', color: '#292929' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#E7E5E0';
                      (e.currentTarget as HTMLElement).style.borderColor = '#D8D5CF';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F6F3';
                      (e.currentTarget as HTMLElement).style.borderColor = '#E7E5E0';
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-5 pt-4" style={{ borderTop: '1px solid #E7E5E0' }}>
              <p style={{ color: '#77746F' }}>
                New citizen?{' '}
                <Link to="/register" className="font-semibold" style={{ color: '#C62828' }}>
                  Register here
                </Link>
              </p>
              <Link
                to="/admin/login"
                className="flex items-center gap-1 font-medium transition-colors"
                style={{ color: '#77746F' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C62828'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#77746F'; }}
              >
                <ShieldAlert className="w-3.5 h-3.5" style={{ color: '#C62828' }} />
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
