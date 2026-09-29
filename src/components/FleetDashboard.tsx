import React from 'react';
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Gauge,
  Truck,
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { FleetKpiSummary, FuelRecord, Vehicle, DisplayUnit, ThemeMode, UserRole } from '../types/fleet';

interface FleetDashboardProps {
  kpis: FleetKpiSummary;
  records: FuelRecord[];
  vehicles: Vehicle[];
  unit: DisplayUnit;
  themeMode: ThemeMode;
  currentRole: UserRole;
  onNavigateToDispense: (vehicleId?: string) => void;
  onNavigateToHistory: (filterAnomaly?: boolean) => void;
  onNavigateToAuditReport: () => void;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  kpis,
  records,
  vehicles,
  unit,
  themeMode,
  currentRole,
  onNavigateToDispense,
  onNavigateToHistory,
  onNavigateToAuditReport,
}) => {
  const isCabin = themeMode === 'cabin';
  const isMetric = unit === 'metric';

  // Recent anomalies
  const criticalRecords = records.filter((r) => r.statusAnomaly === 'critical');
  const warningRecords = records.filter((r) => r.statusAnomaly === 'warning');

  return (
    <div className="space-y-6">
      {/* Role Context Bar & Notification */}
      {criticalRecords.length > 0 && (
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md animate-fade-in ${
            isCabin
              ? 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40'
              : 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  {criticalRecords.length} Alerta(s) Crítica(s) de Combustible Detectada(s)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
                  ATENCIÓN INMEDIATA
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {criticalRecords[0].vehiclePlate} ({criticalRecords[0].vehicleModel}): Rendimiento anormalmente bajo (
                {criticalRecords[0].efficiencyKmL} km/l). Posible drenado o falla mecánica.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToHistory(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <span>Auditar Despacho Anómalo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards (Clean, Tabular Numbers, Semaphoric Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Volume */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Combustible Consumido</span>
            <Fuel className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-tight">
            {isMetric
              ? `${kpis.totalFuelLiters.toLocaleString()} L`
              : `${kpis.totalFuelGallons.toLocaleString()} Gal`}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-inherit/20">
            <span className="text-slate-400">Total Despachos:</span>
            <span className="font-bold font-mono-numbers">{kpis.totalDispatches} cargas</span>
          </div>
        </div>

        {/* KPI 2: Total Cost */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Gasto Total Acumulado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-tight text-emerald-600 dark:text-emerald-400">
            ${kpis.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-inherit/20">
            <span className="text-slate-400">Costo Promedio / Km:</span>
            <span className="font-bold font-mono-numbers">${kpis.averageCostPerKm} MXN</span>
          </div>
        </div>

        {/* KPI 3: Fleet Efficiency Semaphoric */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            kpis.averageEfficiencyKmL >= 3.0
              ? isCabin
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : isCabin
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-amber-50/60 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2 opacity-80">
            <span>Rendimiento Global Flota</span>
            <Gauge className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-tight">
            {isMetric ? `${kpis.averageEfficiencyKmL} km/L` : `${kpis.averageEfficiencyMPG} MPG`}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-inherit/20">
            <span className="opacity-80">Distancia Recorrida:</span>
            <span className="font-bold font-mono-numbers">{kpis.totalDistanceKm.toLocaleString()} km</span>
          </div>
        </div>

        {/* KPI 4: Telematics & Anti-Theft Status */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            kpis.criticalAlertsCount > 0
              ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
              : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2 opacity-80">
            <span>Semáforo de Seguridad</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-tight flex items-center gap-2">
            <span>{kpis.criticalAlertsCount} Críticas</span>
            {kpis.warningAlertsCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold">
                {kpis.warningAlertsCount} advertencias
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-inherit/20">
            <span className="opacity-80">Unidades Operativas:</span>
            <span className="font-bold font-mono-numbers">
              {kpis.activeVehiclesCount} / {vehicles.length} activas
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Efficiency by Vehicle & Quick Action Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vehicle Efficiency Table / Telematics Benchmarks */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold tracking-tight">Rendimiento por Unidad & Telemetría</h3>
              <p className="text-xs text-slate-400">
                Comparativa entre consumo real registrado vs. especificación de fábrica
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToHistory()}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Historial Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => {
              // Find latest record for vehicle
              const lastRecord = records.find((r) => r.vehicleId === v.id);
              const realKmL = lastRecord ? lastRecord.efficiencyKmL : v.standardEfficiencyKmL;
              const expectedKmL = v.standardEfficiencyKmL;
              const percentageOfTarget = Math.round((realKmL / expectedKmL) * 100);

              let statusColor = 'bg-emerald-500';
              let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              let label = 'Óptimo';

              if (percentageOfTarget < 70) {
                statusColor = 'bg-rose-600';
                badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                label = 'Anomalía / Posible Fuga';
              } else if (percentageOfTarget < 90) {
                statusColor = 'bg-amber-500';
                badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                label = 'Bajo Rendimiento';
              }

              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    isCabin
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCabin ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm font-mono-numbers">{v.plate}</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[140px] sm:max-w-none">
                          {v.model}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{v.assignedDriverName}</span>
                        <span>•</span>
                        <span className="font-mono-numbers">{v.currentOdometer.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Semaphore */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-[200px] justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-mono-numbers font-black">
                        {isMetric ? `${realKmL} km/L` : `${(realKmL * 2.352).toFixed(1)} MPG`}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${badgeColor}`}>
                        {label} ({percentageOfTarget}%)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateToDispense(v.id)}
                      title="Registrar carga inmediata para esta unidad"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Fuel className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cargar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & UX Highlights */}
        <div className="space-y-4">
          {/* Quick Dispense CTA */}
          <div
            className={`p-5 rounded-2xl border ${
              isCabin
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold tracking-tight">Acceso Rápido en Cabina (≤ 2 Clics)</h4>
            <p className="text-xs opacity-80 mt-1 mb-4">
              Formulario optimizado para uso con una sola mano, teclas táctiles ≥ 48px y validación automática de
              odómetro para evitar errores humanos.
            </p>
            <button
              type="button"
              onClick={() => onNavigateToDispense()}
              className="w-full h-12 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Fuel className="w-4 h-4" />
              <span>+ Nueva Carga de Combustible</span>
            </button>
          </div>

          {/* Audit Quick Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isCabin ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200' : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Auditoría UX/UI Especializada
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white">
                INFORME COMPLETO
              </span>
            </div>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-200/80 mb-3">
              Revisa los 4 pilares evaluados: Arquitectura por Roles, Formularios con Prevención de Error, Dashboards Semafóricos y Microinteracciones.
            </p>
            <button
              type="button"
              onClick={onNavigateToAuditReport}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Ver Dictamen & Código Corregido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
