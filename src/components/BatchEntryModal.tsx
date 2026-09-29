import React, { useState, useEffect } from 'react';
import { parseBatchMovementsText } from '../utils/inventoryEngine';
import { InventoryMovement, ClientRecord } from '../types/inventory';
import { X, ClipboardPaste, AlertCircle, CheckCircle2, ArrowRight, Building, PackagePlus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface BatchEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBatch: (movements: Array<Omit<InventoryMovement, 'id' | 'createdAt'>>) => void;
  currentDate: string;
  clients?: ClientRecord[];
}

export const BatchEntryModal: React.FC<BatchEntryModalProps> = ({
  isOpen,
  onClose,
  onApplyBatch,
  currentDate,
  clients = [],
}) => {
  // Section toggle: AGREGAR (Entrada) vs SALIDA (Retiro)
  const [batchMode, setBatchMode] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [defaultClient, setDefaultClient] = useState('');
  const [rawText, setRawText] = useState(`1600TA/5/P1/
CRP 2X2/4/P2/
15000TP/2/P2/
60x60x90/10/P1/`);

  const [parsedResult, setParsedResult] = useState<{
    success: boolean;
    movements: Array<{
      product: string;
      type: 'ENTRADA' | 'SALIDA';
      plant: 'P1' | 'P2' | 'AUTO';
      quantity: number;
      reference: string;
      comment: string;
    }>;
    errors: string[];
  } | null>(null);

  // Auto-parse on text or batchMode change
  useEffect(() => {
    if (!isOpen) return;
    if (!rawText.trim()) {
      setParsedResult(null);
      return;
    }
    const res = parseBatchMovementsText(rawText, batchMode);
    setParsedResult(res);
  }, [rawText, batchMode, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!parsedResult || parsedResult.movements.length === 0) return;

    const formatted = parsedResult.movements.map((m) => ({
      date: currentDate,
      time: '12:00',
      product: m.product,
      type: m.type,
      plant: m.plant,
      quantity: m.quantity,
      reference: m.reference || (batchMode === 'ENTRADA' ? 'Carga Rápida (Entrada)' : 'Carga Rápida (Salida)'),
      client: defaultClient.trim() || undefined,
      comment: m.comment || undefined,
    }));

    onApplyBatch(formatted);
    onClose();
  };

  const handleSwitchMode = (newMode: 'ENTRADA' | 'SALIDA') => {
    setBatchMode(newMode);
    if (newMode === 'ENTRADA' && rawText.includes('-')) {
      setRawText(`1600TA/5/P1/
CRP 2X2/4/P2/
15000TP/2/P2/
60x60x90/10/P1/`);
    } else if (newMode === 'SALIDA' && !rawText.trim()) {
      setRawText(`1600TA/2/P1/
CRP 2X2/1/P2/
2400TA/1/P1/`);
    }
  };

  const loadExample = (mode: 'ENTRADA' | 'SALIDA') => {
    setBatchMode(mode);
    if (mode === 'ENTRADA') {
      setRawText(`1600TA/5/P1/
CRP 2X2/4/P2/
15000TP/2/P2/
60x60x90/10/P1/
FORT3 1.20/3/P2/`);
    } else {
      setRawText(`1600TA/2/P1/
CRP 2X2/1/P2/
2400TA/1/P1/
15000TP/1/P2/`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-sm text-zinc-900 leading-tight">
              Carga Rápida por Lote
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pega líneas en formato: <code className="font-mono text-zinc-600">producto/cant/p#/</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Section Mode Toggle Buttons (AGREGAR vs SALIDA) */}
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-500 uppercase tracking-wider block text-[11px]">
              Operación del Lote:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
              <button
                type="button"
                onClick={() => handleSwitchMode('ENTRADA')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  batchMode === 'ENTRADA'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>Entrada / Producción (+)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('SALIDA')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  batchMode === 'SALIDA'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Salida / Despacho (-)</span>
              </button>
            </div>
          </div>

          {/* Format Explanation & Examples */}
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            batchMode === 'ENTRADA' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            <div>
              <span className="font-bold">Formato por línea: </span>
              <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-300">
                producto/cant/p#/
              </code>
              <span className="text-[11px] block mt-0.5 opacity-90">
                Ejemplos: <code className="font-mono">1600TA/5/P1/</code> o <code className="font-mono">15000TP/2/P2/</code>
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadExample(batchMode)}
              className="text-xs font-bold underline cursor-pointer shrink-0 ml-2"
            >
              Cargar plantilla de ejemplo
            </button>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`1600TA/5/P1/\nCRP 2X2/4/P2/\n15000TP/2/P2/`}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36] leading-relaxed text-slate-800"
            />
          </div>

          {/* Client Selector for the entire batch (optional) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#165a36] shrink-0" />
              <div>
                <span className="font-bold text-slate-800 text-xs block">Cliente o Constructora (Opcional):</span>
                <span className="text-[11px] text-slate-500">
                  {clients.length === 0 
                    ? 'No hay clientes registrados aún. Puedes agregar clientes en la pestaña de Clientes o continuar sin cliente.'
                    : 'Se asignará a todos los movimientos del lote'}
                </span>
              </div>
            </div>
            <select
              value={defaultClient}
              onChange={(e) => setDefaultClient(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#165a36] max-w-[220px]"
            >
              <option value="">
                {batchMode === 'ENTRADA' ? '-- Sin cliente (Stock general) --' : '-- Sin cliente (Retiro de patio) --'}
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Parsing Results */}
          {parsedResult && (
            <div className="space-y-3 pt-1">
              {parsedResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    <span>Líneas con observación ({parsedResult.errors.length}):</span>
                  </div>
                  <ul className="list-disc pl-5 text-amber-900 space-y-0.5 text-[11px]">
                    {parsedResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedResult.movements.length > 0 ? (
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-3 py-2 bg-slate-100 border-b border-slate-300 flex items-center justify-between font-bold text-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#165a36]" />
                      <span>{parsedResult.movements.length} movimientos listos para procesar ({batchMode === 'ENTRADA' ? 'AGREGAR' : 'SALIDAS'}):</span>
                    </div>
                    <span className="text-slate-500 font-normal">Vista previa en tiempo real</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {parsedResult.movements.map((m, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.type === 'ENTRADA' ? '+ ENTRADA' : '- SALIDA'}
                          </span>
                          <span className="font-bold text-slate-900">{m.product}</span>
                          <span className="text-slate-500 text-[11px]">({m.plant})</span>
                          {m.comment && <span className="text-slate-400 text-[11px]">"{m.comment}"</span>}
                        </div>
                        <div className="font-mono-numbers font-bold text-sm">
                          {m.type === 'ENTRADA' ? `+${m.quantity}` : `-${m.quantity}`} pzas
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No se detectaron movimientos válidos en el texto ingresado. Usa el formato <code className="font-mono">producto/cant/p#/</code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!parsedResult || parsedResult.movements.length === 0}
            onClick={handleConfirm}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              parsedResult && parsedResult.movements.length > 0
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aplicar al Inventario ({parsedResult?.movements?.length || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
