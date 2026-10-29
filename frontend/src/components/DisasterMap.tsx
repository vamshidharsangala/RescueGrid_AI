import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, Marker, useMap } from 'react-leaflet';
import type { Incident, Resource } from '../types';
import { getMarkerColor, getPriorityLabel, getDisasterLabel, getDisasterIcon, getResourceTypeIcon } from '../utils/helpers';
import L from 'leaflet';
import { MapPin, Users, BarChart2 } from 'lucide-react';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createResourceIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:18px;background:white;border:2px solid #245C45;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(36,92,69,0.25)">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

interface MapProps {
  incidents: Incident[];
  resources: Resource[];
  selectedId?: string;
  onIncidentClick?: (incident: Incident) => void;
}

function FitBounds({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map(i => [i.latitude, i.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [incidents.length]);
  return null;
}

export default function DisasterMap({ incidents, resources, selectedId, onIncidentClick }: MapProps) {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[17.3850, 78.4867]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {incidents.length > 0 && <FitBounds incidents={incidents} />}

        {/* Incident markers */}
        {incidents.map(incident => (
          <CircleMarker
            key={incident.id}
            center={[incident.latitude, incident.longitude]}
            radius={incident.id === selectedId ? 16 : 12 + incident.priorityScore * 0.08}
            pathOptions={{
              color: getMarkerColor(incident.priorityScore),
              fillColor: getMarkerColor(incident.priorityScore),
              fillOpacity: 0.85,
              weight: incident.id === selectedId ? 3 : 2,
            }}
            eventHandlers={{ click: () => onIncidentClick?.(incident) }}
          >
            <Tooltip permanent={false} direction="top">
              <div className="text-xs">
                <div className="font-bold">{incident.incidentNumber}</div>
                <div>{getDisasterLabel(incident.type)}</div>
                <div>Priority: {incident.priorityScore} ({getPriorityLabel(incident.priorityScore)})</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="min-w-[200px] font-sans">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getDisasterIcon(incident.type)}</span>
                  <div>
                    <div className="font-bold" style={{ color: '#26332D' }}>{incident.incidentNumber}</div>
                    <div className="text-xs" style={{ color: '#748078' }}>{getDisasterLabel(incident.type)}</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs" style={{ color: '#748078' }}>
                  <div className="flex items-center gap-1"><BarChart2 size={11} />Priority: <strong style={{ color: '#26332D' }}>{incident.priorityScore}</strong> ({getPriorityLabel(incident.priorityScore)})</div>
                  <div className="flex items-center gap-1"><Users size={11} />{incident.peopleAffected} people affected</div>
                  <div className="flex items-center gap-1"><MapPin size={11} />{incident.locationName || 'Unknown location'}</div>
                </div>
                {incident.isDevelopmentData && (
                  <div className="mt-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FFF8DB', color: '#8A6A12' }}>⚠️ Development Data</div>
                )}
                {onIncidentClick && (
                  <button
                    onClick={() => onIncidentClick(incident)}
                    className="mt-2 w-full text-xs py-1.5 rounded font-medium transition-colors"
                    style={{ backgroundColor: '#245C45', color: '#fff' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#193F31'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#245C45'; }}
                  >
                    View Intelligence →
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Resource markers */}
        {resources.map(resource => (
          resource.status === 'AVAILABLE' && (
            <Marker
              key={resource.id}
              position={[resource.latitude, resource.longitude]}
              icon={createResourceIcon(getResourceTypeIcon(resource.type as any))}
            >
              <Tooltip direction="top">
                <div className="text-xs">
                  <div className="font-bold">{resource.name}</div>
                  <div className="text-emerald-600">Available</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs min-w-[160px] font-sans">
                  <div className="font-bold mb-1" style={{ color: '#26332D' }}>{resource.name}</div>
                  <div style={{ color: '#748078' }}>{resource.capability}</div>
                  <div className="font-medium mt-1" style={{ color: '#3D8B62' }}>✓ Available</div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 rounded-xl shadow-card-md px-3 py-2.5 text-xs space-y-1.5 z-[1000]"
        style={{ backgroundColor: '#fff', border: '1px solid #E0E7DF' }}
      >
        <div className="font-semibold mb-2" style={{ color: '#26332D', fontFamily: 'Manrope, sans-serif' }}>Priority Legend</div>
        {[
          { label: 'Critical (86–100)', color: '#D94841' },
          { label: 'Very High (71–85)', color: '#B9681F' },
          { label: 'High (51–70)', color: '#E9A23B' },
          { label: 'Moderate (31–50)', color: '#8A6A12' },
          { label: 'Low (0–30)', color: '#3D8B62' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span style={{ color: '#748078' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
