import React, { useState } from 'react';
import { CustomProductRecord, ClientRecord } from '../types/inventory';
import { 
  X, 
  PackagePlus, 
  Building, 
  AlertTriangle, 
  Check, 
  Trash2, 
  List, 
  Edit3, 
  Package
} from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: CustomProductRecord) => void;
  clients: ClientRecord[];
  onAddClient: (name: string, project?: string) => void;
  existingProductNames: string[];
  customProducts?: CustomProductRecord[];
  onDeleteProduct?: (productName: string) => void;
  onUpdateProductStock?: (productName: string, p1: number, p2: number) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  clients,
  onAddClient,
  existingProductNames,
  customProducts = [],
  onDeleteProduct,
  onUpdateProductStock,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [productName, setProductName] = useState('');
  const [initialP1, setInitialP1] = useState<number>(0);
  const [initialP2, setInitialP2] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [reservas, setReservas] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state for existing custom products
  const [editingProd, setEditingProd] = useState<string | null>(null);
  const [editP1, setEditP1] = useState<number>(0);
  const [editP2, setEditP2] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = productName.trim();
    if (!cleanName) {
      setErrorMsg('Debes ingresar el nombre o código del producto.');
      return;
    }

    // Check if already in system
    const alreadyExists = existingProductNames.some(
      (n) => n.toLowerCase() === cleanName.toLowerCase()
    );
    if (alreadyExists) {
      setErrorMsg(`El producto "${cleanName}" ya está registrado en el inventario.`);
      return;
    }

    onSaveProduct({
      product: cleanName,
      initialP1: Math.max(0, Number(initialP1) || 0),
      initialP2: Math.max(0, Number(initialP2) || 0),
      comentario: comentario.trim(),
      reservas: reservas.trim(),
      clienteReserva: selectedClient.trim() || undefined,
      createdAt: Date.now(),
    });

    // Reset and close
    setProductName('');
    setInitialP1(0);
    setInitialP2(0);
    setComentario('');
    setReservas('');
    setSelectedClient('');
    setErrorMsg('');
    onClose();
  };

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddClient(newClientName.trim());
    setSelectedClient(newClientName.trim());
    setNewClientName('');
    setShowNewClient(false);
  };

  const startEditProduct = (cp: CustomProductRecord) => {
    setEditingProd(cp.product);
    setEditP1(cp.initialP1 || 0);
    setEditP2(cp.initialP2 || 0);
  };

  const saveEditedStock = (prodName: string) => {
    if (onUpdateProductStock) {
      onUpdateProductStock(prodName, editP1, editP2);
    }
    setEditingProd(null);
  };

  const handleDelete = (prodName: string) => {
    if (
      window.confirm(
        `¿Confirmas que deseas eliminar "${prodName}" por completo del inventario, catálogo y movimientos? Esta acción no se puede deshacer.`
      )
    ) {
      if (onDeleteProduct) {
        onDeleteProduct(prodName);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header - Medium-dark green */}
        <div className="px-6 py-4 bg-[#165a36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg text-emerald-200">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Gestión de Catálogo de Productos
              </h3>
              <p className="text-xs text-emerald-100/80">
                Registra nuevos modelos o elimina productos incorporados del inventario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-[#165a36] text-[#165a36] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>+ Registrar Nuevo Producto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-[#165a36] text-[#165a36] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Productos Agregados ({customProducts.length})</span>
          </button>
        </div>

        {/* Tab 1: Create */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Nombre / Código del Producto o Tanque <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej: 15000TP, CISTERNA 5000, 100x100x120..."
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36] focus:border-[#165a36]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Este producto aparecerá en todas las tablas y reportes de inventario.
              </p>
            </div>

            {/* Initial Quantities P1 and P2 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Existencias Iniciales en Patio
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Planta 1 — MÓD (P1):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialP1}
                    onChange={(e) => setInitialP1(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono-numbers font-bold text-slate-800 focus:ring-2 focus:ring-[#165a36] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Planta 2 — RECTA (P2):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialP2}
                    onChange={(e) => setInitialP2(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono-numbers font-bold text-slate-800 focus:ring-2 focus:ring-[#165a36] focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-200">
                Total inicial en sistema: <span className="font-bold text-[#165a36]">{initialP1 + initialP2} piezas</span>
              </div>
            </div>

            {/* Comment / Physical State */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Observación Física / Estado de Calidad (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: 1 con fisura en borde, PISO MALO, Óptimo..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#165a36] focus:outline-none"
              />
            </div>

            {/* Client / Reserve */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#165a36] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Reserva de Cliente (Opcional):
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewClient(!showNewClient)}
                  className="text-xs text-[#165a36] hover:text-[#12462a] font-semibold cursor-pointer"
                >
                  {showNewClient ? 'Cancelar' : '+ Crear Cliente'}
                </button>
              </div>

              {showNewClient ? (
                <div className="p-2 bg-white rounded-lg border border-emerald-200 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Nombre de la nueva constructora o cliente..."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-[#165a36] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddClient}
                    className="px-3 py-1 bg-[#165a36] text-white rounded text-xs font-semibold hover:bg-[#12462a] cursor-pointer"
                  >
                    Guardar y Asignar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-[#165a36] focus:outline-none"
                  >
                    <option value="">-- Sin cliente asignado --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Detalle reserva (ej. 3 apartadas)..."
                    value={reservas}
                    onChange={(e) => setReservas(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-[#165a36] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#165a36] hover:bg-[#12462a] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Registrar e Incorporar al Inventario</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manage Registered Custom Products */}
        {activeTab === 'manage' && (
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-gray-800 text-xs mb-1">
                Catálogo de Productos Creados por el Usuario
              </h4>
              <p className="text-[11px] text-gray-500">
                Aquí puedes modificar las existencias iniciales de P1 o P2 (ej. poner en 0) o <strong>eliminar por completo</strong> del inventario cualquier producto que hayas registrado.
              </p>
            </div>

            {customProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No hay productos personalizados registrados en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {customProducts.map((cp) => (
                  <div
                    key={cp.product}
                    className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{cp.product}</span>
                        <span className="text-[9px] bg-emerald-100 text-[#165a36] font-bold px-1.5 py-0.5 rounded">
                          NUEVO
                        </span>
                      </div>
                      
                      {editingProd === cp.product ? (
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-[11px] text-gray-600">P1:</label>
                          <input
                            type="number"
                            min="0"
                            value={editP1}
                            onChange={(e) => setEditP1(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 px-1.5 py-1 text-xs border border-gray-300 rounded font-bold font-mono"
                          />
                          <label className="text-[11px] text-gray-600 ml-1">P2:</label>
                          <input
                            type="number"
                            min="0"
                            value={editP2}
                            onChange={(e) => setEditP2(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 px-1.5 py-1 text-xs border border-gray-300 rounded font-bold font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditedStock(cp.product)}
                            className="px-2.5 py-1 bg-[#165a36] text-white rounded text-xs font-bold hover:bg-[#12462a] cursor-pointer"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProd(null)}
                            className="px-2 py-1 text-gray-500 hover:text-gray-800 text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-gray-600 font-mono-numbers flex items-center gap-3">
                          <span>Inicial P1: <strong>{cp.initialP1 || 0}</strong></span>
                          <span>Inicial P2: <strong>{cp.initialP2 || 0}</strong></span>
                          <span>Total Inicial: <strong className="text-[#165a36]">{(cp.initialP1 || 0) + (cp.initialP2 || 0)}</strong> pzas</span>
                        </div>
                      )}

                      {cp.comentario && (
                        <p className="text-[11px] text-amber-800 mt-1">
                          Nota: {cp.comentario}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {editingProd !== cp.product && (
                        <button
                          type="button"
                          onClick={() => startEditProduct(cp)}
                          className="px-2.5 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                          title="Editar existencias iniciales"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Base</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(cp.product)}
                        className="px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 font-bold transition-colors cursor-pointer"
                        title="Eliminar producto por completo del inventario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar del Inventario</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-end border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
