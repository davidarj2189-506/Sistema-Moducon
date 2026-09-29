import * as XLSX from 'xlsx';
import { ProductInventoryState, SalidaRevisionRow } from '../types/inventory';

export function exportInventoryToExcel(
  date: string,
  salidasRevision: SalidaRevisionRow[],
  generalInventory: ProductInventoryState[],
  p1Inventory: Array<{ product: string; cantidad: number; planta: 'P1'; comentario: string; reservas: string }>,
  p2Inventory: Array<{ product: string; cantidad: number; planta: 'P2'; comentario: string; reservas: string }>,
  totalP1: number,
  totalP2: number,
  grandTotal: number
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Revisión de Salidas
  const salidasData = salidasRevision.map((r) => ({
    'PRODUCTO': r.producto,
    'INICIAL P1': r.inicialP1,
    'ENTRADA': r.entrada,
    'SALIDA': r.salida,
    'INICIAL P2': r.inicialP2,
    'RESULTADO P1': r.resultadoP1,
    'RESULTADO P2': r.resultadoP2,
    'OBSERVACIÓN': r.observacion,
  }));
  const wsSalidas = XLSX.utils.json_to_sheet(salidasData);
  XLSX.utils.book_append_sheet(wb, wsSalidas, 'Revisión de Salidas');

  // 2. Sheet: Inventario General
  const generalData = generalInventory.map((g) => ({
    'PRODUCTO': g.product,
    'P1': g.p1,
    'P2': g.p2,
    'TOTAL GENERAL': g.total,
    'RESERVAS': g.reservas,
    'COMENTARIO': g.comentario,
  }));
  // Add total row
  generalData.push({
    'PRODUCTO': 'TOTAL GENERAL CONSOLIDADO',
    'P1': totalP1,
    'P2': totalP2,
    'TOTAL GENERAL': grandTotal,
    'RESERVAS': '',
    'COMENTARIO': '',
  });
  const wsGeneral = XLSX.utils.json_to_sheet(generalData);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'Inventario General');

  // 3. Sheet: P1 - Inventario Mód
  const p1Data = p1Inventory.map((item) => ({
    'PRODUCTO': item.product,
    'CANTIDAD': item.cantidad,
    'PLANTA (P)': item.planta,
    'COMENTARIO': item.comentario,
    'RESERVAS': item.reservas,
  }));
  p1Data.push({
    'PRODUCTO': 'TOTAL P1',
    'CANTIDAD': totalP1,
    'PLANTA (P)': 'P1',
    'COMENTARIO': '',
    'RESERVAS': '',
  });
  const wsP1 = XLSX.utils.json_to_sheet(p1Data);
  XLSX.utils.book_append_sheet(wb, wsP1, 'P1 - Inventario MÓD');

  // 4. Sheet: P2 - Inven Recta
  const p2Data = p2Inventory.map((item) => ({
    'PRODUCTO': item.product,
    'CANTIDAD': item.cantidad,
    'PLANTA (P)': item.planta,
    'COMENTARIO': item.comentario,
    'RESERVAS': item.reservas,
  }));
  p2Data.push({
    'PRODUCTO': 'TOTAL P2',
    'CANTIDAD': totalP2,
    'PLANTA (P)': 'P2',
    'COMENTARIO': '',
    'RESERVAS': '',
  });
  const wsP2 = XLSX.utils.json_to_sheet(p2Data);
  XLSX.utils.book_append_sheet(wb, wsP2, 'P2 - Inven RECTA');

  // Write file
  XLSX.writeFile(wb, `Inventario_Concreto_${date}.xlsx`);
}
