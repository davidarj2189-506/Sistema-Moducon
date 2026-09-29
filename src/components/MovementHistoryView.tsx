import React, { useState } from 'react';
import { InventoryMovement, ClientRecord } from '../types/inventory';
import { Search, Trash2, ArrowDownRight, ArrowUpRight, Calendar, Building, UserCheck, RefreshCw } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden no-print">
      {/* Filters header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto, cliente o remisión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-0.5 text-xs">
            <span className="px-2 text-gray-500 font-medium">Tipo:</span>
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-[#165a36] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('ENTRADA')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                typeFilter === 'ENTRADA' ? 'bg-[#165a36] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Entradas (+)
            </button>
            <button
              onClick={() => setTypeFilter('SALIDA')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                typeFilter === 'SALIDA' ? 'bg-rose-700 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Salidas (-)
            </button>
            <button
              onClick={() => setTypeFilter('TRASPASO')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                typeFilter === 'TRASPASO' ? 'bg-[#165a36] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Filtrar reubicaciones internas entre plantas"
            >
              Traspasos (⇄)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-0.5 text-xs">
            <span className="px-2 text-gray-500 font-medium">Planta:</span>
            <button
              onClick={() => setPlantFilter('ALL')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                plantFilter === 'ALL' ? 'bg-[#165a36] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setPlantFilter('P1')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                plantFilter === 'P1' ? 'bg-[#165a36] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              P1
            </button>
            <button
              onClick={() => setPlantFilter('P2')}
              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer ${
                plantFilter === 'P2' ? 'bg-[#14532d] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              P2
            </button>
          </div>

          {/* Client Filter */}
          {uniqueClientsInMovements.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs">
              <Building className="w-3.5 h-3.5 text-[#165a36]" />
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los Clientes</option>
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
            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar todos los movimientos</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Fecha / Hora</th>
              <th className="p-3">Operación</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Cliente / Solicitante</th>
              <th className="p-3 text-center">Planta</th>
              <th className="p-3 text-center">Cantidad</th>
              <th className="p-3">Referencia / Obra</th>
              <th className="p-3">Comentario Físico</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMovements.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.date} {m.time}</span>
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {m.type === 'ENTRADA' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                      Producción (+)
                    </span>
                  ) : m.type === 'SALIDA' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                      <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      Salida / Entrega (-)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      <RefreshCw className="w-3 h-3 text-sky-600" />
                      Traspaso Interno (⇄)
                    </span>
                  )}
                </td>
                <td className="p-3 font-bold text-slate-900">{m.product}</td>
                <td className="p-3">
                  {m.type === 'TRASPASO' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
                      Almacenamiento en Patio
                    </span>
                  ) : m.client ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#165a36] border border-emerald-200">
                      <Building className="w-3 h-3 text-[#165a36]" />
                      {m.client}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No especificado</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {m.type === 'TRASPASO' ? (
                    <span className="px-2 py-0.5 bg-sky-50 border border-sky-300 rounded font-bold text-sky-900 text-[11px]">
                      {m.plant} ➔ {m.destPlant || (m.plant === 'P1' ? 'P2' : 'P1')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700">
                      {m.plant}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center font-black font-mono text-sm">
                  {m.type === 'ENTRADA' && <span className="text-emerald-700">+{m.quantity}</span>}
                  {m.type === 'SALIDA' && <span className="text-rose-700">-{m.quantity}</span>}
                  {m.type === 'TRASPASO' && (
                    <span className="text-sky-700 font-bold" title="Traspaso interno: El total del inventario no disminuye">
                      ⇄ {m.quantity}
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-700 font-medium">{m.reference || '—'}</td>
                <td className="p-3 text-slate-600">
                  {m.comment ? (
                    <span className="text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {m.comment}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onDeleteMovement(m.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Deshacer este movimiento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  <p className="font-semibold text-sm">No hay movimientos registrados</p>
                  <p className="text-xs mt-1 text-slate-400">
                    Registra nuevas entradas o salidas usando el botón "Nuevo Registro" o "Carga Rápida".
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
