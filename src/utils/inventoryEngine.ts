import { INITIAL_INVENTORY_BASE, INITIAL_SALIDAS_REVISION, BASE_DATE } from '../data/initialInventory';
import { InventoryMovement, ProductInventoryState, SalidaRevisionRow, ClientRecord, ProductStatusUpdate, CustomProductRecord } from '../types/inventory';

const STORAGE_MOVEMENTS_KEY = 'concreto_inventario_movements_v1';
const STORAGE_CUSTOM_PRODUCTS_KEY = 'concreto_inventario_custom_products_v1';
const STORAGE_CUSTOM_COMMENTS_KEY = 'concreto_inventario_custom_comments_v1';
const STORAGE_CUSTOM_RESERVAS_KEY = 'concreto_inventario_custom_reservas_v1';
const STORAGE_CUSTOM_CLIENTS_RESERVA_KEY = 'concreto_inventario_custom_clients_reserva_v1';
const STORAGE_CUSTOM_CALIDAD_KEY = 'concreto_inventario_custom_calidad_v1';
const STORAGE_CLIENTS_LIST_KEY = 'concreto_inventario_clients_list_v1';
const STORAGE_DELETED_PRODUCTS_KEY = 'concreto_inventario_deleted_products_v1';

export function loadDeletedProducts(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedProducts(deleted: string[]): void {
  try {
    localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
  } catch (e) {
    console.error('Error saving deleted products:', e);
  }
}

export function loadCustomProducts(): CustomProductRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProducts(products: CustomProductRecord[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving custom products:', e);
  }
}

export function addOrUpdateCustomProduct(
  newProd: Omit<CustomProductRecord, 'createdAt'> & { createdAt?: number }
): CustomProductRecord[] {
  const current = loadCustomProducts();
  const prodName = newProd.product.trim();
  if (!prodName) return current;

  // Un-delete if previously deleted
  const currentDeleted = loadDeletedProducts();
  if (currentDeleted.includes(prodName.toLowerCase())) {
    saveDeletedProducts(currentDeleted.filter((d) => d !== prodName.toLowerCase()));
  }

  const existingIndex = current.findIndex(
    (p) => p.product.trim().toLowerCase() === prodName.toLowerCase()
  );

  const record: CustomProductRecord = {
    product: prodName,
    initialP1: Math.max(0, Number(newProd.initialP1) || 0),
    initialP2: Math.max(0, Number(newProd.initialP2) || 0),
    comentario: newProd.comentario || '',
    reservas: newProd.reservas || '',
    clienteReserva: newProd.clienteReserva || '',
    estadoCalidad: newProd.estadoCalidad || '',
    createdAt: newProd.createdAt || Date.now(),
  };

  let updated: CustomProductRecord[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...current[existingIndex], ...record };
  } else {
    updated = [...current, record];
  }

  saveCustomProducts(updated);
  return updated;
}

export function deleteCustomProduct(productName: string): CustomProductRecord[] {
  const current = loadCustomProducts();
  const updated = current.filter(
    (p) => p.product.trim().toLowerCase() !== productName.trim().toLowerCase()
  );
  saveCustomProducts(updated);
  return updated;
}

/**
 * Completely removes a product from customProducts, removes all its movements,
 * marks it as deleted so it never appears in P1, P2 or General tables,
 * and clears any comments/reservations associated with it.
 */
export function deleteProductCompletely(productName: string): {
  customProducts: CustomProductRecord[];
  remainingMovements: InventoryMovement[];
} {
  const nameClean = productName.trim().toLowerCase();

  // 1. Add to deleted products list to exclude from base & current inventory
  const currentDeleted = loadDeletedProducts();
  if (!currentDeleted.includes(nameClean)) {
    saveDeletedProducts([...currentDeleted, nameClean]);
  }

  // 2. Remove from custom products
  const currentCp = loadCustomProducts();
  const updatedCp = currentCp.filter((cp) => cp.product.trim().toLowerCase() !== nameClean);
  saveCustomProducts(updatedCp);

  // 3. Remove associated movements
  const currentMovs = loadMovements();
  const remainingMovs = currentMovs.filter((m) => m.product.trim().toLowerCase() !== nameClean);
  saveMovements(remainingMovs);

  // 4. Remove custom comments / reservas / calidad
  const comments = loadCustomComments();
  delete comments[productName];
  saveCustomComments(comments);

  const reservas = loadCustomReservas();
  delete reservas[productName];
  saveCustomReservas(reservas);

  const clientsRes = loadCustomClientsReserva();
  delete clientsRes[productName];
  saveCustomClientsReserva(clientsRes);

  const calidad = loadCustomCalidad();
  delete calidad[productName];
  saveCustomCalidad(calidad);

  return { customProducts: updatedCp, remainingMovements: remainingMovs };
}

