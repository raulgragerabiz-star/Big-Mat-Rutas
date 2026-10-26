/**
 * Tipos y modelos de datos para la optimización de rutas de BigMat Pinto
 */

export type VehicleType = 
  | 'TRAILER_40T' 
  | 'RIGIDO_3E_26T' 
  | 'RIGIDO_2E_18T' 
  | 'LIGERO_35T' 
  | 'PORTE_AGENCIA';

export interface VehicleDefinition {
  id: VehicleType;
  name: string;
  category: string;
  maxWeightKg: number;
  maxPallets: number;
  costPerKm: number; // Observatorio del Ministerio (MITMA)
  speedInterurbanKmH: number;
  speedUrbanKmH: number;
  unloadTimeMinutes: number;
  fixedCostDaily?: number;
  urbanRestricted: boolean; // Tráiler no puede entrar a cascos urbanos
  description: string;
}

export type KmConfidence = 'contrastado' | 'estimado' | 'pendiente';

export interface SocioRecord {
  codigo: string;
  nombre: string;
  poblacion: string | null;
  provincia: string | null;
  cif: string | null;
  rutaERP: string | null;
  corredor: string;
  latitud: number | null;
  longitud: number | null;
  kmDesdePinto: number | null;
  kmTipo: KmConfidence;
  distanciaRectaKm: number | null;
  tramoDistancia: string;
  pedidosTotales: number;
  kgTotales: number;
  paletsTotales: number;
  diasServidos: number;
  pedidosPorDiaSemana: number[]; // [L, M, X, J, V]
  calidadDato: string;
  
  // Métricas calculadas medias por día laborable (171 días en muestra)
  kgPorDia: number;
  pedidosPorDia: number;
  paletsPorDia: number;
  enviosPorDia: number;
  kgPorEnvio: number;
  kgPorPedido: number;
  
  activoEnPeriodo: boolean;
  duplicadaCoordenada?: number; // si comparte lat/lon con otro socio
}

export interface RouteStop {
  orden: number;
  socio: SocioRecord;
  kgEntrega: number;
  paletsEntrega: number;
  pedidosEntrega: number;
  kmTramo: number; // km desde la parada anterior
  tiempoConduccionHoras: number;
  tiempoDescargaHoras: number;
  ingresoTarifario: number;
  esPorteAgencia: boolean;
}

export type RouteValidationStatus = 'VALIDA' | 'PENDIENTE' | 'RECHAZADA';

export interface OptimizedRoute {
  id: string;
  nombre: string;
  corredorId: string;
  corredorNombre: string;
  vehiculo: VehicleDefinition;
  diasSemana: number[]; // [0=Lunes, 1=Martes, ...]
  diasTexto: string;
  salidasSemanales: number;
  
  paradas: RouteStop[];
  sociosDirectos: SocioRecord[];
  sociosPorte: SocioRecord[]; // socios que en este escenario se canalizan por agencia
  
  // Totales por salida de camión
  pedidosPorSalida: number;
  kgPorSalida: number;
  paletsPorSalida: number;
  kmTotalesRuta: number; // Ida desde Pinto + interparadas + retorno a Pinto
  
  // Tiempos
  tiempoCargaPintoHoras: number;
  tiempoConduccionHoras: number;
  tiempoDescargaHoras: number;
  duracionTotalHoras: number;
  cumpleJornada9h: boolean;
  
  // Ocupación
  ocupacionKgPercent: number;
  ocupacionPaletsPercent: number;
  
  // Costes e Ingresos (por salida de camión)
  costeTransporteSalida: number; // km * Observatorio MITMA
  costePortesAgenciaSalida: number; // para los que van por agencia
  costeTotalSalida: number;
  ingresoTarifarioSalida: number;
  margenBrutoSalida: number;
  margenPercent: number;
  beneficioNetoEstimadoSalida: number; // Margen - 10% costes indirectos de plataforma
  
  // Semanal acumulado
  costeSemanal: number;
  ingresoSemanal: number;
  margenSemanal: number;
  beneficioNetoSemanal: number;
  
  // Validación y Auditoría
  estadoValidacion: RouteValidationStatus;
  motivoValidacion: string;
  avisos: string[];
  
  // Comparativa de Decisión
  alternativaComparada: {
    opcionConsolidacion: string;
    opcionVehiculoAlternativo: string;
    opcionPorte: string;
    decisionRecomendada: string;
  };
}

export type ScenarioId = 'ACTUAL_3000' | 'ALTA_200' | 'ALTB_0';

export interface ScenarioDefinition {
  id: ScenarioId;
  codigo: string;
  nombre: string;
  subtitulo: string;
  umbralMinimoKg: number | null;
  descripcion: string;
  politicaFlota: string;
  politicaPortes: string;
  
  rutas: OptimizedRoute[];
  
  // KPIs Globales del Escenario (semanal y diario)
  totalSalidasSemanales: number;
  totalKmSemanales: number;
  horasMediasPorJornada: number;
  ocupacionMediaKgPercent: number;
  ocupacionMediaPaletsPercent: number;
  
  costeTransporteSemanal: number;
  ingresoTarifarioSemanal: number;
  margenBrutoSemanal: number;
  margenPercent: number;
  beneficioNetoSemanal: number;
  
  pedidosEnRutaSemanales: number;
  pedidosPorteSemanales: number;
  kgEnRutaSemanales: number;
  kgPorteSemanales: number;
  porcentajePedidosEnRuta: number;
  
  rutasValidasCount: number;
  rutasPendientesCount: number;
  rutasRechazadasCount: number;
}

export interface DataLimitation {
  id: string;
  tipo: 'COORDENADAS_FALTANTES' | 'KM_ESTIMADO' | 'ERROR_ESCALA' | 'COORDENADA_COMPARTIDA' | 'INACTIVO' | 'EXCESO_JORNADA_FISICA';
  severidad: 'ALTA' | 'MEDIA' | 'INFO';
  titulo: string;
  descripcion: string;
  afectados: string[];
  tratamientoAplicado: string;
  recomendacionOperativa: string;
}
