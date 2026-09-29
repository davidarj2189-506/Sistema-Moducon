export type UserRole = 'admin' | 'supervisor' | 'driver';

export type DisplayUnit = 'metric' | 'imperial'; // metric: Litros, Km, Km/L | imperial: Galones, Millas, MPG
export type ThemeMode = 'office' | 'cabin'; // cabin: ultra high-contrast dark for vehicle cabin / direct sunlight

export type FuelType = 'Diésel' | 'Gasolina Regular' | 'Gasolina Premium' | 'Gas LP' | 'GNV';

export type VehicleStatus = 'active' | 'maintenance' | 'idle';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  type: 'Tractocamión' | 'Camión 3.5T' | 'Pick-up' | 'Van de Reparto' | 'Volqueta';
  fuelType: FuelType;
  tankCapacityLiters: number;
  standardEfficiencyKmL: number; // Eficiencia esperada según ficha
  currentOdometer: number;
  assignedDriverId: string;
  assignedDriverName: string;
  status: VehicleStatus;
  department: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  assignedVehiclePlate: string;
  status: 'active' | 'off-duty';
  performanceRating: number; // 0 a 100
}

export type AnomalySeverity = 'normal' | 'warning' | 'critical';

export interface FuelRecord {
  id: string;
  ticketNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  timestamp: string;
  date: string;
  odometerPrevious: number;
  odometerCurrent: number;
  distanceTraveledKm: number;
  fuelAmountLiters: number;
  fuelAmountGallons: number;
  pricePerLiter: number;
  totalCost: number;
  fuelType: FuelType;
  stationName: string;
  fullTank: boolean;
  efficiencyKmL: number; // Km por Litro
  efficiencyMPG: number; // Miles per Gallon
  costPerKm: number;
  statusAnomaly: AnomalySeverity;
  anomalyReason?: string;
  roleRegistered: UserRole;
  notes?: string;
}

export interface FleetKpiSummary {
  totalFuelLiters: number;
  totalFuelGallons: number;
  totalCost: number;
  totalDistanceKm: number;
  averageEfficiencyKmL: number;
  averageEfficiencyMPG: number;
  averageCostPerKm: number;
  totalDispatches: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;
  activeVehiclesCount: number;
}
