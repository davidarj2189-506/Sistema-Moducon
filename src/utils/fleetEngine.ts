import { Vehicle, FuelRecord, FleetKpiSummary, AnomalySeverity, DisplayUnit } from '../types/fleet';
import { INITIAL_VEHICLES, INITIAL_FUEL_RECORDS } from '../data/fleetData';

const STORAGE_KEYS = {
  RECORDS: 'fleetfuel_records_v1',
  VEHICLES: 'fleetfuel_vehicles_v1',
  UNIT_PREF: 'fleetfuel_unit_pref_v1',
  THEME_MODE: 'fleetfuel_theme_mode_v1',
};

// Conversions
export const LITERS_TO_GALLONS = 0.264172;
export const GALLONS_TO_LITERS = 3.78541;
export const KM_TO_MILES = 0.621371;
export const KML_TO_MPG = 2.35215;

export function loadStoredVehicles(): Vehicle[] {
  if (typeof window === 'undefined') return INITIAL_VEHICLES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : INITIAL_VEHICLES;
  } catch (e) {
    return INITIAL_VEHICLES;
  }
}

export function saveStoredVehicles(vehicles: Vehicle[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Error saving vehicles', e);
  }
}

export function loadStoredRecords(): FuelRecord[] {
  if (typeof window === 'undefined') return INITIAL_FUEL_RECORDS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : INITIAL_FUEL_RECORDS;
  } catch (e) {
    return INITIAL_FUEL_RECORDS;
  }
}

export function saveStoredRecords(records: FuelRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records', e);
  }
}

export interface ValidationResult {
  isValid: boolean;
  canProceedWithWarning: boolean;
  errors: string[];
  warnings: string[];
  calculatedEfficiencyKmL: number;
  calculatedEfficiencyMPG: number;
  calculatedDistanceKm: number;
  calculatedTotalCost: number;
  anomalyLevel: AnomalySeverity;
  anomalyMessage?: string;
}

export function validateFuelEntry(
  vehicle: Vehicle,
  currentOdo: number,
  fuelLiters: number,
  pricePerLiter: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const prevOdo = vehicle.currentOdometer;
  const distance = currentOdo - prevOdo;
  const totalCost = fuelLiters * pricePerLiter;

  // 1. Basic validation
  if (currentOdo <= 0) {
    errors.push('El odómetro actual debe ser un valor numérico positivo.');
  }

  if (fuelLiters <= 0) {
    errors.push('La cantidad de combustible debe ser mayor a 0.');
  }

  if (pricePerLiter <= 0) {
    errors.push('El precio por litro debe ser mayor a 0.');
  }

  // 2. Strict Odometer Logic (Crucial Fleet Check)
  if (currentOdo <= prevOdo) {
    errors.push(
      `El odómetro actual (${currentOdo.toLocaleString()} km) NO puede ser menor o igual al último odómetro registrado (${prevOdo.toLocaleString()} km).`
    );
  } else if (distance > 3500) {
    warnings.push(
      `Distancia inusualmente alta: +${distance.toLocaleString()} km desde la última carga. Verifica si hubo cargas intermedias no reportadas.`
    );
  }

  // 3. Tank Capacity Check (Anti-Fraud / Anti-Spill)
  if (fuelLiters > vehicle.tankCapacityLiters * 1.05) {
    errors.push(
      `Volumen excede capacidad máxima: Intentas cargar ${fuelLiters.toFixed(1)} L en un tanque con capacidad de ${vehicle.tankCapacityLiters} L (+5% margen).`
    );
  } else if (fuelLiters > vehicle.tankCapacityLiters * 0.95) {
    warnings.push(
      `Carga al límite superior (${fuelLiters.toFixed(1)} L de ${vehicle.tankCapacityLiters} L de capacidad).`
    );
  }

  // 4. Efficiency Calculation & Telematics Anomaly
  let efficiencyKmL = 0;
  let efficiencyMPG = 0;
  let anomalyLevel: AnomalySeverity = 'normal';
  let anomalyMessage: string | undefined = undefined;

  if (distance > 0 && fuelLiters > 0) {
    efficiencyKmL = Number((distance / fuelLiters).toFixed(2));
    efficiencyMPG = Number((efficiencyKmL * KML_TO_MPG).toFixed(2));

    const expectedKmL = vehicle.standardEfficiencyKmL;
    const deviationPercent = ((efficiencyKmL - expectedKmL) / expectedKmL) * 100;

    if (deviationPercent < -30) {
      anomalyLevel = 'critical';
      anomalyMessage = `Alerta Crítica: Rendimiento de ${efficiencyKmL} km/l es ${Math.abs(deviationPercent).toFixed(1)}% inferior al esperado (${expectedKmL} km/l). Posible fuga o extracción no autorizada.`;
      warnings.push(anomalyMessage);
    } else if (deviationPercent < -15) {
      anomalyLevel = 'warning';
      anomalyMessage = `Advertencia: Rendimiento de ${efficiencyKmL} km/l está ${Math.abs(deviationPercent).toFixed(1)}% por debajo del estándar (${expectedKmL} km/l).`;
      warnings.push(anomalyMessage);
    } else if (deviationPercent > 45) {
      anomalyLevel = 'warning';
      anomalyMessage = `Advertencia: Rendimiento anormalmente alto (${efficiencyKmL} km/l vs ${expectedKmL} km/l esperado). Verifica odómetro o si el tanque no se llenó por completo.`;
      warnings.push(anomalyMessage);
    }
  }

  return {
    isValid: errors.length === 0,
    canProceedWithWarning: errors.length === 0 && warnings.length > 0,
    errors,
    warnings,
    calculatedEfficiencyKmL: efficiencyKmL,
    calculatedEfficiencyMPG: efficiencyMPG,
    calculatedDistanceKm: Math.max(0, distance),
    calculatedTotalCost: Number(totalCost.toFixed(2)),
    anomalyLevel,
    anomalyMessage,
  };
}

