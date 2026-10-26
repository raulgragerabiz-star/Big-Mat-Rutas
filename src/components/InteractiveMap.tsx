import React, { useState, useMemo } from 'react';
import { OptimizedRoute, SocioRecord } from '../types/logistics';
import { SOCIOS_DATA } from '../data/sociosData';
import { MapPin, Navigation, Eye, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface InteractiveMapProps {
  routes: OptimizedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
  selectedSocioCode?: string | null;
  onSelectSocio?: (socio: SocioRecord) => void;
}

// Proyección cónica equiárea adaptada para la Península Ibérica
const PROJ = {
  lon0: -10,
  lat1: 44,
  k: 70,
  cos: 0.766044443118978,
  w: 780,
  h: 580
};

const KM_TO_PX = PROJ.k / 111.2;

function projectCoords(lat: number, lon: number): { x: number; y: number } {
  return {
    x: (lon - PROJ.lon0) * PROJ.k * PROJ.cos,
    y: (PROJ.lat1 - lat) * PROJ.k
  };
}

const PINTO_POINT = projectCoords(40.244, -3.700);

const MAP_VIEWS = {
  peninsula: {
    label: 'Península',
    viewBox: [0, 0, PROJ.w, PROJ.h]
  },
  centro: {
    label: 'Radio 300 km',
    viewBox: [
      PINTO_POINT.x - 310 * KM_TO_PX * 1.34,
      PINTO_POINT.y - 310 * KM_TO_PX,
      620 * KM_TO_PX * 1.34,
      620 * KM_TO_PX
    ]
  },
  madrid: {
    label: 'Madrid (75 km)',
    viewBox: [
      PINTO_POINT.x - 85 * KM_TO_PX * 1.34,
      PINTO_POINT.y - 85 * KM_TO_PX,
      170 * KM_TO_PX * 1.34,
      170 * KM_TO_PX
    ]
  }
};

const CORRIDOR_COLORS: Record<string, string> = {
  'COR-MAD-NORTE': '#38bdf8',      // Sky
  'COR-MAD-SUR': '#06b6d4',        // Cyan
  'COR-AVILA-SALAMANCA': '#f59e0b',// Amber
  'COR-CASTILLA-LEON': '#8b5cf6',  // Purple
  'COR-EXTREMADURA': '#10b981',    // Emerald
  'COR-BURGOS-NORTE': '#ec4899',   // Pink
  'COR-CUENCA': '#f97316',         // Orange
  'COR-GUADALAJARA': '#14b8a6',    // Teal
  'COR-MANCHA-SUR': '#eab308',     // Yellow
  'COR-ASTURIAS': '#6366f1',       // Indigo
  'COR-ANDALUCIA-SERLOG': '#ef4444',// Red
  'COR-RIOJA-VASCO': '#a855f7'     // Violet
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  selectedSocioCode,
  onSelectSocio
}) => {
  const [activeView, setActiveView] = useState<'peninsula' | 'centro' | 'madrid'>('peninsula');
  const [hoveredSocio, setHoveredSocio] = useState<SocioRecord | null>(null);

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || null;
  }, [routes, selectedRouteId]);

  const currentViewBox = MAP_VIEWS[activeView].viewBox;
  const zoomFactor = PROJ.w / currentViewBox[2];

  // Socios con coordenadas válidas para dibujar
  const mappableSocios = useMemo(() => {
    return SOCIOS_DATA.filter(s => s.latitud != null && s.longitud != null).map(s => {
      const coords = projectCoords(s.latitud!, s.longitud!);
      // Micro-dispersión para socios que comparten coordenadas exactas
      if (s.duplicadaCoordenada) {
        const offsetAngle = (2 * Math.PI * (parseInt(s.codigo.slice(-2)) || 1)) / (s.duplicadaCoordenada + 1);
        coords.x += Math.cos(offsetAngle) * 4;
        coords.y += Math.sin(offsetAngle) * 4;
      }
      return {
        ...s,
        px: coords.x,
        py: coords.y
      };
    });
  }, []);

  // Construir líneas de ruta
  const routePaths = useMemo(() => {
    return routes.map(route => {
      const stops = route.paradas.map(p => p.socio).filter(s => s.latitud != null && s.longitud != null);
      if (stops.length === 0) return null;

      // Línea desde Pinto pasando por las paradas y volviendo
      const points = [PINTO_POINT, ...stops.map(s => projectCoords(s.latitud!, s.longitud!)), PINTO_POINT];
      const d = points.reduce((acc, pt, idx) => {
        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
      }, '');

      const isSelected = selectedRouteId === route.id;
      const color = CORRIDOR_COLORS[route.corredorId] || '#94a3b8';

      return {
        id: route.id,
        route,
        d,
        color,
        isSelected
      };
    }).filter(Boolean);
  }, [routes, selectedRouteId]);

  const distanceRings = [50, 100, 150, 200, 250, 300];

  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Viewport Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          {(['peninsula', 'centro', 'madrid'] as const).map(viewKey => (
            <button
              key={viewKey}
              type="button"
              onClick={() => setActiveView(viewKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === viewKey
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {MAP_VIEWS[viewKey].label}
            </button>
          ))}
        </div>

        {/* Right: Active Route Pill */}
        {selectedRoute ? (
          <div className="bg-slate-900/95 backdrop-blur px-3 py-1.5 rounded-xl border border-rose-500/50 shadow-lg flex items-center gap-2 pointer-events-auto">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ background: CORRIDOR_COLORS[selectedRoute.corredorId] || '#f43f5e' }}
            />
            <span className="text-xs font-bold text-white">{selectedRoute.nombre}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {selectedRoute.vehiculo.name.split(' ')[0]}
            </span>
            <button
              type="button"
              onClick={() => onSelectRoute(null)}
              className="text-slate-400 hover:text-white text-xs ml-1 font-bold"
              title="Ver todas las rutas"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 pointer-events-auto hidden sm:block">
            <span>Haz clic en un corredor o socio para ver su trazado</span>
          </div>
        )}
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox={currentViewBox.join(' ')}
        className="w-full h-auto block select-none bg-slate-950"
        style={{ aspectRatio: `${PROJ.w} / ${PROJ.h}`, minHeight: '440px' }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />

        {/* Distance Rings around Pinto */}
        <g pointerEvents="none">
          {distanceRings.map(radiusKm => {
            const rPx = radiusKm * KM_TO_PX;
            return (
              <g key={radiusKm}>
                <circle
                  cx={PINTO_POINT.x}
                  cy={PINTO_POINT.y}
                  r={rPx}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth={0.8 / zoomFactor}
                  strokeDasharray={`${3 / zoomFactor} ${3 / zoomFactor}`}
                />
                <text
                  x={PINTO_POINT.x + 3 / zoomFactor}
                  y={PINTO_POINT.y - rPx - 3 / zoomFactor}
                  fontSize={8 / zoomFactor}
                  fill="rgba(148, 163, 184, 0.6)"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {radiusKm} km
                </text>
              </g>
            );
          })}
        </g>

        {/* All Route Lines */}
        <g>
          {routePaths.map(rp => {
            if (!rp) return null;
            const isDimmed = selectedRouteId !== null && selectedRouteId !== rp.id;
            return (
              <path
                key={rp.id}
                d={rp.d}
                fill="none"
                stroke={rp.color}
                strokeWidth={(rp.isSelected ? 3.2 : 1.2) / zoomFactor}
                strokeOpacity={rp.isSelected ? 0.95 : isDimmed ? 0.15 : 0.6}
                strokeDasharray={rp.route.estadoValidacion === 'RECHAZADA' ? `${4 / zoomFactor} ${2 / zoomFactor}` : undefined}
                className="cursor-pointer transition-all duration-300"
                onClick={() => onSelectRoute(rp.isSelected ? null : rp.id)}
              >
                <title>{`${rp.route.nombre} (${rp.route.vehiculo.name})`}</title>
              </path>
            );
          })}
        </g>

        {/* Socio Markers */}
        <g>
          {mappableSocios.map(socio => {
            const isSelectedSocio = selectedSocioCode === socio.codigo;
            const inSelectedRoute = selectedRoute?.paradas.some(p => p.socio.codigo === socio.codigo);
            const isDimmed = selectedRouteId !== null && !inSelectedRoute;
            
            // Radio en función de los kg por día
            const radius = Math.max(
              2.5 / zoomFactor,
              Math.min(10 / zoomFactor, (2.5 + Math.sqrt(socio.kgPorDia) * 0.12) / zoomFactor)
            );

            const corridorId = routes.find(r => r.corredorNombre === socio.corredor)?.corredorId || '';
            const markerColor = CORRIDOR_COLORS[corridorId] || '#94a3b8';
            const isEstimado = socio.kmTipo === 'estimado';

            return (
              <circle
                key={socio.codigo}
                cx={socio.px}
                cy={socio.py}
                r={isSelectedSocio || hoveredSocio?.codigo === socio.codigo ? radius * 1.5 : radius}
                fill={isEstimado ? '#f59e0b' : markerColor}
                fillOpacity={isDimmed ? 0.2 : 0.9}
                stroke={isSelectedSocio ? '#ffffff' : inSelectedRoute ? '#ffffff' : 'rgba(15, 23, 42, 0.8)'}
                strokeWidth={(isSelectedSocio ? 2 : 0.8) / zoomFactor}
                strokeDasharray={isEstimado ? `${1.5 / zoomFactor} ${1 / zoomFactor}` : undefined}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredSocio(socio)}
                onMouseLeave={() => setHoveredSocio(null)}
                onClick={() => {
                  if (onSelectSocio) onSelectSocio(socio);
                  const relatedRoute = routes.find(r => r.paradas.some(p => p.socio.codigo === socio.codigo));
                  if (relatedRoute) onSelectRoute(relatedRoute.id);
                }}
              />
            );
          })}
        </g>

        {/* Pinto Origin Hub (Center) */}
        <g pointerEvents="none">
          {/* Animated pulse ring */}
          <circle
            cx={PINTO_POINT.x}
            cy={PINTO_POINT.y}
            r={14 / zoomFactor}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={1 / zoomFactor}
            strokeOpacity={0.4}
          />
          <circle
            cx={PINTO_POINT.x}
            cy={PINTO_POINT.y}
            r={6 / zoomFactor}
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth={1.8 / zoomFactor}
          />
          <text
            x={PINTO_POINT.x + 8 / zoomFactor}
            y={PINTO_POINT.y + 3 / zoomFactor}
            fontSize={10 / zoomFactor}
            fontWeight="800"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth={2.5 / zoomFactor}
            paintOrder="stroke"
          >
            HUB PINTO
          </text>
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredSocio && (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl max-w-xs text-xs pointer-events-none backdrop-blur">
          <div className="font-bold text-white text-sm leading-tight flex items-center justify-between gap-2">
            <span>{hoveredSocio.nombre}</span>
            <span className="font-mono text-[10px] text-slate-400">#{hoveredSocio.codigo}</span>
          </div>
          <div className="text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>{[hoveredSocio.poblacion, hoveredSocio.provincia].filter(Boolean).join(', ') || 'Sin población'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Demanda:</span>
              <span className="text-emerald-400 font-bold">{hoveredSocio.kgPorDia.toFixed(0)} kg/día</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Distancia:</span>
              <span className="text-blue-400 font-bold">
                {hoveredSocio.kmDesdePinto != null ? `${hoveredSocio.kmDesdePinto} km` : 'Pendiente'}
                {hoveredSocio.kmTipo === 'estimado' && ' *'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Corredor: {hoveredSocio.corredor}</span>
            {hoveredSocio.kmTipo === 'estimado' && (
              <span className="text-amber-400 font-semibold">* Km estimado</span>
            )}
          </div>
        </div>
      )}

      {/* Corridor Legend Drawer on Bottom Right */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-800 text-[11px] max-h-36 overflow-y-auto hidden md:block">
        <div className="text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
          Corredores ({routes.length})
        </div>
        <div className="space-y-1">
          {routes.map(r => {
            const color = CORRIDOR_COLORS[r.corredorId] || '#94a3b8';
            const isSelected = selectedRouteId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onSelectRoute(isSelected ? null : r.id)}
                className={`flex items-center gap-2 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="truncate max-w-[170px]">{r.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
