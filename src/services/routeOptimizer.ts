import { SOCIOS_DATA } from '../data/sociosData';
import { 
  SocioRecord, 
  OptimizedRoute, 
  RouteStop, 
  ScenarioDefinition, 
  ScenarioId, 
  VehicleDefinition,
  RouteValidationStatus
} from '../types/logistics';
import { 
  VEHICLES, 
  calculateTariffRevenue, 
  calculateAgencyPorteCost 
} from './pricingAndFleet';

const PINTO_LAT = 40.244;
const PINTO_LON = -3.700;
const SEMANAS_ANALISIS = 171 / 5; // 34.2 semanas laborables

/**
 * Distancia ortodrómica Haversine en km entre dos puntos
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio terrestre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Factor de rodeo carretera medio observado en la península: 1.25 - 1.29
 */
export function estimateRoadKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return calculateHaversineKm(lat1, lon1, lat2, lon2) * 1.25;
}

/**
 * Definición estructurada de Corredores Geográficos Coherentes
 */
interface CorridorConfig {
  id: string;
  nombre: string;
  autovia: string;
  esUrbanoMetropolitano: boolean;
  salidasSemanalesAcordadas: number;
  diasTexto: string;
  diasSemana: number[]; // [0=L, 1=M, 2=X, 3=J, 4=V]
  sociosCodigos: string[];
}