export function computeFleetKpis(records: FuelRecord[], vehicles: Vehicle[]): FleetKpiSummary {
  const totalFuelLiters = records.reduce((acc, r) => acc + r.fuelAmountLiters, 0);
  const totalFuelGallons = totalFuelLiters * LITERS_TO_GALLONS;
  const totalCost = records.reduce((acc, r) => acc + r.totalCost, 0);
  const totalDistanceKm = records.reduce((acc, r) => acc + r.distanceTraveledKm, 0);

  const avgEfficiencyKmL = totalFuelLiters > 0 ? Number((totalDistanceKm / totalFuelLiters).toFixed(2)) : 0;
  const avgEfficiencyMPG = Number((avgEfficiencyKmL * KML_TO_MPG).toFixed(2));
  const avgCostPerKm = totalDistanceKm > 0 ? Number((totalCost / totalDistanceKm).toFixed(2)) : 0;

  const criticalAlertsCount = records.filter((r) => r.statusAnomaly === 'critical').length;
  const warningAlertsCount = records.filter((r) => r.statusAnomaly === 'warning').length;
  const activeVehiclesCount = vehicles.filter((v) => v.status === 'active').length;

  return {
    totalFuelLiters: Math.round(totalFuelLiters),
    totalFuelGallons: Number(totalFuelGallons.toFixed(1)),
    totalCost: Math.round(totalCost),
    totalDistanceKm: Math.round(totalDistanceKm),
    averageEfficiencyKmL: avgEfficiencyKmL,
    averageEfficiencyMPG: avgEfficiencyMPG,
    averageCostPerKm: avgCostPerKm,
    totalDispatches: records.length,
    criticalAlertsCount,
    warningAlertsCount,
    activeVehiclesCount,
  };
}

export function exportFleetRecordsToCsv(records: FuelRecord[], unit: DisplayUnit = 'metric'): void {
  const isMetric = unit === 'metric';
  const headers = [
    'Folio Ticket',
    'Fecha y Hora',
    'Placa',
    'Vehículo',
    'Conductor',
    'Tipo Combustible',
    isMetric ? 'Volumen (L)' : 'Volumen (Gal)',
    isMetric ? 'Precio ($/L)' : 'Precio ($/Gal)',
    'Costo Total ($)',
    'Odómetro Previo (km)',
    'Odómetro Actual (km)',
    'Distancia Recorrida (km)',
    isMetric ? 'Rendimiento (km/L)' : 'Rendimiento (MPG)',
    'Costo por Km ($)',
    'Estación / Proveedor',
    'Estado Auditoría',
    'Detalle Anomalía',
  ];

  const rows = records.map((r) => [
    `"${r.ticketNumber}"`,
    `"${r.date} ${r.timestamp.split('T')[1] || ''}"`,
    `"${r.vehiclePlate}"`,
    `"${r.vehicleModel}"`,
    `"${r.driverName}"`,
    `"${r.fuelType}"`,
    isMetric ? r.fuelAmountLiters.toFixed(2) : r.fuelAmountGallons.toFixed(2),
    isMetric ? r.pricePerLiter.toFixed(2) : (r.pricePerLiter / LITERS_TO_GALLONS).toFixed(2),
    r.totalCost.toFixed(2),
    r.odometerPrevious,
    r.odometerCurrent,
    r.distanceTraveledKm,
    isMetric ? r.efficiencyKmL.toFixed(2) : r.efficiencyMPG.toFixed(2),
    r.costPerKm.toFixed(2),
    `"${r.stationName}"`,
    `"${r.statusAnomaly.toUpperCase()}"`,
    `"${(r.anomalyReason || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Auditoria_Combustible_Flota_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
