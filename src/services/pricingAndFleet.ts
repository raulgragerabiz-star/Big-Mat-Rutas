import { VehicleDefinition, VehicleType } from '../types/logistics';

/**
 * Parámetros oficiales de flota basados en el Observatorio de Costes del Transporte
 * de Mercancías por Carretera del Ministerio de Transportes y Movilidad Sostenible (MITMA).
 */
export const VEHICLES: Record<VehicleType, VehicleDefinition> = {
  TRAILER_40T: {
    id: 'TRAILER_40T',
    name: 'Tráiler 40t (Articulado)',
    category: 'Pesado articulado',
    maxWeightKg: 24000,
    maxPallets: 33,
    costPerKm: 1.30, // Coste medio de referencia Observatorio MITMA para distribución Pinto
    speedInterurbanKmH: 72,
    speedUrbanKmH: 42,
    unloadTimeMinutes: 35,
    urbanRestricted: true, // Prohibido o restringido en cascos urbanos densos
    description: 'Vehículo de máxima capacidad para corredores de alta densidad con muelles de descarga amplios.'
  },
  RIGIDO_3E_26T: {
    id: 'RIGIDO_3E_26T',
    name: 'Rígido 3 Ejes 26t',
    category: 'Pesado rígido',
    maxWeightKg: 14500,
    maxPallets: 20,
    costPerKm: 1.14, // Coste Observatorio MITMA
    speedInterurbanKmH: 74,
    speedUrbanKmH: 45,
    unloadTimeMinutes: 30,
    urbanRestricted: false,
    description: 'Equilibrio idóneo entre carga útil (14,5 t) y maniobrabilidad en polígonos y socios medianos.'
  },
  RIGIDO_2E_18T: {
    id: 'RIGIDO_2E_18T',
    name: 'Rígido 2 Ejes 18t',
    category: 'Medio rígido',
    maxWeightKg: 9000,
    maxPallets: 15,
    costPerKm: 1.05, // Coste Observatorio MITMA
    speedInterurbanKmH: 76,
    speedUrbanKmH: 48,
    unloadTimeMinutes: 25,
    urbanRestricted: false,
    description: 'Vehículo ágil para corredores regionales de demanda moderada y entregas con accesos justos.'
  },
  LIGERO_35T: {
    id: 'LIGERO_35T',
    name: 'Furgón Carrozado 3.5t con trampilla',
    category: 'Ligero urbano',
    maxWeightKg: 1400,
    maxPallets: 5,
    costPerKm: 0.82, // Coste Observatorio MITMA
    speedInterurbanKmH: 80,
    speedUrbanKmH: 50,
    unloadTimeMinutes: 18,
    urbanRestricted: false,
    description: 'Permite reparto en centros urbanos restringidos (Madrid M-30/M-40) y pedidos urgentes de ferretería.'
  },
  PORTE_AGENCIA: {
    id: 'PORTE_AGENCIA',
    name: 'Red de Paletería / Porte Concertado',
    category: 'Agencia externa (LTL)',
    maxWeightKg: 24000,
    maxPallets: 33,
    costPerKm: 0, // No devenga coste kilométrico dedicado, se factura por bulto/palé
    speedInterurbanKmH: 75,
    speedUrbanKmH: 45,
    unloadTimeMinutes: 0,
    urbanRestricted: false,
    description: 'Servicio tercerizado para envíos unitarios o socios aislados donde un camión dedicado genera pérdidas.'
  }
};

/**
 * Zonas tarifarias por distancia por carretera desde Pinto
 */
export function getTariffZone(km: number | null): { zone: number; label: string } {
  const distance = km ?? 50;
  if (distance <= 75) return { zone: 1, label: 'Zona 1: Madrid / Local (≤75 km)' };
  if (distance <= 150) return { zone: 2, label: 'Zona 2: Radio Cercano (76–150 km)' };
  if (distance <= 250) return { zone: 3, label: 'Zona 3: Radio Medio (151–250 km)' };
  if (distance <= 350) return { zone: 4, label: 'Zona 4: Interurbana (251–350 km)' };
  return { zone: 5, label: 'Zona 5: Larga Distancia / Portugal (>350 km)' };
}

/**
 * Matriz de Tarifas por Peso y Zona (Ingresos facturados a socios)
 * Columnas: [Zona 1, Zona 2, Zona 3, Zona 4, Zona 5]
 */
export const TARIFF_MATRIX = {
  p50:   [24,  32,  42,  54,   68],   // ≤ 50 kg
  p200:  [38,  54,  72,  94,  122],   // 51 – 200 kg
  p500:  [55,  82, 115, 152,  198],   // 201 – 500 kg
  p1000: [95, 145, 210, 285,  375],   // 501 – 1.000 kg
  p3000: [175, 265, 380, 510,  680],  // 1.001 – 3.000 kg
  p7000: [290, 430, 620, 820, 1080],  // 3.001 – 7.000 kg
  pMax:  [420, 610, 880, 1150, 1480]  // > 7.000 kg (carga completa)
};

/**
 * Calcula el ingreso tarifario según kg de envío y km de distancia a Pinto
 */
export function calculateTariffRevenue(kg: number, km: number | null): number {
  const { zone } = getTariffZone(km);
  const zIdx = zone - 1;
  
  if (kg <= 50) return TARIFF_MATRIX.p50[zIdx];
  if (kg <= 200) return TARIFF_MATRIX.p200[zIdx];
  if (kg <= 500) return TARIFF_MATRIX.p500[zIdx];
  if (kg <= 1000) return TARIFF_MATRIX.p1000[zIdx];
  if (kg <= 3000) return TARIFF_MATRIX.p3000[zIdx];
  if (kg <= 7000) return TARIFF_MATRIX.p7000[zIdx];
  return TARIFF_MATRIX.pMax[zIdx];
}

/**
 * Coste de servicio para un envío derivado a red de agencia / paletería externa
 */
export function calculateAgencyPorteCost(kg: number, km: number | null): number {
  const { zone } = getTariffZone(km);
  // Tarifa negociada de paletería/agencia (Palletways/TXT/Dachser)
  // Base por bulto/palé + recargo kilométrico por zona
  const baseRate = [22, 29, 38, 48, 62][zone - 1];
  const weightFactor = Math.max(1, Math.ceil(kg / 450)); // aprox 1 palé cada 450-500 kg
  return baseRate * weightFactor;
}
