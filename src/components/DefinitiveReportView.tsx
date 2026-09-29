import React, { useState } from 'react';
import { ProductInventoryState, SalidaRevisionRow } from '../types/inventory';
import { Search, AlertTriangle, CheckCircle2, Edit2, Check, Printer, Download, ShieldCheck, Tag, Trash2 } from 'lucide-react';

interface DefinitiveReportViewProps {
  currentDate: string;
  salidasRevision: SalidaRevisionRow[];
  generalInventory: ProductInventoryState[];
  p1Inventory: Array<{ product: string; cantidad: number; planta: 'P1'; comentario: string; reservas: string }>;
  p2Inventory: Array<{ product: string; cantidad: number; planta: 'P2'; comentario: string; reservas: string }>;
  totalP1: number;
  totalP2: number;
  grandTotal: number;
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
  onUpdateComment,
  onUpdateReserva,
  onOpenStatusModal,
  onDeleteProductCompletely,
  onPrint,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'salidas' | 'general' | 'p1' | 'p2'>('all');
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
    <div className="space-y-6">
      {/* Control bar (Hidden on Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Ver Sección:</span>
          {[
            { id: 'all', label: 'Todo el Reporte Completo (PDF)' },
            { id: 'salidas', label: '1. Revisión de Salidas' },
            { id: 'general', label: '2. Inventario General' },
            { id: 'p1', label: '3. P1 — MÓD' },
            { id: 'p2', label: '4. P2 — RECTA' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[#165a36] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs w-48 sm:w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36] focus:border-[#165a36]"
            />
          </div>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#165a36] hover:bg-[#12462a] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-200" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT SHEET WRAPPER (Prints perfectly with original PDF look) */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-300/80 p-6 md:p-10 max-w-5xl mx-auto text-slate-900">
        
        {/* DOCUMENT HEADER */}
        <div className="text-center pb-6 border-b border-slate-300 mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            CONTEO DE INVENTARIO — DEFINITIVO
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Actualización: {formattedDate} | Revisión producto por producto
          </p>
        </div>

        {/* 1. SECCIÓN: REVISIÓN DE SALIDAS */}
        {(activeSection === 'all' || activeSection === 'salidas') && (
          <div className="mb-10 print-avoid-break">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
                  <span>REVISIÓN DE SALIDAS</span>
                  <span className="text-xs font-semibold text-[#165a36] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ajustes del día: {formattedDate}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Conciliación exclusiva de entradas, salidas y producción realizadas en la fecha {formattedDate}
                </p>
              </div>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                {filteredSalidas.length} {filteredSalidas.length === 1 ? 'producto evaluado' : 'productos evaluados'}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-400">
              <table className="pdf-table w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-slate-900">
                    <th className="p-2 border border-slate-400 font-bold text-left w-32">PRODUCTO</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">INICIAL P1</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">ENTRADA</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">SALIDA</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">INICIAL P2</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">RESULTADO P1</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">RESULTADO P2</th>
                    <th className="p-2 border border-slate-400 font-bold text-left">OBSERVACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalidas.map((row, idx) => {
                    const isFaltante = (row.faltante && row.faltante > 0) || row.observacion.includes('Faltante no aplicado');
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-slate-300 hover:bg-slate-50 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                        }`}
                      >
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">
                          {row.producto}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers">
                          {row.inicialP1}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers font-semibold text-[#165a36]">
                          {row.entrada > 0 ? `+${row.entrada}` : row.entrada}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers font-semibold text-rose-700">
                          {row.salida > 0 ? `-${row.salida}` : row.salida}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers">
                          {row.inicialP2}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers font-bold bg-slate-100/50">
                          {row.resultadoP1}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono-numbers font-bold bg-slate-100/50">
                          {row.resultadoP2}
                        </td>
                        <td className="p-2 border border-slate-300 text-slate-800 text-[11px] leading-snug">
                          <div className="flex items-start gap-1.5">
                            {isFaltante && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <span className={isFaltante ? 'text-amber-900 font-bold' : 'text-slate-700'}>
                              {row.observacion}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSalidas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 bg-gray-50/60">
                        <div className="max-w-md mx-auto space-y-1">
                          <p className="font-bold text-gray-700 text-xs">
                            Sin movimientos ni ajustes en la fecha seleccionada ({formattedDate})
                          </p>
                          <p className="text-[11px] text-gray-500">
                            La tabla de Revisión de Salidas se actualiza cada día reflejando únicamente los movimientos registrados en esa fecha. Puedes agregar nuevas entradas o salidas desde "Nuevo Registro" o "Carga Rápida".
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  INVENTARIO GENERAL
                </h3>
                <span className="text-xs text-slate-500 font-medium">Conteo definitivo</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenStatusModal && (
                  <button
                    type="button"
                    onClick={() => onOpenStatusModal()}
                    className="no-print inline-flex items-center gap-1.5 px-3 py-1 bg-[#165a36] hover:bg-[#12462a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    title="Modificar observaciones físicas, defectos o clientes solicitantes de cualquier tanque o producto"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Modificar Estado / Comentarios</span>
                  </button>
                )}
                <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                  TOTAL PIEZAS EN SISTEMA: <span className="text-slate-900 font-black">{grandTotal}</span> (P1: {totalP1} | P2: {totalP2})
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-400">
              <table className="pdf-table w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-slate-900">
                    <th className="p-2 border border-slate-400 font-bold text-left w-48">PRODUCTO</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">P1</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-20">P2</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">TOTAL GENERAL</th>
                    <th className="p-2 border border-slate-400 font-bold text-left w-36">RESERVAS</th>
                    <th className="p-2 border border-slate-400 font-bold text-left">COMENTARIO</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGeneral.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`border-b border-slate-300 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span>{item.product}</span>
                            {item.isCustom && (
                              <span className="no-print text-[9px] bg-emerald-100 text-[#165a36] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                                NUEVO
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {onOpenStatusModal && (
                              <button
                                type="button"
                                onClick={() => onOpenStatusModal(item.product)}
                                className="no-print p-0.5 text-slate-400 hover:text-[#165a36] hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                title={`Modificar estado o reserva de ${item.product}`}
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
                                      `¿Confirmas que deseas eliminar "${item.product}" por completo de todo el inventario, catálogo y movimientos?`
                                    )
                                  ) {
                                    onDeleteProductCompletely(item.product);
                                  }
                                }}
                                className="no-print p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title={`Eliminar ${item.product} del inventario por completo`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono-numbers font-medium">
                        {item.p1}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono-numbers font-medium">
                        {item.p2}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono-numbers font-bold bg-slate-100/60">
                        <span className={item.total === 0 ? 'text-slate-400' : 'text-slate-900'}>
                          {item.total}
                        </span>
                      </td>
                      
                      {/* Editable Reservas */}
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {editingReservaProduct === item.product ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempReserva}
                              onChange={(e) => setTempReserva(e.target.value)}
                              className="px-1.5 py-0.5 text-xs border border-emerald-500 rounded bg-white w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveReserva(item.product);
                                if (e.key === 'Escape') setEditingReservaProduct(null);
                              }}
                            />
                            <button
                              onClick={() => saveReserva(item.product)}
                              className="p-1 text-emerald-600 hover:text-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenStatusModal ? onOpenStatusModal(item.product) : startEditReserva(item.product, item.reservas)}
                            className="cursor-pointer group flex items-center justify-between min-h-[18px]"
                            title="Click para gestionar cliente o reserva"
                          >
                            <span className={item.reservas ? 'text-indigo-900 font-semibold' : 'text-slate-300 italic'}>
                              {item.reservas || '—'}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                          </div>
                        )}
                      </td>

