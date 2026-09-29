import React, { useState, useMemo, useEffect } from 'react';
import {
  Fuel,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Gauge,
  DollarSign,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Vehicle, FuelRecord, DisplayUnit, ThemeMode, UserRole } from '../types/fleet';
import { validateFuelEntry, LITERS_TO_GALLONS, GALLONS_TO_LITERS } from '../utils/fleetEngine';

interface FuelEntryFormProps {
  vehicles: Vehicle[];
  currentRole: UserRole;
  unit: DisplayUnit;
  themeMode: ThemeMode;
  onSaveRecord: (record: Omit<FuelRecord, 'id' | 'ticketNumber' | 'timestamp'>) => void;
  onCancel?: () => void;
  preselectedVehicleId?: string;
}

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  vehicles,
  currentRole,
  unit,
  themeMode,
  onSaveRecord,
  onCancel,
  preselectedVehicleId,
}) => {
  const isCabin = themeMode === 'cabin';
  const isMetric = unit === 'metric';

  // Selected vehicle state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return preselectedVehicleId || vehicles[0]?.id || '';
  });

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Form states
  const [odometerInput, setOdometerInput] = useState<string>('');
  const [fuelVolumeInput, setFuelVolumeInput] = useState<string>('');
  const [priceInput, setPriceInput] = useState<string>('24.80');
  const [stationName, setStationName] = useState<string>('Mobil Autopista México-Qro Km 84');
  const [fullTank, setFullTank] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  // Suggested next odometer (e.g. +350 km default for simulation)
  useEffect(() => {
    if (selectedVehicle) {
      // Default to sensible next odometer to save clicks
      const suggestedOdo = selectedVehicle.currentOdometer + 450;
      setOdometerInput(suggestedOdo.toString());

      // Default reasonable fuel volume (approx 65% tank)
      const suggestedLiters = Math.round(selectedVehicle.tankCapacityLiters * 0.7);
      setFuelVolumeInput(isMetric ? suggestedLiters.toString() : (suggestedLiters * LITERS_TO_GALLONS).toFixed(1));

      // Adjust default price by fuel type
      if (selectedVehicle.fuelType === 'Diésel') {
        setPriceInput('24.85');
      } else if (selectedVehicle.fuelType === 'Gasolina Premium') {
        setPriceInput('25.90');
      } else {
        setPriceInput('23.50');
      }
    }
  }, [selectedVehicleId, isMetric]);

  // Numeric parsing
  const numericCurrentOdo = parseFloat(odometerInput) || 0;
  const rawVolume = parseFloat(fuelVolumeInput) || 0;
  const numericVolumeInLiters = isMetric ? rawVolume : rawVolume * GALLONS_TO_LITERS;
  const numericPricePerLiter = parseFloat(priceInput) || 0;

  // Real-time validation
  const validation = useMemo(() => {
    if (!selectedVehicle) {
      return {
        isValid: false,
        canProceedWithWarning: false,
        errors: ['Selecciona un vehículo válido.'],
        warnings: [],
        calculatedEfficiencyKmL: 0,
        calculatedEfficiencyMPG: 0,
        calculatedDistanceKm: 0,
        calculatedTotalCost: 0,
        anomalyLevel: 'normal' as const,
      };
    }

    return validateFuelEntry(
      selectedVehicle,
      numericCurrentOdo,
      numericVolumeInLiters,
      numericPricePerLiter
    );
  }, [selectedVehicle, numericCurrentOdo, numericVolumeInLiters, numericPricePerLiter]);

  // Quick preset buttons for mobile / cabin single-hand tap
  const handleQuickAddVolume = (addedLiters: number) => {
    const currentL = numericVolumeInLiters || 0;
    const newL = Math.min(selectedVehicle.tankCapacityLiters, currentL + addedLiters);
    setFuelVolumeInput(isMetric ? newL.toString() : (newL * LITERS_TO_GALLONS).toFixed(1));
  };

  const handleSetFullTank = () => {
    setFullTank(true);
    const capacity = selectedVehicle.tankCapacityLiters;
    setFuelVolumeInput(isMetric ? capacity.toString() : (capacity * LITERS_TO_GALLONS).toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onSaveRecord({
        vehicleId: selectedVehicle.id,
        vehiclePlate: selectedVehicle.plate,
        vehicleModel: `${selectedVehicle.brand} ${selectedVehicle.model}`,
        driverId: selectedVehicle.assignedDriverId,
        driverName: selectedVehicle.assignedDriverName,
        date: new Date().toISOString().split('T')[0],
        odometerPrevious: selectedVehicle.currentOdometer,
        odometerCurrent: numericCurrentOdo,
        distanceTraveledKm: validation.calculatedDistanceKm,
        fuelAmountLiters: Number(numericVolumeInLiters.toFixed(2)),
        fuelAmountGallons: Number((numericVolumeInLiters * LITERS_TO_GALLONS).toFixed(2)),
        pricePerLiter: numericPricePerLiter,
        totalCost: validation.calculatedTotalCost,
        fuelType: selectedVehicle.fuelType,
        stationName: stationName || 'Estación de Red',
        fullTank,
        efficiencyKmL: validation.calculatedEfficiencyKmL,
        efficiencyMPG: validation.calculatedEfficiencyMPG,
        costPerKm: Number((validation.calculatedTotalCost / Math.max(1, validation.calculatedDistanceKm)).toFixed(2)),
        statusAnomaly: validation.anomalyLevel,
        anomalyReason: validation.anomalyMessage,
        roleRegistered: currentRole,
        notes: notes.trim(),
      });

      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 3000);
    }, 400);
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCabin
          ? 'bg-slate-900 border-amber-500/50 text-slate-100 shadow-2xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Top Banner */}
      <div
        className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isCabin ? 'border-amber-500/30 bg-slate-950' : 'border-slate-100 bg-slate-50/70'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isCabin ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
            }`}
          >
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <span>Registro Rápido de Combustible</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentRole === 'driver'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}
              >
                Vista {currentRole}
              </span>
            </h2>
            <p className={`text-xs ${isCabin ? 'text-slate-400' : 'text-slate-500'}`}>
              Validación telemática instantánea contra fraude, errores de tipeo y desbordes.
            </p>
          </div>
        </div>

        {/* Quick Help Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 ${
              isCabin
                ? 'bg-slate-800 text-amber-300 border border-amber-400/40'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Prevención de Error Activa
          </span>
        </div>
      </div>

      {submissionSuccess && (
        <div className="m-5 p-4 rounded-xl bg-emerald-500 text-slate-950 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-black text-sm">¡Despacho Registrado Exitosamente!</p>
            <p className="text-xs font-medium">Odómetro actualizado y métricas sincronizadas con la flota.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Vehicle Selector with Big Touch Targets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
            1. Seleccionar Vehículo / Unidad
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {vehicles.map((v) => {
              const isSelected = v.id === selectedVehicleId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-3 rounded-xl border text-left transition-all min-h-[58px] cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? isCabin
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 text-amber-300 font-bold'
                        : 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 font-bold'
                      : isCabin
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck
                      className={`w-5 h-5 shrink-0 ${
                        isSelected ? (isCabin ? 'text-amber-400' : 'text-emerald-600') : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black font-mono-numbers">{v.plate}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/50 text-slate-600 font-medium">
                          {v.fuelType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[170px]">{v.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs block font-mono-numbers font-semibold">
                      {v.currentOdometer.toLocaleString()} km
                    </span>
                    <span className="text-[10px] text-slate-400">Tanque: {v.tankCapacityLiters}L</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Vehicle Specs Banner */}
        {selectedVehicle && (
          <div
            className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isCabin
                ? 'bg-slate-950/80 border-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-400">Conductor Asignado:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{selectedVehicle.assignedDriverName}</span>
            </div>
            <div className="flex items-center gap-4 font-mono-numbers">
              <div>
                <span className="text-slate-400">Último Odómetro: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedVehicle.currentOdometer.toLocaleString()} km
                </span>
              </div>
              <div>
                <span className="text-slate-400">Rendimiento Objetivo: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {isMetric
                    ? `${selectedVehicle.standardEfficiencyKmL} km/L`
                    : `${(selectedVehicle.standardEfficiencyKmL * 2.352).toFixed(1)} MPG`}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Capacidad Tanque: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {isMetric
                    ? `${selectedVehicle.tankCapacityLiters} L`
                    : `${(selectedVehicle.tankCapacityLiters * LITERS_TO_GALLONS).toFixed(1)} Gal`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Odometer and Fuel Input (Large Touch Buttons for Mobile/Cabin) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Odometer Input */}
          <div
            className={`p-4 rounded-xl border ${
              validation.errors.some((e) => e.includes('odómetro'))
                ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20'
                : isCabin
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Gauge className="w-4 h-4 text-emerald-500" />
                Odómetro Actual (km)
              </label>
              <span className="text-[11px] text-slate-400">
                Previo: {selectedVehicle.currentOdometer.toLocaleString()} km
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                step="1"
                value={odometerInput}
                onChange={(e) => setOdometerInput(e.target.value)}
                placeholder="Ej. 149200"
                className={`w-full h-14 px-4 text-xl sm:text-2xl font-bold font-mono-numbers rounded-xl border transition-all focus:outline-none focus:ring-4 ${
                  validation.errors.some((e) => e.includes('odómetro'))
                    ? 'border-rose-500 text-rose-600 focus:ring-rose-500/20 bg-rose-50/50'
                    : isCabin
                    ? 'bg-slate-950 border-slate-600 text-amber-300 focus:border-amber-400 focus:ring-amber-500/20'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 uppercase">KM</span>
            </div>

            {/* Calculated Distance preview */}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Distancia recorrida calculada:</span>
              <span
                className={`font-black font-mono-numbers text-sm ${
                  validation.calculatedDistanceKm <= 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {validation.calculatedDistanceKm > 0 ? `+${validation.calculatedDistanceKm.toLocaleString()} km` : '0 km'}
              </span>
            </div>

            {/* Quick buttons to simulate odometer additions (+100, +250, +500) */}
            <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-inherit/20">
              <span className="text-[10px] text-slate-400 font-medium">Atajos:</span>
              {[150, 300, 500, 850].map((addKm) => (
                <button
                  key={addKm}
                  type="button"
                  onClick={() => setOdometerInput((selectedVehicle.currentOdometer + addKm).toString())}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    isCabin
                      ? 'bg-slate-700 text-amber-300 hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{addKm} km
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Amount Input */}
          <div
            className={`p-4 rounded-xl border ${
              validation.errors.some((e) => e.includes('capacidad'))
                ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20'
                : isCabin
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Fuel className="w-4 h-4 text-emerald-500" />
                Cantidad Suministrada ({isMetric ? 'Litros' : 'Galones'})
              </label>
              <button
                type="button"
                onClick={handleSetFullTank}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Llenar Tanque ({selectedVehicle.tankCapacityLiters}L)
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={fuelVolumeInput}
                onChange={(e) => setFuelVolumeInput(e.target.value)}
                placeholder={isMetric ? 'Ej. 350.0' : 'Ej. 92.5'}
                className={`w-full h-14 px-4 text-xl sm:text-2xl font-bold font-mono-numbers rounded-xl border transition-all focus:outline-none focus:ring-4 ${
                  validation.errors.some((e) => e.includes('capacidad'))
                    ? 'border-rose-500 text-rose-600 focus:ring-rose-500/20 bg-rose-50/50'
                    : isCabin
                    ? 'bg-slate-950 border-slate-600 text-amber-300 focus:border-amber-400 focus:ring-amber-500/20'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 uppercase">
                {isMetric ? 'L' : 'GAL'}
              </span>
            </div>

            {/* Tank Capacity Fill Meter */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Nivel vs Capacidad del Tanque:</span>
                <span
                  className={`font-mono-numbers font-bold ${
                    numericVolumeInLiters > selectedVehicle.tankCapacityLiters ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {numericVolumeInLiters.toFixed(1)} / {selectedVehicle.tankCapacityLiters} L (
                  {Math.round((numericVolumeInLiters / selectedVehicle.tankCapacityLiters) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    numericVolumeInLiters > selectedVehicle.tankCapacityLiters
                      ? 'bg-rose-600'
                      : numericVolumeInLiters > selectedVehicle.tankCapacityLiters * 0.9
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (numericVolumeInLiters / selectedVehicle.tankCapacityLiters) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Presets for Cabin / Thick Gloves */}
            <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-inherit/20">
              <span className="text-[10px] text-slate-400 font-medium">Incrementar:</span>
              {[20, 50, 100, 200].map((liters) => (
                <button
                  key={liters}
                  type="button"
                  onClick={() => handleQuickAddVolume(liters)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    isCabin
                      ? 'bg-slate-700 text-amber-300 hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{liters}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Real-time Telematics & Efficiency Card (Semaphoric Status) */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            validation.anomalyLevel === 'critical'
              ? 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200'
              : validation.anomalyLevel === 'warning'
              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                Auditoría en Tiempo Real de Eficiencia
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  validation.anomalyLevel === 'critical'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : validation.anomalyLevel === 'warning'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {validation.anomalyLevel === 'critical'
                  ? 'ALERTA CRÍTICA'
                  : validation.anomalyLevel === 'warning'
                  ? 'DESVIACIÓN MODERADA'
                  : 'ÓPTIMO'}
              </span>
            </div>

            <div className="text-xs">
              <span className="opacity-80">Rendimiento Estimado: </span>
              <span className="font-black text-sm font-mono-numbers">
                {isMetric
                  ? `${validation.calculatedEfficiencyKmL} km/L`
                  : `${validation.calculatedEfficiencyMPG} MPG`}
              </span>
              <span className="opacity-70 ml-1">
                (Meta: {isMetric ? selectedVehicle.standardEfficiencyKmL : (selectedVehicle.standardEfficiencyKmL * 2.352).toFixed(1)})
              </span>
            </div>
          </div>

          {/* Validation Messages / Warnings */}
          {validation.errors.length > 0 && (
            <div className="space-y-1 mt-2">
              {validation.errors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="space-y-1 mt-2">
              {validation.warnings.map((warn, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}

          {validation.isValid && validation.warnings.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Rendimiento dentro de parámetros normales de la unidad. Sin sospechas de ordeña o fuga.</span>
            </div>
          )}
        </div>

        {/* Step 5: Price, Station & Cost Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Precio por {isMetric ? 'Litro' : 'Galón'} ($)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className={`w-full h-11 px-3 pl-8 text-sm font-bold font-mono-numbers rounded-lg border ${
                  isCabin ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <DollarSign className="w-4 h-4 absolute left-2.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Estación de Servicio / Gasolinera
            </label>
            <div className="relative">
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="Nombre o estación"
                className={`w-full h-11 px-3 pl-8 text-sm font-medium rounded-lg border ${
                  isCabin ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <MapPin className="w-4 h-4 absolute left-2.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Costo Total Calculado
            </label>
            <div
              className={`h-11 px-3 flex items-center justify-between rounded-lg border font-mono-numbers font-black text-base ${
                isCabin
                  ? 'bg-slate-950 border-slate-700 text-emerald-400'
                  : 'bg-slate-100 border-slate-300 text-emerald-700'
              }`}
            >
              <span className="text-xs font-sans font-medium text-slate-400">Total:</span>
              <span>${validation.calculatedTotalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Step 6: Full Tank Switch & Driver Notes */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-inherit/20">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={fullTank}
              onChange={(e) => setFullTank(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tanque Lleno (Permite cálculo 100% certero entre cargas)
            </span>
          </label>

          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones de ruta (tráfico, carga pesada, fallas)..."
            className={`text-xs px-3 py-2 rounded-lg border flex-1 min-w-[240px] ${
              isCabin ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {/* Step 7: Submit Action Buttons (Touch Friendly: min-height 52px) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit/20">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`px-5 h-13 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                isCabin
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={!validation.isValid || isSubmitting}
            className={`px-8 h-14 rounded-xl text-base font-black tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
              !validation.isValid
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                : isCabin
                ? 'bg-amber-500 hover:bg-amber-400 text-black font-black ring-4 ring-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold ring-4 ring-emerald-500/20'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Fuel className="w-5 h-5" />
                <span>Confirmar y Guardar Despacho</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
