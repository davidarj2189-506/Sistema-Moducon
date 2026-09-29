import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { DefinitiveReportView } from './components/DefinitiveReportView';
import { PlantSplitView } from './components/PlantSplitView';
import { MovementHistoryView } from './components/MovementHistoryView';
import { ClientsTrackingView } from './components/ClientsTrackingView';
import { SingleEntryModal } from './components/SingleEntryModal';
import { BatchEntryModal } from './components/BatchEntryModal';
import { ProductStatusModal } from './components/ProductStatusModal';
import { NewProductModal } from './components/NewProductModal';
import { InventoryMovement, ClientRecord, ProductStatusUpdate, CustomProductRecord } from './types/inventory';
import {
  calculateCurrentInventory,
  loadMovements,
  saveMovements,
  loadCustomComments,
  saveCustomComments,
  loadCustomReservas,
  saveCustomReservas,
  loadCustomClientsReserva,
  saveCustomClientsReserva,
  loadCustomCalidad,
  saveCustomCalidad,
  loadCustomProducts,
  saveCustomProducts,
  addOrUpdateCustomProduct,
  ensureCustomProductExists,
  loadClients,
  saveClients,
  resetToInitialBase,
  deleteProductCompletely,
  updateCustomProductInitialStock,
} from './utils/inventoryEngine';
import { exportInventoryToExcel } from './utils/excelExporter';
import { INITIAL_INVENTORY_BASE, BASE_DATE } from './data/initialInventory';

const ZERO_INIT_V3_KEY = 'concreto_inventario_zero_reset_v3_clean';

function ensureZeroInventoryState() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(ZERO_INIT_V3_KEY) !== 'done') {
    // 1. Clear movements so stock starts clean from 0
    localStorage.removeItem('concreto_inventario_movements_v1');
    // 2. Clear old demo clients
    localStorage.removeItem('concreto_inventario_clients_list_v1');
    // 3. Keep custom products names intact in memory, but set initial stock to 0
    const rawCp = localStorage.getItem('concreto_inventario_custom_products_v1');
    if (rawCp) {
      try {
        const cpList = JSON.parse(rawCp);
        if (Array.isArray(cpList)) {
          const zeroCp = cpList.map((cp: any) => ({
            ...cp,
            initialP1: 0,
            initialP2: 0,
          }));
          localStorage.setItem('concreto_inventario_custom_products_v1', JSON.stringify(zeroCp));
        }
      } catch (e) {
        // ignore
      }
    }
    localStorage.setItem(ZERO_INIT_V3_KEY, 'done');
  }
}

ensureZeroInventoryState();

