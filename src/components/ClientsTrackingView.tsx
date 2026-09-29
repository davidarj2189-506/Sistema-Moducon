import React, { useState } from 'react';
import { ClientRecord, InventoryMovement, ProductInventoryState } from '../types/inventory';
import { 
  Building, 
  Search, 
  Plus, 
  Truck, 
  BookmarkCheck, 
  Phone, 
  MapPin, 
  Tag
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

    // Check movements with client field
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

    // Check reserved products matching client name or clienteReserva
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
    <div className="space-y-6 no-print">
      {/* Top Banner and Search */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-[#165a36] rounded-lg border border-emerald-100">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Rastreabilidad de Clientes, Obras y Pedidos Solicitados
              </h2>
              <p className="text-xs text-gray-500">
                Control de despachos entregados y existencias en concreto reservadas por cliente
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente u obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs w-56 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#165a36]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#165a36] hover:bg-[#12462a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid of Clients */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#165a36] flex items-center justify-center mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">
            {searchTerm ? 'No se encontraron clientes con ese nombre' : 'Sin clientes registrados en el sistema'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? 'Verifica los términos de búsqueda o borra el filtro para ver todos.'
              : 'El catálogo de clientes está listo y limpio para que agregues únicamente tus constructoras, clientes y proyectos reales.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#165a36] hover:bg-[#12462a] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
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
              className="bg-white rounded-xl border border-gray-200 shadow-xs hover:border-gray-300 transition-colors p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-[#165a36] shrink-0" />
                      {client.name}
                    </h3>
                    {client.projectOrSite && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {client.projectOrSite}
                      </p>
                    )}
                  </div>
                </div>

                {/* KPI metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Despachos a Obra</span>
                    <span className="font-bold text-gray-800 text-sm">
                      {stats.dispatchCount} <span className="text-xs font-normal text-gray-500">entregas</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Piezas Retiradas</span>
                    <span className="font-bold text-[#165a36] text-sm">
                      {stats.totalDispatchedPieces} <span className="text-xs font-normal text-gray-500">unids</span>
                    </span>
                  </div>
                </div>

                {/* Active reservations */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                    Reservas Activas en Inventario ({stats.reservedProducts.length}):
                  </span>

                  {stats.reservedProducts.length > 0 ? (
                    <div className="space-y-1.5">
                      {stats.reservedProducts.map((res, i) => (
                        <div
                          key={i}
                          className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-amber-950">{res.product}</span>
                            <p className="text-[11px] text-amber-800 italic">{res.reservaText}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-white border border-amber-300 rounded font-bold text-amber-900 text-xs">
                            {res.stock} en patio
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded-lg">
                      No tiene productos apartados en el reporte actualmente.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSingleEntryForClient(client.name)}
                  className="px-3 py-1.5 bg-[#165a36] hover:bg-[#12462a] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Despachar a este Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStatusModal(generalInventory[0]?.product || '1600TA')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Apartar o reservar un tanque para este cliente"
                >
                  <Tag className="w-3.5 h-3.5 text-gray-500" />
                  <span>Apartar Tanque</span>
                </button>
              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#165a36] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Registrar Nuevo Cliente / Constructora</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-100 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nombre de la Empresa o Cliente *
                </label>
                <input
                  type="text"
                  placeholder="ej. Constructora Bolívar SAS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Obra / Proyecto / Frente de Trabajo
                </label>
                <input
                  type="text"
                  placeholder="ej. Urbanización Los Pinos - Manzana 4"
                  value={projectOrSite}
                  onChange={(e) => setProjectOrSite(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 310 555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Contacto / Residente
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ing. Carlos Pérez"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165a36]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#165a36] hover:bg-[#12462a] rounded-lg shadow-sm cursor-pointer"
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
