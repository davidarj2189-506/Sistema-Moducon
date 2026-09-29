import React from 'react';
import { 
  Menu, 
  FileText, 
  Layers, 
  History, 
  Building,
  Search,
  Printer,
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'report' | 'plants' | 'history' | 'clients';
  onToggleMobileSidebar: () => void;
  reportSection: 'all' | 'salidas' | 'general' | 'p1' | 'p2';
  setReportSection: (section: 'all' | 'salidas' | 'general' | 'p1' | 'p2') => void;
  reportSearchTerm: string;
  setReportSearchTerm: (term: string) => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleMobileSidebar,
  reportSection,
  setReportSection,
  reportSearchTerm,
  setReportSearchTerm,
  onPrint,
}) => {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'report':
        return {
          title: 'Reporte Oficial de Inventario',
          subtitle: 'Conteo definitivo y conciliación de salidas',
          badge: 'PDF Oficial',
          icon: FileText
        };
      case 'plants':
        return {
          title: 'Plantas P1 (MÓD) & P2 (RECTA)',
          subtitle: 'Ajuste rápido de existencias físicas en patio',
          badge: 'Patio P1 / P2',
          icon: Layers
        };
      case 'history':
        return {
          title: 'Historial de Movimientos',
          subtitle: 'Registro cronológico de operaciones',
          badge: 'Trazabilidad',
          icon: History
        };
      case 'clients':
        return {
          title: 'Clientes, Obras & Despachos',
          subtitle: 'Control de entregas y reservas por cliente',
          badge: 'Gestión Comercial',
          icon: Building
        };
    }
  };

  const { title, subtitle, badge, icon: ActiveIcon } = getTabInfo();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-30 no-print">
      <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Mobile Menu Trigger & View Title / Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Abrir menú de navegación"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 shrink-0 border border-zinc-200/60">
              <ActiveIcon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-400 hidden xl:inline">
                  Inventario
                </span>
                <span className="text-[11px] text-zinc-300 hidden xl:inline">/</span>
                <h1 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight truncate">
                  {title}
                </h1>
                <span className="hidden 2xl:inline-flex text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200/60 shrink-0">
                  {badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate hidden xl:block leading-tight">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Section Switcher, Search, and Print Button (Exact position requested) */}
        {activeTab === 'report' && (
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Segmented Section Switcher */}
            <div className="hidden lg:flex items-center gap-0.5 bg-zinc-100/90 p-1 rounded-lg border border-zinc-200/60 text-xs">
              {[
                { id: 'all', fullLabel: 'Todo el Reporte', shortLabel: 'Todo' },
                { id: 'salidas', fullLabel: '1. Revisión Salidas', shortLabel: '1. Salidas' },
                { id: 'general', fullLabel: '2. General', shortLabel: '2. General' },
                { id: 'p1', fullLabel: '3. P1 (MÓD)', shortLabel: '3. P1' },
                { id: 'p2', fullLabel: '4. P2 (RECTA)', shortLabel: '4. P2' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setReportSection(sec.id as any)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    reportSection === sec.id
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="hidden xl:inline">{sec.fullLabel}</span>
                  <span className="xl:hidden">{sec.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Compact select on medium screens where space is tight */}
            <div className="hidden md:flex lg:hidden items-center bg-zinc-100 border border-zinc-200/60 rounded-lg px-2 py-1 text-xs">
              <select
                value={reportSection}
                onChange={(e) => setReportSection(e.target.value as any)}
                className="bg-transparent text-zinc-800 font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">Todo el Reporte</option>
                <option value="salidas">1. Revisión Salidas</option>
                <option value="general">2. General</option>
                <option value="p1">3. P1 (MÓD)</option>
                <option value="p2">4. P2 (RECTA)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-36 sm:w-44 md:w-48 lg:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                className="pl-8 pr-7 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs w-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-2xs"
              />
              {reportSearchTerm && (
                <button 
                  onClick={() => setReportSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Imprimir / PDF Button */}
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
              title="Imprimir documento oficial en formato PDF"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

          </div>
        )}

      </div>

      {/* Mobile sub-bar for section switching if on small screen */}
      {activeTab === 'report' && (
        <div className="md:hidden border-t border-zinc-200/60 bg-zinc-50/70 px-3 py-1.5 flex items-center gap-1 overflow-x-auto text-xs scrollbar-none no-print">
          {[
            { id: 'all', label: 'Todo el Reporte' },
            { id: 'salidas', label: '1. Revisión Salidas' },
            { id: 'general', label: '2. General' },
            { id: 'p1', label: '3. P1 (MÓD)' },
            { id: 'p2', label: '4. P2 (RECTA)' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setReportSection(sec.id as any)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                reportSection === sec.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200/60'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