export default function App() {
  const [activeTab, setActiveTab] = useState<'report' | 'plants' | 'history' | 'clients'>('report');
  const [selectedDate, setSelectedDate] = useState<string>(() => BASE_DATE);

  const [movements, setMovements] = useState<InventoryMovement[]>(() => loadMovements());
  const [customComments, setCustomComments] = useState<Record<string, string>>(() => loadCustomComments());
  const [customReservas, setCustomReservas] = useState<Record<string, string>>(() => loadCustomReservas());
  const [customClientsReserva, setCustomClientsReserva] = useState<Record<string, string>>(() => loadCustomClientsReserva());
  const [customCalidad, setCustomCalidad] = useState<Record<string, string>>(() => loadCustomCalidad());
  const [customProducts, setCustomProducts] = useState<CustomProductRecord[]>(() => loadCustomProducts());
  const [clients, setClients] = useState<ClientRecord[]>(() => loadClients());

  // Modals state
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [statusModalProduct, setStatusModalProduct] = useState<string>('1600TA');

  // Sync to storage
  useEffect(() => {
    saveMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveCustomComments(customComments);
  }, [customComments]);

  useEffect(() => {
    saveCustomReservas(customReservas);
  }, [customReservas]);

  useEffect(() => {
    saveCustomClientsReserva(customClientsReserva);
  }, [customClientsReserva]);

  useEffect(() => {
    saveCustomCalidad(customCalidad);
  }, [customCalidad]);

  useEffect(() => {
    saveCustomProducts(customProducts);
  }, [customProducts]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  // Dynamic calculations: includes custom products and daily date
  const inventoryCalc = useMemo(() => {
    return calculateCurrentInventory(
      movements,
      customComments,
      customReservas,
      customClientsReserva,
      customCalidad,
      customProducts,
      selectedDate
    );
  }, [movements, customComments, customReservas, customClientsReserva, customCalidad, customProducts, selectedDate]);

  // Existing product names for validation
  const existingProductNames = useMemo(() => {
    return inventoryCalc.generalInventory.map((p) => p.product);
  }, [inventoryCalc.generalInventory]);

  // Handlers for movements
  const handleAddMovement = (movData: Omit<InventoryMovement, 'id' | 'createdAt'>) => {
    const prodClean = movData.product.trim();
    if (!prodClean) return;

    // Check if product is new outside the catalog; if so, register it permanently
    const existsInBase = INITIAL_INVENTORY_BASE.some(
      (b) => b.product.trim().toLowerCase() === prodClean.toLowerCase()
    );
    const existsInCustom = customProducts.some(
      (cp) => cp.product.trim().toLowerCase() === prodClean.toLowerCase()
    );

    if (!existsInBase && !existsInCustom) {
      const updatedCp = ensureCustomProductExists(
        prodClean,
        movData.plant === 'AUTO' ? 'P1' : movData.plant,
        0
      );
      setCustomProducts([...updatedCp]);
    }

    // If movement specifies a client that's new, add it
    if (movData.client) {
      setClients((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === movData.client!.trim().toLowerCase());
        if (!exists) {
          const updated = [
            ...prev,
            {
              id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: movData.client!.trim(),
              projectOrSite: 'Registrado desde movimiento',
            },
          ];
          saveClients(updated);
          return updated;
        }
        return prev;
      });
    }

    const newMovement: InventoryMovement = {
      ...movData,
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  const handleApplyBatch = (batchItems: Array<Omit<InventoryMovement, 'id' | 'createdAt'>>) => {
    let updatedCp = [...customProducts];

    // Ensure all products in batch exist in the catalog
    for (const item of batchItems) {
      const prodClean = item.product.trim();
      const inBase = INITIAL_INVENTORY_BASE.some(
        (b) => b.product.trim().toLowerCase() === prodClean.toLowerCase()
      );
      const inCustom = updatedCp.some(
        (cp) => cp.product.trim().toLowerCase() === prodClean.toLowerCase()
      );
      if (!inBase && !inCustom) {
        updatedCp = ensureCustomProductExists(
          prodClean,
          item.plant === 'AUTO' ? 'P1' : item.plant,
          0
        );
      }
    }
    setCustomProducts([...updatedCp]);

    const newMovements: InventoryMovement[] = batchItems.map((item, index) => ({
      ...item,
      id: `batch_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now() + index,
    }));
    setMovements((prev) => [...newMovements, ...prev]);
  };

  const handleDeleteMovement = (id: string) => {
    setMovements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMovements = () => {
    setMovements([]);
  };

  // Direct comment & reserva quick inline updates
  const handleUpdateComment = (product: string, newComment: string) => {
    setCustomComments((prev) => ({
      ...prev,
      [product]: newComment,
    }));
  };

  const handleUpdateReserva = (product: string, newReserva: string) => {
    setCustomReservas((prev) => ({
      ...prev,
      [product]: newReserva,
    }));
  };

  // Dedicated Product / Tank Status Modal Handlers
  const handleOpenStatusModal = (productName?: string) => {
    if (productName) {
      setStatusModalProduct(productName);
    } else {
      setStatusModalProduct(inventoryCalc.generalInventory[0]?.product || '1600TA');
    }
    setIsStatusModalOpen(true);
  };

  const handleSaveStatusModal = (update: ProductStatusUpdate) => {
    setCustomComments((prev) => ({
      ...prev,
      [update.product]: update.comentario,
    }));

    setCustomReservas((prev) => ({
      ...prev,
      [update.product]: update.reservas,
    }));

    if (update.clienteReserva !== undefined) {
      setCustomClientsReserva((prev) => ({
        ...prev,
        [update.product]: update.clienteReserva || '',
      }));
    }

    if (update.estadoCalidad !== undefined) {
      setCustomCalidad((prev) => ({
        ...prev,
        [update.product]: update.estadoCalidad || '',
      }));
    }
  };

  // Save new product from NewProductModal
  const handleSaveNewProduct = (record: CustomProductRecord) => {
    const updated = addOrUpdateCustomProduct(record);
    setCustomProducts([...updated]);

    if (record.comentario) {
      setCustomComments((prev) => ({
        ...prev,
        [record.product]: record.comentario!,
      }));
    }
    if (record.reservas) {
      setCustomReservas((prev) => ({
        ...prev,
        [record.product]: record.reservas!,
      }));
    }
    if (record.clienteReserva) {
      setCustomClientsReserva((prev) => ({
        ...prev,
        [record.product]: record.clienteReserva!,
      }));
    }
  };

  // Register new product on-the-fly from SingleEntryModal
  const handleRegisterNewProductOnTheFly = (productName: string, plant?: 'P1' | 'P2', qty = 0) => {
    const updated = ensureCustomProductExists(productName, plant, qty);
    setCustomProducts([...updated]);
  };

  // Complete removal of a product from the inventory and all its records
  const handleDeleteProductCompletely = (productName: string) => {
    const { customProducts: updatedCp, remainingMovements: remainingMovs } = deleteProductCompletely(productName);
    setCustomProducts([...updatedCp]);
    setMovements([...remainingMovs]);
    setCustomComments((prev) => {
      const copy = { ...prev };
      delete copy[productName];
      return copy;
    });
    setCustomReservas((prev) => {
      const copy = { ...prev };
      delete copy[productName];
      return copy;
    });
    setCustomClientsReserva((prev) => {
      const copy = { ...prev };
      delete copy[productName];
      return copy;
    });
    setCustomCalidad((prev) => {
      const copy = { ...prev };
      delete copy[productName];
      return copy;
    });
  };

  // Update initial baseline stock of a custom product
  const handleUpdateCustomProductStock = (productName: string, p1: number, p2: number) => {
    const updated = updateCustomProductInitialStock(productName, p1, p2);
    setCustomProducts([...updated]);
  };

  // Client Management Handlers
  const handleAddClient = (name: string, project?: string, phone?: string, contact?: string) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) return prev;
      const updated = [
        ...prev,
        {
          id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: name.trim(),
          projectOrSite: project,
          phone,
          contact,
        },
      ];
      saveClients(updated);
      return updated;
    });
  };

  const handleOpenSingleEntryForClient = (clientName: string) => {
    setIsSingleModalOpen(true);
  };

  const handleQuickAdjust = (product: string, plant: 'P1' | 'P2', delta: number) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    handleAddMovement({
      date: selectedDate,
      time,
      product,
      type: delta > 0 ? 'ENTRADA' : 'SALIDA',
      plant,
      quantity: Math.abs(delta),
      reference: 'Ajuste rápido de patio',
      comment: undefined,
    });
  };

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Synchronize and update all inventories taking the new movements as reference
  const handleResetOrSyncInventory = () => {
    // 1. Force state persistence to localStorage
    saveMovements(movements);
    saveCustomProducts(customProducts);
    saveCustomComments(customComments);
    saveCustomReservas(customReservas);
    saveCustomClientsReserva(customClientsReserva);
    saveCustomCalidad(customCalidad);
    saveClients(clients);

    // 2. Force fresh re-calculation across all views
    setMovements((prev) => [...prev]);
    setCustomProducts((prev) => [...prev]);

    // 3. Show confirmation feedback
    setSyncFeedback('✅ Todos los inventarios de Planta 1 (MÓD), Planta 2 (RECTA) y General han sido recalculados y actualizados tomando de referencia los últimos movimientos.');
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportInventoryToExcel(
      selectedDate,
      inventoryCalc.salidasRevision,
      inventoryCalc.generalInventory,
      inventoryCalc.p1Inventory,
      inventoryCalc.p2Inventory,
      inventoryCalc.totalP1,
      inventoryCalc.totalP2,
      inventoryCalc.grandTotal
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans selection:bg-[#165a36] selection:text-white">
      {/* Header & Navigation - Medium dark green */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSingleEntry={() => setIsSingleModalOpen(true)}
        onOpenBatchEntry={() => setIsBatchModalOpen(true)}
        onOpenStatusModal={() => handleOpenStatusModal()}
        onOpenNewProduct={() => setIsNewProductModalOpen(true)}
        onPrint={handlePrint}
        onExportExcel={handleExportExcel}
        onReset={handleResetOrSyncInventory}
        totalPieces={inventoryCalc.grandTotal}
        totalMovements={movements.length}
        totalClients={clients.length}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Sync Feedback Toast Banner */}
        {syncFeedback && (
          <div className="p-3.5 bg-emerald-50 border border-[#165a36] text-[#165a36] rounded-xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#165a36] shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-emerald-800 hover:text-emerald-950 font-bold px-2 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <KpiSummaryCards
          totalPieces={inventoryCalc.grandTotal}
          totalP1={inventoryCalc.totalP1}
          totalP2={inventoryCalc.totalP2}
          movements={movements}
          generalInventory={inventoryCalc.generalInventory}
          totalFaltantes={inventoryCalc.totalFaltantes}
        />

        {/* Dynamic Tab Content */}
        {activeTab === 'report' && (
          <DefinitiveReportView
            currentDate={selectedDate}
            salidasRevision={inventoryCalc.salidasRevision}
            generalInventory={inventoryCalc.generalInventory}
            p1Inventory={inventoryCalc.p1Inventory}
            p2Inventory={inventoryCalc.p2Inventory}
            totalP1={inventoryCalc.totalP1}
            totalP2={inventoryCalc.totalP2}
            grandTotal={inventoryCalc.grandTotal}
            onUpdateComment={handleUpdateComment}
            onUpdateReserva={handleUpdateReserva}
            onOpenStatusModal={handleOpenStatusModal}
            onDeleteProductCompletely={handleDeleteProductCompletely}
            onPrint={handlePrint}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'plants' && (
          <PlantSplitView
            generalInventory={inventoryCalc.generalInventory}
            totalP1={inventoryCalc.totalP1}
            totalP2={inventoryCalc.totalP2}
            onQuickAdjust={handleQuickAdjust}
            onOpenStatusModal={handleOpenStatusModal}
          />
        )}

        {activeTab === 'history' && (
          <MovementHistoryView
            movements={movements}
            clients={clients}
            onDeleteMovement={handleDeleteMovement}
            onClearAllMovements={handleClearAllMovements}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsTrackingView
            clients={clients}
            movements={movements}
            generalInventory={inventoryCalc.generalInventory}
            onAddClient={handleAddClient}
            onOpenStatusModal={handleOpenStatusModal}
            onOpenSingleEntryForClient={handleOpenSingleEntryForClient}
          />
        )}

      </main>

      {/* Modals */}
      <SingleEntryModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onAddMovement={handleAddMovement}
        products={inventoryCalc.generalInventory}
        currentDate={selectedDate}
        clients={clients}
        movements={movements}
        onAddClient={handleAddClient}
        onRegisterNewProduct={handleRegisterNewProductOnTheFly}
      />

      <BatchEntryModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onApplyBatch={handleApplyBatch}
        currentDate={selectedDate}
        clients={clients}
      />

      <ProductStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        products={inventoryCalc.generalInventory}
        selectedProductInitial={statusModalProduct}
        clients={clients}
        onSaveStatus={handleSaveStatusModal}
        onAddClient={handleAddClient}
        onDeleteProductCompletely={handleDeleteProductCompletely}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSaveProduct={handleSaveNewProduct}
        clients={clients}
        onAddClient={handleAddClient}
        existingProductNames={existingProductNames}
        customProducts={customProducts}
        onDeleteProduct={handleDeleteProductCompletely}
        onUpdateProductStock={handleUpdateCustomProductStock}
      />

      {/* Footer (Hidden on print) - White with light gray border */}
      <footer className="no-print bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-gray-700">Sistema de Control de Inventario • Prefabricados en Concreto</span>
          <span>Base Oficial: 25-09-2026 • Planta 1 (MÓD) &amp; Planta 2 (RECTA) • Catálogo Dinámico &amp; Trazabilidad</span>
        </div>
      </footer>
    </div>
  );
}