export function updateCustomProductInitialStock(
  productName: string,
  p1: number,
  p2: number
): CustomProductRecord[] {
  const nameClean = productName.trim().toLowerCase();
  const current = loadCustomProducts();
  const updated = current.map((p) => {
    if (p.product.trim().toLowerCase() === nameClean) {
      return {
        ...p,
        initialP1: Math.max(0, p1),
        initialP2: Math.max(0, p2),
      };
    }
    return p;
  });
  saveCustomProducts(updated);
  return updated;
}

export function ensureCustomProductExists(
  productName: string,
  _plant?: 'P1' | 'P2',
  _qty = 0
): CustomProductRecord[] {
  const nameClean = productName.trim();
  if (!nameClean) return loadCustomProducts();

  // Check if exists in base
  const inBase = INITIAL_INVENTORY_BASE.some(
    (b) => b.product.trim().toLowerCase() === nameClean.toLowerCase()
  );
  if (inBase) return loadCustomProducts();

  const current = loadCustomProducts();
  const exists = current.some(
    (cp) => cp.product.trim().toLowerCase() === nameClean.toLowerCase()
  );
  if (exists) return current;

  // Baseline is 0 so movements accurately determine the stock without doubling
  return addOrUpdateCustomProduct({
    product: nameClean,
    initialP1: 0,
    initialP2: 0,
    createdAt: Date.now(),
  });
}

export const DEFAULT_CLIENTS: ClientRecord[] = [];

export function loadClients(): ClientRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Purge legacy demo clients so user starts with a completely clean real client list
    const demoClientNames = [
      'constructora bolívar',
      'consorcio vial andino',
      'ingeniería & concretos sas',
      'alcaldía municipal - obras públicas',
      'urbanizaciones del valle',
      'cliente mostrador / venta directa',
    ];
    return parsed.filter(
      (c) => c && c.name && !demoClientNames.includes(c.name.trim().toLowerCase())
    );
  } catch {
    return [];
  }
}

