import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Eye,
  Calendar,
  X,
  Fuel,
} from 'lucide-react';
import { FuelRecord, DisplayUnit, ThemeMode, AnomalySeverity } from '../types/fleet';
import { exportFleetRecordsToCsv } from '../utils/fleetEngine';

interface FuelHistoryViewProps {
  records: FuelRecord[];
  unit: DisplayUnit;
  themeMode: ThemeMode;
  initialFilterAnomaly?: boolean;
}

export const FuelHistoryView: React.FC<FuelHistoryViewProps> = ({
  records,
  unit,
  themeMode,
  initialFilterAnomaly = false,
}) => {
  const isCabin = themeMode === 'cabin';
  const isMetric = unit === 'metric';

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'critical' | 'warning' | 'normal'>(
    initialFilterAnomaly ? 'critical' : 'all'
  );
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Anomaly filter
      if (anomalyFilter !== 'all' && r.statusAnomaly !== anomalyFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesPlate = r.vehiclePlate.toLowerCase().includes(query);
        const matchesDriver = r.driverName.toLowerCase().includes(query);
        const matchesModel = r.vehicleModel.toLowerCase().includes(query);
        const matchesTicket = r.ticketNumber.toLowerCase().includes(query);
        const matchesStation = r.stationName.toLowerCase().includes(query);
        return matchesPlate || matchesDriver || matchesModel || matchesTicket || matchesStation;
      }

      return true;
    });
  }, [records, searchTerm, anomalyFilter]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleExportCsv = () => {
    exportFleetRecordsToCsv(filteredRecords, unit);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por placa, conductor, estación o ticket..."
              className={`w-full h-10 pl-9 pr-3 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
                isCabin
                  ? 'bg-slate-950 border-slate-700 text-slate-200 focus:ring-amber-500/30'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500/20'
              }`}
            />
          </div>

          {/* Anomaly filter pills */}
          <div
            className={`flex items-center rounded-xl p-1 border text-xs font-semibold ${
              isCabin ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => {
                setAnomalyFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                anomalyFilter === 'all'
                  ? isCabin
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({records.length})
            </button>
            <button
              onClick={() => {
                setAnomalyFilter('critical');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                anomalyFilter === 'critical'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-rose-500 hover:text-rose-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Críticos ({records.filter((r) => r.statusAnomaly === 'critical').length})</span>
            </button>
            <button
              onClick={() => {
                setAnomalyFilter('warning');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                anomalyFilter === 'warning'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-amber-500 hover:text-amber-600'
              }`}
            >
              Advertencias ({records.filter((r) => r.statusAnomaly === 'warning').length})
            </button>
          </div>
        </div>

        {/* Export Button (1-Click) */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar a Excel/CSV</span>
        </button>
      </div>

      {/* Main Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                  isCabin ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-3 px-4">Ticket / Fecha</th>
                <th className="py-3 px-4">Unidad & Conductor</th>
                <th className="py-3 px-4">Odómetros</th>
                <th className="py-3 px-4 text-right">Distancia</th>
                <th className="py-3 px-4 text-right">Volumen Carga</th>
                <th className="py-3 px-4 text-right">Rendimiento</th>
                <th className="py-3 px-4 text-right">Costo / Km</th>
                <th className="py-3 px-4 text-center">Estado Auditoría</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit/20 font-mono-numbers">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Normal
                    </span>
                  );

                  if (r.statusAnomaly === 'critical') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Crítica / Fuga
                      </span>
                    );
                  } else if (r.statusAnomaly === 'warning') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        Advertencia
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-500/5 transition-colors ${
                        r.statusAnomaly === 'critical' ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{r.ticketNumber}</div>
                        <div className="text-[11px] text-slate-400 font-sans">{r.date}</div>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold font-mono-numbers text-slate-900 dark:text-slate-100">
                          {r.vehiclePlate}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">{r.driverName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-400 text-[11px]">{r.odometerPrevious.toLocaleString()} km</div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {r.odometerCurrent.toLocaleString()} km
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        +{r.distanceTraveledKm.toLocaleString()} km
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {isMetric ? `${r.fuelAmountLiters} L` : `${r.fuelAmountGallons} Gal`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          ${r.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 1 })}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div
                          className={`font-black text-sm ${
                            r.statusAnomaly === 'critical'
                              ? 'text-rose-600 dark:text-rose-400'
                              : r.statusAnomaly === 'warning'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isMetric ? `${r.efficiencyKmL} km/L` : `${r.efficiencyMPG} MPG`}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold font-sans">
                        ${r.costPerKm.toFixed(2)}/km
                      </td>

                      <td className="py-3 px-4 text-center font-sans">{badge}</td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-colors"
                          title="Ver detalle del ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          className={`p-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isCabin ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-slate-400 font-sans">
            Mostrando {paginatedRecords.length} de {filteredRecords.length} registros
          </div>

          <div className="flex items-center gap-1.5 font-mono-numbers">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-inherit disabled:opacity-40 cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-2 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-inherit disabled:opacity-40 cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isCabin ? 'bg-slate-900 border-amber-500 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-inherit/20">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base">Detalle de Conciliación - {selectedRecord.ticketNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Vehículo:</span>
                <span className="font-bold text-sm font-mono-numbers">{selectedRecord.vehiclePlate}</span>
                <span className="block text-slate-500">{selectedRecord.vehicleModel}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Conductor:</span>
                <span className="font-bold text-sm">{selectedRecord.driverName}</span>
                <span className="block text-slate-500">Registrado por: {selectedRecord.roleRegistered}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Odómetro Inicial:</span>
                <span className="font-bold font-mono-numbers">{selectedRecord.odometerPrevious.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-slate-400 block">Odómetro Final:</span>
                <span className="font-bold font-mono-numbers">{selectedRecord.odometerCurrent.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-slate-400 block">Volumen Despachado:</span>
                <span className="font-bold font-mono-numbers text-sm text-emerald-600">
                  {selectedRecord.fuelAmountLiters} L ({selectedRecord.fuelAmountGallons} Gal)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Costo Total:</span>
                <span className="font-bold font-mono-numbers text-sm">
                  ${selectedRecord.totalCost.toFixed(2)} (${selectedRecord.pricePerLiter}/L)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Rendimiento Real:</span>
                <span className="font-bold font-mono-numbers text-sm text-indigo-600">
                  {selectedRecord.efficiencyKmL} km/L ({selectedRecord.efficiencyMPG} MPG)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Costo por Kilómetro:</span>
                <span className="font-bold font-mono-numbers text-sm">${selectedRecord.costPerKm}/km</span>
              </div>
            </div>

            {selectedRecord.anomalyReason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                <span className="font-bold block mb-1">Diagnóstico Telemático:</span>
                {selectedRecord.anomalyReason}
              </div>
            )}

            {selectedRecord.notes && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="font-bold block mb-1 text-slate-400">Observaciones del Conductor:</span>
                {selectedRecord.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
