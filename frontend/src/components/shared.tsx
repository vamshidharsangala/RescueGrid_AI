import type { Incident, PriorityBreakdownItem, PriorityResult } from '../types';
import {
  getPriorityLabel, getPriorityColor, getDisasterIcon, getDisasterLabel,
  getConfidenceLabel, timeAgo
} from '../utils/helpers';
import { Users, MapPin, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// ── Priority Score Bar ────────────────────────────────────────────

export function PriorityScoreBar({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const color = getPriorityColor(score);
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span style={{ color: '#77746F' }}>Priority Score</span>
          <span className="font-semibold" style={{ color }}>{score} — {getPriorityLabel(score)}</span>
        </div>
      )}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E7E5E0' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Priority Breakdown ─────────────────────────────────────────────

export function PriorityBreakdown({ result }: { result: PriorityResult }) {
  const color = getPriorityColor(result.score);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="text-4xl font-bold" style={{ color }}>{result.score}</div>
        <div className="pb-1">
          <div className="text-sm font-semibold" style={{ color: '#181818' }}>{result.classification}</div>
          <div className="text-xs" style={{ color: '#77746F' }}>Priority Score / 100</div>
        </div>
      </div>
      <div className="space-y-2">
        {result.breakdown.map((item: PriorityBreakdownItem) => (
          <div key={item.factor} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: '#77746F' }}>{item.factor}</span>
              <span className="font-mono" style={{ color: '#77746F' }}>{item.label}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E7E5E0' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${item.rawScore}%`, backgroundColor: getPriorityColor(item.rawScore) }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs border-t pt-2" style={{ color: '#77746F', borderColor: '#E7E5E0' }}>
        ⚠️ AI provides decision support only. Verify with field teams before dispatch.
      </p>
    </div>
  );
}

// ── Incident Card ──────────────────────────────────────────────────

export function IncidentCard({
  incident, selected, onClick
}: {
  incident: Incident;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { label: confLabel, color: confColor } = getConfidenceLabel(incident.confidenceScore);
  const priority   = getPriorityLabel(incident.priorityScore);
  const prioColor  = getPriorityColor(incident.priorityScore);

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer transition-all duration-150 hover:shadow-card-md fade-in"
      style={selected
        ? { border: '1.5px solid #C62828', boxShadow: '0 0 0 3px rgba(198,40,40,0.10)' }
        : undefined
      }
    >
      {incident.isDevelopmentData && (
        <div className="px-3 py-1 rounded-t-[10px]" style={{ backgroundColor: '#F5EBD7', borderBottom: '1px solid #DDD0AC' }}>
          <span className="text-xs font-medium" style={{ color: '#805515' }}>⚠️ Development Data</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDisasterIcon(incident.type)}</span>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#181818' }}>{getDisasterLabel(incident.type)}</div>
              <div className="text-xs font-mono" style={{ color: '#77746F' }}>{incident.incidentNumber}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold" style={{ color: prioColor }}>{incident.priorityScore}</div>
            <div className="text-xs font-medium" style={{ color: prioColor }}>{priority}</div>
          </div>
        </div>

        <div className="space-y-1 text-xs" style={{ color: '#77746F' }}>
          <div className="flex items-center gap-1.5">
            <MapPin size={11} />
            <span className="truncate">{incident.locationName || 'Location unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} />
            <span>{incident.peopleAffected} people affected</span>
            {incident.vulnerablePeople && (
              <span className="font-medium" style={{ color: '#B7791F' }}>· Vulnerable</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>{timeAgo(incident.createdAt)}</span>
            <span className={`ml-auto font-medium ${confColor}`}>{confLabel}</span>
          </div>
        </div>

        <div className="mt-3">
          <PriorityScoreBar score={incident.priorityScore} showLabel={false} />
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    REPORTED:             { bg: '#E7E5E0', color: '#77746F', border: '#D8D5CF' },
    AI_PROCESSING:        { bg: '#EAF1F7', color: '#2a7fa8', border: '#B7D5E8' },
    VERIFIED:             { bg: '#EAF1F7', color: '#2a7fa8', border: '#B7D5E8' },
    NEEDS_VERIFICATION:   { bg: '#F5EBD7', color: '#805515', border: '#DDD0AC' },
    PRIORITIZED:          { bg: '#F8E8E7', color: '#A61F24', border: '#E8C2C0' },
    RESOURCE_RECOMMENDED: { bg: '#F8E8E7', color: '#A61F24', border: '#E8C2C0' },
    RESOURCE_ASSIGNED:    { bg: '#EAF1F7', color: '#2a7fa8', border: '#B7D5E8' },
    RESCUE_EN_ROUTE:      { bg: '#F5EBD7', color: '#805515', border: '#DDD0AC' },
    RESOLVED:             { bg: '#E8E6E1', color: '#292929', border: '#D8D5CF' },
    CLOSED:               { bg: '#E7E5E0', color: '#77746F', border: '#D8D5CF' },
  };

  const labelMap: Record<string, string> = {
    REPORTED: 'Reported', AI_PROCESSING: 'AI Processing', VERIFIED: 'Verified',
    NEEDS_VERIFICATION: 'Needs Verification', PRIORITIZED: 'Prioritized',
    RESOURCE_RECOMMENDED: 'Resource Recommended', RESOURCE_ASSIGNED: 'Resource Assigned',
    RESCUE_EN_ROUTE: 'Rescue En Route', RESOLVED: 'Resolved', CLOSED: 'Closed',
  };

  const style = styles[status] || { bg: '#E7E5E0', color: '#77746F', border: '#D8D5CF' };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {labelMap[status] || status}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────

export function StatCard({
  label, value, icon: Icon, iconBg, iconColor, subtext,
  color: _color, bgColor: _bgColor
}: {
  label: string;
  value: string | number;
  icon: any;
  iconBg?: string;
  iconColor?: string;
  subtext?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#77746F' }}>{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#181818' }}>{value}</p>
          {subtext && <p className="text-xs mt-0.5" style={{ color: '#77746F' }}>{subtext}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ml-3"
          style={{ backgroundColor: iconBg || '#F7F6F3', border: '1px solid #E7E5E0' }}
        >
          <Icon size={20} style={{ color: iconColor || '#292929' }} />
        </div>
      </div>
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────────

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 12) }}
    />
  );
}

// ── Empty State ────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description }: {
  icon: any; title: string; description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: '#E7E5E0', border: '1px solid #D8D5CF' }}
      >
        <Icon size={24} style={{ color: '#77746F' }} />
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: '#181818' }}>{title}</h3>
      {description && (
        <p className="text-xs max-w-xs" style={{ color: '#77746F' }}>{description}</p>
      )}
    </div>
  );
}