export const CORREDORES_CONFIG: CorridorConfig[] = [
  {
    id: 'COR-MAD-NORTE',
    nombre: 'Madrid Norte–Este (Henares y A-1/A-2)',
    autovia: 'A-1 / A-2 / M-40 / M-50',
    esUrbanoMetropolitano: true,
    salidasSemanalesAcordadas: 5,
    diasTexto: 'Lunes a Viernes',
    diasSemana: [0, 1, 2, 3, 4],
    sociosCodigos: [
      '351000', '530000', '542001', '547117', '547156', '562004', 
      '568000', '570000', '570001', '570003', '574000', '585002', 
      '585003', '585004', '585007', '585008', '585009', '585019', 
      '585021', '610000', '614093', '619000', '481000'
    ]
  },
  {
    id: 'COR-MAD-SUR',
    nombre: 'Madrid Sur–Oeste y La Sagra',
    autovia: 'A-42 / A-4 / CM-4004',
    esUrbanoMetropolitano: true,
    salidasSemanalesAcordadas: 4,
    diasTexto: 'Lunes a Jueves',
    diasSemana: [0, 1, 2, 3],
    sociosCodigos: [
      '585005', '547121', '562003', '332000', '591000', '547130', '525000', '318001', '547147'
    ]
  },
  {
    id: 'COR-AVILA-SALAMANCA',
    nombre: 'Ávila–Salamanca–Portugal Centro',
    autovia: 'A-6 / AP-51 / A-50 / A-62',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Lunes y Miércoles',
    diasSemana: [0, 2],
    sociosCodigos: [
      '547123', '586000', '480002', '482000', '547010', '324000', '405000',
      '571001', '437000', '323001', '421000', '335000', '431000', '547058',
      '467000', '542000', '564000', '538000', '509000', '513000', '531001'
    ]
  },
  {
    id: 'COR-CASTILLA-LEON',
    nombre: 'Castilla y León (A-6 / Valle del Duero)',
    autovia: 'A-6 / AP-6 / A-601 / A-62',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Martes y Jueves',
    diasSemana: [1, 3],
    sociosCodigos: [
      '499000', '409000', '480000', '547051', '534000', '547082', '585015',
      '571000', '585016', '595000', '585017'
    ]
  },
  {
    id: 'COR-EXTREMADURA',
    nombre: 'Extremadura–Portugal Sur',
    autovia: 'A-5 / EX-A1 / N-430',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Lunes y Miércoles',
    diasSemana: [0, 2],
    sociosCodigos: [
      '562001', '518001', '547052', '315000', '490000', '304000', '336000',
      '336001', '304001', '319000', '547012', '547088', '580000', '515000',
      '607000', '579000'
    ]
  },
  {
    id: 'COR-BURGOS-NORTE',
    nombre: 'Burgos–Cantabria–Ebro',
    autovia: 'A-1 / AP-1 / N-627 / A-67',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Lunes y Miércoles',
    diasSemana: [0, 2],
    sociosCodigos: [
      '553000', '321000', '322000', '316000', '575147', '478001', '328000',
      '328005', '328004', '328002', '333002', '328003', '328001', '328009'
    ]
  },
  {
    id: 'COR-CUENCA',
    nombre: 'Cuenca–Tarancón',
    autovia: 'A-3 / A-40 / N-420',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Martes y Jueves',
    diasSemana: [1, 3],
    sociosCodigos: [
      '573000', '547029', '420000', '547071', '561000'
    ]
  },
  {
    id: 'COR-GUADALAJARA',
    nombre: 'Guadalajara–Henares Alto',
    autovia: 'A-2 / N-320',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Martes y Jueves',
    diasSemana: [1, 3],
    sociosCodigos: [
      '569000', '594000', '547038', '547153', '547129'
    ]
  },
  {
    id: 'COR-MANCHA-SUR',
    nombre: 'La Mancha–Andalucía Norte',
    autovia: 'A-4 / N-401',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 2,
    diasTexto: 'Lunes y Miércoles',
    diasSemana: [0, 2],
    sociosCodigos: [
      '492001', '620000'
    ]
  },
  {
    id: 'COR-ASTURIAS',
    nombre: 'Asturias–León Norte (Pernocta necesaria)',
    autovia: 'A-6 / A-66 / AP-66',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 1,
    diasTexto: 'Miércoles (Ruta semanal)',
    diasSemana: [2],
    sociosCodigos: [
      '547064', '558001', '446000', '596000', '489000', '328006'
    ]
  },
  {
    id: 'COR-ANDALUCIA-SERLOG',
    nombre: 'Andalucía Periférica (SERLOG)',
    autovia: 'A-4 / AP-4 / A-7',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 1,
    diasTexto: 'Según demanda / Lanzadera',
    diasSemana: [4],
    sociosCodigos: [
      '593000', '588001'
    ]
  },
  {
    id: 'COR-RIOJA-VASCO',
    nombre: 'Rioja–País Vasco',
    autovia: 'A-1 / A-12',
    esUrbanoMetropolitano: false,
    salidasSemanalesAcordadas: 1,
    diasTexto: 'Miércoles',
    diasSemana: [2],
    sociosCodigos: [
      '511000'
    ]
  }
];

/**
 * Calcula la secuencia y kilometraje total de una ruta en carretera
 */
function buildRouteSequence(
  pintoOrigin: { lat: number; lon: number },
  stops: SocioRecord[]
): {
  orderedStops: SocioRecord[];
  totalDistanceKm: number;
  stageDistances: number[];
} {
  if (stops.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, stageDistances: [] };
  }

  // Ordenar paradas según distancia creciente desde Pinto a lo largo del corredor
  const sorted = [...stops].sort((a, b) => (a.kmDesdePinto ?? 0) - (b.kmDesdePinto ?? 0));
  
  let totalKm = 0;
  const stageDistances: number[] = [];
  
  // Tramo 1: Pinto -> Primera parada
  const firstKm = sorted[0].kmDesdePinto ?? 50;
  stageDistances.push(firstKm);
  totalKm += firstKm;
  
  // Tramos intermedios entre paradas sucesivas
  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    let interKm = 0;
    if (s1.latitud != null && s1.longitud != null && s2.latitud != null && s2.longitud != null) {
      interKm = estimateRoadKm(s1.latitud, s1.longitud, s2.latitud, s2.longitud);
    } else {
      interKm = Math.abs((s2.kmDesdePinto ?? 0) - (s1.kmDesdePinto ?? 0));
    }
    // Asegurar mínimo de 5 km si son paradas distintas
    interKm = Math.max(4, Math.round(interKm * 10) / 10);
    stageDistances.push(interKm);
    totalKm += interKm;
  }
  
  // Tramo final: Retorno directo desde la última parada más lejana a Pinto
  const lastKm = sorted[sorted.length - 1].kmDesdePinto ?? 50;
  stageDistances.push(lastKm);
  totalKm += lastKm;
  
  return {
    orderedStops: sorted,
    totalDistanceKm: Math.round(totalKm * 10) / 10,
    stageDistances
  };
}

