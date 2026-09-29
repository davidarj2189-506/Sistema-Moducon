import React from 'react';
import { Package, Building, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { InventoryMovement, ProductInventoryState } from '../types/inventory';

interface KpiSummaryCardsProps {
  totalPieces: number;
  totalP1: number;
  totalP2: number;
  movements: InventoryMovement[];
  generalInventory: ProductInventoryState[];
  totalFaltantes: number;
}

export const KpiSummaryCards: React.FC<KpiSummaryCardsProps> = ({
  totalPieces,
  totalP1,
  totalP2,
  movements,
  generalInventory,
  totalFaltantes,
}) => {
  // Count items with observed defects or physical comments
  const defectiveItems = generalInventory.filter(
    (item) => item.comentario && item.comentario.trim().length > 0
  );

  const totalEntradas = movements
    .filter((m) => m.type === 'ENTRADA')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalSalidas = movements
    .filter((m) => m.type === 'SALIDA')
    .reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 no-print">
      {/* Total General */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Patio
          </span>
          <div className="p-1.5 bg-gray-100 text-gray-700 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-gray-900 font-mono-numbers">
            {totalPieces}
          </span>
          <span className="text-xs text-gray-500 font-medium">piezas</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Conteo físico activo consolidado</p>
      </div>

      {/* P1 MÓD */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#165a36] uppercase tracking-wider">
            Planta 1 (MÓD)
          </span>
          <div className="p-1.5 bg-emerald-50 text-[#165a36] rounded-lg border border-emerald-100">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#165a36] font-mono-numbers">
            {totalP1}
          </span>
          <span className="text-xs text-gray-500 font-medium">piezas</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-200">
          <div
            className="bg-[#165a36] h-full rounded-full transition-all"
            style={{ width: `${totalPieces > 0 ? (totalP1 / totalPieces) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* P2 RECTA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#14532d] uppercase tracking-wider">
            Planta 2 (RECTA)
          </span>
          <div className="p-1.5 bg-emerald-50 text-[#14532d] rounded-lg border border-emerald-100">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#14532d] font-mono-numbers">
            {totalP2}
          </span>
          <span className="text-xs text-gray-500 font-medium">piezas</span>
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-200">
          <div
            className="bg-[#14532d] h-full rounded-full transition-all"
            style={{ width: `${totalPieces > 0 ? (totalP2 / totalPieces) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Movimientos Acumulados */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Entradas vs Salidas
          </span>
          <div className="flex gap-1">
            <div className="p-1 bg-emerald-50 text-[#165a36] rounded">
              <ArrowDownRight className="w-3 h-3" />
            </div>
            <div className="p-1 bg-rose-50 text-rose-700 rounded">
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Prod. (+)</span>
            <span className="font-bold text-[#165a36] font-mono-numbers text-base">+{totalEntradas}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Salidas (-)</span>
            <span className="font-bold text-rose-700 font-mono-numbers text-base">-{totalSalidas}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{movements.length} operaciones registradas</p>
      </div>

      {/* Items con Observación / Defectos */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Observaciones Físicas
          </span>
          <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-900 font-mono-numbers">
            {defectiveItems.length}
          </span>
          <span className="text-xs text-gray-500 font-medium">ítems</span>
        </div>
        <p className="text-[11px] text-amber-800 font-medium truncate mt-1" title={defectiveItems.map(d => `${d.product}: ${d.comentario}`).join(', ')}>
          {defectiveItems.length > 0 ? `${defectiveItems[0].product}: "${defectiveItems[0].comentario}"` : 'Sin defectos reportados'}
        </p>
      </div>
    </div>
  );
};
