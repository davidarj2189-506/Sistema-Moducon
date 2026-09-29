import React, { useState } from 'react';
import { ClientRecord, InventoryMovement, ProductInventoryState } from '../types/inventory';
import { 
  Search, 
  Plus, 
  Truck, 
  BookmarkCheck, 
  MapPin, 
  Tag,
  Building2,
  X
} from 'lucide-react';

interface ClientsTrackingViewProps {
  clients: ClientRecord[];
  movements: InventoryMovement[];
  generalInventory: ProductInventoryState[];
  onAddClient: (name: string, project?: string, phone?: string, contact?: string) => void;
  onOpenStatusModal: (product: string) => void;
  onOpenSingleEntryForClient: (clientName: string) => void;
}

export const ClientsTrackingView: React.FC<ClientsTrackingViewProps> = ({
  clients,
  movements,
  generalInventory,
  onAddClient,
  onOpenStatusModal,
  onOpenSingleEntryForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [projectOrSite, setProjectOrSite] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState('');

  // Filter clients
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.projectOrSite && c.projectOrSite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate client analytics
  const clientStats = React.useMemo(() => {
    const stats: Record<
      string, 
      { 
        totalDispatchedPieces: number; 
        dispatchCount: number; 
        reservedProducts: Array<{ product: string; reservaText: string; stock: number }>;
        recentMovements: InventoryMovement[];
      }
    > = {};

    clients.forEach((c) => {
      stats[c.name.toLowerCase()] = {
        totalDispatchedPieces: 0,
        dispatchCount: 0,
        reservedProducts: [],
        recentMovements: [],
      };
    });

    movements.forEach((m) => {
      if (m.client) {
        const key = m.client.toLowerCase();
        if (!stats[key]) {
          stats[key] = {
            totalDispatchedPieces: 0,
            dispatchCount: 0,
            reservedProducts: [],
            recentMovements: [],
          };
        }
        if (m.type === 'SALIDA') {
          stats[key].totalDispatchedPieces += m.quantity;
          stats[key].dispatchCount += 1;
        }
        stats[key].recentMovements.push(m);
      }
    });

    generalInventory.forEach((item) => {
      if (item.reservas) {
        clients.forEach((c) => {
          const key = c.name.toLowerCase();
          const matchReserva = item.reservas.toLowerCase().includes(key) || 
            (item.clienteReserva && item.clienteReserva.toLowerCase() === key);
          
          if (matchReserva) {
            stats[key]?.reservedProducts.push({
              product: item.product,
              reservaText: item.reservas,
              stock: item.total,
            });
          }
        });
      }
    });

    return stats;
  }, [clients, movements, generalInventory]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddClient(name.trim(), projectOrSite.trim() || undefined, phone.trim() || undefined, contact.trim() || undefined);
    setName('');
    setProjectOrSite('');
    setPhone('');
    setContact('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 no-print">
      {/* Top Banner and Search */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Clientes & Obras Solicitantes
          </h2>
          <p className="text-xs text-zinc-400">
            Trazabilidad de despachos entregados y reservas activas por constructor
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente u obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-7 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs w-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid of Clients */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 mx-auto text-zinc-300" />
          <h3 className="font-medium text-zinc-800 text-xs">
            {searchTerm ? 'No se encontraron clientes con ese nombre' : 'Sin clientes registrados en el sistema'}
          </h3>
          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
            {searchTerm 
              ? 'Verifica los términos de búsqueda o borra el filtro.'
              : 'Agrega tus clientes, constructoras y obras para asociarlos a los despachos de patio.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Cliente</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const stats = clientStats[client.name.toLowerCase()] || {
            totalDispatchedPieces: 0,
            dispatchCount: 0,
            reservedProducts: [],
            recentMovements: [],
          };

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors p-4 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900">
                      {client.name}
                    </h3>
                    {client.projectOrSite && (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        {client.projectOrSite}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-zinc-50 rounded-lg border border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-medium">Entregas</span>
                    <span className="font-semibold text-zinc-900 text-xs font-mono-numbers">
                      {stats.dispatchCount} <span className="text-[11px] font-normal text-zinc-400">viajes</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-medium">Despachadas</span>
                    <span className="font-semibold text-zinc-900 text-xs font-mono-numbers">
                      {stats.totalDispatchedPieces} <span className="text-[11px] font-normal text-zinc-400">piezas</span>
                    </span>
                  </div>
                </div>

                {/* Active reservations */}
                <div className="mt-2.5">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                    Reservas en inventario ({stats.reservedProducts.length})
                  </span>

                  {stats.reservedProducts.length > 0 ? (
                    <div className="space-y-1">
                      {stats.reservedProducts.map((res, i) => (
                        <div
                          key={i}
                          className="p-1.5 bg-zinc-50 border border-zinc-200/70 rounded-md text-[11px] flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-zinc-900">{res.product}</span>
                            <p className="text-[10px] text-zinc-500">{res.reservaText}</p>
                          </div>
                          <span className="font-mono font-medium text-zinc-700 text-[11px]">
                            {res.stock} pzas
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">
                      Sin apartados activos en este momento.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSingleEntryForClient(client.name)}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Truck className="w-3 h-3 text-zinc-300" />
                  <span>Despachar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStatusModal(generalInventory[0]?.product || '1600TA')}
                  className="px-2 py-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-zinc-200"
                  title="Apartar tanque para este cliente"
                >
                  <Tag className="w-3 h-3 text-zinc-400" />
                  <span>Apartar</span>
                </button>
              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/30 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="font-semibold text-xs text-zinc-900 uppercase tracking-wide">
                Nuevo Cliente / Constructora
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 uppercase mb-1">
                  Empresa / Cliente *
                </label>
                <input
                  type="text"
                  placeholder="ej. Constructora Bolívar SAS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 uppercase mb-1">
                  Obra / Proyecto / Frente
                </label>
                <input
                  type="text"
                  placeholder="ej. Urbanización Los Pinos"
                  value={projectOrSite}
                  onChange={(e) => setProjectOrSite(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 310 555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 uppercase mb-1">
                    Contacto / Residente
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ing. Carlos Pérez"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
