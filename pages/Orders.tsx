import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Truck, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Loader2, Phone } from 'lucide-react';
import { getRecentOrders } from '../services/mockService';
import { triggerWebhook } from '../services/n8nService';
import { Order, OrderStatus, Platform } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to map raw string status to OrderStatus enum
  const mapStatus = (status: string): OrderStatus => {
    const s = status?.toLowerCase() || '';
    if (s.includes('deliver')) return OrderStatus.DELIVERED;
    if (s.includes('cancel')) return OrderStatus.CANCELLED;
    if (s.includes('reject')) return OrderStatus.REJECTED;
    if (s.includes('attempt')) return OrderStatus.ATTEMPT;
    if (s.includes('confirm')) return OrderStatus.CONFIRMED;
    if (s.includes('upload')) return OrderStatus.UPLOADED;
    if (s.includes('pend')) return OrderStatus.PENDING;
    return OrderStatus.UPLOADED; // Default to Uploaded if unknown, as it seems to be the initial state
  };

  // Helper to determine platform type
  const mapPlatform = (source: string): Platform => {
    const s = source?.toLowerCase() || '';
    if (s.includes('facebook')) return Platform.FACEBOOK;
    if (s.includes('instagram')) return Platform.INSTAGRAM;
    return Platform.CONVERTY;
  };

  const fetchOrders = async () => {
    try {
      // Fetch orders specifically using the new action
      const response = await triggerWebhook({ action: 'get_orders' });

      let rawOrders: any[] = [];

      // Robust Parsing Logic for various n8n response structures
      if (Array.isArray(response)) {
        if (response[0]?.body?.data) {
          rawOrders = response[0].body.data;
        } else if (response[0]?.data) {
          rawOrders = response[0].data;
        } else {
          rawOrders = response;
        }
      } else if (response && typeof response === 'object') {
        // @ts-ignore
        if (Array.isArray(response.data)) {
          // @ts-ignore
          rawOrders = response.data;
        }
        // @ts-ignore
        else if (response.body?.data) {
          // @ts-ignore
          rawOrders = response.body.data;
        }
      }

      if (rawOrders && rawOrders.length > 0) {
        const mappedOrders: Order[] = rawOrders.map((o: any) => ({
          id: o._id || `temp-${Math.random()}`,
          store_id: o.store || 'unknown',
          customer: {
            id: o._id || `cust-${Math.random()}`,
            name: o.customer?.name || `${o.firstname || ''} ${o.lastname || ''}`.trim() || 'Unknown Customer',
            phone: o.customer?.phone || o.phone || 'N/A',
            platform_id: 'unknown',
            platform_type: mapPlatform(o.source || o.platform || ''),
            avatar_url: undefined
          },
          converty_order_id: o.reference ? `#${o.reference}` : 'N/A',
          status: mapStatus(o.status),
          total_amount: Number(o.total?.totalPrice) || Number(o.total) || 0,
          items_count: Array.isArray(o.products) ? o.products.length : 1,
          created_at: o.createdAt || new Date().toISOString()
        }));

        // Sort by newest first
        mappedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(mappedOrders);
      } else {
        console.warn("No orders found in webhook response, using fallback.");
        setOrders(getRecentOrders());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders(getRecentOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Trigger backend sync
      await triggerWebhook({ action: 'sync_orders' });
      // Refresh local data
      await fetchOrders();
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20';
      case OrderStatus.DELIVERED: return 'text-brand-green bg-brand-greenDim border border-brand-green/20';
      case OrderStatus.CANCELLED: return 'text-red-400 bg-red-400/10 border border-red-400/20';
      case OrderStatus.ATTEMPT: return 'text-brand-orange bg-brand-orangeDim border border-brand-orange/20';
      case OrderStatus.REJECTED: return 'text-gray-400 bg-gray-700 border border-gray-600';
      case OrderStatus.CONFIRMED: return 'text-blue-400 bg-blue-400/10 border border-blue-400/20';
      case OrderStatus.UPLOADED: return 'text-indigo-400 bg-indigo-400/10 border border-indigo-400/20';
      default: return 'text-white border border-gray-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={14} />;
      case OrderStatus.DELIVERED: return <CheckCircle size={14} />;
      case OrderStatus.CANCELLED: return <XCircle size={14} />;
      case OrderStatus.ATTEMPT: return <Truck size={14} />;
      case OrderStatus.REJECTED: return <AlertTriangle size={14} />;
      case OrderStatus.CONFIRMED: return <CheckCircle size={14} />;
      case OrderStatus.UPLOADED: return <Clock size={14} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-brand-green gap-3 p-12">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xl font-medium">Loading Orders...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-brand-gray mt-1">Manage and track delivery status</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-brand-card hover:bg-gray-800 text-brand-green p-3 rounded-xl border border-gray-800 transition-colors disabled:opacity-50"
            title="Sync with Delivery Provider"
          >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              triggerWebhook({ action: 'export_data' });
              alert('Exporting data...');
            }}
            className="bg-brand-card hover:bg-gray-800 text-white p-3 rounded-xl border border-gray-800 transition-colors"
            title="Export Data"
          >
            <Filter size={20} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search order ID or phone..."
              className="bg-brand-card border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-green w-64 lg:w-80"
            />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {['All', 'Uploaded', 'Confirmed', 'Pending', 'Attempt', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status.toLowerCase());
              triggerWebhook({ action: 'filter_orders', status: status.toLowerCase() });
            }}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${filter === status.toLowerCase()
              ? 'bg-brand-green/20 border-brand-green text-brand-green'
              : 'bg-brand-card border-gray-800 text-gray-400 hover:text-white'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-brand-card rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-brand-gray text-sm bg-black/20">
                <th className="p-5 font-medium">Order Ref</th>
                <th className="p-5 font-medium">Customer Details</th>
                <th className="p-5 font-medium">Total Amount</th>
                <th className="p-5 font-medium">Status</th>
                <th className="p-5 font-medium">Date</th>
                <th className="p-5 font-medium">Platform</th>
                <th className="p-5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{order.converty_order_id}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-medium text-white text-base">{order.customer.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-brand-gray mt-1 font-mono bg-white/5 w-fit px-2 py-0.5 rounded">
                      <Phone size={10} />
                      {order.customer.phone}
                    </div>
                  </td>
                  <td className="p-5 font-mono text-white font-bold text-lg">
                    {order.total_amount.toFixed(2)} <span className="text-xs text-brand-gray font-normal">TND</span>
                  </td>
                  <td className="p-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-brand-gray text-sm">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    <div className="text-xs text-gray-600 mt-0.5">
                      {new Date(order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${order.customer.platform_type === Platform.FACEBOOK ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                      order.customer.platform_type === Platform.INSTAGRAM ? 'border-pink-500/30 text-pink-400 bg-pink-500/10' :
                        'border-purple-500/30 text-purple-400 bg-purple-500/10'
                      }`}>
                      {order.customer.platform_type === Platform.CONVERTY ? 'Converty' : order.customer.platform_type}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={24} className="opacity-20" />
                      <p>No orders found matching your filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;