/**
 * Evaluador y Constructor de Rutas para cada Escenario
 */
export function buildOptimizedRoute(
  corridor: CorridorConfig,
  allSocios: SocioRecord[],
  scenarioId: ScenarioId,
  minThresholdKg: number | null
): OptimizedRoute {
  // 1. Filtrar socios asignados a este corredor
  const sociosInCorridor = allSocios.filter(s => corridor.sociosCodigos.includes(s.codigo));
  
  // Días laborables semanales y salidas acordadas
  const salidasSemana = Math.max(1, corridor.salidasSemanalesAcordadas);
  
  // 2. Aplicar umbral de escenario a cada socio
  const sociosDirectos: SocioRecord[] = [];
  const sociosPorte: SocioRecord[] = [];
  
  for (const s of sociosInCorridor) {
    if (!s.activoEnPeriodo) continue;
    
    // Demanda esperada por salida en este corredor
    const kgPorSalidaSocio = (s.kgTotales / SEMANAS_ANALISIS) / salidasSemana;
    
    if (scenarioId === 'ACTUAL_3000') {
      // Modelo actual: si el envío medio del socio no llega a 3.000 kg, en el modelo
      // histórico se fuerza o queda penalizado. Si es < 3.000 kg individualmente,
      // se evalúa si consolidado con el corredor llega.
      sociosDirectos.push(s);
    } else if (scenarioId === 'ALTA_200') {
      // Alternativa A: mínimo 200 kg
      if (kgPorSalidaSocio >= 200) {
        sociosDirectos.push(s);
      } else {
        sociosPorte.push(s); // Menor de 200 kg va por agencia / porte
      }
    } else {
      // Alternativa B: Sin umbral mínimo
      // Decisión económica: si un socio tiene < 120 kg y está a > 350 km (muy aislado),
      // enviarle un camión dedicado genera pérdida masiva -> se deriva a Porte
      if (kgPorSalidaSocio < 120 && (s.kmDesdePinto ?? 0) > 350) {
        sociosPorte.push(s);
      } else {
        sociosDirectos.push(s);
      }
    }
  }

  // 3. Calcular carga útil por salida de la ruta consolidada
  const kgPorSalida = sociosDirectos.reduce((sum, s) => {
    return sum + (s.kgTotales / SEMANAS_ANALISIS) / salidasSemana;
  }, 0);
  
  const paletsPorSalida = sociosDirectos.reduce((sum, s) => {
    return sum + (s.paletsTotales / SEMANAS_ANALISIS) / salidasSemana;
  }, 0);
  
  const pedidosPorSalida = sociosDirectos.reduce((sum, s) => {
    return sum + (s.pedidosTotales / SEMANAS_ANALISIS) / salidasSemana;
  }, 0);

  // 4. Selección del vehículo adecuado según el escenario
  let vehiculo: VehicleDefinition;
  
  if (scenarioId === 'ACTUAL_3000') {
    // Modelo actual: flota fija basada casi exclusivamente en Tráiler 40t
    vehiculo = VEHICLES.TRAILER_40T;
  } else {
    // Alternativas A y B: Selección dinámica del vehículo adecuado
    if (corridor.esUrbanoMetropolitano && kgPorSalida <= 1400 && paletsPorSalida <= 5) {
      vehiculo = VEHICLES.LIGERO_35T;
    } else if (kgPorSalida <= 8500 && paletsPorSalida <= 14 && !corridor.esUrbanoMetropolitano) {
      vehiculo = VEHICLES.RIGIDO_2E_18T;
    } else if (kgPorSalida <= 14000 && paletsPorSalida <= 20) {
      vehiculo = VEHICLES.RIGIDO_3E_26T;
    } else {
      vehiculo = VEHICLES.TRAILER_40T;
    }
  }

  // 5. Secuencia de paradas y cálculo de distancias
  const pinto = { lat: PINTO_LAT, lon: PINTO_LON };
  const { orderedStops, totalDistanceKm, stageDistances } = buildRouteSequence(pinto, sociosDirectos);

  // 6. Construir las paradas detalladas
  const paradas: RouteStop[] = orderedStops.map((socio, idx) => {
    const kgStop = (socio.kgTotales / SEMANAS_ANALISIS) / salidasSemana;
    const palStop = (socio.paletsTotales / SEMANAS_ANALISIS) / salidasSemana;
    const pedStop = (socio.pedidosTotales / SEMANAS_ANALISIS) / salidasSemana;
    const stageKm = stageDistances[idx];
    const speed = corridor.esUrbanoMetropolitano ? vehiculo.speedUrbanKmH : vehiculo.speedInterurbanKmH;
    const driveH = stageKm / speed;
    const unloadH = vehiculo.unloadTimeMinutes / 60;
    const rev = calculateTariffRevenue(kgStop, socio.kmDesdePinto);

    return {
      orden: idx + 1,
      socio,
      kgEntrega: Math.round(kgStop * 10) / 10,
      paletsEntrega: Math.round(palStop * 10) / 10,
      pedidosEntrega: Math.round(pedStop * 100) / 100,
      kmTramo: stageKm,
      tiempoConduccionHoras: Math.round(driveH * 100) / 100,
      tiempoDescargaHoras: Math.round(unloadH * 100) / 100,
      ingresoTarifario: Math.round(rev * 100) / 100,
      esPorteAgencia: false
    };
  });

  // 7. Cálculo de tiempos y validación de la jornada de 9 horas
  const tiempoCargaPintoHoras = 0.75; // 45 min fijos en Pinto
  const commercialSpeed = corridor.esUrbanoMetropolitano ? vehiculo.speedUrbanKmH : vehiculo.speedInterurbanKmH;
  const tiempoConduccionHoras = totalDistanceKm / commercialSpeed;
  const tiempoDescargaHoras = (orderedStops.length * vehiculo.unloadTimeMinutes) / 60;
  const duracionTotalHoras = tiempoCargaPintoHoras + tiempoConduccionHoras + tiempoDescargaHoras;
  const cumpleJornada9h = duracionTotalHoras <= 9.0;

  // 8. Ocupación del vehículo
  const ocupacionKgPercent = Math.min(100, Math.round((kgPorSalida / vehiculo.maxWeightKg) * 1000) / 10);
  const ocupacionPaletsPercent = Math.min(100, Math.round((paletsPorSalida / vehiculo.maxPallets) * 1000) / 10);

  // 9. Costes e Ingresos por salida
  const costeTransporteSalida = Math.round(totalDistanceKm * vehiculo.costPerKm * 10) / 10;
  
  // Coste de los socios derivados a porte de agencia
  const costePortesAgenciaSalida = sociosPorte.reduce((acc, sp) => {
    const kgPorte = (sp.kgTotales / SEMANAS_ANALISIS) / salidasSemana;
    return acc + calculateAgencyPorteCost(kgPorte, sp.kmDesdePinto);
  }, 0);

  const costeTotalSalida = costeTransporteSalida + costePortesAgenciaSalida;
  
  // Ingresos tarifarios recaudados de socios directos + socios porte
  const ingresoTarifarioDirecto = paradas.reduce((acc, p) => acc + p.ingresoTarifario, 0);
  const ingresoTarifarioPorte = sociosPorte.reduce((acc, sp) => {
    const kgPorte = (sp.kgTotales / SEMANAS_ANALISIS) / salidasSemana;
    return acc + calculateTariffRevenue(kgPorte, sp.kmDesdePinto);
  }, 0);
  const ingresoTarifarioSalida = Math.round((ingresoTarifarioDirecto + ingresoTarifarioPorte) * 10) / 10;

  const margenBrutoSalida = Math.round((ingresoTarifarioSalida - costeTotalSalida) * 10) / 10;
  const margenPercent = ingresoTarifarioSalida > 0 
    ? Math.round((margenBrutoSalida / ingresoTarifarioSalida) * 1000) / 10 
    : 0;
  
  // Beneficio neto deduciendo ~10% de costes indirectos de plataforma logística
  const costesIndirectos = costeTotalSalida * 0.10;
  const beneficioNetoEstimadoSalida = Math.round((margenBrutoSalida - costesIndirectos) * 10) / 10;

  // Semanal acumulado
  const costeSemanal = Math.round(costeTotalSalida * salidasSemana);
  const ingresoSemanal = Math.round(ingresoTarifarioSalida * salidasSemana);
  const margenSemanal = Math.round(margenBrutoSalida * salidasSemana);
  const beneficioNetoSemanal = Math.round(beneficioNetoEstimadoSalida * salidasSemana);

  // 10. Validación técnica y clasificación de la ruta
  let estadoValidacion: RouteValidationStatus = 'VALIDA';
  let motivoValidacion = 'Cumple capacidad de peso, palés y jornada legal ≤ 9h.';
  const avisos: string[] = [];

  // Chequeo de jornada
  if (!cumpleJornada9h) {
    if (totalDistanceKm > 750) {
      estadoValidacion = 'RECHAZADA';
      motivoValidacion = `Exceso crítico de jornada laboral (${duracionTotalHoras.toFixed(1)} h > 9,0 h). Imposible ida y vuelta en el mismo día.`;
      avisos.push(`Ruta de larga distancia (${totalDistanceKm.toFixed(0)} km). Requiere ruta de 2 días con pernocta o lanzadera de línea.`);
    } else {
      estadoValidacion = 'PENDIENTE';
      motivoValidacion = `Jornada al límite (${duracionTotalHoras.toFixed(1)} h). Requiere optimizar tiempos de descarga o reducir paradas.`;
      avisos.push('Al borde de 9 horas. Reducir paradas intermedias.');
    }
  }

  // Chequeo de capacidades
  if (kgPorSalida > vehiculo.maxWeightKg) {
    estadoValidacion = 'RECHAZADA';
    motivoValidacion = `Sobrecarga de peso (${kgPorSalida.toFixed(0)} kg > ${vehiculo.maxWeightKg} kg max).`;
    avisos.push('Exceso de peso. Asignar vehículo de mayor tonelaje o desdoblar frecuencia.');
  }

  if (paletsPorSalida > vehiculo.maxPallets) {
    estadoValidacion = 'RECHAZADA';
    motivoValidacion = `Sobrecarga de volumen (${paletsPorSalida.toFixed(1)} palés > ${vehiculo.maxPallets} palés max).`;
    avisos.push('Capacidad volumétrica superada.');
  }

  // Chequeo de infradimensión en Modelo Actual
  if (scenarioId === 'ACTUAL_3000' && kgPorSalida < 3000 && sociosDirectos.length > 0) {
    estadoValidacion = 'RECHAZADA';
    motivoValidacion = `Incumple el umbral mínimo del modelo actual (${kgPorSalida.toFixed(0)} kg < 3.000 kg). Tráiler sobredimensionado y margen negativo (${margenBrutoSalida.toFixed(0)} €).`;
    avisos.push('Tráiler infrautilizado que destruye el margen de transporte.');
  }

  // Chequeo de datos pendientes o estimados en la ruta
  const sociosConKmEstimado = sociosDirectos.filter(s => s.kmTipo === 'estimado');
  if (sociosConKmEstimado.length > 0) {
    if (estadoValidacion === 'VALIDA') {
      estadoValidacion = 'PENDIENTE';
      motivoValidacion = `Validación provisional: incluye ${sociosConKmEstimado.length} socio(s) con km estimado (*).`;
    }
    avisos.push(`${sociosConKmEstimado.length} socio(s) con distancia estimada por línea recta × 1,25.`);
  }

  // 11. Comparativa de Decisión de Transporte
  const alternativaComparada = {
    opcionConsolidacion: `Ruta multi-parada en ${vehiculo.name} con ${sociosDirectos.length} socio(s). Ocupación: ${ocupacionKgPercent}% peso / ${ocupacionPaletsPercent}% palés.`,
    opcionVehiculoAlternativo: vehiculo.id === 'TRAILER_40T' 
      ? 'Rígido 3 Ejes (14,5 t): Reduciría coste km de 1,30 a 1,14 €/km si el peso no excede 14 t.'
      : 'Tráiler 40t: Innecesario, aumentaría el coste por km en un 14% a 24% sin beneficio de carga.',
    opcionPorte: sociosPorte.length > 0 
      ? `${sociosPorte.length} socio(s) derivado(s) a agencia por baja carga (<${minThresholdKg ?? 0} kg). Ahorro estimado de camión dedicado.`
      : 'Todos los socios del corredor alcanzan masa suficiente para transporte propio en ruta.',
    decisionRecomendada: estadoValidacion === 'VALIDA'
      ? `Mantener salida consolidada en ${vehiculo.name}. Margen positivo de ${margenPercent}%.`
      : estadoValidacion === 'PENDIENTE'
      ? 'Ajustar secuencia o pernocta; verificar distancias de socios estimados.'
      : 'Reestructurar corredor: transferir envíos residuales a porte o convertir a ruta de 2 días.'
  };

  return {
    id: `RUTA-${corridor.id}-${scenarioId}`,
    nombre: corridor.nombre,
    corredorId: corridor.id,
    corredorNombre: corridor.nombre,
    vehiculo,
    diasSemana: corridor.diasSemana,
    diasTexto: corridor.diasTexto,
    salidasSemanales: salidasSemana,
    paradas,
    sociosDirectos,
    sociosPorte,
    pedidosPorSalida: Math.round(pedidosPorSalida * 10) / 10,
    kgPorSalida: Math.round(kgPorSalida * 10) / 10,
    paletsPorSalida: Math.round(paletsPorSalida * 10) / 10,
    kmTotalesRuta: totalDistanceKm,
    tiempoCargaPintoHoras,
    tiempoConduccionHoras: Math.round(tiempoConduccionHoras * 100) / 100,
    tiempoDescargaHoras: Math.round(tiempoDescargaHoras * 100) / 100,
    duracionTotalHoras: Math.round(duracionTotalHoras * 100) / 100,
    cumpleJornada9h,
    ocupacionKgPercent,
    ocupacionPaletsPercent,
    costeTransporteSalida,
    costePortesAgenciaSalida: Math.round(costePortesAgenciaSalida * 10) / 10,
    costeTotalSalida,
    ingresoTarifarioSalida,
    margenBrutoSalida,
    margenPercent,
    beneficioNetoEstimadoSalida,
    costeSemanal,
    ingresoSemanal,
    margenSemanal,
    beneficioNetoSemanal,
    estadoValidacion,
    motivoValidacion,
    avisos,
    alternativaComparada
  };
}

