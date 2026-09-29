import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Printer, 
  RotateCcw, 
  Download, 
  Layers, 
  History, 
  ClipboardPaste,
  Building2,
  Calendar,
  ShieldCheck,
  Building,
  PackagePlus
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'report' | 'plants' | 'history' | 'clients';
  setActiveTab: (tab: 'report' | 'plants' | 'history' | 'clients') => void;
  onOpenSingleEntry: () => void;
  onOpenBatchEntry: () => void;
  onOpenStatusModal: () => void;
  onOpenNewProduct: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  onReset: () => void;
  totalPieces: number;
  totalMovements: number;
  totalClients: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSingleEntry,
  onOpenBatchEntry,
  onOpenStatusModal,
  onOpenNewProduct,
  onPrint,
  onExportExcel,
  onReset,
  totalPieces,
  totalMovements,
  totalClients,
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <header className="bg-[#165a36] text-white border-b border-[#12462a] shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Control de Inventario Prefabricados de Concreto
                </h1>
                <span className="bg-white/20 text-emerald-100 text-xs font-semibold px-2 py-0.5 rounded border border-white/25">
                  P1 (MÓD) & P2 (RECTA)
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Gestión diaria de producción, salidas a obra, trazabilidad de clientes y conteo definitivo
              </p>
            </div>
          </div>

          {/* Date Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#12462a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white shadow-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-200" />
              <span className="text-emerald-200 mr-1">Fecha:</span>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Nuevo Registro button */}
            <button
              onClick={onOpenSingleEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#165a36] hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Registrar entrada o salida individual con cliente y trazabilidad"
            >
              <PlusCircle className="w-4 h-4 text-[#165a36]" />
              <span>Nuevo Registro</span>
            </button>

            {/* + Nuevo Producto button */}
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#12462a] hover:bg-[#0e3721] text-white border border-white/25 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Incorporar un nuevo producto o tanque al catálogo de inventario"
            >
              <PackagePlus className="w-4 h-4 text-emerald-200" />
              <span>+ Nuevo Producto</span>
            </button>

            {/* Estados & Reservas button */}
            <button
              onClick={onOpenStatusModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#12462a] hover:bg-[#0e3721] text-white border border-white/25 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Modificar observaciones físicas, defectos o reservas de tanques y productos sin borrarlos"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Estados & Reservas</span>
            </button>

            {/* Carga Rápida button */}
            <button
              onClick={onOpenBatchEntry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#12462a] hover:bg-[#0e3721] text-white border border-white/25 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Pegar texto o lista de producción y salidas del día"
            >
              <ClipboardPaste className="w-4 h-4 text-emerald-200" />
              <span>Carga Rápida</span>
            </button>

            {/* Imprimir / PDF */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Imprimir o Guardar reporte oficial en PDF"
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Excel */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Descargar libro Excel con todas las hojas"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Excel</span>
            </button>

            {/* Restablecer / Sincronizar Inventarios */}
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#12462a] hover:bg-[#0e3721] text-emerald-100 hover:text-white border border-emerald-500/40 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Restablecer y actualizar todos los inventarios de Planta 1, Planta 2 y General tomando de referencia el nuevo movimiento registrado"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
              <span>Restablecer / Actualizar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-white/15 overflow-x-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'report'
                ? 'border-white text-white font-bold bg-white/10'
                : 'border-transparent text-emerald-100/70 hover:text-white hover:border-white/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reporte Oficial (Formato PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('plants')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'plants'
                ? 'border-white text-white font-bold bg-white/10'
                : 'border-transparent text-emerald-100/70 hover:text-white hover:border-white/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plantas P1 (MÓD) & P2 (RECTA)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'history'
                ? 'border-white text-white font-bold bg-white/10'
                : 'border-transparent text-emerald-100/70 hover:text-white hover:border-white/40'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial de Movimientos ({totalMovements})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === 'clients'
                ? 'border-white text-white font-bold bg-white/10'
                : 'border-transparent text-emerald-100/70 hover:text-white hover:border-white/40'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-200" />
            <span>Clientes & Solicitudes ({totalClients})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