export function saveClients(clients: ClientRecord[]): void {
  try {
    localStorage.setItem(STORAGE_CLIENTS_LIST_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving clients:', e);
  }
}

export function addClientIfNotExists(clientName: string, projectOrSite?: string): ClientRecord[] {
  const nameClean = clientName.trim();
  if (!nameClean) return loadClients();

  const current = loadClients();
  const exists = current.find((c) => c.name.toLowerCase() === nameClean.toLowerCase());
  if (exists) return current;

  const updated = [
    ...current,
    {
      id: `cli-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: nameClean,
      projectOrSite: projectOrSite || 'Proyecto no especificado',
    },
  ];
  saveClients(updated);
  return updated;
}

export function loadMovements(): InventoryMovement[] {
  try {
    const raw = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading movements from localStorage:', e);
    return [];
  }
}

export function saveMovements(movements: InventoryMovement[]): void {
  try {
    localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (e) {
    console.error('Error saving movements:', e);
  }
}

export function loadCustomComments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_COMMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomComments(comments: Record<string, string>): void {
  localStorage.setItem(STORAGE_CUSTOM_COMMENTS_KEY, JSON.stringify(comments));
}

export function loadCustomReservas(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_RESERVAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomReservas(reservas: Record<string, string>): void {
  localStorage.setItem(STORAGE_CUSTOM_RESERVAS_KEY, JSON.stringify(reservas));
}

export function loadCustomClientsReserva(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CLIENTS_RESERVA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomClientsReserva(data: Record<string, string>): void {
  localStorage.setItem(STORAGE_CUSTOM_CLIENTS_RESERVA_KEY, JSON.stringify(data));
}

export function loadCustomCalidad(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CALIDAD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomCalidad(data: Record<string, string>): void {
  localStorage.setItem(STORAGE_CUSTOM_CALIDAD_KEY, JSON.stringify(data));
}

export function resetToInitialBase(): void {
  localStorage.removeItem(STORAGE_MOVEMENTS_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_PRODUCTS_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_COMMENTS_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_RESERVAS_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_CLIENTS_RESERVA_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_CALIDAD_KEY);
  localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
}

/**
 * Calculates current stock per product and plant given all movements after BASE_DATE
 */
export function calculateCurrentInventory(
  movements: InventoryMovement[],
  customComments: Record<string, string> = {},
  customReservas: Record<string, string> = {},
  customClientsReserva: Record<string, string> = {},
  customCalidad: Record<string, string> = {},
  customProducts: CustomProductRecord[] = [],
  reportDate?: string
): {
  generalInventory: ProductInventoryState[];
  p1Inventory: Array<{ product: string; cantidad: number; planta: 'P1'; comentario: string; reservas: string; isCustom?: boolean }>;
  p2Inventory: Array<{ product: string; cantidad: number; planta: 'P2'; comentario: string; reservas: string; isCustom?: boolean }>;
  totalP1: number;
  totalP2: number;
  grandTotal: number;
  salidasRevision: SalidaRevisionRow[];
  totalFaltantes: number;
} {
  // Start from initial base copies
  const productMap = new Map<string, { 
    p1: number; 
    p2: number; 
    comentario: string; 
    reservas: string;
    clienteReserva: string;
    estadoCalidad: string;
    isCustom?: boolean;
  }>();

  const deletedSet = new Set(loadDeletedProducts().map((p) => p.trim().toLowerCase()));

  const baseOrderMap = new Map<string, number>();
  INITIAL_INVENTORY_BASE.forEach((item, index) => baseOrderMap.set(item.product.trim().toLowerCase(), index));

  // Initialize with initial base (excluding deleted products)
  for (const item of INITIAL_INVENTORY_BASE) {
    if (deletedSet.has(item.product.trim().toLowerCase())) continue;
    productMap.set(item.product, {
      p1: item.p1,
      p2: item.p2,
      comentario: customComments[item.product] !== undefined ? customComments[item.product] : item.comentario,
      reservas: customReservas[item.product] !== undefined ? customReservas[item.product] : item.reservas,
      clienteReserva: customClientsReserva[item.product] || '',
      estadoCalidad: customCalidad[item.product] || '',
      isCustom: false,
    });
  }

  // Also track base P1 / P2 values for revision calculation
  const baseInitialMap = new Map<string, { p1: number; p2: number }>();
  for (const item of INITIAL_INVENTORY_BASE) {
    if (deletedSet.has(item.product.trim().toLowerCase())) continue;
    baseInitialMap.set(item.product, { p1: item.p1, p2: item.p2 });
  }

  // Incorporate custom registered products (excluding deleted products)
  for (const cp of customProducts) {
    const key = cp.product.trim();
    if (!key || deletedSet.has(key.toLowerCase())) continue;
    const initialP1 = Math.max(0, Number(cp.initialP1) || 0);
    const initialP2 = Math.max(0, Number(cp.initialP2) || 0);
    const isAlreadyInBase = baseOrderMap.has(key.toLowerCase());

    productMap.set(key, {
      p1: initialP1,
      p2: initialP2,
      comentario: customComments[key] !== undefined ? customComments[key] : (cp.comentario || ''),
      reservas: customReservas[key] !== undefined ? customReservas[key] : (cp.reservas || ''),
      clienteReserva: customClientsReserva[key] || cp.clienteReserva || '',
      estadoCalidad: customCalidad[key] || cp.estadoCalidad || '',
      isCustom: !isAlreadyInBase,
    });
    baseInitialMap.set(key, { p1: initialP1, p2: initialP2 });
  }

  // Canonical case-insensitive product map
  const canonicalProductMap = new Map<string, string>();
  for (const key of productMap.keys()) {
    canonicalProductMap.set(key.trim().toLowerCase(), key);
  }

  // Track daily totals for revision of salidas
  const productDeltas = new Map<string, { entrada: number; salida: number }>();

  // Sort movements chronologically (oldest first) so entradas precede salidas
  const chronoSortedMovements = [...movements].sort(
    (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
  );

  // Process movements in chronological order
  for (const m of chronoSortedMovements) {
    const rawKey = m.product.trim();
    if (deletedSet.has(rawKey.toLowerCase())) continue;

    const prodKey = canonicalProductMap.get(rawKey.toLowerCase()) || rawKey;
    if (!productMap.has(prodKey)) {
      productMap.set(prodKey, {
        p1: 0,
        p2: 0,
        comentario: customComments[prodKey] || '',
        reservas: customReservas[prodKey] || '',
        clienteReserva: customClientsReserva[prodKey] || '',
        estadoCalidad: customCalidad[prodKey] || '',
      });
      canonicalProductMap.set(rawKey.toLowerCase(), prodKey);
      baseInitialMap.set(prodKey, { p1: 0, p2: 0 });
    }

    const current = productMap.get(prodKey)!;
    const delta = productDeltas.get(prodKey) || { entrada: 0, salida: 0 };

    if (m.type === 'ENTRADA') {
      delta.entrada += m.quantity;
      if (m.plant === 'P2') {
        current.p2 += m.quantity;
      } else {
        // Defaults to P1
        current.p1 += m.quantity;
      }
    } else if (m.type === 'SALIDA') {
      delta.salida += m.quantity;
      let qtyToDeduct = m.quantity;

      if (m.plant === 'P1') {
        current.p1 = Math.max(0, current.p1 - qtyToDeduct);
      } else if (m.plant === 'P2') {
        current.p2 = Math.max(0, current.p2 - qtyToDeduct);
      } else {
        // AUTO (FIFO: P1 first, then P2)
        if (current.p1 >= qtyToDeduct) {
          current.p1 -= qtyToDeduct;
        } else {
          qtyToDeduct -= current.p1;
          current.p1 = 0;
          current.p2 = Math.max(0, current.p2 - qtyToDeduct);
        }
      }
    } else if (m.type === 'TRASPASO') {
      const fromPlant = m.plant === 'P2' ? 'P2' : 'P1';
      const toPlant = m.destPlant || (fromPlant === 'P1' ? 'P2' : 'P1');
      const qtyToTransfer = m.quantity;

      if (fromPlant === 'P1' && toPlant === 'P2') {
        current.p1 = Math.max(0, current.p1 - qtyToTransfer);
        current.p2 += qtyToTransfer;
      } else if (fromPlant === 'P2' && toPlant === 'P1') {
        current.p2 = Math.max(0, current.p2 - qtyToTransfer);
        current.p1 += qtyToTransfer;
      }
    }

    productDeltas.set(prodKey, delta);
  }

  // Build General Inventory List
  const generalInventory: ProductInventoryState[] = [];
  let totalP1 = 0;
  let totalP2 = 0;

  for (const [product, data] of productMap.entries()) {
    const total = data.p1 + data.p2;
    totalP1 += data.p1;
    totalP2 += data.p2;
    const isCustom = data.isCustom !== undefined ? data.isCustom : !baseOrderMap.has(product.trim().toLowerCase());
    generalInventory.push({
      product,
      p1: data.p1,
      p2: data.p2,
      total,
      reservas: data.reservas,
      comentario: data.comentario,
      clienteReserva: data.clienteReserva,
      estadoCalidad: data.estadoCalidad,
      isCustom,
    });
  }

  // Sort general inventory: base products first in standard order, custom/new products right after
  generalInventory.sort((a, b) => {
    const keyA = a.product.trim().toLowerCase();
    const keyB = b.product.trim().toLowerCase();
    const orderA = baseOrderMap.has(keyA) ? baseOrderMap.get(keyA)! : 9999;
    const orderB = baseOrderMap.has(keyB) ? baseOrderMap.get(keyB)! : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return a.product.localeCompare(b.product);
  });

  // Build P1 and P2 sub-tables: ONLY include items with active stock in that plant (> 0)
  const p1Inventory = generalInventory
    .filter((item) => item.p1 > 0)
    .map((item) => ({
      product: item.product,
      cantidad: item.p1,
      planta: 'P1' as const,
      comentario: item.comentario,
      reservas: item.reservas,
      isCustom: item.isCustom,
    }));

  const p2Inventory = generalInventory
    .filter((item) => item.p2 > 0)
    .map((item) => ({
      product: item.product,
      cantidad: item.p2,
      planta: 'P2' as const,
      comentario: item.comentario,
      reservas: item.reservas,
      isCustom: item.isCustom,
    }));

  // Build Salidas Revision
  // Per user requirement: "QUIERO QUE CADA DIA LA REVISION DE SALIDAS SEA ACTUALIZADA CUANDO SE GENERA EL REPORTE COMPLETO, QUE SOLO MUESTRE LO QUE SE REALIZO ESE DIA DE AJUSTES"
  let salidasRevision: SalidaRevisionRow[] = [];
  let totalFaltantes = 0;

  const targetDate = reportDate ? reportDate.trim() : BASE_DATE;
  const isBaseDay = targetDate === BASE_DATE;
  const dayMovements = movements.filter((m) => m.date === targetDate);

  if (isBaseDay && dayMovements.length === 0) {
    // Original official PDF baseline as of 25-09-2026 (excluding deleted products)
    salidasRevision = INITIAL_SALIDAS_REVISION.filter(
      (r) => !deletedSet.has(r.producto.trim().toLowerCase())
    );
    totalFaltantes = salidasRevision.reduce((acc, row) => acc + (row.faltante || 0), 0);
  } else if (dayMovements.length > 0) {
    // Only products that had activity ON THAT SPECIFIC DAY and not deleted
    const dayProductNames = Array.from(
      new Set(dayMovements.map((m) => m.product.trim()))
    ).filter((prod) => !deletedSet.has(prod.toLowerCase()));

    // Compute stock at the start of targetDate (applying only movements before targetDate)
    const priorMovements = movements.filter((m) => m.date < targetDate);
    const startOfDayMap = new Map<string, { p1: number; p2: number }>();

    for (const prod of dayProductNames) {
      const baseStock = baseInitialMap.get(prod) || { p1: 0, p2: 0 };
      let p1 = baseStock.p1;
      let p2 = baseStock.p2;

      for (const pm of priorMovements) {
        if (pm.product.trim().toLowerCase() === prod.toLowerCase()) {
          if (pm.type === 'ENTRADA') {
            if (pm.plant === 'P2') p2 += pm.quantity;
            else p1 += pm.quantity;
          } else if (pm.type === 'SALIDA') {
            let rem = pm.quantity;
            if (pm.plant === 'P1') {
              p1 = Math.max(0, p1 - rem);
            } else if (pm.plant === 'P2') {
              p2 = Math.max(0, p2 - rem);
            } else {
              if (p1 >= rem) p1 -= rem;
              else {
                rem -= p1;
                p1 = 0;
                p2 = Math.max(0, p2 - rem);
              }
            }
          } else if (pm.type === 'TRASPASO') {
            const fromP = pm.plant === 'P2' ? 'P2' : 'P1';
            const toP = pm.destPlant || (fromP === 'P1' ? 'P2' : 'P1');
            const qty = pm.quantity;
            if (fromP === 'P1' && toP === 'P2') {
              p1 = Math.max(0, p1 - qty);
              p2 += qty;
            } else if (fromP === 'P2' && toP === 'P1') {
              p2 = Math.max(0, p2 - qty);
              p1 += qty;
            }
          }
        }
      }
      startOfDayMap.set(prod, { p1, p2 });
    }

    // Now compute entries, exits, transfers, and end-of-day result for this specific date
    for (const prod of dayProductNames) {
      const startStock = startOfDayMap.get(prod) || { p1: 0, p2: 0 };
      let curP1 = startStock.p1;
      let curP2 = startStock.p2;
      let dayEntrada = 0;
      let daySalida = 0;
      let traspasoNote = '';

      const prodsDayMovs = dayMovements.filter(
        (m) => m.product.trim().toLowerCase() === prod.toLowerCase()
      );

      for (const m of prodsDayMovs) {
        if (m.type === 'ENTRADA') {
          dayEntrada += m.quantity;
          if (m.plant === 'P2') curP2 += m.quantity;
          else curP1 += m.quantity;
        } else if (m.type === 'SALIDA') {
          daySalida += m.quantity;
          let rem = m.quantity;
          if (m.plant === 'P1') {
            curP1 = Math.max(0, curP1 - rem);
          } else if (m.plant === 'P2') {
            curP2 = Math.max(0, curP2 - rem);
          } else {
            if (curP1 >= rem) curP1 -= rem;
            else {
              rem -= curP1;
              curP1 = 0;
              curP2 = Math.max(0, curP2 - rem);
            }
          }
        } else if (m.type === 'TRASPASO') {
          const fromP = m.plant === 'P2' ? 'P2' : 'P1';
          const toP = m.destPlant || (fromP === 'P1' ? 'P2' : 'P1');
          const qty = m.quantity;
          if (fromP === 'P1' && toP === 'P2') {
            curP1 = Math.max(0, curP1 - qty);
            curP2 += qty;
          } else if (fromP === 'P2' && toP === 'P1') {
            curP2 = Math.max(0, curP2 - qty);
            curP1 += qty;
          }
          traspasoNote = `Traspaso interno de patio: ${qty} pza(s) de ${fromP} a ${toP} (almacenamiento).`;
        }
      }

      const needed = daySalida;
      const available = startStock.p1 + startStock.p2 + dayEntrada;
      let faltante = 0;
      let obs = '';

      if (needed > available) {
        faltante = needed - available;
        obs = `No existe suficiente stock; faltante no aplicado: ${faltante} pieza(s).`;
      } else if (daySalida === 0 && dayEntrada > 0) {
        obs = `Producción registrada en el día (+${dayEntrada} piezas).`;
      } else if (dayEntrada >= needed && needed > 0) {
        obs = `Entrada (${dayEntrada}) compensa directamente salida (${daySalida}).`;
      } else if (daySalida > 0 && startStock.p1 >= needed) {
        obs = `Salida cubierta por P1 (considerando producción/entradas).`;
      } else if (daySalida > 0) {
        obs = `Salida cubierta con combinación de P1 y P2.`;
      } else if (traspasoNote) {
        obs = traspasoNote;
      }

      if (daySalida > 0 && traspasoNote) {
        obs = `${obs} | ${traspasoNote}`;
      }

      totalFaltantes += faltante;

      salidasRevision.push({
        producto: prod,
        inicialP1: startStock.p1,
        entrada: dayEntrada,
        salida: daySalida,
        inicialP2: startStock.p2,
        resultadoP1: curP1,
        resultadoP2: curP2,
        observacion: obs,
        faltante,
      });
    }

    salidasRevision.sort((a, b) => a.producto.localeCompare(b.producto));
  } else {
    // Non-base date with no movements on that date
    salidasRevision = [];
    totalFaltantes = 0;
  }

  return {
    generalInventory,
    p1Inventory,
    p2Inventory,
    totalP1,
    totalP2,
    grandTotal: totalP1 + totalP2,
    salidasRevision,
    totalFaltantes,
  };
}

/**
 * Text batch parser supporting the user's requested format:
 * "producto/cant/p#/" (e.g., "1600TA/5/P1/" or "15000TP/2/P2/")
 * Also supports optional comment: "producto/cant/p#/comentario"
 * Mode (Entrada/Agregar vs Salida/Retiro) is governed by sectionType ('ENTRADA' | 'SALIDA').
 */
export function parseBatchMovementsText(
  text: string,
  sectionType: 'ENTRADA' | 'SALIDA' = 'ENTRADA'
): {
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
} {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const parsedMovements: Array<{
    product: string;
    type: 'ENTRADA' | 'SALIDA';
    plant: 'P1' | 'P2' | 'AUTO';
    quantity: number;
    reference: string;
    comment: string;
  }> = [];
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Priority 1: Requested format "producto/cant/p#/" or "producto/cant/p#"
    if (line.includes('/')) {
      const parts = line.split('/').map((p) => p.trim());
      // parts[0] = product, parts[1] = cant, parts[2] = plant, parts[3] = optional comment
      if (parts.length >= 3 && parts[0] && parts[1]) {
        const prod = parts[0];
        const qtyNum = Math.abs(parseInt(parts[1].replace(/[^0-9-]/g, ''), 10) || 0);
        const plantStr = parts[2].toUpperCase();
        const plant: 'P1' | 'P2' = plantStr.includes('P2') || plantStr === '2' ? 'P2' : 'P1';
        const comment = parts[3] || '';
        // If user typed negative quantity like -5, treat as SALIDA, otherwise use sectionType
        const type: 'ENTRADA' | 'SALIDA' = parts[1].startsWith('-') ? 'SALIDA' : sectionType;

        if (qtyNum > 0 && prod) {
          parsedMovements.push({
            product: prod,
            type,
            plant,
            quantity: qtyNum,
            reference: 'Carga Rápida',
            comment,
          });
          continue;
        }
      }
    }

    // Tab / Semicolon / CSV fallback
    if (line.includes('\t') || line.includes(';')) {
      const parts = line.split(/[\t;]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const prod = parts[0];
        const qtyStr = parts[1];
        const isNegative = qtyStr.startsWith('-');
        const qty = Math.abs(parseInt(qtyStr.replace(/[^0-9-]/g, ''), 10) || 0);
        const type: 'ENTRADA' | 'SALIDA' = isNegative || (parts[2] && parts[2].toUpperCase().includes('SAL')) ? 'SALIDA' : sectionType;
        const plantStr = (parts[3] || parts[2] || '').toUpperCase();
        const plant: 'P1' | 'P2' | 'AUTO' = plantStr.includes('P2') ? 'P2' : plantStr.includes('P1') ? 'P1' : 'P1';
        const comment = parts[4] || parts[3] || '';

        if (qty > 0 && prod) {
          parsedMovements.push({
            product: prod,
            type,
            plant,
            quantity: qty,
            reference: 'Carga Rápida',
            comment,
          });
          continue;
        }
      }
    }

    // Pattern 2: Signed quantity with explicit + or - (e.g., "1600TA +5 P1")
    const signedMatch = line.match(/^(.*?)\s+([+-])\s*(\d+)(?:\s+(P1|P2|AUTO))?(?:\s+(.*))?$/i);
    if (signedMatch && signedMatch[1].trim()) {
      const prod = signedMatch[1].trim();
      const sign = signedMatch[2];
      const quantity = parseInt(signedMatch[3], 10);
      const plantRaw = ((signedMatch[4] || 'P1').toUpperCase()) as 'P1' | 'P2';
      const comment = (signedMatch[5] || '').trim();
      const type: 'ENTRADA' | 'SALIDA' = sign === '-' ? 'SALIDA' : (sign === '+' ? 'ENTRADA' : sectionType);

      if (quantity > 0) {
        parsedMovements.push({
          product: prod,
          type,
          plant: plantRaw === 'P2' ? 'P2' : 'P1',
          quantity,
          reference: 'Carga Rápida',
          comment,
        });
        continue;
      }
    }

    // Pattern 3: Fallback unsigned matching (e.g., "1600TA 5 P1")
    const unsignedMatch = line.match(/^(.*?)\s+(\d+)\s*(P1|P2)?(?:\s+(.*))?$/i);
    if (unsignedMatch && unsignedMatch[1].trim()) {
      const prod = unsignedMatch[1].trim();
      const quantity = parseInt(unsignedMatch[2], 10);
      const plantRaw = ((unsignedMatch[3] || 'P1').toUpperCase()) as 'P1' | 'P2';
      const comment = (unsignedMatch[4] || '').trim();

      if (quantity > 0) {
        parsedMovements.push({
          product: prod,
          type: sectionType,
          plant: plantRaw === 'P2' ? 'P2' : 'P1',
          quantity,
          reference: 'Carga Rápida',
          comment,
        });
        continue;
      }
    }

    errors.push(`Línea ${i + 1}: No se pudo interpretar "${line}". Usa el formato: producto/cant/p#/ (ej: 1600TA/5/P1/)`);
  }

  return {
    success: errors.length === 0,
    movements: parsedMovements,
    errors,
  };
}
