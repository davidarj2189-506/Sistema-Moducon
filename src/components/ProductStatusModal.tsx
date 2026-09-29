import React, { useState, useEffect, useMemo } from 'react';
import { ProductInventoryState, ClientRecord } from '../types/inventory';
import { 
  X, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Building, 
  Tag, 
  Search, 
  Filter, 
  Clock, 
  Trash2, 
  Plus, 
  Layers
} from 'lucide-react';

interface ProductStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductInventoryState[];
  selectedProductInitial?: string;
  clients: ClientRecord[];
  onSaveStatus: (update: {
    product: string;
    comentario: string;
    reservas: string;
    clienteReserva?: string;
    estadoCalidad?: string;
  }) => void;
  onAddClient: (name: string, project?: string) => void;
  onDeleteProductCompletely?: (productName: string) => void;
}

const COMMON_STATUS_PRESETS = [
  { label: 'Óptimo / Conforme', comment: '', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { label: 'Una tiene un defecto interior', comment: 'Una tiene un defecto interior', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { label: '1 piso malo', comment: '1 piso malo', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { label: 'PISO MALO', comment: 'PISO MALO', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
  { label: '2 malas', comment: '2 malas', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
  { label: 'Fisura superficial / Reparable', comment: 'Fisura superficial en borde', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { label: 'En proceso de fraguado / No despachar', comment: 'En curado - No despachar', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
];

export const ProductStatusModal: React.FC<ProductStatusModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductInitial,
  clients,
  onSaveStatus,
  onAddClient,
  onDeleteProductCompletely,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TANQUES' | 'WITH_COMMENT' | 'WITH_RESERVA'>('ALL');
  
  const [comment, setComment] = useState('');
  const [reservas, setReservas] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientProject, setNewClientProject] = useState('');
  const [showAddNewClient, setShowAddNewClient] = useState(false);
  const [qualityPreset, setQualityPreset] = useState('');

  // Sync initial product when opened or changed
  useEffect(() => {
    if (isOpen) {
      const targetProd = selectedProductInitial || (products[0]?.product ?? '');
      setSelectedProduct(targetProd);
      syncFormData(targetProd);
    }
  }, [isOpen, selectedProductInitial, products]);

  const syncFormData = (prodName: string) => {
    const prod = products.find((p) => p.product.toLowerCase() === prodName.toLowerCase());
    if (prod) {
      setComment(prod.comentario || '');
      setReservas(prod.reservas || '');
      setSelectedClient(prod.clienteReserva || '');
      setQualityPreset(prod.estadoCalidad || '');
    } else {
      setComment('');
      setReservas('');
      setSelectedClient('');
      setQualityPreset('');
    }
  };

  const handleSelectProductChange = (prodName: string) => {
    setSelectedProduct(prodName);
    syncFormData(prodName);
  };

  // Filtered product list for quick selector
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.product.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.comentario.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.reservas.toLowerCase().includes(searchFilter.toLowerCase());

      if (!matchSearch) return false;

      if (categoryFilter === 'TANQUES') {
        const isTanque = /TA|TS|TG|PT|poso/i.test(p.product);
        return isTanque;
      }
      if (categoryFilter === 'WITH_COMMENT') {
        return !!p.comentario && p.comentario.trim().length > 0;
      }
      if (categoryFilter === 'WITH_RESERVA') {
        return !!p.reservas && p.reservas.trim().length > 0;
      }
      return true;
    });
  }, [products, searchFilter, categoryFilter]);

  const currentProductData = useMemo(() => {
    return products.find((p) => p.product === selectedProduct);
  }, [products, selectedProduct]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetComment: string, presetLabel: string) => {
    setComment(presetComment);
    setQualityPreset(presetLabel);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddClient(newClientName.trim(), newClientProject.trim() || undefined);
    setSelectedClient(newClientName.trim());
    if (!reservas) {
      setReservas(`Solicitado por ${newClientName.trim()}`);
    }
    setNewClientName('');
    setNewClientProject('');
    setShowAddNewClient(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onSaveStatus({
      product: selectedProduct,
      comentario: comment.trim(),
      reservas: reservas.trim(),
      clienteReserva: selectedClient.trim() || undefined,
      estadoCalidad: qualityPreset || undefined,
    });

    onClose();
  };

  const handleClearComment = () => {
    setComment('');
    setQualityPreset('Óptimo / Conforme');
  };

  const handleClearReserva = () => {
    setReservas('');
    setSelectedClient('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/30 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 leading-tight">
              Estados, Defectos y Reservas
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Actualiza las observaciones físicas de patio o asigna reservas por cliente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Section 1: Selector of Tank / Product */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                1. Seleccionar Producto o Tanque:
              </label>
              <span className="text-xs text-slate-500">
                {products.length} productos en catálogo
              </span>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('TANQUES')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  categoryFilter === 'TANQUES'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Sólo Tanques y Posos
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('WITH_COMMENT')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  categoryFilter === 'WITH_COMMENT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Con Observaciones / Defectos ({products.filter(p => p.comentario).length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('WITH_RESERVA')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  categoryFilter === 'WITH_RESERVA'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Con Reservas ({products.filter(p => p.reservas).length})
              </button>
            </div>

            {/* Product Picker & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar tanque o código (ej. 2400TA)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <select
                value={selectedProduct}
                onChange={(e) => handleSelectProductChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {filteredProducts.map((p) => (
                  <option key={p.product} value={p.product}>
                    {p.product} — [P1: {p.p1} | P2: {p.p2} | Total: {p.total}] {p.comentario ? `⚠️ (${p.comentario})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Status & Stock Summary Pill */}
            {currentProductData && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{currentProductData.product}</span>
                  <div className="flex items-center gap-3 text-slate-600 mt-0.5">
                    <span>Existencia P1 (MÓD): <strong className="text-slate-900">{currentProductData.p1}</strong></span>
                    <span>Existencia P2 (RECTA): <strong className="text-slate-900">{currentProductData.p2}</strong></span>
                    <span>Total en Patio: <strong className="text-emerald-700">{currentProductData.total}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  {currentProductData.comentario ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {currentProductData.comentario}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Sin defectos registrados
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Physical State / Comment */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                2. Estado Físico / Observación de Calidad:
              </label>
              {comment && (
                <button
                  type="button"
                  onClick={handleClearComment}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpiar estado/comentario
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_STATUS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset.comment, preset.label)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                    comment === preset.comment
                      ? 'ring-2 ring-slate-900 bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Freeform Comment Input */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Escribe la observación física exacta (ej. 'Una tiene un defecto interior', '1 piso malo', '2 malas')..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Este texto aparecerá directamente en la columna <strong>COMENTARIO</strong> del reporte oficial del conteo definitivo y en las hojas de P1 y P2.
              </p>
            </div>
          </div>

          {/* Section 3: Client Tracking & Reservations */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                3. Clientes Solicitantes y Reservas:
              </label>
              {reservas && (
                <button
                  type="button"
                  onClick={handleClearReserva}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3 h-3" />
                  Liberar reserva
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Existing Client */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cliente o Constructora Solicitante:
                </label>
                <div className="space-y-1">
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedClient(val);
                      if (val && !reservas) {
                        setReservas(`Apartado para ${val}`);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">-- Sin cliente asignado --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.projectOrSite ? `(${c.projectOrSite})` : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowAddNewClient(!showAddNewClient)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {showAddNewClient ? 'Cancelar nuevo cliente' : 'Registrar nuevo cliente'}
                  </button>
                </div>
              </div>

              {/* Reservation text */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Detalle en Columna RESERVAS:
                </label>
                <input
                  type="text"
                  placeholder="ej. 2 unds para Obra Álamos, Pedido #32"
                  value={reservas}
                  onChange={(e) => setReservas(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Quick Add Client Subform */}
            {showAddNewClient && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 mt-2">
                <span className="text-xs font-bold text-indigo-900 block">
                  Registrar Nuevo Cliente / Destino:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre de Constructora / Cliente..."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  <input
                    type="text"
                    placeholder="Obra, Proyecto o Contacto (Opcional)..."
                    value={newClientProject}
                    onChange={(e) => setNewClientProject(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateClient}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Agregar y Seleccionar Cliente
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {currentProductData?.isCustom && onDeleteProductCompletely && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Confirmas que deseas eliminar "${selectedProduct}" por completo de todo el inventario, catálogo y movimientos?`
                    )
                  ) {
                    onDeleteProductCompletely(selectedProduct);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Eliminar producto por completo del catálogo e inventario"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar del Catálogo</span>
              </button>
            )}

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Los comentarios no alteran el conteo físico.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
