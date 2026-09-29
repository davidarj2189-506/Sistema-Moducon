import React, { useState } from 'react';
import { ProductInventoryState } from '../types/inventory';
import { Building, Search, Plus, Minus, Package, ShieldAlert } from 'lucide-react';

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

  // Search filter applied strictly to items WITH PHYSICAL STOCK in each plant
  // As requested: "mientras en uno de los P no haya un producto su nombre no se vea reflejado en la zona de ajuste rápido"
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
      {/* Controls Bar - White with Light Gray border */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs border border-gray-200">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-[#165a36] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Comparativa (P1 + P2)
            </button>
            <button
              onClick={() => setActiveTab('p1')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === 'p1'
                  ? 'bg-[#165a36] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Planta 1 — MÓD ({p1ActiveProducts.length} productos / {totalP1} pzas)
            </button>
            <button
              onClick={() => setActiveTab('p2')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === 'p2'
                  ? 'bg-[#165a36] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Planta 2 — RECTA ({p2ActiveProducts.length} productos / {totalP2} pzas)
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium hidden sm:inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-[#165a36]"></span>
            Mostrando exclusivamente productos con existencias físicas en patio (&gt; 0)
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por nombre o comentario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs w-full sm:w-64 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
          />
        </div>
      </div>

      {/* Grid of plants */}
      <div className={`grid gap-6 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* P1 MÓD */}
        {(activeTab === 'both' || activeTab === 'p1') && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
            {/* Header - Medium dark green */}
            <div className="px-5 py-3.5 bg-[#165a36] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">P1 — INVENTARIO MÓD (Ajuste Rápido)</h3>
                  <p className="text-[11px] text-emerald-100/85">
                    {p1ActiveProducts.length} productos con stock físico en patio
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono-numbers">{totalP1}</span>
                <span className="text-xs text-emerald-100/80 ml-1">piezas</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px] flex-1">
              {p1ActiveProducts.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No hay productos con existencias en Planta 1 {searchTerm ? 'para esta búsqueda' : ''}.
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center w-24">Stock P1</th>
                      <th className="p-2.5">Comentario / Estado</th>
                      <th className="p-2.5 text-center w-28">Ajuste Rápido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {p1ActiveProducts.map((item) => (
                      <tr key={item.product} className="hover:bg-gray-50/90 transition-colors">
                        <td className="p-2.5 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="text-[9px] bg-emerald-100 text-[#165a36] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                NUEVO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-black font-mono-numbers text-sm text-[#165a36]">
                          {item.p1}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <div
                            onClick={() => onOpenStatusModal && onOpenStatusModal(item.product)}
                            className={`cursor-pointer inline-block ${onOpenStatusModal ? 'hover:opacity-80' : ''}`}
                            title="Click para modificar estado/comentario de este producto"
                          >
                            {item.comentario ? (
                              <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium inline-block">
                                {item.comentario}
                              </span>
                            ) : (
                              <span className="text-gray-400 hover:text-gray-600 italic">+ Estado</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P1', -1)}
                              className="p-1 text-gray-700 hover:text-rose-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Descontar 1 pieza de P1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P1', 1)}
                              className="p-1 text-gray-700 hover:text-[#165a36] hover:bg-white rounded transition-colors cursor-pointer"
                              title="Añadir 1 pieza producida en P1"
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
            {/* Header - Medium-dark green variant */}
            <div className="px-5 py-3.5 bg-[#14532d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-sm">P2 — INVEN RECTA (Ajuste Rápido)</h3>
                  <p className="text-[11px] text-emerald-100/85">
                    {p2ActiveProducts.length} productos con stock físico en patio
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono-numbers">{totalP2}</span>
                <span className="text-xs text-emerald-100/80 ml-1">piezas</span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[620px] flex-1">
              {p2ActiveProducts.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No hay productos con existencias en Planta 2 {searchTerm ? 'para esta búsqueda' : ''}.
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center w-24">Stock P2</th>
                      <th className="p-2.5">Comentario / Estado</th>
                      <th className="p-2.5 text-center w-28">Ajuste Rápido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {p2ActiveProducts.map((item) => (
                      <tr key={item.product} className="hover:bg-gray-50/90 transition-colors">
                        <td className="p-2.5 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="text-[9px] bg-emerald-100 text-[#165a36] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                NUEVO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-black font-mono-numbers text-sm text-[#14532d]">
                          {item.p2}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <div
                            onClick={() => onOpenStatusModal && onOpenStatusModal(item.product)}
                            className={`cursor-pointer inline-block ${onOpenStatusModal ? 'hover:opacity-80' : ''}`}
                            title="Click para modificar estado/comentario de este producto"
                          >
                            {item.comentario ? (
                              <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium inline-block">
                                {item.comentario}
                              </span>
                            ) : (
                              <span className="text-gray-400 hover:text-gray-600 italic">+ Estado</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P2', -1)}
                              className="p-1 text-gray-700 hover:text-rose-700 hover:bg-white rounded transition-colors cursor-pointer"
                              title="Descontar 1 pieza de P2"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onQuickAdjust(item.product, 'P2', 1)}
                              className="p-1 text-gray-700 hover:text-[#165a36] hover:bg-white rounded transition-colors cursor-pointer"
                              title="Añadir 1 pieza producida en P2"
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
