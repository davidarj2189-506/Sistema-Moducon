import React from 'react';
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

  const p1Percent = totalPieces > 0 ? Math.round((totalP1 / totalPieces) * 100) : 0;
  const p2Percent = totalPieces > 0 ? Math.round((totalP2 / totalPieces) * 100) : 0;

  return (
    <div className="bg-zinc-200/80 border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs no-print">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px">
        
        {/* Metric 1: Total Patio */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Total en Patio
          </span>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 font-mono-numbers">
              {totalPieces}
            </span>
            <span className="text-xs text-zinc-500 font-normal">piezas</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 truncate">
            Conteo físico consolidado
          </span>
        </div>

        {/* Metric 2: Planta 1 MÓD */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Planta 1 (MÓD)
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
              {p1Percent}%
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 font-mono-numbers">
              {totalP1}
            </span>
            <span className="text-xs text-zinc-500 font-normal">piezas</span>
          </div>
          <div className="w-full bg-zinc-100 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-zinc-800 h-full rounded-full transition-all duration-300"
              style={{ width: `${p1Percent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Planta 2 RECTA */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Planta 2 (RECTA)
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
              {p2Percent}%
            </span>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 font-mono-numbers">
              {totalP2}
            </span>
            <span className="text-xs text-zinc-500 font-normal">piezas</span>
          </div>
          <div className="w-full bg-zinc-100 h-1 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-zinc-800 h-full rounded-full transition-all duration-300"
              style={{ width: `${p2Percent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Entradas / Salidas */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Movimientos del Día
          </span>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2.5 text-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-700 font-semibold text-base sm:text-lg font-mono-numbers">
                +{totalEntradas}
              </span>
              <span className="text-[10px] text-zinc-400">prod.</span>
            </div>
            <span className="text-zinc-300">/</span>
            <div className="flex items-baseline gap-1">
              <span className="text-rose-600 font-semibold text-base sm:text-lg font-mono-numbers">
                -{totalSalidas}
              </span>
              <span className="text-[10px] text-zinc-400">sal.</span>
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 truncate">
            {movements.length} {movements.length === 1 ? 'operación' : 'operaciones'}
          </span>
        </div>

        {/* Metric 5: Observaciones / Defectos */}
        <div className="bg-white p-3.5 sm:p-4 md:p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Observaciones
            </span>
            {defectiveItems.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Hay productos con notas de calidad" />
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 font-mono-numbers">
              {defectiveItems.length}
            </span>
            <span className="text-xs text-zinc-500 font-normal">ítems</span>
          </div>
          <span 
            className="text-[10px] sm:text-[11px] text-zinc-500 truncate mt-1" 
            title={defectiveItems.map(d => `${d.product}: ${d.comentario}`).join(', ')}
          >
            {defectiveItems.length > 0 
              ? `${defectiveItems[0].product}: "${defectiveItems[0].comentario}"` 
              : 'Sin novedades físicas'}
          </span>
        </div>

      </div>
    </div>
  );
};
