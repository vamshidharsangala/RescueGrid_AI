import { useState, useEffect, useCallback } from 'react';
import { alertsApi } from '../services/api';
import type { Alert, AlertSeverity } from '../types';
import { LoadingSpinner, EmptyState } from '../components/shared';
import { Bell, AlertTriangle, CheckCircle, ShieldAlert, Radio, Send, Clock, Volume2 } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    severity: 'HIGH' as AlertSeverity
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await alertsApi.list();
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Alerts load error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertsApi.acknowledge(alertId);
      load();
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await alertsApi.create(broadcastData);
      setShowBroadcastModal(false);
      setBroadcastData({ title: '', message: '', severity: 'HIGH' });
      load();
    } catch (err) {
      console.error('Failed to send broadcast', err);
    }
  };

  const filtered = alerts.filter(a => !severityFilter || a.severity === severityFilter);

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return { bg: '#F8E8E7', color: '#A61F24', border: '#E8C2C0' };
      case 'HIGH':     return { bg: '#F5EBD7', color: '#805515', border: '#DDD0AC' };
      case 'MODERATE': return { bg: '#EAF1F7', color: '#2a7fa8', border: '#B7D5E8' };
      default:         return { bg: '#E7E5E0', color: '#77746F', border: '#D8D5CF' };
    }
  };

  const getBorderColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return '#C62828';
      case 'HIGH':     return '#B7791F';
      case 'MODERATE': return '#4A7FA8';
      default:         return '#D8D5CF';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4" style={{ borderBottom: '1px solid #E7E5E0' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#181818' }}>Emergency Alert Center</h1>
            <p className="text-xs" style={{ color: '#77746F' }}>Broadcast notifications and real-time warnings</p>
          </div>
          <button onClick={() => setShowBroadcastModal(true)} className="btn-danger flex items-center gap-2">
            <Radio size={14} className="animate-pulse" />
            Broadcast Emergency Alert
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-2">Filter by Severity:</span>
          {['', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors`}
              style={severityFilter === sev
                ? { backgroundColor: '#181818', color: '#fff' }
                : { backgroundColor: '#E7E5E0', color: '#77746F' }
              }
              onMouseEnter={e => { if (severityFilter !== sev) (e.currentTarget as HTMLElement).style.backgroundColor = '#D8D5CF'; }}
              onMouseLeave={e => { if (severityFilter !== sev) (e.currentTarget as HTMLElement).style.backgroundColor = '#E7E5E0'; }}
            >
              {sev || 'All Alerts'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Timeline */}
      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Bell} title="No active emergency alerts" description="All clear — no critical notifications at this time" />
        ) : (
          <div className="space-y-4">
            {filtered.map(alert => {
              const badge = getSeverityBadge(alert.severity);
              const borderLeft = getBorderColor(alert.severity);
              return (
              <div
                key={alert.id}
                className="card p-5"
                style={{ borderLeft: `4px solid ${borderLeft}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                    >
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: '#181818' }}>{alert.title}</h3>
                      <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: '#77746F' }}>
                        <Clock size={12} />
                        <span>{timeAgo(alert.createdAt)}</span>
                        {alert.incidentId && (
                          <>
                            <span>·</span>
                            <span className="font-mono" style={{ color: '#77746F' }}>Ref Incident</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-sm mt-3 leading-relaxed" style={{ color: '#292929' }}>
                  {alert.message}
                </p>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #E7E5E0' }}>
                  {alert.isAcknowledged ? (
                    <span className="flex items-center gap-1 font-semibold" style={{ color: '#292929' }}>
                      <CheckCircle size={14} /> Acknowledged by Command
                    </span>
                  ) : (
                    <span className="font-medium" style={{ color: '#805515' }}>
                      ⚠️ Awaiting Command Response
                    </span>
                  )}

                  {!alert.isAcknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="btn-secondary btn-sm"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center gap-2" style={{ color: '#C62828' }}>
              <Volume2 size={20} />
              <h2 className="text-lg font-bold">Broadcast Emergency Warning</h2>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#292929' }}>Alert Headline</label>
                <input
                  required
                  type="text"
                  value={broadcastData.title}
                  onChange={e => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  placeholder="e.g. Flash Flood Warning: Musi River Overflow"
                  className="form-input text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#292929' }}>Severity Level</label>
                <select
                  value={broadcastData.severity}
                  onChange={e => setBroadcastData({ ...broadcastData, severity: e.target.value as AlertSeverity })}
                  className="form-select text-sm w-full"
                >
                  <option value="CRITICAL">CRITICAL — Red Alert</option>
                  <option value="HIGH">HIGH — Orange Alert</option>
                  <option value="MODERATE">MODERATE — Yellow Alert</option>
                  <option value="LOW">LOW — Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#292929' }}>Message Body</label>
                <textarea
                  required
                  value={broadcastData.message}
                  onChange={e => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  rows={4}
                  placeholder="Provide immediate instructions for rescue teams and public..."
                  className="form-textarea text-sm w-full"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-danger flex items-center gap-1.5">
                  <Send size={14} /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
