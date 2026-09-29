import React, { useState } from 'react';
import { InventoryMovement, ClientRecord } from '../types/inventory';
import { Search, Trash2, ArrowDownRight, ArrowUpRight, Calendar, Building, RefreshCw, X } from 'lucide-react';

interface MovementHistoryViewProps {
  movements: InventoryMovement[];
  clients?: ClientRecord[];
  onDeleteMovement: (id: string) => void;
  onClearAllMovements: () => void;
}

export const MovementHistoryView: React.FC<MovementHistoryViewProps> = ({
  movements,
  clients = [],
  onDeleteMovement,
  onClearAllMovements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENTRADA' | 'SALIDA' | 'TRASPASO'>('ALL');
  const [plantFilter, setPlantFilter] = useState<'ALL' | 'P1' | 'P2'>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.client && m.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.comment && m.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
    const matchesPlant = plantFilter === 'ALL' || m.plant === plantFilter;
    const matchesClient = clientFilter === 'ALL' || (m.client && m.client.toLowerCase() === clientFilter.toLowerCase());

    return matchesSearch && matchesType && matchesPlant && matchesClient;
  });

  // Extract unique clients present in movements
  const uniqueClientsInMovements = Array.from(
    new Set(movements.map((m) => m.client).filter((c): c is string => Boolean(c && c.trim())))
  );

  return (
    <div className="bg-white rounded-xl shadow-xs border border-zinc-200/80 overflow-hidden no-print">
      
      {/* Filters header */}
      <div className="p-3 sm:p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full md:w-auto">
          
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar producto, cliente o remisión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-zinc-900"
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

          {/* Type Segmented Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60 text-xs overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('ENTRADA')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'ENTRADA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Entradas (+)
            </button>
            <button
              onClick={() => setTypeFilter('SALIDA')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'SALIDA' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Salidas (-)
            </button>
            <button
              onClick={() => setTypeFilter('TRASPASO')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === 'TRASPASO' ? 'bg-white text-sky-800 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Traspasos (⇄)
            </button>
          </div>

          {/* Plant Segmented Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60 text-xs overflow-x-auto">
            <button
              onClick={() => setPlantFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                plantFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setPlantFilter('P1')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                plantFilter === 'P1' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              P1
            </button>
            <button
              onClick={() => setPlantFilter('P2')}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                plantFilter === 'P2' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              P2
            </button>
          </div>

          {/* Client Filter */}
          {uniqueClientsInMovements.length > 0 && (
            <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-xs w-full sm:w-auto">
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-transparent text-zinc-700 font-medium focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">Todos los clientes</option>
                {uniqueClientsInMovements.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {movements.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('¿Deseas vaciar todos los movimientos registrados y volver al estado base?')) {
                onClearAllMovements();
              }
            }}
            className="text-xs text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer self-end md:self-auto shrink-0"
            title="Borrar movimientos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar registros</span>
          </button>
        )}
      </div>

      <div className="sm:hidden text-right text-[10px] text-zinc-400 px-3 py-1.5 border-b border-zinc-100 bg-zinc-50/30">
        <span>Desliza para ver columnas ➔</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto touch-pan-x">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          <thead className="bg-zinc-50 text-zinc-600 font-medium border-b border-zinc-200">
            <tr>
              <th className="p-2.5">Fecha · Hora</th>
              <th className="p-2.5">Operación</th>
              <th className="p-2.5">Producto</th>
              <th className="p-2.5">Cliente / Obra</th>
              <th className="p-2.5 text-center">Planta</th>
              <th className="p-2.5 text-center">Cantidad</th>
              <th className="p-2.5">Referencia</th>
              <th className="p-2.5">Comentario</th>
              <th className="p-2.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredMovements.map((m) => (
              <tr key={m.id} className="hover:bg-zinc-50/70 transition-colors">
                <td className="p-2.5 text-zinc-500 whitespace-nowrap font-mono text-[11px]">
                  {m.date} {m.time}
                </td>
                <td className="p-2.5 whitespace-nowrap">
                  {m.type === 'ENTRADA' ? (
                    <span className="font-semibold text-emerald-700 inline-flex items-center gap-1 font-mono">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Entrada (+)
                    </span>
                  ) : m.type === 'SALIDA' ? (
                    <span className="font-semibold text-rose-600 inline-flex items-center gap-1 font-mono">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Salida (-)
                    </span>
                  ) : (
                    <span className="font-semibold text-sky-700 inline-flex items-center gap-1 font-mono">
                      <RefreshCw className="w-3 h-3" />
                      Traspaso (⇄)
                    </span>
                  )}
                </td>
                <td className="p-2.5 font-semibold text-zinc-900">{m.product}</td>
                <td className="p-2.5 text-zinc-700">
                  {m.type === 'TRASPASO' ? (
                    <span className="text-zinc-400">Reubicación en Patio</span>
                  ) : m.client ? (
                    <span className="font-medium text-zinc-800">{m.client}</span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="p-2.5 text-center text-zinc-600 font-mono">
                  {m.type === 'TRASPASO' ? (
                    <span>{m.plant} ➔ {m.destPlant || (m.plant === 'P1' ? 'P2' : 'P1')}</span>
                  ) : (
                    <span>{m.plant}</span>
                  )}
                </td>
                <td className="p-2.5 text-center font-mono-numbers font-semibold">
                  {m.type === 'ENTRADA' && <span className="text-emerald-700">+{m.quantity}</span>}
                  {m.type === 'SALIDA' && <span className="text-rose-600">-{m.quantity}</span>}
                  {m.type === 'TRASPASO' && <span className="text-sky-700">⇄ {m.quantity}</span>}
                </td>
                <td className="p-2.5 text-zinc-600">{m.reference || '—'}</td>
                <td className="p-2.5 text-zinc-600 text-[11px]">
                  {m.comment ? (
                    <span className="text-amber-900 font-medium">{m.comment}</span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => onDeleteMovement(m.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Eliminar este movimiento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-400">
                  No se encontraron movimientos registrados con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
