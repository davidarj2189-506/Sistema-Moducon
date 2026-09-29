/**
 * Types for Concrete Products Inventory System
 */

export interface ProductInventoryState {
  product: string;
  p1: number;
  p2: number;
  total: number;
  reservas: string;
  comentario: string;
  clienteReserva?: string;
  estadoCalidad?: string;
  isCustom?: boolean;
}

export interface CustomProductRecord {
  product: string;
  initialP1: number;
  initialP2: number;
  comentario?: string;
  reservas?: string;
  clienteReserva?: string;
  estadoCalidad?: string;
  createdAt: number;
}

export interface SalidaRevisionRow {
  producto: string;
  inicialP1: number;
  entrada: number;
  salida: number;
  inicialP2: number;
  resultadoP1: number;
  resultadoP2: number;
  observacion: string;
  faltante: number;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'TRASPASO';
export type PlantTarget = 'P1' | 'P2' | 'AUTO';

export interface InventoryMovement {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  product: string;
  type: MovementType;
  plant: PlantTarget; // Origin plant if TRASPASO
  destPlant?: 'P1' | 'P2'; // Destination plant if TRASPASO
  actualPlantAffected?: 'P1' | 'P2' | 'AMBAS';
  quantity: number;
  reference: string; // e.g. "Remisión #4520", "Producción batch A", "Traspaso de patio"
  client?: string; // Cliente o constructora que solicita/recibe el producto
  comment?: string;
  createdAt: number;
}

export interface ClientRecord {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  projectOrSite?: string;
}

export interface ProductStatusUpdate {
  product: string;
  comentario: string;
  reservas: string;
  clienteReserva?: string;
  estadoCalidad?: string;
}

export interface DailySnapshot {
  id: string;
  date: string;
  totalP1: number;
  totalP2: number;
  grandTotal: number;
  revisionSalidas: SalidaRevisionRow[];
  generalInventory: ProductInventoryState[];
  p1Inventory: Array<{ product: string; cantidad: number; planta: 'P1'; comentario: string; reservas: string }>;
  p2Inventory: Array<{ product: string; cantidad: number; planta: 'P2'; comentario: string; reservas: string }>;
  note?: string;
}
