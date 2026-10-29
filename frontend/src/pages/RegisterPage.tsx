import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Shield, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '', role: 'CITIZEN' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const { updateUserContext } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      localStorage.setItem('rg_token', res.data.token);
      localStorage.setItem('rg_user', JSON.stringify(res.data.user));
      updateUserContext(res.data.user);

      if (form.role === 'ADMIN' || form.role === 'AUTHORITY' || form.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Check if email or phone is already registered.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 focus:outline-none";
  const inputStyle = {
    backgroundColor: '#2D2D2D',
    border: '1px solid #383838',
    color: '#F7F6F3',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans"
      style={{ backgroundColor: '#181818' }}
    >
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: '#C62828' }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#F7F6F3' }}>Create Citizen Account</h1>
          <p className="text-xs" style={{ color: '#77746F' }}>Join RescueGrid Emergency Response Network</p>
        </div>

        {/* Form Box */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 sm:p-8 space-y-4"
          style={{ backgroundColor: '#242424', border: '1px solid #383838' }}
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#B7B5B0' }}>
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle }}
              placeholder="e.g. Rahul Sharma"
              required
              id="register-name"
              onFocus={e => { e.currentTarget.style.borderColor = '#C62828'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#B7B5B0' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle }}
              placeholder="rahul@example.com"
              required
              id="register-email"
              onFocus={e => { e.currentTarget.style.borderColor = '#C62828'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#B7B5B0' }}>
              Mobile Phone Number *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle }}
              placeholder="+91 9876543210"
              required
              id="register-phone"
              onFocus={e => { e.currentTarget.style.borderColor = '#C62828'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#B7B5B0' }}>
              Password *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle }}
              placeholder="Min 6 characters"
              required
              id="register-password"
              onFocus={e => { e.currentTarget.style.borderColor = '#C62828'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(198,40,40,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.boxShadow = 'none'; }}
            />
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
            id="register-submit"
            className="w-full py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#C62828', color: '#fff' }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#A61F24'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C62828'; }}
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-xs text-center" style={{ color: '#77746F' }}>
          Already registered?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#C62828' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
