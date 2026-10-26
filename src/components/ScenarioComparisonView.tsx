import React from 'react';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Truck,
  Package,
  Euro
} from 'lucide-react';
import { ScenarioDefinition, ScenarioId } from '../types/logistics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ScenarioComparisonViewProps {
  scenarios: Record<ScenarioId, ScenarioDefinition>;
  activeScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
}

function formatEuro(val: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(val) + ' €';
}

function formatNumber(val: number, decimals = 0): string {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario
}) => {
  const actual = scenarios.ACTUAL_3000;
  const altA = scenarios.ALTA_200;
  const altB = scenarios.ALTB_0;

  // Comparativa de ahorro de costes respecto al modelo actual
  const ahorroCosteAltA = actual.costeTransporteSemanal - altA.costeTransporteSemanal;
  const mejoraMargenAltA = altA.margenBrutoSemanal - actual.margenBrutoSemanal;
  const ahorroAnualEstAltA = ahorroCosteAltA * (171 / 5); // 34.2 semanas

  // Datos para el gráfico comparativo
  const chartData = [
    {
      name: 'Modelo Actual (3.000 kg)',
      Coste: actual.costeTransporteSemanal,
      Ingreso: actual.ingresoTarifarioSemanal,
      Margen: actual.margenBrutoSemanal,
      Neto: actual.beneficioNetoSemanal
    },
    {
      name: 'Alternativa A (200 kg)',
      Coste: altA.costeTransporteSemanal,
      Ingreso: altA.ingresoTarifarioSemanal,
      Margen: altA.margenBrutoSemanal,
      Neto: altA.beneficioNetoSemanal
    },
    {
      name: 'Alternativa B (Sin umbral)',
      Coste: altB.costeTransporteSemanal,
      Ingreso: altB.ingresoTarifarioSemanal,
      Margen: altB.margenBrutoSemanal,
      Neto: altB.beneficioNetoSemanal
    }
  ];

  return (
    <div className="space-y-6">
      {/* Executive Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/60 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              Auditoría Comparativa de Escenarios Operativos
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Evaluación Financiera y Operativa de Umbrales de Distribución
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Comparación rigurosa entre el modelo actual rígido de 3.000 kg y las alternativas de flexibilización (200 kg y sin umbral),
              analizando ocupación de flota (Observatorio MITMA), cumplimiento de jornada (≤ 9 horas) y márgenes tarifarios reales.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-blue-800/50 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Impacto de la Alternativa A:</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              +{formatEuro(ahorroCosteAltA)} / sem
            </span>
            <span className="text-[11px] text-emerald-300 block font-medium">
              ~{formatEuro(ahorroAnualEstAltA)} ahorro anual estimado
            </span>
          </div>
        </div>

        {/* Quick Delta Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Reducción de Kilómetros:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">
                -{formatNumber(actual.totalKmSemanales - altA.totalKmSemanales)} km/sem
              </span>
              <span className="text-xs text-emerald-300">
                (-{Math.round(((actual.totalKmSemanales - altA.totalKmSemanales) / actual.totalKmSemanales) * 100)}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Al derivar micro-envíos dispersos a agencia de paletería.
            </p>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Aumento de Margen Bruto:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-blue-400 font-mono">
                +{formatEuro(mejoraMargenAltA)} / sem
              </span>
              <span className="text-xs text-blue-300">
                ({actual.margenPercent}% → {altA.margenPercent}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              +{Math.round((altA.margenPercent - actual.margenPercent) * 10) / 10} puntos porcentuales de margen operativo.
            </p>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Rutas Válidas en Norma (≤ 9h):</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {altA.rutasValidasCount} válidas
              </span>
              <span className="text-xs text-slate-400">
                (vs {actual.rutasValidasCount} en Modelo Actual)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tráileres sobredimensionados eliminados y vehículos adaptados.
            </p>
          </div>
        </div>
      </div>

      {/* Side by Side Detailed Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
          <span>Matriz Comparativa de Parámetros y Resultados</span>
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-1/4">Variable / Indicador</th>
                <th className="py-3 px-4 text-center w-1/4 bg-slate-950/60">
                  <div className="text-white font-bold text-sm">Modelo Actual</div>
                  <div className="text-[10px] text-rose-400 font-mono">Umbral ≥ 3.000 kg</div>
                </th>
                <th className="py-3 px-4 text-center w-1/4 bg-blue-950/20 border-x border-slate-800">
                  <div className="text-blue-400 font-bold text-sm">Alternativa A (Recomendada)</div>
                  <div className="text-[10px] text-blue-300 font-mono">Umbral ≥ 200 kg</div>
                </th>
                <th className="py-3 px-4 text-center w-1/4 bg-emerald-950/20">
                  <div className="text-emerald-400 font-bold text-sm">Alternativa B</div>
                  <div className="text-[10px] text-emerald-300 font-mono">Sin umbral (Continua)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {/* Política de Flota */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Política de Flota</td>
                <td className="py-2.5 px-4 text-center text-slate-400 font-sans">
                  Tráiler 40t casi exclusivo (1,30 €/km)
                </td>
                <td className="py-2.5 px-4 text-center text-blue-300 font-sans bg-blue-950/10 border-x border-slate-800 font-semibold">
                  Tráiler 24t + Rígidos 3E/2E + Furgón
                </td>
                <td className="py-2.5 px-4 text-center text-slate-400 font-sans">
                  Flota mixta con micro-absorción
                </td>
              </tr>

              {/* Salidas Semanales */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Salidas / Semana</td>
                <td className="py-2.5 px-4 text-center text-slate-200">{actual.totalSalidasSemanales} salidas</td>
                <td className="py-2.5 px-4 text-center text-blue-300 bg-blue-950/10 border-x border-slate-800 font-bold">
                  {altA.totalSalidasSemanales} salidas
                </td>
                <td className="py-2.5 px-4 text-center text-slate-200">{altB.totalSalidasSemanales} salidas</td>
              </tr>

              {/* Km Totales Semanales */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Km Totales Ruta / Semana</td>
                <td className="py-2.5 px-4 text-center text-rose-400">{formatNumber(actual.totalKmSemanales)} km</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 bg-blue-950/10 border-x border-slate-800 font-bold">
                  {formatNumber(altA.totalKmSemanales)} km
                </td>
                <td className="py-2.5 px-4 text-center text-slate-200">{formatNumber(altB.totalKmSemanales)} km</td>
              </tr>

              {/* Horas Medias Jornada */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Jornada Media por Conductor</td>
                <td className="py-2.5 px-4 text-center text-slate-300">{actual.horasMediasPorJornada} h</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 bg-blue-950/10 border-x border-slate-800 font-bold">
                  {altA.horasMediasPorJornada} h (≤ 9h)
                </td>
                <td className="py-2.5 px-4 text-center text-slate-300">{altB.horasMediasPorJornada} h</td>
              </tr>

              {/* Ocupación Media */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Ocupación Media Carga (Peso)</td>
                <td className="py-2.5 px-4 text-center text-slate-400">{actual.ocupacionMediaKgPercent}%</td>
                <td className="py-2.5 px-4 text-center text-blue-300 bg-blue-950/10 border-x border-slate-800 font-bold">
                  {altA.ocupacionMediaKgPercent}%
                </td>
                <td className="py-2.5 px-4 text-center text-slate-300">{altB.ocupacionMediaKgPercent}%</td>
              </tr>

              {/* Coste Transporte Semanal */}
              <tr className="hover:bg-slate-800/30 bg-slate-950/40">
                <td className="py-3 px-4 font-sans font-bold text-white">Coste de Transporte / Semana (MITMA)</td>
                <td className="py-3 px-4 text-center text-rose-400 font-extrabold text-sm">
                  {formatEuro(actual.costeTransporteSemanal)}
                </td>
                <td className="py-3 px-4 text-center text-emerald-400 font-extrabold text-sm bg-blue-950/20 border-x border-slate-800">
                  {formatEuro(altA.costeTransporteSemanal)}
                </td>
                <td className="py-3 px-4 text-center text-slate-200 font-extrabold text-sm">
                  {formatEuro(altB.costeTransporteSemanal)}
                </td>
              </tr>

              {/* Ingreso Tarifario Semanal */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Ingreso Tarifario Facturado / Sem</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">{formatEuro(actual.ingresoTarifarioSemanal)}</td>
                <td className="py-2.5 px-4 text-center text-emerald-400 bg-blue-950/10 border-x border-slate-800 font-semibold">
                  {formatEuro(altA.ingresoTarifarioSemanal)}
                </td>
                <td className="py-2.5 px-4 text-center text-emerald-400 font-semibold">{formatEuro(altB.ingresoTarifarioSemanal)}</td>
              </tr>

              {/* Margen Bruto Semanal */}
              <tr className="hover:bg-slate-800/30 bg-slate-950/40">
                <td className="py-3 px-4 font-sans font-bold text-white">Margen Bruto de Ruta / Semana</td>
                <td className="py-3 px-4 text-center text-slate-200 font-extrabold text-sm">
                  {formatEuro(actual.margenBrutoSemanal)} ({actual.margenPercent}%)
                </td>
                <td className="py-3 px-4 text-center text-blue-400 font-extrabold text-sm bg-blue-950/20 border-x border-slate-800">
                  {formatEuro(altA.margenBrutoSemanal)} ({altA.margenPercent}%)
                </td>
                <td className="py-3 px-4 text-center text-slate-200 font-extrabold text-sm">
                  {formatEuro(altB.margenBrutoSemanal)} ({altB.margenPercent}%)
                </td>
              </tr>

              {/* Beneficio Neto Estimado */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Beneficio Neto Estimado (-10% plataf.)</td>
                <td className="py-2.5 px-4 text-center text-slate-300">{formatEuro(actual.beneficioNetoSemanal)}</td>
                <td className="py-2.5 px-4 text-center text-indigo-400 bg-blue-950/10 border-x border-slate-800 font-bold">
                  {formatEuro(altA.beneficioNetoSemanal)}
                </td>
                <td className="py-2.5 px-4 text-center text-slate-300">{formatEuro(altB.beneficioNetoSemanal)}</td>
              </tr>

              {/* Rutas Válidas vs Rechazadas */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Dictamen de Rutas (Válidas / Rechazadas)</td>
                <td className="py-2.5 px-4 text-center font-sans">
                  <span className="text-emerald-400 font-bold">{actual.rutasValidasCount} válidas</span> / <span className="text-rose-400 font-bold">{actual.rutasRechazadasCount} rech.</span>
                </td>
                <td className="py-2.5 px-4 text-center font-sans bg-blue-950/10 border-x border-slate-800 font-semibold">
                  <span className="text-emerald-400 font-bold">{altA.rutasValidasCount} válidas</span> / <span className="text-rose-400 font-bold">{altA.rutasRechazadasCount} rech.*</span>
                </td>
                <td className="py-2.5 px-4 text-center font-sans">
                  <span className="text-emerald-400 font-bold">{altB.rutasValidasCount} válidas</span> / <span className="text-rose-400 font-bold">{altB.rutasRechazadasCount} rech.*</span>
                </td>
              </tr>

              {/* Canalización de Pedidos */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-300">Canalización de Pedidos</td>
                <td className="py-2.5 px-4 text-center text-slate-400 font-sans">
                  100% forzado en camión
                </td>
                <td className="py-2.5 px-4 text-center text-blue-300 font-sans bg-blue-950/10 border-x border-slate-800">
                  {altA.porcentajePedidosEnRuta}% camión / {(100 - altA.porcentajePedidosEnRuta).toFixed(1)}% agencia
                </td>
                <td className="py-2.5 px-4 text-center text-slate-300 font-sans">
                  {altB.porcentajePedidosEnRuta}% camión / {(100 - altB.porcentajePedidosEnRuta).toFixed(1)}% agencia
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 mt-2">
          * Nota de rechazo: Las rutas a Asturias, Portugal periférico y Cantabria exceden físicamente las 9 horas en recorrido de ida y vuelta en un solo día (&gt; 800 km). En la Alternativa A y B se documenta formalmente su conversión obligatoria a ruta de 2 días con pernocta o servicio de lanzadera intermodal.
        </p>
      </div>

      {/* Visual Bar Chart Comparing Coste, Ingreso y Margen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Comparativa Económica Semanal (€ / Semana)</span>
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `${v / 1000}k €`} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                formatter={(val: number) => [formatEuro(val), '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Coste" fill="#f43f5e" name="Coste Transporte (MITMA)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ingreso" fill="#10b981" name="Ingreso Tarifario" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Margen" fill="#3b82f6" name="Margen Bruto de Ruta" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="font-bold text-rose-400 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Por qué falla el Modelo Actual
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Solo 3 de los 115 socios activos superan de media 3.000 kg por envío en solitario. La norma de 3.000 kg obliga a retener pedidos durante días o forzar salidas de tráileres de 24 t con apenas 1.500 kg de carga, generando pérdidas sistemáticas en los corredores periféricos.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/60 ring-1 ring-blue-500/30 space-y-2">
          <div className="font-bold text-blue-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Por qué triunfa la Alternativa A
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Al fijar el corte en 200 kg y consolidar geográficamente, el 99% del tonelaje se entrega en camiones propios optimizados (rígidos de 2 o 3 ejes para 8-14 t). Los micro-envíos dispersos van por red de paletería externa (coste medio 35-45 €), ahorrando ~5.000 €/sem en combustible y kilometraje.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Cuándo aplicar la Alternativa B
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Es la opción recomendada para periodos promocionales o campañas donde la rapidez de servicio prima sobre el umbral. Requiere el algoritmo de desvío económico activo para transferir a agencia aquellos pedidos donde el desvío del camión supere el ingreso tarifario.
          </p>
        </div>
      </div>
    </div>
  );
};
