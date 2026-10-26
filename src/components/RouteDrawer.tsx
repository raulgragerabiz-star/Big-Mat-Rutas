import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Scale, 
  MapPin, 
  Euro, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Building,
  Info
} from 'lucide-react';
import { OptimizedRoute, RouteValidationStatus } from '../types/logistics';

interface RouteDrawerProps {
  route: OptimizedRoute;
  onClose: () => void;
}

function getStatusBadge(status: RouteValidationStatus) {
  switch (status) {
    case 'VALIDA':
      return {
        label: 'Válida (≤ 9h)',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2
      };
    case 'PENDIENTE':
      return {
        label: 'Pendiente Revisión',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: AlertCircle
      };
    case 'RECHAZADA':
      return {
        label: 'Rechazada (> 9h / Sobrecarga)',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: XCircle
      };
  }
}

export const RouteDrawer: React.FC<RouteDrawerProps> = ({ route, onClose }) => {
  const statusInfo = getStatusBadge(route.estadoValidacion);
  const StatusIcon = statusInfo.icon;

  const hoursPercent = Math.min(100, Math.round((route.duracionTotalHoras / 9.0) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusInfo.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {route.salidasSemanales} salida(s) / sem · {route.diasTexto}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1.5">{route.nombre}</h3>
          <p className="text-xs text-slate-400">
            Corredor: <span className="text-slate-200">{route.corredorNombre}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Cerrar detalle"
        >
          ✕
        </button>
      </div>

      {/* Assigned Vehicle & 9h Workday Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              Vehículo Asignado
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {route.vehiculo.costPerKm.toFixed(2)} €/km (MITMA)
            </span>
          </div>
          <div className="text-sm font-bold text-white mt-2">
            {route.vehiculo.name}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {route.vehiculo.category} · Carga máx: {route.vehiculo.maxWeightKg.toLocaleString('es-ES')} kg ({route.vehiculo.maxPallets} palés)
          </div>

          {/* Ocupación Gauges */}
          <div className="mt-3 space-y-2 pt-2 border-t border-slate-900">
            <div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Ocupación Peso:</span>
                <span className={`font-bold ${route.ocupacionKgPercent > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {route.kgPorSalida.toLocaleString('es-ES')} kg / {route.vehiculo.maxWeightKg.toLocaleString('es-ES')} kg ({route.ocupacionKgPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    route.ocupacionKgPercent > 100 ? 'bg-rose-500' : route.ocupacionKgPercent > 80 ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, route.ocupacionKgPercent)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Ocupación Palés:</span>
                <span className={`font-bold ${route.ocupacionPaletsPercent > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {route.paletsPorSalida.toFixed(1)} / {route.vehiculo.maxPallets} palés ({route.ocupacionPaletsPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    route.ocupacionPaletsPercent > 100 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, route.ocupacionPaletsPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 9-Hour Workday Gauge & Breakdown */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Jornada Máxima (Límite 9,0 h)
            </span>
            <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
              route.cumpleJornada9h ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
            }`}>
              {route.cumpleJornada9h ? 'Dentro de norma' : 'Excede 9h'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-extrabold font-mono ${route.cumpleJornada9h ? 'text-white' : 'text-rose-400'}`}>
              {route.duracionTotalHoras.toFixed(1)} h
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / 9,0 horas máximas ({hoursPercent}%)
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                route.duracionTotalHoras > 9 ? 'bg-rose-500' : route.duracionTotalHoras > 8 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, hoursPercent)}%` }}
            />
          </div>

          {/* Time breakdown details */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-900 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Carga Pinto:</span>
              <span className="text-slate-300 font-semibold">{route.tiempoCargaPintoHoras * 60} min</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Conducción:</span>
              <span className="text-slate-300 font-semibold">{route.tiempoConduccionHoras.toFixed(1)} h</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Descargas ({route.paradas.length}):</span>
              <span className="text-slate-300 font-semibold">{route.tiempoDescargaHoras.toFixed(1)} h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financials & Margins Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px]">Km Totales (i/v):</span>
          <span className="text-sm font-bold text-white font-mono">{route.kmTotalesRuta.toLocaleString('es-ES')} km</span>
          <span className="text-[10px] text-slate-500 block">por salida</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Coste Transporte:</span>
          <span className="text-sm font-bold text-rose-400 font-mono">{route.costeTotalSalida.toLocaleString('es-ES')} €</span>
          <span className="text-[10px] text-slate-500 block">{route.costeSemanal.toLocaleString('es-ES')} € / sem</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Ingreso Tarifario:</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{route.ingresoTarifarioSalida.toLocaleString('es-ES')} €</span>
          <span className="text-[10px] text-slate-500 block">{route.ingresoSemanal.toLocaleString('es-ES')} € / sem</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Margen Estimado:</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold font-mono ${route.margenBrutoSalida >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {route.margenBrutoSalida.toLocaleString('es-ES')} €
            </span>
            <span className={`text-[10px] font-semibold ${route.margenPercent >= 0 ? 'text-blue-300' : 'text-rose-300'}`}>
              ({route.margenPercent}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Neto: {route.beneficioNetoEstimadoSalida.toLocaleString('es-ES')} €</span>
        </div>
      </div>

      {/* Validation Motive & Warning Notices */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Dictamen de Validación: </span>
            <span className="text-slate-400">{route.motivoValidacion}</span>
          </div>
        </div>
        {route.avisos.map((aviso, idx) => (
          <div key={idx} className="flex items-center gap-2 text-amber-400 pl-6 text-[11px]">
            <span>⚠ {aviso}</span>
          </div>
        ))}
      </div>

      {/* Decision Comparison (Consolidación vs Alternativo vs Porte) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-blue-400" />
          Análisis de Alternativas de Decisión
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">1. Consolidación en Ruta</span>
            <p className="text-slate-300 mt-1">{route.alternativaComparada.opcionConsolidacion}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">2. Vehículo Alternativo</span>
            <p className="text-slate-300 mt-1">{route.alternativaComparada.opcionVehiculoAlternativo}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">3. Servicio de Porte / Agencia</span>
            <p className="text-slate-300 mt-1">{route.alternativaComparada.opcionPorte}</p>
          </div>
        </div>
        <div className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50 font-semibold">
          💡 Recomendación del Optimizador: {route.alternativaComparada.decisionRecomendada}
        </div>
      </div>

      {/* Sequential Stops Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          Secuencia de Entregas ({route.paradas.length} paradas directas)
        </h4>
        
        <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Socio</th>
                <th className="py-2 px-3">Localidad</th>
                <th className="py-2 px-3 text-right">Tramo</th>
                <th className="py-2 px-3 text-right">Kg</th>
                <th className="py-2 px-3 text-right">Palés</th>
                <th className="py-2 px-3 text-right">Tarifa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {route.paradas.map(stop => (
                <tr key={stop.socio.codigo} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-500">{stop.orden}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-200">
                    {stop.socio.nombre}
                    <span className="block text-[10px] text-slate-500">#{stop.socio.codigo}</span>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-400">
                    {[stop.socio.poblacion, stop.socio.provincia].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    +{stop.kmTramo} km
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    {stop.kgEntrega.toLocaleString('es-ES')} kg
                  </td>
                  <td className="py-2 px-3 text-right text-amber-400">
                    {stop.paletsEntrega} pal
                  </td>
                  <td className="py-2 px-3 text-right text-blue-400 font-bold">
                    {stop.ingresoTarifario} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Socios Derivados a Porte (si los hay) */}
      {route.sociosPorte.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3 text-xs space-y-1.5">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            {route.sociosPorte.length} socio(s) canalizado(s) mediante Red de Porte / Agencia
          </div>
          <p className="text-amber-200/80">
            Envíos que no alcanzan el umbral de camión o cuyo desvío es antieconómico. Se despachan sin retrasos mediante paquetería concertada:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {route.sociosPorte.map(sp => (
              <span key={sp.codigo} className="px-2 py-1 rounded bg-slate-900 border border-amber-800/60 font-mono text-[11px] text-amber-200">
                {sp.nombre} ({sp.kgPorDia.toFixed(0)} kg/d · {sp.kmDesdePinto} km)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
