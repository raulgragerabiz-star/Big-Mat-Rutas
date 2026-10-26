import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Truck, 
  Euro, 
  TrendingUp, 
  Layers, 
  Package, 
  Clock, 
  Gauge 
} from 'lucide-react';
import { ScenarioDefinition } from '../types/logistics';

interface TopKpiCardsProps {
  scenario: ScenarioDefinition;
  onFilterStatus?: (status: string | null) => void;
  selectedStatus?: string | null;
}

function formatEuro(val: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';
}

function formatNumber(val: number, decimals = 0): string {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
}

export const TopKpiCards: React.FC<TopKpiCardsProps> = ({
  scenario,
  onFilterStatus,
  selectedStatus
}) => {
  return (
    <div className="space-y-3">
      {/* Primary Status Banner Cards (inspired by Movyra design) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* TOTAL VIAJES / RUTAS */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus(null)}
          className={`cursor-pointer rounded-xl p-4 transition-all border ${
            selectedStatus === null 
              ? 'bg-blue-600/90 text-white border-blue-400 shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/50' 
              : 'bg-gradient-to-br from-blue-950/70 to-slate-900 text-slate-100 border-blue-900/50 hover:border-blue-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Total Salidas / Sem
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 font-mono">
              {scenario.rutas.length} corredores
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {scenario.totalSalidasSemanales}
          </div>
          <div className="text-xs text-blue-200/80 mt-1 flex items-center justify-between">
            <span>{formatNumber(scenario.totalKmSemanales)} km/sem</span>
            <span>~{scenario.horasMediasPorJornada} h/salida</span>
          </div>
        </div>

        {/* SIN ASIGNAR / DERIVADOS A AGENCIA */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('AGENCIA')}
          className={`cursor-pointer rounded-xl p-4 transition-all border ${
            selectedStatus === 'AGENCIA'
              ? 'bg-amber-600 text-white border-amber-300 shadow-lg shadow-amber-900/30 ring-2 ring-amber-400/50'
              : 'bg-gradient-to-br from-amber-950/50 to-slate-900 text-slate-100 border-amber-900/50 hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Canal Porte / Agencia
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-mono">
              LTL
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {scenario.pedidosPorteSemanales}
          </div>
          <div className="text-xs text-amber-300/80 mt-1 flex items-center justify-between">
            <span>{formatNumber(scenario.kgPorteSemanales)} kg/sem</span>
            <span>{scenario.umbralMinimoKg ? `< ${scenario.umbralMinimoKg} kg` : 'Desvío caro'}</span>
          </div>
        </div>

        {/* RUTAS VÁLIDAS */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('VALIDA')}
          className={`cursor-pointer rounded-xl p-4 transition-all border ${
            selectedStatus === 'VALIDA'
              ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-900/30 ring-2 ring-emerald-400/50'
              : 'bg-gradient-to-br from-emerald-950/50 to-slate-900 text-slate-100 border-emerald-900/50 hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Rutas Válidas
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono">
              ≤ 9.0h
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {scenario.rutasValidasCount}
          </div>
          <div className="text-xs text-emerald-300/80 mt-1 flex items-center justify-between">
            <span>Cumplen peso y palés</span>
            <span>{Math.round((scenario.rutasValidasCount / scenario.rutas.length) * 100)}%</span>
          </div>
        </div>

        {/* INCIDENCIAS / RECHAZADAS O EXCESO JORNADA */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('RECHAZADA')}
          className={`cursor-pointer rounded-xl p-4 transition-all border ${
            selectedStatus === 'RECHAZADA'
              ? 'bg-rose-600 text-white border-rose-300 shadow-lg shadow-rose-900/30 ring-2 ring-rose-400/50'
              : 'bg-gradient-to-br from-rose-950/50 to-slate-900 text-slate-100 border-rose-900/50 hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Rechazadas / Alertas
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono">
              {scenario.rutasPendientesCount > 0 ? `${scenario.rutasPendientesCount} pend.` : 'Auditar'}
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {scenario.rutasRechazadasCount}
          </div>
          <div className="text-xs text-rose-300/80 mt-1 flex items-center justify-between">
            <span>&gt; 9h jornada o subcarga</span>
            <span>{scenario.rutasPendientesCount} pendientes</span>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Productivity Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        {/* Coste Transporte */}
        <div className="px-3 py-1.5 border-r border-slate-800 last:border-r-0">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Euro className="w-3 h-3 text-slate-400" />
            Coste Transporte / Sem
          </div>
          <div className="text-lg font-bold text-slate-100 mt-0.5 font-mono">
            {formatEuro(scenario.costeTransporteSemanal)}
          </div>
          <div className="text-[10px] text-slate-400">
            Observatorio MITMA ({scenario.totalSalidasSemanales} salidas)
          </div>
        </div>

        {/* Ingreso Tarifario */}
        <div className="px-3 py-1.5 border-r border-slate-800 last:border-r-0">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Ingreso Tarifario / Sem
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
            {formatEuro(scenario.ingresoTarifarioSemanal)}
          </div>
          <div className="text-[10px] text-slate-400">
            Matriz de tarifas por peso y zona
          </div>
        </div>

        {/* Margen Bruto Estimado */}
        <div className="px-3 py-1.5 border-r border-slate-800 last:border-r-0">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-blue-400" />
            Margen Bruto de Ruta
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold text-blue-400 font-mono">
              {formatEuro(scenario.margenBrutoSemanal)}
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-blue-900/50 text-blue-300">
              {scenario.margenPercent}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Ingresos menos costes directos
          </div>
        </div>

        {/* Beneficio Neto Estimado */}
        <div className="px-3 py-1.5">
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            Beneficio Neto Estimado
          </div>
          <div className="text-lg font-bold text-indigo-400 mt-0.5 font-mono">
            {formatEuro(scenario.beneficioNetoSemanal)}
          </div>
          <div className="text-[10px] text-slate-400">
            Deduce 10% costes plataforma Pinto
          </div>
        </div>
      </div>
    </div>
  );
};
