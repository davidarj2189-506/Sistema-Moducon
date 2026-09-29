import React, { useState } from 'react';
import { ProductInventoryState } from '../types/inventory';
import { Search, Plus, Minus, Package, X } from 'lucide-react';

interface PlantSplitViewProps {
  generalInventory: ProductInventoryState[];
  totalP1: number;
  totalP2: number;
  onQuickAdjust: (product: string, plant: 'P1' | 'P2', delta: number) => void;
  onOpenStatusModal?: (product: string) => void;
}

export const PlantSplitView: React.FC<PlantSplitViewProps> = ({
  generalInventory,
  totalP1,
  totalP2,
  onQuickAdjust,
  onOpenStatusModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'both' | 'p1' | 'p2'>('both');

  // Filter products by search & physical existence
  const p1ActiveProducts = generalInventory
    .filter((item) => item.p1 > 0)
    .filter((item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comentario.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const p2ActiveProducts = generalInventory
    .filter((item) => item.p2 > 0)
    .filter((item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comentario.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-4 no-print">
      {/* Controls Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-zinc-100 p-1 rounded-lg text-xs border border-zinc-200/60 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Comparativa (P1 + P2)
            </button>
            <button
              onClick={() => setActiveTab('p1')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'p1'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Planta 1 — MÓD ({p1ActiveProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('p2')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'p2'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Planta 2 — RECTA ({p2ActiveProducts.length})
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden xl:inline-block">
            Solo con existencias (&gt; 0)
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar producto o comentario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs w-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of plants */}
      <div className={`grid gap-4 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* P1 MÓD */}
        {(activeTab === 'both' || activeTab === 'p1') && (
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
            
            {/* Minimalist Card Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wide">
                  Planta 1 — MÓD
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {p1ActiveProducts.length} productos con stock activo
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold font-mono-numbers text-zinc-900">{totalP1}</span>
                <span className="text-xs text-zinc-400 ml-1">piezas</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px] flex-1 touch-pan-x">
              {p1ActiveProducts.length === 0 ? (
                <div className="p-10 text-center text-zinc-400 text-xs">
                  <Package className="w-7 h-7 mx-auto mb-2 text-zinc-300" />
                  No hay productos con existencias en Planta 1.
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse min-w-[440px]">
                  <thead className="bg-zinc-50 text-zinc-600 font-medium border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center w-24">Stock P1</th>
                      <th className="p-2.5">Comentario / Estado</th>
                      <th className="p-2.5 text-center w-24">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {p1ActiveProducts.map((item) => (
                      <tr key={item.product} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="p-2.5 font-semibold text-zinc-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="text-[10px] text-zinc-500 bg-zinc-100 font-medium px-1.5 py-0.2 rounded border border-zinc-200">
                                Nuevo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-semibold font-mono-numbers text-sm text-zinc-900">
                          {item.p1}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <div
                            onClick={() => onOpenStatusModal && onOpenStatusModal(item.product)}
                            className="cursor-pointer inline-block"
                            title="Click para modificar estado o defecto"
                          >
                            {item.comentario ? (
                              <span className="text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 font-medium inline-block">
                                {item.comentario}
                              </span>
                            ) : (
                              <span className="text-zinc-300 hover:text-zinc-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-100 rounded-md p-0.5 border border-zinc-200/60">
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P1', -1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Restar 1 pieza de P1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P1', 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Sumar 1 pieza producida en P1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* P2 RECTA */}
        {(activeTab === 'both' || activeTab === 'p2') && (
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
            
            {/* Minimalist Card Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wide">
                  Planta 2 — RECTA
                </h3>
                <span className="text-[11px] text-zinc-400">
                  {p2ActiveProducts.length} productos con stock activo
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold font-mono-numbers text-zinc-900">{totalP2}</span>
                <span className="text-xs text-zinc-400 ml-1">piezas</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px] flex-1 touch-pan-x">
              {p2ActiveProducts.length === 0 ? (
                <div className="p-10 text-center text-zinc-400 text-xs">
                  <Package className="w-7 h-7 mx-auto mb-2 text-zinc-300" />
                  No hay productos con existencias en Planta 2.
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse min-w-[440px]">
                  <thead className="bg-zinc-50 text-zinc-600 font-medium border-b border-zinc-100 sticky top-0">
                    <tr>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center w-24">Stock P2</th>
                      <th className="p-2.5">Comentario / Estado</th>
                      <th className="p-2.5 text-center w-24">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {p2ActiveProducts.map((item) => (
                      <tr key={item.product} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="p-2.5 font-semibold text-zinc-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="text-[10px] text-zinc-500 bg-zinc-100 font-medium px-1.5 py-0.2 rounded border border-zinc-200">
                                Nuevo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-semibold font-mono-numbers text-sm text-zinc-900">
                          {item.p2}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <div
                            onClick={() => onOpenStatusModal && onOpenStatusModal(item.product)}
                            className="cursor-pointer inline-block"
                            title="Click para modificar estado o defecto"
                          >
                            {item.comentario ? (
                              <span className="text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 font-medium inline-block">
                                {item.comentario}
                              </span>
                            ) : (
                              <span className="text-zinc-300 hover:text-zinc-500">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-100 rounded-md p-0.5 border border-zinc-200/60">
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P2', -1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Restar 1 pieza de P2"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P2', 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Sumar 1 pieza producida en P2"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
