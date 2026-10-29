import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../services/api';
import { LoadingSpinner } from '../components/shared';
import {
  AlertTriangle, FileText, CheckCircle2, Clock, Shield,
  MapPin, Plus, ArrowRight, Activity, PhoneCall
} from 'lucide-react';

interface CitizenStats {
  totalReports: number;
  underReview: number;
  inProgress: number;
  resolved: number;
}

export default function CitizenDashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [stats, setStats] = useState<CitizenStats>({
    totalReports: 0, underReview: 0, inProgress: 0, resolved: 0
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [copiedLocation, setCopiedLocation] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.citizenStats();
      if (res.data) {
        setStats(res.data.stats || { totalReports: 0, underReview: 0, inProgress: 0, resolved: 0 });
        setRecentReports(res.data.recentReports || []);
      }
    } catch (err) {
      console.error('Failed to load citizen stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          navigator.clipboard.writeText(coords);
          setCopiedLocation(true);
          setTimeout(() => setCopiedLocation(false), 3000);
        },
        () => alert('Location access denied or unavailable.')
      );
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
      RESOLVED:   { bg: '#E7E5E0', color: '#292929',  border: '#D8D5CF', label: 'Resolved' },
      SUBMITTED:  { bg: '#F5EBD7', color: '#805515',  border: '#DDD0AC', label: 'Under Review' },
      VERIFIED:   { bg: '#EAF1F7', color: '#2a7fa8',  border: '#B7D5E8', label: 'Verified' },
      IN_PROGRESS:{ bg: '#F8E8E7', color: '#A61F24',  border: '#E8C2C0', label: 'In Progress' },
    };
    const s = map[status] || { bg: '#E7E5E0', color: '#77746F', border: '#D8D5CF', label: status.replace('_', ' ') };
    return (
      <span
        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
        style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-7">

      {/* ── Welcome Hero ── */}
      <div
        className="relative overflow-hidden rounded-xl p-6 sm:p-8"
        style={{ backgroundColor: '#181818' }}
      >
        {/* Emergency status badge */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: '#F8E8E7', color: '#C62828', border: '1px solid #E8C2C0' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'markerPulse 2s infinite' }} />
            24/7 Citizen Emergency Response Active
          </span>
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#FFFFFF' }}>
            {getTimeOfDay()}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#D0CECA' }}>
            Report disasters or distress situations instantly. AI automatically extracts key details, prioritizes high-impact incidents, and connects you with active emergency response teams.
          </p>

          {/* Quick Actions */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all"
              style={{ backgroundColor: '#C62828' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#A61F24'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C62828'; }}
            >
              <AlertTriangle className="w-4 h-4" />
              Report Emergency Now
            </button>

            <button
              onClick={handleShareLocation}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{ backgroundColor: '#2D2D2D', color: '#E7E5E0', border: '1px solid #383838' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#383838'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2D2D2D'; }}
            >
              <MapPin className="w-4 h-4" style={{ color: '#C62828' }} />
              {copiedLocation ? 'GPS Copied!' : 'Share Current GPS'}
            </button>

            <button
              onClick={() => navigate('/my-reports')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{ backgroundColor: '#2D2D2D', color: '#B7B5B0', border: '1px solid #383838' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#383838'; (e.currentTarget as HTMLElement).style.color = '#E7E5E0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2D2D2D'; (e.currentTarget as HTMLElement).style.color = '#B7B5B0'; }}
            >
              <FileText className="w-4 h-4" />
              View My Reports
            </button>
          </div>
        </div>

        {/* Decorative icon */}
        <Shield
          className="absolute -bottom-6 -right-6 pointer-events-none"
          style={{ width: '180px', height: '180px', color: 'rgba(198,40,40,0.06)' }}
        />
      </div>

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-white rounded-xl p-5 space-y-3" style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#77746F' }}>Total Reports</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0' }}>
              <FileText className="w-4 h-4" style={{ color: '#2D2D2D' }} />
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: '#181818' }}>
            {isLoading ? <LoadingSpinner size={24} /> : stats.totalReports}
          </div>
          <div className="text-xs" style={{ color: '#77746F' }}>Submitted by your account</div>
        </div>

        {/* Under Review */}
        <div className="bg-white rounded-xl p-5 space-y-3" style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#77746F' }}>Under Review</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5EBD7', border: '1px solid #DDD0AC' }}>
              <Clock className="w-4 h-4" style={{ color: '#805515' }} />
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: '#805515' }}>
            {isLoading ? <LoadingSpinner size={24} /> : stats.underReview}
          </div>
          <div className="text-xs" style={{ color: '#77746F' }}>AI analysis & verification pending</div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-5 space-y-3" style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#77746F' }}>In Progress</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F8E8E7', border: '1px solid #E8C2C0' }}>
              <Activity className="w-4 h-4" style={{ color: '#C62828' }} />
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: '#C62828' }}>
            {isLoading ? <LoadingSpinner size={24} /> : stats.inProgress}
          </div>
          <div className="text-xs" style={{ color: '#77746F' }}>Rescuers assigned or en route</div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-xl p-5 space-y-3" style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#77746F' }}>Resolved</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E7E5E0', border: '1px solid #D8D5CF' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: '#292929' }} />
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: '#292929' }}>
            {isLoading ? <LoadingSpinner size={24} /> : stats.resolved}
          </div>
          <div className="text-xs" style={{ color: '#77746F' }}>Emergency resolved safely</div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* Recent Reports (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#181818' }}>
              <Activity className="w-4 h-4" style={{ color: '#C62828' }} />
              My Recent Emergency Reports
            </h2>
            <button
              onClick={() => navigate('/my-reports')}
              className="text-xs font-medium flex items-center gap-1 transition-colors"
              style={{ color: '#C62828' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#A61F24'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C62828'; }}
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div
              className="bg-white rounded-xl p-8 flex items-center justify-center"
              style={{ border: '1px solid #E7E5E0' }}
            >
              <LoadingSpinner size={32} />
            </div>
          ) : recentReports.length === 0 ? (
            <div
              className="bg-white rounded-xl p-8 text-center space-y-3"
              style={{ border: '1px dashed #D8D5CF' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0' }}
              >
                <FileText className="w-6 h-6" style={{ color: '#B7B5B0' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#292929' }}>
                No emergency reports submitted yet
              </h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: '#77746F' }}>
                If you encounter a medical emergency, flood, fire, or accident, click below to log a report immediately.
              </p>
              <button
                onClick={() => navigate('/report')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#C62828' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#A61F24'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C62828'; }}
              >
                <Plus className="w-4 h-4" />
                Submit First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/my-reports/${report.id}`)}
                  className="bg-white rounded-xl p-4 sm:p-5 cursor-pointer transition-all space-y-3"
                  style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#D8D5CF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = '#E7E5E0'; }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#F8E8E7', color: '#C62828', border: '1px solid #E8C2C0' }}
                      >
                        RG-{report.id.substring(0, 6).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold uppercase" style={{ color: '#292929' }}>
                        {report.emergencyType || report.type || 'EMERGENCY'}
                      </span>
                    </div>
                    {statusBadge(report.verificationStatus)}
                  </div>

                  <p className="text-sm line-clamp-2" style={{ color: '#292929' }}>
                    {report.text || 'Emergency report containing photo/voice evidence.'}
                  </p>

                  <div
                    className="flex items-center justify-between text-xs pt-2"
                    style={{ color: '#77746F', borderTop: '1px solid #F7F6F3' }}
                  >
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#C62828' }} />
                      <span className="truncate max-w-[200px]">{report.locationName || 'GPS Location'}</span>
                    </div>
                    <div>
                      {new Date(report.createdAt).toLocaleDateString()}{' '}
                      {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Helplines Sidebar */}
        <div className="space-y-6">
          <div
            className="bg-white rounded-xl p-6 space-y-5"
            style={{ border: '1px solid #E7E5E0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
          >
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#181818' }}>
              <PhoneCall className="w-4 h-4" style={{ color: '#C62828' }} />
              National Emergency Helplines
            </h3>

            <div className="space-y-2">
              {[
                { label: 'National Emergency', number: '112' },
                { label: 'Police Department',  number: '100' },
                { label: 'Fire & Rescue',      number: '101' },
                { label: 'Ambulance & Medical',number: '108 / 102' },
                { label: 'NDRF Disaster Mgmt', number: '1078' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#292929' }}>{item.label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: '#C62828' }}>{item.number}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/help-safety')}
              className="w-full py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0', color: '#292929' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#E7E5E0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F6F3'; }}
            >
              <Shield className="w-4 h-4" style={{ color: '#C62828' }} />
              View Disaster Safety Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