/**
 * Genera el Escenario 1: Modelo Actual con Mínimo de 3.000 kg
 */
export function generateScenarioActual(allSocios: SocioRecord[]): ScenarioDefinition {
  const rutas = CORREDORES_CONFIG.map(corridor => 
    buildOptimizedRoute(corridor, allSocios, 'ACTUAL_3000', 3000)
  );

  return compileScenario('ACTUAL_3000', 'Modelo Actual', 'Mínimo de 3.000 kg por envío/salida', 3000,
    'Modelo histórico tradicional de BigMat Pinto. Exige umbral de 3.000 kg para salida de camión y recurre casi exclusivamente a Tráileres de 40t. Los corredores ligeros o periféricos viajan fuertemente desaprovechados con márgenes negativos o acumulan retrasos.',
    'Flota homogénea de Tráiler 40t (24t útil / 33 palés), coste 1,30 €/km.',
    'No integra red de paquetería; los envíos bajo umbral quedan retenidos o fuerzan viajes inviables.',
    rutas
  );
}

/**
 * Genera el Escenario 2: Alternativa A con Mínimo de 200 kg
 */
export function generateScenarioAltA(allSocios: SocioRecord[]): ScenarioDefinition {
  const rutas = CORREDORES_CONFIG.map(corridor => 
    buildOptimizedRoute(corridor, allSocios, 'ALTA_200', 200)
  );

  return compileScenario('ALTA_200', 'Alternativa A', 'Mínimo de 200 kg + Flota Diversificada', 200,
    'Umbral reducido a 200 kg con consolidación estricta por corredor. Se asigna el vehículo idóneo (Rígidos de 2 o 3 ejes para corredores medianos, Tráiler para densos, Furgón para Madrid urbano). Los envíos < 200 kg se derivan a agencia de paletería externa.',
    'Flota combinada (Tráiler 1,30 €/km, Rígido 3E 1,14 €/km, Rígido 2E 1,05 €/km, Furgón 0,82 €/km).',
    'Envíos < 200 kg transferidos a Red de Porte/Agencia concertada (coste variable controlado de 32 a 48 €).',
    rutas
  );
}

