import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, incidentsApi, resourcesApi } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import type { Incident, DashboardStats, Resource } from '../types';
import { StatCard, IncidentCard, LoadingSpinner, EmptyState } from '../components/shared';
import {
  AlertTriangle, Users, Shield, Clock, Radio, RefreshCw, ExternalLink
} from 'lucide-react';
import { getResourceStatusClass, getResourceTypeIcon } from '../utils/helpers';
import DisasterMap from '../components/DisasterMap';
import IncidentDetail from '../components/IncidentDetail';

export default function DashboardPage() {
  const [stats, setStats]                 = useState<DashboardStats | null>(null);
  const [incidents, setIncidents]         = useState<Incident[]>([]);
  const [resources, setResources]         = useState<Resource[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const { lastIncident, lastAlert, connected } = useSocket();

  const load = useCallback(async () => {
    try {
      const [statsRes, incRes, resRes] = await Promise.all([
        dashboardApi.stats(),
        incidentsApi.list({ limit: 20 }),
        resourcesApi.list()
      ]);
      setStats(statsRes.data.stats);
      setIncidents(incRes.data.incidents);
      setResources(resRes.data.resources);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (lastIncident) {
      setIncidents(prev => {
        const idx = prev.findIndex(i => i.id === lastIncident.id);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = lastIncident; return next;
        }
        return [lastIncident, ...prev].slice(0, 20);
      });
      load();
    }
  }, [lastIncident]);

  useEffect(() => { if (lastAlert) load(); }, [lastAlert]);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={40} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: '#77746F' }}>Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header bar ── */}
      <div
        className="px-6 py-3 flex items-center justify-between shrink-0"
        style={{ backgroundColor: '#fff', borderBottom: '1px solid #E7E5E0' }}
      >
        <div>
          <h1 className="text-base font-bold" style={{ color: '#181818' }}>RESCUEGRID COMMAND CENTER</h1>
          <p className="text-xs" style={{ color: '#77746F' }}>
            Real-time disaster coordination · {new Date().toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: connected ? '#C62828' : '#77746F' }}
          >
            <Radio size={12} className={connected ? 'animate-pulse' : ''} />
            {connected ? 'Live' : 'Offline'}
          </div>
          <button onClick={refresh} disabled={refreshing} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/report" className="btn-danger btn-sm">Report Emergency</Link>
        </div>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div
          className="grid grid-cols-4 gap-4 px-6 py-4 shrink-0"
          style={{ backgroundColor: '#F7F6F3', borderBottom: '1px solid #E7E5E0' }}
        >
          <StatCard
            label="Active Incidents"
            value={stats.activeIncidents}
            icon={Shield}
            iconColor="#292929"
            iconBg="#E7E5E0"
          />
          <StatCard
            label="Critical"
            value={stats.criticalIncidents}
            icon={AlertTriangle}
            iconColor="#A61F24"
            iconBg="#F8E8E7"
            subtext="Priority ≥86"
          />
          <StatCard
            label="Resources Available"
            value={stats.availableResources}
            icon={Users}
            iconColor="#292929"
            iconBg="#E7E5E0"
          />
          <StatCard
            label="People at Risk"
            value={stats.peopleAtRisk}
            icon={Clock}
            iconColor="#805515"
            iconBg="#F5EBD7"
            subtext="Active incidents only"
          />
        </div>
      )}

      {/* ── Main 3-column layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Incident list */}
        <div
          className="w-72 flex flex-col overflow-hidden shrink-0"
          style={{ backgroundColor: '#fff', borderRight: '1px solid #E7E5E0' }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid #E7E5E0' }}
          >
            <h2 className="text-sm font-semibold" style={{ color: '#181818' }}>Active Incidents</h2>
            <Link
              to="/admin/incidents"
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: '#77746F' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C62828'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#77746F'; }}
            >
              View all <ExternalLink size={10} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {incidents.length === 0 ? (
              <EmptyState icon={Shield} title="No active incidents" description="All clear — no ongoing emergencies" />
            ) : (
              incidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  selected={selectedIncident?.id === incident.id}
                  onClick={() => setSelectedIncident(incident)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative">
          <DisasterMap
            incidents={incidents}
            resources={resources}
            selectedId={selectedIncident?.id}
            onIncidentClick={setSelectedIncident}
          />
        </div>

        {/* Right: Incident detail */}
        <div
          className="w-80 flex flex-col overflow-hidden shrink-0"
          style={{ backgroundColor: '#fff', borderLeft: '1px solid #E7E5E0' }}
        >
          {selectedIncident ? (
            <IncidentDetail
              incident={selectedIncident}
              resources={resources}
              onUpdate={load}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#F7F6F3', border: '1px solid #E7E5E0' }}
              >
                <Shield size={22} style={{ color: '#B7B5B0' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#292929' }}>Select an incident</p>
              <p className="text-xs mt-1" style={{ color: '#77746F' }}>
                Click on an incident or map marker to view AI intelligence and resource recommendations
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom resource strip ── */}
      <div
        className="px-6 py-2 shrink-0"
        style={{ backgroundColor: '#fff', borderTop: '1px solid #E7E5E0' }}
      >
        <div className="flex items-center gap-6 overflow-x-auto">
          <span className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: '#77746F' }}>
            Resources
          </span>
          {resources.slice(0, 8).map(r => (
            <div key={r.id} className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm">{getResourceTypeIcon(r.type)}</span>
              <span className="text-xs" style={{ color: '#292929' }}>{r.name}</span>
              <span className={`badge ${getResourceStatusClass(r.status)} text-xs`}>{r.status}</span>
            </div>
          ))}
          {resources.length > 8 && (
            <Link
              to="/admin/resources"
              className="text-xs transition-colors shrink-0"
              style={{ color: '#77746F' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C62828'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#77746F'; }}
            >
              +{resources.length - 8} more
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