// ── AI Disclaimer ──────────────────────────────────────────────────

export function AIDisclaimer() {
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs"
      style={{ backgroundColor: '#F8E8E7', border: '1px solid #E8C2C0' }}
    >
      <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: '#C62828' }} />
      <span style={{ color: '#292929' }}>
        AI provides decision support and recommendations. It does not replace emergency authorities or guarantee outcomes.
        All recommendations require human approval before dispatch.
      </span>
    </div>
  );
}

// ── Confidence Indicator ───────────────────────────────────────────

export function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const { label, color } = getConfidenceLabel(score);
  const barColor = pct >= 70 ? '#292929' : pct >= 50 ? '#B7791F' : '#C62828';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: '#77746F' }}>Report Confidence</span>
        <span className={`font-semibold ${color}`}>{pct}% · {label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E7E5E0' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="space-y-0.5 mt-1">
        {pct >= 80 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#292929' }}>
            <CheckCircle size={10} />Location data present
          </div>
        )}
        {pct >= 70 && pct < 80 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#292929' }}>
            <CheckCircle size={10} />Recent timestamp
          </div>
        )}
        {pct < 60 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#B7791F' }}>
            <XCircle size={10} />Exact details unverified
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="px-6 py-4 flex items-center justify-between shrink-0"
      style={{ backgroundColor: '#fff', borderBottom: '1px solid #E7E5E0' }}
    >
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#77746F' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
