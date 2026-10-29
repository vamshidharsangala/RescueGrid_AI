import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/shared';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await adminLogin(email, password);
      if (user.role === 'ADMIN' || user.role === 'AUTHORITY' || user.role === 'RESCUER') {
        navigate('/admin/incidents');
      } else {
        setError('Access denied. Account lacks administrative privileges.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{ backgroundColor: '#181818' }}
    >
      <div className="w-full max-w-md space-y-4">

        {/* Back link */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: '#77746F' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#B7B5B0'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#77746F'; }}
        >
          <ArrowLeft className="w-4 h-4" /> Return to Citizen Portal
        </button>

        {/* Card */}
        <div
          className="bg-white rounded-xl p-8 space-y-6"
          style={{ border: '1px solid #E7E5E0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#181818' }}
            >
              <Shield className="w-7 h-7" style={{ color: '#C62828' }} />
            </div>
            <div>
              <span
                className="inline-block text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2"
                style={{ backgroundColor: '#F8E8E7', color: '#A61F24', border: '1px solid #E8C2C0' }}
              >
                Restricted Command Center Access
              </span>
              <h1 className="text-2xl font-bold" style={{ color: '#181818' }}>Admin Command Login</h1>
              <p className="text-xs mt-1" style={{ color: '#77746F' }}>
                RescueGrid Disaster Response Operations Center
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-lg text-xs flex items-center gap-3"
              style={{ backgroundColor: '#F8E8E7', border: '1px solid #E8C2C0', color: '#A61F24' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="form-label">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B7B5B0' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rescuegrid.gov"
                  className="form-input pl-10"
                  required
                  id="admin-login-email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Command Access Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B7B5B0' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input pl-10"
                  required
                  id="admin-login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="admin-login-submit"
              className="btn-primary w-full py-3 text-sm font-semibold justify-center"
            >
              {isLoading ? <LoadingSpinner size={16} /> : null}
              {isLoading ? 'Authenticating…' : 'Access Command Center'}
            </button>
          </form>

          {/* Security note */}
          <div
            className="text-center text-[11px] pt-4"
            style={{ borderTop: '1px solid #E7E5E0', color: '#77746F' }}
          >
            Security Notice: All login attempts are audited and logged. Maximum 5 failed attempts before account lock.
          </div>
        </div>
      </div>
    </div>
  );
}
