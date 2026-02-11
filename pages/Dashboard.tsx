import * as React from 'react';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, MessageCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { getKPIs } from '../services/mockService';
import { triggerWebhook } from '../services/n8nService';
import { KPI } from '../types';

const Dashboard: React.FC = () => {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Default mock data for charts in case webhook doesn't return them
  const defaultChartData = [
    { name: 'Mon', revenue: 4000, orders: 240 },
    { name: 'Tue', revenue: 3000, orders: 139 },
    { name: 'Wed', revenue: 2000, orders: 980 },
    { name: 'Thu', revenue: 2780, orders: 390 },
    { name: 'Fri', revenue: 1890, orders: 480 },
    { name: 'Sat', revenue: 2390, orders: 380 },
    { name: 'Sun', revenue: 3490, orders: 430 },
  ];

  const defaultPlatformData = [
    { name: 'FB', value: 65 },
    { name: 'IG', value: 35 },
    { name: 'Conv', value: 80 },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await triggerWebhook({ action: 'get_dashboard_data' });

      let rawOrders: any[] = [];

      // Parse n8n response structure dynamically
      // Handles: [ { body: { data: [...] } } ] OR { data: [...] } OR [...]
      if (Array.isArray(response)) {
        const first = response[0];
        if (first?.body?.data) {
          rawOrders = first.body.data;
        } else if (first?.data) {
          rawOrders = first.data;
        } else {
          rawOrders = response;
        }
      } else if (response && typeof response === 'object') {
        const resObj = response as any;
        if (Array.isArray(resObj.data)) {
          rawOrders = resObj.data;
        } else if (resObj.body?.data) {
          rawOrders = resObj.body.data;
        }
      }

      console.log("Parsed Orders for Dashboard:", rawOrders);

      if (rawOrders.length > 0) {
        // 1. Calculate KPIs
        const totalRevenue = rawOrders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
        const totalOrders = rawOrders.length;

        // Count statuses
        const pending = rawOrders.filter(o =>
          ['pending', 'new', 'confirmed', 'processing', 'ready_to_ship', 'uploaded'].includes(o.status?.toLowerCase())
        ).length;

        // 2. Calculate Chart Data (Last 7 Days)
        const days = 7;
        const chartMap = new Map<string, { name: string; revenue: number; orders: number }>();
        const today = new Date();

        // Initialize last 7 days with 0 values
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateKey = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          chartMap.set(dateKey, { name: dayName, revenue: 0, orders: 0 });
        }

        // Aggregate real data
        rawOrders.forEach(order => {
          if (order.createdAt) {
            const dateKey = order.createdAt.split('T')[0];
            if (chartMap.has(dateKey)) {
              const entry = chartMap.get(dateKey)!;
              entry.revenue += (Number(order.total) || 0);
              entry.orders += 1;
            }
          }
        });

        const generatedChartData = Array.from(chartMap.values());

        // Update State
        setKpi({
          revenue: totalRevenue,
          revenue_growth: 12.5, // Requires historical data comparison, keeping static
          orders: totalOrders,
          orders_growth: 8.4,   // Keeping static
          ai_handled_rate: 92,  // Keeping static
          pending_shipments: pending
        });

        setChartData(generatedChartData);
        setPlatformData(defaultPlatformData); // Source data not explicit in current webhook payload
      } else {
        console.warn('No orders found in webhook response, using mock data.');
        setKpi(getKPIs());
        setChartData(defaultChartData);
        setPlatformData(defaultPlatformData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setKpi(getKPIs());
      setChartData(defaultChartData);
      setPlatformData(defaultPlatformData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    await triggerWebhook({ action: 'generate_report' });

    setTimeout(() => {
      setGeneratingReport(false);
      alert('Report generation triggered successfully!');
    }, 1000);
  };

  if (loading && !kpi) {
    return (
      <div className="flex h-screen items-center justify-center text-brand-green gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-xl font-medium">Loading Business Analytics...</span>
      </div>
    );
  }

  // Safety check if KPI is still null after loading (shouldn't happen due to fallback)
  const displayKpi = kpi || getKPIs();

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-brand-gray mt-1">Real-time business insights & AI performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-brand-card border border-gray-800 rounded-full text-brand-green hover:bg-gray-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <span className="text-sm text-brand-gray bg-brand-card px-4 py-2 rounded-full border border-gray-800">
            Last 7 Days
          </span>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 bg-brand-green text-black px-4 py-2 rounded-full font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70"
          >
            {generatingReport ? <Loader2 size={18} className="animate-spin" /> : null}
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-green/30 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-greenDim rounded-xl text-brand-green group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-brand-green text-sm bg-brand-greenDim px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} />
              {displayKpi.revenue_growth}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-brand-gray text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              ${displayKpi.revenue.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-brand-orange/30 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand-orangeDim rounded-xl text-brand-orange group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <div className="flex items-center gap-1 text-brand-green text-sm bg-brand-greenDim px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} />
              {displayKpi.orders_growth}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-brand-gray text-sm">Total Orders</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {displayKpi.orders.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* AI Performance Card */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-brand-gray text-sm">AI Handled Messages</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {displayKpi.ai_handled_rate}%
            </h3>
            <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${displayKpi.ai_handled_rate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-all group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
              <AlertCircle size={24} />
            </div>
            <div className="flex items-center gap-1 text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded-lg">
              Action Needed
            </div>
          </div>
          <div className="mt-4">
            <p className="text-brand-gray text-sm">Pending Shipments</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {displayKpi.pending_shipments}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-brand-card p-6 rounded-2xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Revenue Analytics</h2>
            <div className="flex gap-2">
              <button className="text-xs font-medium text-brand-green bg-brand-greenDim px-3 py-1 rounded-lg">Weekly</button>
              <button className="text-xs font-medium text-brand-gray hover:text-white px-3 py-1 rounded-lg">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : defaultChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="orders" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-brand-card p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Source Performance</h2>
          <div className="space-y-6">
            {(platformData.length > 0 ? platformData : defaultPlatformData).map((item) => (
              <div key={item.name} className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">{item.name === 'Conv' ? 'Converty Store' : item.name === 'FB' ? 'Facebook' : 'Instagram'}</span>
                  <span className="text-white font-bold">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.name === 'FB' ? 'bg-blue-500' : item.name === 'IG' ? 'bg-pink-500' : 'bg-brand-green'}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-brand-dark rounded-xl border border-gray-800">
            <h3 className="text-brand-orange font-bold text-sm mb-2">Insight</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Instagram engagement is up by 12% this week thanks to AI auto-replies on comments. Consider boosting ad spend on IG Stories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;