import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './shared';
import { Leaf } from 'lucide-react';

export default function AdminLayout() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#193F31' }}>
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(143,175,150,0.2)', border: '1px solid rgba(143,175,150,0.3)' }}
          >
            <Leaf size={28} style={{ color: '#8FAF96' }} />
          </div>
          <LoadingSpinner size={32} className="mx-auto" />
          <p className="text-sm" style={{ color: '#8FAF96' }}>Initializing Command Center…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user && user.role !== 'ADMIN' && user.role !== 'AUTHORITY' && user.role !== 'RESCUER') {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F6F7F2' }}>
        <div
          className="max-w-md w-full bg-white rounded-2xl p-8 text-center space-y-4 shadow-card-lg"
          style={{ border: '1px solid #E0E7DF' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto font-bold text-2xl"
            style={{ background: '#FDECEA', color: '#D94841', border: '1px solid #f5b8b5' }}
          >
            403
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#26332D' }}>Access Denied</h2>
          <p className="text-sm" style={{ color: '#748078' }}>
            You do not have administrative privileges to access the RescueGrid AI Command Center.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary w-full py-2.5"
          >
            Return to Citizen Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ backgroundColor: '#F6F7F2' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ backgroundColor: '#F6F7F2' }}>
        <Outlet />
      </main>
    </div>
  );
}