/**
 * Genera el Escenario 3: Alternativa B sin Umbral Mínimo (Distribución Continua)
 */
export function generateScenarioAltB(allSocios: SocioRecord[]): ScenarioDefinition {
  const rutas = CORREDORES_CONFIG.map(corridor => 
    buildOptimizedRoute(corridor, allSocios, 'ALTB_0', 0)
  );

  return compileScenario('ALTB_0', 'Alternativa B', 'Sin umbral mínimo (Distribución Continua)', 0,
    'Servicio continuo sin umbral restrictivo. El optimizador evalúa cada entrega: la integra en la ruta si no excede la jornada de 9h, o la deriva a porte si el desvío del camión es más caro que la tarifa de agencia. Máxima cobertura y satisfacción del socio.',
    'Flota flexible y dimensionada por corredor con capacidad de absorción de paradas menores.',
    'Derivación selectiva a porte solo para pedidos aislados donde el desvío en km cuesta más que la tarifa externa.',
    rutas
  );
}

/**
 * Compila y calcula agregados globales para un escenario
 */
function compileScenario(
  id: ScenarioId,
  nombre: string,
  subtitulo: string,
  umbralMinimoKg: number | null,
  descripcion: string,
  politicaFlota: string,
  politicaPortes: string,
  rutas: OptimizedRoute[]
): ScenarioDefinition {
  const totalSalidasSemanales = rutas.reduce((acc, r) => acc + r.salidasSemanales, 0);
  const totalKmSemanales = rutas.reduce((acc, r) => acc + r.kmTotalesRuta * r.salidasSemanales, 0);
  
  const horasTotalesSemanales = rutas.reduce((acc, r) => acc + r.duracionTotalHoras * r.salidasSemanales, 0);
  const horasMediasPorJornada = totalSalidasSemanales > 0 
    ? Math.round((horasTotalesSemanales / totalSalidasSemanales) * 10) / 10 
    : 0;

  const ocupacionMediaKgPercent = Math.round(
    rutas.reduce((acc, r) => acc + r.ocupacionKgPercent, 0) / rutas.length * 10
  ) / 10;
  
  const ocupacionMediaPaletsPercent = Math.round(
    rutas.reduce((acc, r) => acc + r.ocupacionPaletsPercent, 0) / rutas.length * 10
  ) / 10;

  const costeTransporteSemanal = rutas.reduce((acc, r) => acc + r.costeSemanal, 0);
  const ingresoTarifarioSemanal = rutas.reduce((acc, r) => acc + r.ingresoSemanal, 0);
  const margenBrutoSemanal = ingresoTarifarioSemanal - costeTransporteSemanal;
  const margenPercent = ingresoTarifarioSemanal > 0 
    ? Math.round((margenBrutoSemanal / ingresoTarifarioSemanal) * 1000) / 10 
    : 0;
  const beneficioNetoSemanal = rutas.reduce((acc, r) => acc + r.beneficioNetoSemanal, 0);

  const kgEnRutaSemanales = rutas.reduce((acc, r) => acc + r.kgPorSalida * r.salidasSemanales, 0);
  const pedidosEnRutaSemanales = rutas.reduce((acc, r) => acc + r.pedidosPorSalida * r.salidasSemanales, 0);

  const kgPorteSemanales = rutas.reduce((acc, r) => {
    return acc + r.sociosPorte.reduce((sum, sp) => sum + (sp.kgTotales / SEMANAS_ANALISIS), 0);
  }, 0);
  
  const pedidosPorteSemanales = rutas.reduce((acc, r) => {
    return acc + r.sociosPorte.reduce((sum, sp) => sum + (sp.pedidosTotales / SEMANAS_ANALISIS), 0);
  }, 0);

  const totalKg = kgEnRutaSemanales + kgPorteSemanales;
  const porcentajePedidosEnRuta = (pedidosEnRutaSemanales + pedidosPorteSemanales) > 0
    ? Math.round((pedidosEnRutaSemanales / (pedidosEnRutaSemanales + pedidosPorteSemanales)) * 1000) / 10
    : 100;

  const rutasValidasCount = rutas.filter(r => r.estadoValidacion === 'VALIDA').length;
  const rutasPendientesCount = rutas.filter(r => r.estadoValidacion === 'PENDIENTE').length;
  const rutasRechazadasCount = rutas.filter(r => r.estadoValidacion === 'RECHAZADA').length;

  return {
    id,
    codigo: id === 'ACTUAL_3000' ? 'ACT' : id === 'ALTA_200' ? 'ALT-A' : 'ALT-B',
    nombre,
    subtitulo,
    umbralMinimoKg,
    descripcion,
    politicaFlota,
    politicaPortes,
    rutas,
    totalSalidasSemanales,
    totalKmSemanales: Math.round(totalKmSemanales),
    horasMediasPorJornada,
    ocupacionMediaKgPercent,
    ocupacionMediaPaletsPercent,
    costeTransporteSemanal: Math.round(costeTransporteSemanal),
    ingresoTarifarioSemanal: Math.round(ingresoTarifarioSemanal),
    margenBrutoSemanal: Math.round(margenBrutoSemanal),
    margenPercent,
    beneficioNetoSemanal: Math.round(beneficioNetoSemanal),
    pedidosEnRutaSemanales: Math.round(pedidosEnRutaSemanales),
    pedidosPorteSemanales: Math.round(pedidosPorteSemanales),
    kgEnRutaSemanales: Math.round(kgEnRutaSemanales),
    kgPorteSemanales: Math.round(kgPorteSemanales),
    porcentajePedidosEnRuta,
    rutasValidasCount,
    rutasPendientesCount,
    rutasRechazadasCount
  };
}

/**
 * Obtiene los 3 escenarios calculados
 */
export function getAllScenarios(allSocios = SOCIOS_DATA): Record<ScenarioId, ScenarioDefinition> {
  return {
    ACTUAL_3000: generateScenarioActual(allSocios),
    ALTA_200: generateScenarioAltA(allSocios),
    ALTB_0: generateScenarioAltB(allSocios)
  };
}
