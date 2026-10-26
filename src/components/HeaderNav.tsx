import React from 'react';
import { 
  Truck, 
  MapPin, 
  Route as RouteIcon, 
  Scale, 
  Layers, 
  Users, 
  FileText, 
  AlertTriangle,
  Compass,
  TrendingUp,
  Settings
} from 'lucide-react';
import { ScenarioId } from '../types/logistics';

interface HeaderNavProps {
  currentScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentScenario,
  onSelectScenario,
  currentTab,
  onSelectTab,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-slate-900/90">
      {/* Top bar with branding and scenarios */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Movyra</span>
              <span className="text-slate-400 text-xs px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 font-mono">
                BigMat Pinto Hub
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema de Optimización de Rutas, Flota y Costes MITMA
            </p>
          </div>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider hidden sm:inline">
            Escenario:
          </span>
          <button
            type="button"
            onClick={() => onSelectScenario('ACTUAL_3000')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentScenario === 'ACTUAL_3000'
                ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Modelo Actual</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentScenario === 'ACTUAL_3000' ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              ≥ 3.000 kg
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('ALTA_200')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentScenario === 'ALTA_200'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Alternativa A</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentScenario === 'ALTA_200' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              ≥ 200 kg
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('ALTB_0')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentScenario === 'ALTB_0'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Alternativa B</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              currentScenario === 'ALTB_0' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              Sin umbral
            </span>
          </button>
        </div>

        {/* Pinto Logistics Hub pill */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>Pinto (Madrid) · 40.244º N, -3.700º W</span>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 border-t border-slate-800/80 scrollbar-none">
        {[
          { id: 'planificador', label: 'Planificador & Mapa', icon: Compass },
          { id: 'comparativa', label: 'Comparativa Escenarios', icon: Scale },
          { id: 'rutas', label: 'Validación de Rutas', icon: RouteIcon },
          { id: 'socios', label: 'Directorio de Socios', icon: Users },
          { id: 'flota', label: 'Flota & Costes MITMA', icon: Truck },
          { id: 'auditoria', label: 'Auditoría & Datos', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                active
                  ? 'border-rose-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
