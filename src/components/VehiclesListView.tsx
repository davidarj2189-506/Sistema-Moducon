import React, { useState } from 'react';
import { Truck, Fuel, Gauge, User, ShieldCheck, Wrench, Search } from 'lucide-react';
import { Vehicle, DisplayUnit, ThemeMode } from '../types/fleet';
import { LITERS_TO_GALLONS } from '../utils/fleetEngine';

interface VehiclesListViewProps {
  vehicles: Vehicle[];
  unit: DisplayUnit;
  themeMode: ThemeMode;
  onSelectVehicleForFuel: (vehicleId: string) => void;
}

export const VehiclesListView: React.FC<VehiclesListViewProps> = ({
  vehicles,
  unit,
  themeMode,
  onSelectVehicleForFuel,
}) => {
  const isCabin = themeMode === 'cabin';
  const isMetric = unit === 'metric';
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div>
          <h2 className="text-base font-bold tracking-tight">Padrón de Vehículos de Flota ({vehicles.length})</h2>
          <p className="text-xs text-slate-400">
            Control de odómetros activos, capacidades nominales de tanque y conductores asignados.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa o conductor..."
            className={`w-full h-10 pl-9 pr-3 text-xs rounded-xl border focus:outline-none focus:ring-2 ${
              isCabin
                ? 'bg-slate-950 border-slate-700 text-slate-200 focus:ring-amber-500/30'
                : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500/20'
            }`}
          />
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isCabin
                ? 'bg-slate-900 border-slate-700 text-slate-100 hover:border-slate-500'
                : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-extrabold text-base font-mono-numbers px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
                  {v.plate}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    v.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  }`}
                >
                  {v.status === 'active' ? 'Operativo' : 'En Taller'}
                </span>
              </div>

              <h3 className="font-bold text-sm tracking-tight">{v.brand} {v.model}</h3>
              <p className="text-xs text-slate-400 mb-3">{v.department} • Año {v.year}</p>

              <div className="space-y-2 text-xs border-t border-inherit/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Conductor:
                  </span>
                  <span className="font-semibold">{v.assignedDriverName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                    Odómetro Actual:
                  </span>
                  <span className="font-bold font-mono-numbers text-slate-900 dark:text-slate-100">
                    {v.currentOdometer.toLocaleString()} km
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-indigo-500" />
                    Capacidad Tanque:
                  </span>
                  <span className="font-bold font-mono-numbers">
                    {isMetric ? `${v.tankCapacityLiters} L` : `${(v.tankCapacityLiters * LITERS_TO_GALLONS).toFixed(1)} Gal`} ({v.fuelType})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rendimiento Ficha Técnica:</span>
                  <span className="font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
                    {isMetric ? `${v.standardEfficiencyKmL} km/L` : `${(v.standardEfficiencyKmL * 2.352).toFixed(1)} MPG`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-inherit/20">
              <button
                type="button"
                onClick={() => onSelectVehicleForFuel(v.id)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Fuel className="w-4 h-4" />
                <span>Registrar Carga de Combustible</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
