import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InventoryMovement, MovementType, ProductInventoryState, ClientRecord } from '../types/inventory';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw, 
  Check, 
  Building, 
  UserPlus, 
  PackagePlus, 
  AlertTriangle 
} from 'lucide-react';

interface SingleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovement: (movement: Omit<InventoryMovement, 'id' | 'createdAt'>) => void;
  products: ProductInventoryState[];
  currentDate: string;
  clients: ClientRecord[];
  movements?: InventoryMovement[];
  onAddClient: (name: string, project?: string) => void;
  onRegisterNewProduct?: (productName: string, plant?: 'P1' | 'P2', qty?: number) => void;
}

export const SingleEntryModal: React.FC<SingleEntryModalProps> = ({
  isOpen,
  onClose,
  onAddMovement,
  products,
  currentDate,
  clients,
  movements = [],
  onAddClient,
  onRegisterNewProduct,
}) => {
  const [productInput, setProductInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<MovementType>('ENTRADA');
  const [plant, setPlant] = useState<'P1' | 'P2'>('P1');
  const [destPlant, setDestPlant] = useState<'P1' | 'P2'>('P2');
  const [quantity, setQuantity] = useState<number>(1);
  const [reference, setReference] = useState('');
  const [client, setClient] = useState('');
  const [showAllClientsInSalida, setShowAllClientsInSalida] = useState(false);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientProject, setNewClientProject] = useState('');
  const [comment, setComment] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Reset or preset input when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!productInput && products.length > 0) {
        setProductInput(products[0].product);
      }
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products: ONLY show products that resemble what the user is typing
  const matchingProducts = useMemo(() => {
    const term = productInput.trim().toLowerCase();
    if (!term) return products.slice(0, 15);
    return products.filter((p) => p.product.toLowerCase().includes(term));
  }, [products, productInput]);

  // Check if typed product exactly matches an existing product in the catalog
  const exactMatchedProduct = useMemo(() => {
    const term = productInput.trim().toLowerCase();
    if (!term) return null;
    return products.find((p) => p.product.toLowerCase() === term) || null;
  }, [products, productInput]);

  const isBrandNewProduct = useMemo(() => {
    const term = productInput.trim();
    if (!term) return false;
    return !exactMatchedProduct;
  }, [productInput, exactMatchedProduct]);

  // Current stock info of the selected or typed product
  const currentStock = useMemo(() => {
    if (exactMatchedProduct) {
      return {
        p1: exactMatchedProduct.p1,
        p2: exactMatchedProduct.p2,
        total: exactMatchedProduct.total,
        comentario: exactMatchedProduct.comentario,
      };
    }
    return { p1: 0, p2: 0, total: 0, comentario: '' };
  }, [exactMatchedProduct]);

  // Intelligent auto-selection of active plant based on stock
  useEffect(() => {
    if (exactMatchedProduct) {
      if (exactMatchedProduct.p2 > 0 && exactMatchedProduct.p1 === 0) {
        setPlant('P2');
        setDestPlant('P1');
      } else if (exactMatchedProduct.p1 > 0 && exactMatchedProduct.p2 === 0) {
        setPlant('P1');
        setDestPlant('P2');
      }
    }
  }, [exactMatchedProduct]);

  // Filter clients specifically associated with the selected product
  const relatedClientsForSelectedProduct = useMemo(() => {
    if (!productInput.trim()) return [];
    const prodClean = productInput.trim().toLowerCase();
    const relatedSet = new Set<string>();

    // 1. From exact product's reservation client field
    if (exactMatchedProduct?.clienteReserva && exactMatchedProduct.clienteReserva.trim()) {
      relatedSet.add(exactMatchedProduct.clienteReserva.trim());
    }

    // 2. From product's text reservations matching known client names
    if (exactMatchedProduct?.reservas) {
      const resText = exactMatchedProduct.reservas.toLowerCase();
      for (const cl of clients) {
        if (resText.includes(cl.name.toLowerCase())) {
          relatedSet.add(cl.name);
        }
      }
    }

    // 3. From prior movements of this product
    for (const m of movements) {
      if (m.product.trim().toLowerCase() === prodClean && m.client && m.client.trim()) {
        relatedSet.add(m.client.trim());
      }
    }

    return Array.from(relatedSet);
  }, [productInput, exactMatchedProduct, clients, movements]);

  // When switching product or operation, default to related client if exactly one exists
  useEffect(() => {
    if (type === 'SALIDA') {
      if (relatedClientsForSelectedProduct.length === 1) {
        setClient(relatedClientsForSelectedProduct[0]);
      } else if (!relatedClientsForSelectedProduct.includes(client)) {
        setClient('');
      }
      setShowAllClientsInSalida(false);
    }
  }, [productInput, type, relatedClientsForSelectedProduct]);

  if (!isOpen) return null;

  const handleSelectProduct = (prodName: string) => {
    setProductInput(prodName);
    setIsDropdownOpen(false);
    const found = products.find((p) => p.product.toLowerCase() === prodName.trim().toLowerCase());
    if (found) {
      if (found.p2 > 0 && found.p1 === 0) {
        setPlant('P2');
        setDestPlant('P1');
      } else if (found.p1 > 0 && found.p2 === 0) {
        setPlant('P1');
        setDestPlant('P2');
      }
    }
  };

  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddClient(newClientName.trim(), newClientProject.trim() || undefined);
    setClient(newClientName.trim());
    setNewClientName('');
    setNewClientProject('');
    setShowAddClientForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct = productInput.trim();
    if (!finalProduct) return;
    if (quantity <= 0) return;

    // If it's a new product outside the catalog, ensure it gets permanently registered with 0 base
    if (isBrandNewProduct && onRegisterNewProduct) {
      onRegisterNewProduct(finalProduct, plant, 0);
    }

    let defaultRef = 'Producción diaria';
    if (type === 'SALIDA') defaultRef = 'Entrega a obra';
    if (type === 'TRASPASO') defaultRef = `Traspaso interno de ${plant} a ${destPlant}`;

    onAddMovement({
      date: currentDate,
      time,
      product: finalProduct,
      type,
      plant,
      destPlant: type === 'TRASPASO' ? destPlant : undefined,
      quantity,
      reference: reference.trim() || defaultRef,
      client: type === 'TRASPASO' ? undefined : (client.trim() || undefined),
      comment: comment.trim() || undefined,
    });

    // Reset and close
    setQuantity(1);
    setReference('');
    setClient('');
    setComment('');
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/30 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200/90 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Minimalist */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 leading-tight">
              {type === 'ENTRADA' && 'Registrar Producción (Entrada)'}
              {type === 'SALIDA' && 'Registrar Salida a Obra'}
              {type === 'TRASPASO' && 'Traspaso Interno (P1 ⇄ P2)'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {type === 'ENTRADA' && `Incrementará las existencias de ${plant}`}
              {type === 'SALIDA' && `Descontará del inventario de ${plant}`}
              {type === 'TRASPASO' && `Reubicación de ${plant} a ${destPlant}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Movement Type Toggle */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-3 gap-2 bg-zinc-100 p-1 rounded-lg border border-zinc-200/60">
              <button
                type="button"
                onClick={() => setType('ENTRADA')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  type === 'ENTRADA'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => setType('SALIDA')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  type === 'SALIDA'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Salida</span>
              </button>

              <button
                type="button"
                onClick={() => setType('TRASPASO')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  type === 'TRASPASO'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                <span>Traspaso</span>
              </button>
            </div>
          </div>

          {/* Interactive Product Combobox / Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                Producto o Tanque en Concreto <span className="text-rose-500">*</span>
              </label>
              {isBrandNewProduct && productInput.trim().length > 0 && (
                <span className="text-[11px] font-bold text-[#165a36] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ★ Producto nuevo a incorporar
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder="Escribe el nombre del producto (ej. 1600TA, CISTERNA 5000)..."
                value={productInput}
                onChange={(e) => {
                  setProductInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36] focus:border-[#165a36]"
              />
            </div>

            {/* Live Autocomplete Suggestions */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl max-h-56 overflow-y-auto z-40 divide-y divide-gray-100 text-xs">
                {matchingProducts.length > 0 ? (
                  matchingProducts.map((p) => (
                    <div
                      key={p.product}
                      onClick={() => handleSelectProduct(p.product)}
                      className="p-2.5 hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{p.product}</span>
                        {p.comentario && (
                          <span className="ml-2 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                            {p.comentario}
                          </span>
                        )}
                        {p.isCustom && (
                          <span className="ml-1 text-[9px] bg-emerald-100 text-[#165a36] font-bold px-1 rounded">
                            NUEVO
                          </span>
                        )}
                      </div>
                      <div className="text-right text-[11px] font-mono-numbers text-gray-500">
                        P1: <strong className="text-gray-800">{p.p1}</strong> | P2: <strong className="text-gray-800">{p.p2}</strong> | Total: <strong className="text-[#165a36]">{p.total}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500 text-xs">
                    No hay productos registrados que coincidan con "{productInput.trim()}".
                  </div>
                )}

                {isBrandNewProduct && productInput.trim().length > 0 && (
                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-2.5 bg-emerald-50 text-[#165a36] font-bold hover:bg-emerald-100 cursor-pointer flex items-center gap-2"
                  >
                    <PackagePlus className="w-4 h-4 shrink-0" />
                    <span>Registrar "{productInput.trim()}" como nuevo producto en inventario</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Stock Indicator */}
            <div className="mt-2 text-xs">
              {exactMatchedProduct ? (
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="text-gray-700 font-medium">
                    Existencia actual en patio:
                  </div>
                  <div className="font-mono-numbers text-xs font-semibold text-gray-800">
                    <span className={exactMatchedProduct.p1 > 0 ? 'text-[#165a36] font-bold' : 'text-gray-400'}>
                      P1: {exactMatchedProduct.p1}
                    </span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className={exactMatchedProduct.p2 > 0 ? 'text-[#14532d] font-bold' : 'text-gray-400'}>
                      P2: {exactMatchedProduct.p2}
                    </span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className="text-gray-900 font-bold">
                      Total: {exactMatchedProduct.total} pzas
                    </span>
                  </div>
                </div>
              ) : isBrandNewProduct && productInput.trim().length > 0 ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[#165a36] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#165a36] shrink-0" />
                  <span>
                    Este producto es nuevo y se incorporará al catálogo al guardar la operación.
                  </span>
                </div>
              ) : null}

              {/* Warning if SALIDA requested on a plant with 0 stock */}
              {type === 'SALIDA' && exactMatchedProduct && (
                (plant === 'P1' && currentStock.p1 <= 0) ||
                (plant === 'P2' && currentStock.p2 <= 0)
              ) && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Aviso: Actualmente hay 0 piezas de este producto en {plant === 'P1' ? 'Planta 1 (MÓD)' : 'Planta 2 (RECTA)'}.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration for TRASPASO vs ENTRADA/SALIDA */}
          {type === 'TRASPASO' ? (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-300/80 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#165a36] uppercase tracking-wide">
                <RefreshCw className="w-4 h-4" />
                <span>Configuración del Traspaso Interno (P1 ⇄ P2)</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">
                Mueve unidades entre patios por motivos de almacenamiento. El conteo total de la empresa no se reduce.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Origin Plant */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Planta de Origen (Sale):
                  </label>
                  <select
                    value={plant}
                    onChange={(e) => {
                      const newOrig = e.target.value as 'P1' | 'P2';
                      setPlant(newOrig);
                      setDestPlant(newOrig === 'P1' ? 'P2' : 'P1');
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                  >
                    <option value="P1">Planta 1 — MÓD (Stock: {currentStock.p1})</option>
                    <option value="P2">Planta 2 — RECTA (Stock: {currentStock.p2})</option>
                  </select>
                </div>

                {/* Destination Plant */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Planta de Destino (Llega):
                  </label>
                  <select
                    value={destPlant}
                    onChange={(e) => {
                      const newDest = e.target.value as 'P1' | 'P2';
                      setDestPlant(newDest);
                      setPlant(newDest === 'P1' ? 'P2' : 'P1');
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                  >
                    <option value="P2">Planta 2 — RECTA (Stock: {currentStock.p2})</option>
                    <option value="P1">Planta 1 — MÓD (Stock: {currentStock.p1})</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Cantidad a traspasar (Piezas) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-bold font-mono-numbers text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                />
              </div>

              {/* Projection preview */}
              {exactMatchedProduct && (
                <div className="p-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono-numbers flex items-center justify-between text-gray-700">
                  <span>
                    {plant}: {plant === 'P1' ? currentStock.p1 : currentStock.p2} ➔{' '}
                    <strong className="text-rose-700">
                      {Math.max(0, (plant === 'P1' ? currentStock.p1 : currentStock.p2) - quantity)}
                    </strong>
                  </span>
                  <span className="text-gray-400">➔</span>
                  <span>
                    {destPlant}: {destPlant === 'P1' ? currentStock.p1 : currentStock.p2} ➔{' '}
                    <strong className="text-[#165a36]">
                      {(destPlant === 'P1' ? currentStock.p1 : currentStock.p2) + quantity}
                    </strong>
                  </span>
                  <span className="font-bold text-gray-900">
                    Total: {currentStock.total} pzas
                  </span>
                </div>
              )}

              {/* Insufficient origin stock warning */}
              {exactMatchedProduct && (
                (plant === 'P1' && currentStock.p1 < quantity) ||
                (plant === 'P2' && currentStock.p2 < quantity)
              ) && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Atención: En {plant} solo hay disponibles {plant === 'P1' ? currentStock.p1 : currentStock.p2} pieza(s).
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Plant & Quantity for ENTRADA or SALIDA */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  {type === 'SALIDA' ? 'Planta de Salida / Despacho' : 'Planta de Entrada / Producción'} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlant('P1')}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      plant === 'P1'
                        ? 'bg-emerald-50 border-[#165a36] text-[#165a36] ring-2 ring-[#165a36]/20 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>Planta 1 (MÓD)</span>
                    <span className="text-[10px] text-gray-500 font-mono-numbers mt-0.5">
                      Stock: <strong className={currentStock.p1 > 0 ? 'text-[#165a36]' : 'text-gray-400'}>{currentStock.p1}</strong>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlant('P2')}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      plant === 'P2'
                        ? 'bg-emerald-50 border-[#165a36] text-[#165a36] ring-2 ring-[#165a36]/20 shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>Planta 2 (RECTA)</span>
                    <span className="text-[10px] text-gray-500 font-mono-numbers mt-0.5">
                      Stock: <strong className={currentStock.p2 > 0 ? 'text-[#14532d]' : 'text-gray-400'}>{currentStock.p2}</strong>
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                  Cantidad (Piezas) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-bold font-mono-numbers text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                />
              </div>
            </div>
          )}

          {/* Client / Customer Tracking (Only relevant for Salida or Entrada, hidden for internal Traspaso) */}
          {type !== 'TRASPASO' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#165a36]" />
                  {type === 'SALIDA' ? 'Cliente Solicitante / Destino (Opcional):' : 'Cliente o Pedido Destino (Opcional):'}
                </label>

                <div className="flex items-center gap-2">
                  {type === 'SALIDA' && relatedClientsForSelectedProduct.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllClientsInSalida(!showAllClientsInSalida)}
                      className="text-xs text-[#165a36] hover:underline font-bold cursor-pointer"
                    >
                      {showAllClientsInSalida ? `Solo asignados (${relatedClientsForSelectedProduct.length})` : `Ver catálogo completo (${clients.length})`}
                    </button>
                  )}

                  {type === 'ENTRADA' && (
                    <button
                      type="button"
                      onClick={() => setShowAddClientForm(!showAddClientForm)}
                      className="text-xs text-[#165a36] hover:text-[#12462a] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      {showAddClientForm ? 'Cancelar' : '+ Nuevo Cliente'}
                    </button>
                  )}
                </div>
              </div>

              {type === 'SALIDA' && relatedClientsForSelectedProduct.length > 0 && !showAllClientsInSalida && (
                <div className="text-[11px] text-[#165a36] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                  Mostrando únicamente los <strong>{relatedClientsForSelectedProduct.length}</strong> cliente(s) vinculados a <strong>{productInput.trim()}</strong>. Puedes retirar sin cliente si es innecesario.
                </div>
              )}

              {showAddClientForm ? (
                <div className="p-2.5 bg-white rounded-lg border border-gray-300 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del cliente o constructora..."
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
                    />
                    <input
                      type="text"
                      placeholder="Obra / Proyecto (opcional)..."
                      value={newClientProject}
                      onChange={(e) => setNewClientProject(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCreateQuickClient}
                      className="px-3 py-1 bg-[#165a36] hover:bg-[#12462a] text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Guardar Cliente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#165a36]"
                  >
                    <option value="">
                      {type === 'SALIDA'
                        ? '-- Sin cliente / Salida libre de patio (Sin asignar) --'
                        : '-- Sin cliente / Producción para inventario general --'}
                    </option>

                    {type === 'SALIDA' && relatedClientsForSelectedProduct.length > 0 && !showAllClientsInSalida ? (
                      relatedClientsForSelectedProduct.map((cName) => (
                        <option key={cName} value={cName}>
                          🎯 {cName} (Asignado a este producto)
                        </option>
                      ))
                    ) : (
                      clients.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.projectOrSite ? `(${c.projectOrSite})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Reference & Comment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Referencia / Remisión:
              </label>
              <input
                type="text"
                placeholder={
                  type === 'ENTRADA'
                    ? 'Ej. Producción Lote A'
                    : type === 'SALIDA'
                    ? 'Ej. Remisión #4023'
                    : `Traspaso interno ${plant} a ${destPlant}`
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Observación Física / Motivo:
              </label>
              <input
                type="text"
                placeholder={type === 'TRASPASO' ? 'Ej. Cambio por almacenamiento' : 'Ej. Óptimo, 1 piso malo...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {type === 'ENTRADA' && 'Confirmar Entrada'}
                {type === 'SALIDA' && 'Confirmar Salida'}
                {type === 'TRASPASO' && `Confirmar Traspaso a ${destPlant}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