                      {/* Editable Comentarios / Estado Físico */}
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {editingCommentProduct === item.product ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempComment}
                              onChange={(e) => setTempComment(e.target.value)}
                              className="px-1.5 py-0.5 text-xs border border-emerald-500 rounded bg-white w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveComment(item.product);
                                if (e.key === 'Escape') setEditingCommentProduct(null);
                              }}
                            />
                            <button
                              onClick={() => saveComment(item.product)}
                              className="p-1 text-emerald-600 hover:text-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenStatusModal ? onOpenStatusModal(item.product) : startEditComment(item.product, item.comentario)}
                            className="cursor-pointer group flex items-center justify-between min-h-[18px]"
                            title="Click para modificar estado físico o defecto de este producto"
                          >
                            {item.comentario ? (
                              <span className="font-semibold text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1">
                                {/defecto|malo|malas/i.test(item.comentario) && (
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                )}
                                <span>{item.comentario}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 italic">—</span>
                            )}
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totals Row */}
                  <tr className="bg-slate-200 border-t-2 border-slate-500 font-black text-slate-900">
                    <td className="p-2 border border-slate-400 uppercase text-right pr-4">
                      TOTAL GENERAL CONSOLIDADO:
                    </td>
                    <td className="p-2 border border-slate-400 text-center font-mono-numbers">
                      {totalP1}
                    </td>
                    <td className="p-2 border border-slate-400 text-center font-mono-numbers">
                      {totalP2}
                    </td>
                    <td className="p-2 border border-slate-400 text-center font-mono-numbers text-sm bg-slate-300">
                      {grandTotal}
                    </td>
                    <td className="p-2 border border-slate-400"></td>
                    <td className="p-2 border border-slate-400"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SECCIÓN: P1 — INVENTARIO MÓD */}
        {(activeSection === 'all' || activeSection === 'p1') && (
          <div className="mb-10 print-page-break">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  P1 — INVENTARIO MÓD
                </h3>
                <span className="text-xs text-slate-500 font-medium">Conteo definitivo</span>
              </div>
              <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                TOTAL PLANTA 1: <span className="text-slate-900 font-black">{totalP1}</span> piezas
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-400">
              <table className="pdf-table w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-slate-900">
                    <th className="p-2 border border-slate-400 font-bold text-left w-56">PRODUCTO</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">CANTIDAD</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">PLANTA (P)</th>
                    <th className="p-2 border border-slate-400 font-bold text-left">COMENTARIO</th>
                    <th className="p-2 border border-slate-400 font-bold text-left w-36">RESERVAS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredP1.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`border-b border-slate-300 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">
                        {item.product}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono-numbers font-bold">
                        <span className={item.cantidad === 0 ? 'text-slate-400' : 'text-slate-900'}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-semibold text-slate-700">
                        {item.planta}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {item.comentario ? (
                          <span className="text-amber-900 font-medium">{item.comentario}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {item.reservas ? (
                          <span className="text-indigo-900 font-medium">{item.reservas}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200 border-t-2 border-slate-500 font-black text-slate-900">
                    <td className="p-2 border border-slate-400 uppercase text-right pr-4">
                      TOTAL P1 (MÓD):
                    </td>
                    <td className="p-2 border border-slate-400 text-center font-mono-numbers text-sm bg-slate-300">
                      {totalP1}
                    </td>
                    <td colSpan={3} className="p-2 border border-slate-400 text-slate-600 font-normal italic">
                      Conteo de piezas verificado en patio P1
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  P2 — INVEN RECTA
                </h3>
                <span className="text-xs text-slate-500 font-medium">Conteo definitivo</span>
              </div>
              <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                TOTAL PLANTA 2: <span className="text-slate-900 font-black">{totalP2}</span> piezas
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-400">
              <table className="pdf-table w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400 text-slate-900">
                    <th className="p-2 border border-slate-400 font-bold text-left w-56">PRODUCTO</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">CANTIDAD</th>
                    <th className="p-2 border border-slate-400 font-bold text-center w-24">PLANTA (P)</th>
                    <th className="p-2 border border-slate-400 font-bold text-left">COMENTARIO</th>
                    <th className="p-2 border border-slate-400 font-bold text-left w-36">RESERVAS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredP2.map((item, idx) => (
                    <tr
                      key={item.product}
                      className={`border-b border-slate-300 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">
                        {item.product}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono-numbers font-bold">
                        <span className={item.cantidad === 0 ? 'text-slate-400' : 'text-slate-900'}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-semibold text-slate-700">
                        {item.planta}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {item.comentario ? (
                          <span className="text-amber-900 font-medium">{item.comentario}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-800 text-[11px]">
                        {item.reservas ? (
                          <span className="text-indigo-900 font-medium">{item.reservas}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200 border-t-2 border-slate-500 font-black text-slate-900">
                    <td className="p-2 border border-slate-400 uppercase text-right pr-4">
                      TOTAL P2 (RECTA):
                    </td>
                    <td className="p-2 border border-slate-400 text-center font-mono-numbers text-sm bg-slate-300">
                      {totalP2}
                    </td>
                    <td colSpan={3} className="p-2 border border-slate-400 text-slate-600 font-normal italic">
                      Conteo de piezas verificado en patio P2
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER SIGNATURE & VERIFICATION */}
        <div className="pt-6 border-t border-slate-300 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-slate-700">Sistema de Control de Inventario y Conciliación Física</p>
            <p>Reporte generado con base al conteo definitivo y trazabilidad de movimientos diarios.</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Conteo Conciliado Oficial
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
