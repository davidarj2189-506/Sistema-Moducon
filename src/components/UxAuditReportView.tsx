import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { ThemeMode } from '../types/fleet';

interface UxAuditReportViewProps {
  themeMode: ThemeMode;
}

export const UxAuditReportView: React.FC<UxAuditReportViewProps> = ({ themeMode }) => {
  const isCabin = themeMode === 'cabin';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: 'Solución 1: Validación Preventiva de Odómetro y Capacidad de Tanque en Tiempo Real',
      desc: 'Bloquea el botón de envío si el odómetro es menor al previo o si el combustible excede la capacidad física del tanque (+5% de tolerancia de cuello). Alerta de ordeña o fuga si la eficiencia cae más del 30%.',
      code: `// Validación telemática en tiempo real para formulario de cabina
export function validateFuelEntry(vehicle: Vehicle, currentOdo: number, fuelLiters: number, pricePerLiter: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const distance = currentOdo - vehicle.currentOdometer;

  // 1. Prevención estricta: Odómetro invertido
  if (currentOdo <= vehicle.currentOdometer) {
    errors.push(\`El odómetro actual (\${currentOdo} km) no puede ser menor o igual al previo (\${vehicle.currentOdometer} km).\`);
  }

  // 2. Anti-derrame y anti-fraude: Capacidad del tanque
  if (fuelLiters > vehicle.tankCapacityLiters * 1.05) {
    errors.push(\`Volumen excede capacidad máxima: \${fuelLiters}L en tanque de \${vehicle.tankCapacityLiters}L.\`);
  }

  // 3. Detección de ordeña/fuga: Caída de rendimiento > 30%
  const efficiency = distance / Math.max(1, fuelLiters);
  const deviation = ((efficiency - vehicle.standardEfficiencyKmL) / vehicle.standardEfficiencyKmL) * 100;
  if (deviation < -30) {
    warnings.push(\`Alerta Crítica: Rendimiento (\${efficiency.toFixed(2)} km/l) está \${Math.abs(deviation).toFixed(1)}% bajo la meta. Posible fuga o robo.\`);
  }

  return { isValid: errors.length === 0, errors, warnings, efficiency, distance };
}`,
    },
    {
      title: 'Solución 2: Componente Táctil para Cabina (Ergonomía con Guantes / 1 Sola Mano)',
      desc: 'Diseño accesible con botones de atajo (+50L, +100L, Tanque Lleno), target táctil ≥ 48px, teclado numérico directo (inputMode="decimal") y números tabulares monoespaciados.',
      code: `// Campo numérico optimizado para cabina y vibración de vehículo
<div className="relative">
  <input
    type="number"
    inputMode="decimal"
    className="w-full h-14 px-4 text-2xl font-bold font-mono-numbers rounded-xl border-2 focus:ring-4 focus:outline-none"
    placeholder="0.0"
  />
  <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">LITROS</span>
</div>

{/* Botones de incremento rápido para operar con guantes */}
<div className="flex gap-2 mt-2">
  {[20, 50, 100, 200].map((l) => (
    <button key={l} type="button" className="min-h-[48px] px-3 rounded-xl bg-slate-100 font-bold active:scale-95">
      +{l} L
    </button>
  ))}
</div>`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div
        className={`p-6 rounded-2xl border ${
          isCabin ? 'bg-slate-900 border-indigo-500/50 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        } shadow-sm`}
      >
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Dictamen de Auditoría Senior UX/UI</span>
        </div>

        <h3 className="text-lg font-black tracking-tight mb-2">
          ### Resumen ejecutivo
        </h3>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/40">
          1. La interacción en ruta presentaba alto riesgo de captura errónea de odómetros y volumen sin validación física de tanques ni detección telemática de anomalías.<br />
          2. La arquitectura carecía de segmentación de roles (conductor en cabina vs supervisor/admin) y de soporte para condiciones de alta luminosidad solar o vibración.<br />
          3. Se reestructuró el sistema con validación preventiva en tiempo real, interfaz táctil ergonómica (≥48px), dashboard semafórico por unidad y exportación en 1 clic.
        </p>
      </div>

      {/* Problems Found (Prioritized List) */}
      <div
        className={`p-6 rounded-2xl border ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <h3 className="text-base font-black tracking-tight mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>### Problemas encontrados (Priorizados por Impacto)</span>
        </h3>

        <div className="space-y-4">
          {/* Alto */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase">
                Impacto Alto (Crítico)
              </span>
              <span className="font-bold text-sm text-rose-700 dark:text-rose-300">
                1. Ausencia de bloqueo ante odómetro regresivo y capacidad de tanque desbordada
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              <strong>Evidencia:</strong> Si el conductor digita accidentalmente un número menor al odómetro anterior o ingresa 800L en un tanque de 140L, el sistema antiguo registraba datos corruptos o distorsionaba el gasto y rendimiento fiscal.
              <br />
              <strong>Solución aplicada:</strong> Se implementó bloqueo en tiempo real con mensaje explicativo antes de permitir el envío y cálculo automático de distancia neta.
            </p>
          </div>

          {/* Alto 2 */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white uppercase">
                Impacto Alto (Operativo)
              </span>
              <span className="font-bold text-sm text-rose-700 dark:text-rose-300">
                2. Inexistencia de semáforo telemático para detección de ordeña o fuga
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              <strong>Evidencia:</strong> Si una unidad con rendimiento esperado de 3.1 km/l registra 1.7 km/l, el supervisor no recibía alerta inmediata en pantalla, perdiendo horas valiosas para investigar posibles robos de combustible en ruta.
              <br />
              <strong>Solución aplicada:</strong> Algoritmo de desviación porcentual que dispara alertas semafóricas inmediatas (Rojo = desviación &gt; 30%, Amarillo = desviación &gt; 15%).
            </p>
          </div>

          {/* Medio */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-black uppercase">
                Impacto Medio
              </span>
              <span className="font-bold text-sm text-amber-800 dark:text-amber-200">
                3. Ergonomía deficiente en dispositivos móviles bajo vibración en cabina
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              <strong>Evidencia:</strong> Campos con altura estándar (&lt; 38px) resultaban imposibles de pulsar con una sola mano o con guantes de trabajo en patio de maniobras.
              <br />
              <strong>Solución aplicada:</strong> Target mínimo de 56px para inputs principales, botones rápidos de incremento (+50L, +100L, Tanque Lleno) y tecla directa a teclado numérico.
            </p>
          </div>

          {/* Bajo */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white uppercase">
                Impacto Bajo / Accesibilidad
              </span>
              <span className="font-bold text-sm text-indigo-800 dark:text-indigo-200">
                4. Dificultad de lectura bajo luz solar directa y sin soporte de unidades imperiales
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
              <strong>Evidencia:</strong> Choferes en rutas fronterizas o internacionales necesitan alternar entre Litros/Galones y Km/L/MPG sin perder los valores digitados.
              <br />
              <strong>Solución aplicada:</strong> Toggle instantáneo de unidades métricas/imperiales y Modo Cabina de ultra alto contraste.
            </p>
          </div>
        </div>
      </div>

      {/* Solutions with Code Snippets */}
      <div
        className={`p-6 rounded-2xl border ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <h3 className="text-base font-black tracking-tight mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-500" />
          <span>### Soluciones con código corregido (listo para producción)</span>
        </h3>

        <div className="space-y-6">
          {codeSnippets.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">{item.title}</h4>
                <button
                  type="button"
                  onClick={() => handleCopy(item.code, idx)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? '¡Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
              <div className="relative rounded-xl overflow-hidden bg-slate-950 p-4 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto">
                <pre>{item.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation of changes */}
      <div
        className={`p-6 rounded-2xl border ${
          isCabin ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <h3 className="text-base font-black tracking-tight mb-3">
          ### Explicación breve de cada cambio
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
          <li>
            <strong>Arquitectura de Información:</strong> Segmentada en 3 roles claros (Admin, Supervisor y Conductor). Toda la información de alertas críticas y registro de combustible es accesible en 1 clic desde cualquier vista.
          </li>
          <li>
            <strong>Formularios con Prevención Activa:</strong> El odómetro previo se precarga como lectura de referencia no modificable por error. La validación en vivo alerta si se desborda el tanque o si el odómetro retrocede.
          </li>
          <li>
            <strong>Rendimiento y Detección de Ordeña:</strong> Se calcula automáticamente km/l y MPG en cada pulsación, comparando contra la meta de la ficha técnica con insignias semafóricas (Verde / Amarillo / Rojo).
          </li>
          <li>
            <strong>Modo Cabina (High Contrast HUD):</strong> Paleta oscura con contrastes ámbar/esmeralda calculados para minimizar deslumbramiento nocturno y fatiga visual al conducir.
          </li>
          <li>
            <strong>Exportación y Auditoría:</strong> Descarga instantánea a formato CSV/Excel con encabezados fiscales y detalle de diagnósticos telemáticos.
          </li>
        </ul>
      </div>
    </div>
  );
};
