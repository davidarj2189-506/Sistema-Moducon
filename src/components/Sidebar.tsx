import React from 'react';
import { 
  FileText, 
  Layers, 
  History, 
  Building, 
  Plus, 
  PackagePlus, 
  ClipboardPaste, 
  ShieldCheck, 
  Printer, 
  Download, 
  RotateCcw, 
  Building2,
  X,
  Calendar
} from 'lucide-react';

interface SidebarProps {
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
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const handleNavClick = (tab: 'report' | 'plants' | 'history' | 'clients') => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out no-print ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-zinc-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <Building2 className="w-4 h-4 text-zinc-100" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs tracking-tight text-zinc-900 block leading-tight truncate">
                  Control de Inventario
                </span>
                <span className="text-[10px] text-zinc-400 font-normal truncate block">
                  Prefabricados · P1 & P2
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary CTA Button */}
          <div className="p-3 pb-2">
            <button
              onClick={() => {
                onOpenSingleEntry();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Registro</span>
            </button>
          </div>

          {/* Date Selector */}
          <div className="px-3 pb-2">
            <div className="flex items-center bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100/70 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
              <span className="text-[11px] text-zinc-400 mr-1 shrink-0 font-medium">Fecha:</span>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-800 font-medium focus:outline-none cursor-pointer text-xs w-full"
                title="Fecha de consulta y conciliación diaria"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-0.5">
            <span className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Vistas Principales
            </span>

            <button
              onClick={() => handleNavClick('report')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span>Reporte Oficial</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">PDF</span>
            </button>

            <button
              onClick={() => handleNavClick('plants')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'plants'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-zinc-500" />
                <span>Plantas P1 & P2</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">MÓD/RECTA</span>
            </button>

            <button
              onClick={() => handleNavClick('history')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-zinc-500" />
                <span>Historial</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                {totalMovements}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('clients')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-zinc-500" />
                <span>Clientes & Obras</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                {totalClients}
              </span>
            </button>
          </div>

          <div className="my-2 border-t border-zinc-100"></div>

          {/* Tools & Catalog Section */}
          <div className="px-3 py-1 space-y-0.5">
            <span className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Catálogo & Operaciones
            </span>

            <button
              onClick={() => {
                onOpenNewProduct();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <PackagePlus className="w-4 h-4 text-zinc-400" />
              <span>Nuevo Producto / Tanque</span>
            </button>

            <button
              onClick={() => {
                onOpenBatchEntry();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 text-zinc-400" />
              <span>Carga Rápida (Lote)</span>
            </button>

            <button
              onClick={() => {
                onOpenStatusModal();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Estados & Reservas</span>
            </button>
          </div>

          <div className="my-2 border-t border-zinc-100"></div>

          {/* Export & Reset Section */}
          <div className="px-3 py-1 space-y-0.5">
            <span className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Exportación & Ajuste
            </span>

            <button
              onClick={() => {
                onPrint();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span>Imprimir / PDF Oficial</span>
            </button>

            <button
              onClick={() => {
                onExportExcel();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Descargar Excel</span>
            </button>

            <button
              onClick={() => {
                onReset();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              <span>Restablecer Inventario</span>
            </button>
          </div>

        </div>

        {/* Footer info strip */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Existencias Patio:</span>
            <span className="font-mono-numbers font-semibold text-zinc-900">{totalPieces} pzas</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
            <span>Base Oficial:</span>
            <span className="font-mono">25-09-2026</span>
          </div>
        </div>

      </aside>
    </>
  );
};
