import React, { useState } from 'react';
import { ProductInventoryState, SalidaRevisionRow } from '../types/inventory';
import { Search, AlertTriangle, CheckCircle2, Edit2, Check, Printer, ShieldCheck, Trash2, X } from 'lucide-react';

interface DefinitiveReportViewProps {
  currentDate: string;
  salidasRevision: SalidaRevisionRow[];
  generalInventory: ProductInventoryState[];
  p1Inventory: Array<{ product: string; cantidad: number; planta: 'P1'; comentario: string; reservas: string }>;
  p2Inventory: Array<{ product: string; cantidad: number; planta: 'P2'; comentario: string; reservas: string }>;
  totalP1: number;
  totalP2: number;
  grandTotal: number;
  activeSection: 'all' | 'salidas' | 'general' | 'p1' | 'p2';
  searchTerm: string;
  onUpdateComment: (product: string, newComment: string) => void;
  onUpdateReserva: (product: string, newReserva: string) => void;
  onOpenStatusModal?: (product?: string) => void;
  onDeleteProductCompletely?: (productName: string) => void;
  onPrint: () => void;
  onExportExcel: () => void;
}

export const DefinitiveReportView: React.FC<DefinitiveReportViewProps> = ({
  currentDate,
  salidasRevision,
  generalInventory,
  p1Inventory,
  p2Inventory,
  totalP1,
  totalP2,
  grandTotal,
  activeSection,
  searchTerm,
  onUpdateComment,
  onUpdateReserva,
  onOpenStatusModal,
  onDeleteProductCompletely,
  onPrint,
  onExportExcel,
}) => {
  const [editingCommentProduct, setEditingCommentProduct] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState('');
  const [editingReservaProduct, setEditingReservaProduct] = useState<string | null>(null);
  const [tempReserva, setTempReserva] = useState('');

  // Format date display (DD-MM-YYYY)
  const formattedDate = React.useMemo(() => {
    if (!currentDate) return '25-09-2026';
    const [y, m, d] = currentDate.split('-');
    return `${d}-${m}-${y}`;
  }, [currentDate]);

  // Filter products by search
  const filteredSalidas = salidasRevision.filter((row) =>
    row.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.observacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGeneral = generalInventory.filter((item) =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.comentario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredP1 = p1Inventory.filter((item) =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.comentario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredP2 = p2Inventory.filter((item) =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.comentario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditComment = (product: string, currentComment: string) => {
    setEditingCommentProduct(product);
    setTempComment(currentComment);
  };

  const saveComment = (product: string) => {
    onUpdateComment(product, tempComment);
    setEditingCommentProduct(null);
  };

  const startEditReserva = (product: string, currentReserva: string) => {
    setEditingReservaProduct(product);
    setTempReserva(currentReserva);
  };

  const saveReserva = (product: string) => {
    onUpdateReserva(product, tempReserva);
    setEditingReservaProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* DOCUMENT SHEET WRAPPER (Prints perfectly with official PDF styling and utilizes full viewport width) */}
      <div className="bg-white rounded-xl shadow-xs border border-zinc-200/90 p-4 sm:p-6 lg:p-8 w-full text-zinc-900">
        
        {/* DOCUMENT HEADER */}
        <div className="text-center pb-5 sm:pb-6 border-b border-zinc-200 mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 uppercase tracking-widest block mb-1">
            Planta 1 (MÓD) & Planta 2 (RECTA)
          </span>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 uppercase">
            CONTEO DE INVENTARIO — DEFINITIVO
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-500 mt-1.5">
            <span>Fecha oficial: <strong className="font-semibold text-zinc-800">{formattedDate}</strong></span>
            <span>·</span>
            <span>Revisión producto por producto</span>
          </div>
        </div>

        {/* 1. SECCIÓN: REVISIÓN DE SALIDAS */}
        {(activeSection === 'all' || activeSection === 'salidas') && (
          <div className="mb-8 sm:mb-10 print-avoid-break">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2.5 gap-1">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide flex flex-wrap items-center gap-2">
                  <span>Revisión de Salidas</span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    Ajustes: {formattedDate}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Conciliación de entradas, salidas y producción registradas en la fecha {formattedDate}
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {filteredSalidas.length} {filteredSalidas.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            <div className="sm:hidden text-right text-[10px] text-zinc-400 mb-1">
              <span>Desliza para ver columnas ➔</span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg touch-pan-x">
              <table className="pdf-table w-full text-xs border-collapse min-w-[680px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                    <th className="p-2.5 font-semibold text-left w-36">PRODUCTO</th>
                    <th className="p-2.5 font-semibold text-center w-20">INICIAL P1</th>
                    <th className="p-2.5 font-semibold text-center w-20">ENTRADA</th>
                    <th className="p-2.5 font-semibold text-center w-20">SALIDA</th>
                    <th className="p-2.5 font-semibold text-center w-20">INICIAL P2</th>
                    <th className="p-2.5 font-semibold text-center w-24">RESULTADO P1</th>
                    <th className="p-2.5 font-semibold text-center w-24">RESULTADO P2</th>
                    <th className="p-2.5 font-semibold text-left">OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSalidas.map((row, idx) => {
                    const isFaltante = (row.faltante && row.faltante > 0) || row.observacion.includes('Faltante no aplicado');
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-zinc-50/70 transition-colors ${
                          idx % 2 === 1 ? 'bg-zinc-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="p-2.5 font-semibold text-zinc-900">
                          {row.producto}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers text-zinc-600">
                          {row.inicialP1}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers font-medium text-emerald-700">
                          {row.entrada > 0 ? `+${row.entrada}` : row.entrada}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers font-medium text-rose-600">
                          {row.salida > 0 ? `-${row.salida}` : row.salida}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers text-zinc-600">
                          {row.inicialP2}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers font-semibold text-zinc-900 bg-zinc-50/50">
                          {row.resultadoP1}
                        </td>
                        <td className="p-2.5 text-center font-mono-numbers font-semibold text-zinc-900 bg-zinc-50/50">
                          {row.resultadoP2}
                        </td>
                        <td className="p-2.5 text-zinc-700 text-[11px] leading-snug">
                          <div className="flex items-start gap-1.5">
                            {isFaltante && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <span className={isFaltante ? 'text-amber-900 font-medium' : 'text-zinc-600'}>
                              {row.observacion}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSalidas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-400 bg-zinc-50/50">
                        <div className="max-w-md mx-auto space-y-1">
                          <p className="font-medium text-zinc-700 text-xs">
                            Sin movimientos registrados en la fecha ({formattedDate})
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            La tabla de Revisión de Salidas refleja exclusivamente las operaciones de este día.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. SECCIÓN: INVENTARIO GENERAL */}
        {(activeSection === 'all' || activeSection === 'general') && (
          <div className="mb-10 print-page-break">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                  Inventario General
                </h3>
                <span className="text-xs text-zinc-400 font-normal">Conteo definitivo consolidado</span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenStatusModal && (
                  <button
                    type="button"
                    onClick={() => onOpenStatusModal()}
                    className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-zinc-200"
                    title="Modificar observaciones o reservas"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Estados / Reservas</span>
                  </button>
                )}
                <div className="text-xs font-mono text-zinc-700 bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200/70">
                  Total: <strong className="font-semibold text-zinc-900">{grandTotal}</strong> (P1: {totalP1} · P2: {totalP2})
                </div>
              </div>
            </div>

            <div className="sm:hidden text-right text-[10px] text-zinc-400 mb-1">
              <span>Desliza para ver columnas ➔</span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg touch-pan-x">
              <table className="pdf-table w-full text-xs border-collapse min-w-[660px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                    <th className="p-2.5 font-semibold text-left w-48">PRODUCTO</th>
                    <th className="p-2.5 font-semibold text-center w-20">P1</th>
                    <th className="p-2.5 font-semibold text-center w-20">P2</th>
                    <th className="p-2.5 font-semibold text-center w-24">TOTAL GENERAL</th>
                    <th className="p-2.5 font-semibold text-left w-36">RESERVAS</th>
                    <th className="p-2.5 font-semibold text-left">COMENTARIO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredGeneral.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        idx % 2 === 1 ? 'bg-zinc-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="p-2.5 font-semibold text-zinc-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="no-print text-[10px] text-zinc-500 bg-zinc-100 font-medium px-1.5 py-0.2 rounded border border-zinc-200">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {onOpenStatusModal && (
                              <button
                                type="button"
                                onClick={() => onOpenStatusModal(item.product)}
                                className="no-print p-0.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors cursor-pointer"
                                title={`Modificar estado de ${item.product}`}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}

                            {item.isCustom && onDeleteProductCompletely && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `¿Confirmas que deseas eliminar "${item.product}" por completo del inventario?`
                                    )
                                  ) {
                                    onDeleteProductCompletely(item.product);
                                  }
                                }}
                                className="no-print p-0.5 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title={`Eliminar ${item.product}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-mono-numbers text-zinc-700">
                        {item.p1}
                      </td>
                      <td className="p-2.5 text-center font-mono-numbers text-zinc-700">
                        {item.p2}
                      </td>
                      <td className="p-2.5 text-center font-mono-numbers font-semibold bg-zinc-50/50">
                        <span className={item.total === 0 ? 'text-zinc-400' : 'text-zinc-900'}>
                          {item.total}
                        </span>
                      </td>
                      
                      {/* Editable Reservas */}
                      <td className="p-2.5 text-zinc-800 text-[11px]">
                        {editingReservaProduct === item.product ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempReserva}
                              onChange={(e) => setTempReserva(e.target.value)}
                              className="px-1.5 py-0.5 text-xs border border-zinc-900 rounded bg-white w-full focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveReserva(item.product);
                                if (e.key === 'Escape') setEditingReservaProduct(null);
                              }}
                            />
                            <button
                              onClick={() => saveReserva(item.product)}
                              className="p-1 text-zinc-900 hover:text-black cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenStatusModal ? onOpenStatusModal(item.product) : startEditReserva(item.product, item.reservas)}
                            className="cursor-pointer group flex items-center justify-between min-h-[18px]"
                            title="Click para gestionar reserva"
                          >
                            <span className={item.reservas ? 'text-zinc-800 font-medium' : 'text-zinc-300'}>
                              {item.reservas || '—'}
                            </span>
                            <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                          </div>
                        )}
                      </td>

                      {/* Editable Comentarios / Estado Físico */}
                      <td className="p-2.5 text-zinc-800 text-[11px]">
                        {editingCommentProduct === item.product ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempComment}
                              onChange={(e) => setTempComment(e.target.value)}
                              className="px-1.5 py-0.5 text-xs border border-zinc-900 rounded bg-white w-full focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveComment(item.product);
                                if (e.key === 'Escape') setEditingCommentProduct(null);
                              }}
                            />
                            <button
                              onClick={() => saveComment(item.product)}
                              className="p-1 text-zinc-900 hover:text-black cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenStatusModal ? onOpenStatusModal(item.product) : startEditComment(item.product, item.comentario)}
                            className="cursor-pointer group flex items-center justify-between min-h-[18px]"
                            title="Click para modificar nota o defecto"
                          >
                            {item.comentario ? (
                              <span className="font-medium text-amber-900 bg-amber-50/70 px-1.5 py-0.5 rounded border border-amber-200/50 inline-flex items-center gap-1">
                                {/defecto|malo|malas/i.test(item.comentario) && (
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                )}
                                <span>{item.comentario}</span>
                              </span>
                            ) : (
                              <span className="text-zinc-300">—</span>
                            )}
                            <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="bg-zinc-100/80 border-t-2 border-zinc-300 font-semibold text-zinc-900">
                    <td className="p-2.5 uppercase text-right pr-4">
                      Total Consolidado:
                    </td>
                    <td className="p-2.5 text-center font-mono-numbers">
                      {totalP1}
                    </td>
                    <td className="p-2.5 text-center font-mono-numbers">
                      {totalP2}
                    </td>
                    <td className="p-2.5 text-center font-mono-numbers font-bold text-sm bg-zinc-200/70">
                      {grandTotal}
                    </td>
                    <td className="p-2.5"></td>
                    <td className="p-2.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SECCIÓN: P1 — INVENTARIO MÓD */}
        {(activeSection === 'all' || activeSection === 'p1') && (
          <div className="mb-10 print-page-break">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                  P1 — Inventario MÓD
                </h3>
                <span className="text-xs text-zinc-400 font-normal">Conteo definitivo Planta 1</span>
              </div>
              <div className="text-xs font-mono text-zinc-700 bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200/70">
                Total P1: <strong className="font-semibold text-zinc-900">{totalP1}</strong> piezas
              </div>
            </div>

            <div className="sm:hidden text-right text-[10px] text-zinc-400 mb-1">
              <span>Desliza para ver columnas ➔</span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg touch-pan-x">
              <table className="pdf-table w-full text-xs border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                    <th className="p-2.5 font-semibold text-left w-56">PRODUCTO</th>
                    <th className="p-2.5 font-semibold text-center w-24">CANTIDAD</th>
                    <th className="p-2.5 font-semibold text-center w-24">PLANTA</th>
                    <th className="p-2.5 font-semibold text-left">COMENTARIO</th>
                    <th className="p-2.5 font-semibold text-left w-36">RESERVAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredP1.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        idx % 2 === 1 ? 'bg-zinc-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="p-2.5 font-semibold text-zinc-900">
                        {item.product}
                      </td>
                      <td className="p-2.5 text-center font-mono-numbers font-semibold">
                        <span className={item.cantidad === 0 ? 'text-zinc-400' : 'text-zinc-900'}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-medium text-zinc-500">
                        {item.planta}
                      </td>
                      <td className="p-2.5 text-zinc-700 text-[11px]">
                        {item.comentario ? (
                          <span className="text-amber-900 font-medium">{item.comentario}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-700 text-[11px]">
                        {item.reservas ? (
                          <span className="text-zinc-800 font-medium">{item.reservas}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-100/80 border-t-2 border-zinc-300 font-semibold text-zinc-900">
                    <td className="p-2.5 uppercase text-right pr-4">
                      Total P1 (MÓD):
                    </td>
                    <td className="p-2.5 text-center font-mono-numbers font-bold text-sm bg-zinc-200/70">
                      {totalP1}
                    </td>
                    <td colSpan={3} className="p-2.5 text-zinc-500 font-normal italic">
                      Verificado en patio Planta 1
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SECCIÓN: P2 — INVEN RECTA */}
        {(activeSection === 'all' || activeSection === 'p2') && (
          <div className="mb-8 print-page-break">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                  P2 — Inventario RECTA
                </h3>
                <span className="text-xs text-zinc-400 font-normal">Conteo definitivo Planta 2</span>
              </div>
              <div className="text-xs font-mono text-zinc-700 bg-zinc-100 px-3 py-1 rounded-md border border-zinc-200/70">
                Total P2: <strong className="font-semibold text-zinc-900">{totalP2}</strong> piezas
              </div>
            </div>

            <div className="sm:hidden text-right text-[10px] text-zinc-400 mb-1">
              <span>Desliza para ver columnas ➔</span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg touch-pan-x">
              <table className="pdf-table w-full text-xs border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700">
                    <th className="p-2.5 font-semibold text-left w-56">PRODUCTO</th>
                    <th className="p-2.5 font-semibold text-center w-24">CANTIDAD</th>
                    <th className="p-2.5 font-semibold text-center w-24">PLANTA</th>
                    <th className="p-2.5 font-semibold text-left">COMENTARIO</th>
                    <th className="p-2.5 font-semibold text-left w-36">RESERVAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredP2.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        idx % 2 === 1 ? 'bg-zinc-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="p-2.5 font-semibold text-zinc-900">
                        {item.product}
                      </td>
                      <td className="p-2.5 text-center font-mono-numbers font-semibold">
                        <span className={item.cantidad === 0 ? 'text-zinc-400' : 'text-zinc-900'}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-medium text-zinc-500">
                        {item.planta}
                      </td>
                      <td className="p-2.5 text-zinc-700 text-[11px]">
                        {item.comentario ? (
                          <span className="text-amber-900 font-medium">{item.comentario}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-700 text-[11px]">
                        {item.reservas ? (
                          <span className="text-zinc-800 font-medium">{item.reservas}</span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-100/80 border-t-2 border-zinc-300 font-semibold text-zinc-900">
                    <td className="p-2.5 uppercase text-right pr-4">
                      Total P2 (RECTA):
                    </td>
                    <td className="p-2.5 text-center font-mono-numbers font-bold text-sm bg-zinc-200/70">
                      {totalP2}
                    </td>
                    <td colSpan={3} className="p-2.5 text-zinc-500 font-normal italic">
                      Verificado en patio Planta 2
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER SIGNATURE & VERIFICATION */}
        <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-zinc-700">Sistema de Control de Inventario y Conciliación Física</p>
            <p className="text-zinc-400">Reporte oficial con trazabilidad de producción y salidas a obra.</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-md font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Conteo Conciliado Oficial
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
