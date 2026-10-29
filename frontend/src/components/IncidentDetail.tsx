import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incidentsApi, assignmentsApi } from '../services/api';
import type { Incident, Resource, PriorityResult, ResourceRecommendation } from '../types';
import { PriorityBreakdown, ConfidenceIndicator, StatusBadge, LoadingSpinner, AIDisclaimer } from './shared';
import {
  ExternalLink, Users, MapPin, Clock, AlertTriangle, CheckCircle,
  Zap, Navigation, X
} from 'lucide-react';
import { getDisasterIcon, getDisasterLabel, getSeverityLabel, timeAgo } from '../utils/helpers';

interface Props {
  incident: Incident;
  resources: Resource[];
  onUpdate: () => void;
}

export default function IncidentDetail({ incident, resources, onUpdate }: Props) {
  const [detail, setDetail] = useState<{ priorityResult: PriorityResult; recommendations: ResourceRecommendation[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignedMsg, setAssignedMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    incidentsApi.get(incident.id).then(res => {
      setDetail({ priorityResult: res.data.priorityResult, recommendations: res.data.recommendations });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [incident.id]);

  const handleAssign = async (rec: ResourceRecommendation) => {
    setAssigning(true);
    try {
      await assignmentsApi.create({ incidentId: incident.id, resourceId: rec.resourceId, eta: rec.eta });
      setAssignedMsg(`${rec.resourceName} assigned. ETA: ${rec.eta} min`);
      onUpdate();
    } catch (err: any) {
      setAssignedMsg(err.response?.data?.error || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await incidentsApi.update(incident.id, { status });
      onUpdate();
    } catch {}
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid #E0E7DF' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getDisasterIcon(incident.type)}</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#26332D' }}>{getDisasterLabel(incident.type)}</div>
            <div className="text-xs font-mono" style={{ color: '#748078' }}>{incident.incidentNumber}</div>
          </div>
        </div>
        <Link to={`/admin/incidents/${incident.id}`} style={{ color: '#245C45' }} className="hover:opacity-70 transition-opacity">
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#F6F7F2' }}>
        {/* Dev data banner */}
        {incident.isDevelopmentData && (
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{ backgroundColor: '#FFF8DB', border: '1px solid #f0d98a', color: '#8A6A12' }}
          >
            ⚠️ This is development/test data.
          </div>
        )}

        {/* Status + Basic info */}
        <div
          className="bg-white rounded-xl p-3 space-y-2"
          style={{ border: '1px solid #E0E7DF' }}
        >
          <div className="flex items-center justify-between">
            <StatusBadge status={incident.status} />
            <span className="text-xs" style={{ color: '#748078' }}>{timeAgo(incident.createdAt)}</span>
          </div>
          <div className="space-y-1.5 text-xs" style={{ color: '#748078' }}>
            <div className="flex items-center gap-1.5"><MapPin size={11} />{incident.locationName || 'Location not specified'}</div>
            <div className="flex items-center gap-1.5"><Users size={11} />{incident.peopleAffected} people affected {incident.vulnerablePeople && <span className="font-medium" style={{ color: '#B9681F' }}>· Vulnerable groups present</span>}</div>
            <div className="flex items-center gap-1.5"><AlertTriangle size={11} />Severity: {getSeverityLabel(incident.severity)}</div>
            <div className="flex items-center gap-1.5"><Clock size={11} />Time sensitivity: {incident.timeSensitivity}</div>
            <div className="flex items-center gap-1.5"><Navigation size={11} />Accessibility: {incident.accessibility}</div>
          </div>
        </div>

        {/* Priority */}
        {loading ? (
          <div className="flex items-center gap-2 text-xs" style={{ color: '#748078' }}>
            <LoadingSpinner size={14} />Calculating priority...
          </div>
        ) : detail?.priorityResult ? (
          <div className="bg-white rounded-xl p-3" style={{ border: '1px solid #E0E7DF' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#748078' }}>Priority Score</p>
            <PriorityBreakdown result={detail.priorityResult} />
          </div>
        ) : null}

        {/* Confidence */}
        <div className="bg-white rounded-xl p-3" style={{ border: '1px solid #E0E7DF' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#748078' }}>Report Confidence</p>
          <ConfidenceIndicator score={incident.confidenceScore} />
        </div>

        {/* Recommendations */}
        {detail?.recommendations && detail.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Zap size={13} style={{ color: '#E9A23B' }} />
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#748078' }}>Recommended Resources</p>
            </div>
            <AIDisclaimer />
            {assignedMsg && (
              <div
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg"
                style={assignedMsg.includes('failed')
                  ? { backgroundColor: '#FDECEA', border: '1px solid #f5b8b5', color: '#D94841' }
                  : { backgroundColor: '#E8F4EC', border: '1px solid #a8d5b4', color: '#287347' }
                }
              >
                {assignedMsg.includes('failed') ? <X size={12} /> : <CheckCircle size={12} />}
                {assignedMsg}
              </div>
            )}
            {detail.recommendations.map((rec, i) => (
              <div
                key={rec.resourceId}
                className="rounded-xl p-3 space-y-2"
                style={i === 0
                  ? { border: '1.5px solid #245C45', backgroundColor: '#EDF4EE' }
                  : { border: '1px solid #E0E7DF', backgroundColor: '#fff' }
                }
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#26332D' }}>{rec.resourceName}</div>
                    <div className="text-xs" style={{ color: '#748078' }}>{rec.capability}</div>
                  </div>
                  {i === 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold text-white"
                      style={{ backgroundColor: '#245C45' }}
                    >
                      Best Match
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: '#748078' }}>
                  <div>📍 {rec.distance} km</div>
                  <div>⏱ {rec.eta} min ETA</div>
                </div>
                <div className="text-xs italic" style={{ color: '#748078' }}>{rec.reason}</div>
                <button
                  onClick={() => handleAssign(rec)}
                  disabled={assigning || incident.status === 'RESOURCE_ASSIGNED' || incident.status === 'RESCUE_EN_ROUTE' || incident.status === 'RESOLVED'}
                  className="w-full py-1.5 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#245C45', color: '#fff' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#193F31'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#245C45'; }}
                >
                  {assigning ? 'Assigning...' : 'Assign Resource'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Status update buttons */}
        <div className="bg-white rounded-xl p-3" style={{ border: '1px solid #E0E7DF' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#748078' }}>Update Status</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { status: 'VERIFIED', label: 'Verify' },
              { status: 'RESCUE_EN_ROUTE', label: 'En Route' },
              { status: 'RESOLVED', label: 'Resolved' },
              { status: 'CLOSED', label: 'Close' },
            ].map(({ status, label }) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={incident.status === status}
                className="py-1.5 text-xs rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: '1px solid #E0E7DF', color: '#26332D', backgroundColor: '#fff' }}
                onMouseEnter={e => {
                  if (!e.currentTarget.disabled) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#EDF4EE';
                    (e.currentTarget as HTMLElement).style.borderColor = '#245C45';
                    (e.currentTarget as HTMLElement).style.color = '#245C45';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E0E7DF';
                  (e.currentTarget as HTMLElement).style.color = '#26332D';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
