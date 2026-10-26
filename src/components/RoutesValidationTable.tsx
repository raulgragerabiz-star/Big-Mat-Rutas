import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Truck, 
  Clock, 
  ChevronRight,
  Download
} from 'lucide-react';
import { OptimizedRoute, RouteValidationStatus } from '../types/logistics';

interface RoutesValidationTableProps {
  routes: OptimizedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
  statusFilter: string | null;
  onSetStatusFilter: (status: string | null) => void;
}

export const RoutesValidationTable: React.FC<RoutesValidationTableProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  statusFilter,
  onSetStatusFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nombre' | 'kgPorSalida' | 'kmTotalesRuta' | 'duracionTotalHoras' | 'costeTotalSalida' | 'margenBrutoSalida'>('kgPorSalida');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredRoutes = useMemo(() => {
    return routes
      .filter(r => {
        if (statusFilter && r.estadoValidacion !== statusFilter) {
          return false;
        }
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          r.nombre.toLowerCase().includes(q) ||
          r.corredorNombre.toLowerCase().includes(q) ||
          r.vehiculo.name.toLowerCase().includes(q) ||
          r.sociosDirectos.some(s => s.nombre.toLowerCase().includes(q) || s.codigo.includes(q))
        );
      })
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [routes, statusFilter, searchTerm, sortBy, sortAsc]);

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top filters and search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Validación Técnica de Rutas</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filteredRoutes.length} de {routes.length} rutas
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprobación de capacidades (peso y palés), jornada laboral legal (≤ 9 horas) y rentabilidad
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onSetStatusFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === null
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({routes.length})
          </button>
          <button
            type="button"
            onClick={() => onSetStatusFilter('VALIDA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'VALIDA'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-400 hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Válidas ({routes.filter(r => r.estadoValidacion === 'VALIDA').length})
          </button>
          <button
            type="button"
            onClick={() => onSetStatusFilter('PENDIENTE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDIENTE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:bg-slate-900'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Pendientes ({routes.filter(r => r.estadoValidacion === 'PENDIENTE').length})
          </button>
          <button
            type="button"
            onClick={() => onSetStatusFilter('RECHAZADA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'RECHAZADA'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-400 hover:bg-slate-900'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Rechazadas ({routes.filter(r => r.estadoValidacion === 'RECHAZADA').length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por corredor, ruta, vehículo o socio asignado..."
          className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Routes Data Grid */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 select-none">
            <tr>
              <th className="py-3 px-3">Estado</th>
              <th 
                className="py-3 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  <span>Ruta / Corredor</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Vehículo</th>
              <th className="py-3 px-3 text-center">Salidas/Sem</th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('kgPorSalida')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kg / Salida</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Palés</th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('kmTotalesRuta')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Km i/v</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('duracionTotalHoras')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Jornada (h)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('costeTotalSalida')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Coste MITMA</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Ingreso</th>
              <th 
                className="py-3 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('margenBrutoSalida')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Margen</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredRoutes.map(route => {
              const isSelected = selectedRouteId === route.id;
              const status = route.estadoValidacion;

              return (
                <tr
                  key={route.id}
                  onClick={() => onSelectRoute(isSelected ? null : route.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-rose-950/40 border-l-4 border-l-rose-500' 
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Estado Badge */}
                  <td className="py-2.5 px-3">
                    {status === 'VALIDA' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        VÁLIDA
                      </span>
                    ) : status === 'PENDIENTE' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <AlertCircle className="w-3 h-3" />
                        PENDIENTE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3" />
                        RECHAZADA
                      </span>
                    )}
                  </td>

                  {/* Nombre Ruta */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-white text-xs leading-snug">
                      {route.nombre}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>{route.sociosDirectos.length} paradas</span>
                      {route.sociosPorte.length > 0 && (
                        <span className="text-amber-400">+{route.sociosPorte.length} por agencia</span>
                      )}
                    </div>
                  </td>

                  {/* Vehículo */}
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[11px] font-semibold text-slate-300 border border-slate-800">
                      {route.vehiculo.name.split('(')[0].trim()}
                    </span>
                  </td>

                  {/* Salidas Semana */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-slate-200 font-bold">{route.salidasSemanales}</span>
                    <span className="text-[10px] text-slate-500 block">{route.diasTexto.slice(0, 15)}</span>
                  </td>

                  {/* Kg por salida */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-bold text-slate-100">
                      {route.kgPorSalida.toLocaleString('es-ES')}
                    </span>
                    <span className={`text-[10px] block ${
                      route.ocupacionKgPercent > 100 ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                      {route.ocupacionKgPercent}% útil
                    </span>
                  </td>

                  {/* Palés por salida */}
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {route.paletsPorSalida.toFixed(1)}
                    <span className="text-[10px] text-slate-500 block">
                      /{route.vehiculo.maxPallets}
                    </span>
                  </td>

                  {/* Km Totales */}
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {route.kmTotalesRuta.toLocaleString('es-ES')}
                  </td>

                  {/* Horas de Jornada */}
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-bold ${route.duracionTotalHoras > 9.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                      {route.duracionTotalHoras.toFixed(1)} h
                    </span>
                    <span className={`text-[10px] block ${route.cumpleJornada9h ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {route.cumpleJornada9h ? '≤ 9h' : '> 9h'}
                    </span>
                  </td>

                  {/* Coste Salida */}
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {route.costeTotalSalida.toLocaleString('es-ES')} €
                  </td>

                  {/* Ingreso Salida */}
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                    {route.ingresoTarifarioSalida.toLocaleString('es-ES')} €
                  </td>

                  {/* Margen Salida */}
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-bold ${route.margenBrutoSalida >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      {route.margenBrutoSalida.toLocaleString('es-ES')} €
                    </span>
                    <span className={`text-[10px] block ${route.margenPercent >= 0 ? 'text-blue-300' : 'text-rose-300'}`}>
                      {route.margenPercent}%
                    </span>
                  </td>

                  {/* Botón Ver */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Ver hoja de ruta"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
