import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  Mail,
  Phone,
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AdminSalesManager() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (Array.isArray(data.sales)) {
        setSales(data.sales);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const confirmedSales = sales.filter((s) => {
    const st = String(s.payment_status || 'successful').toLowerCase();
    return st === 'successful' || st === 'completed';
  });

  const totalRevenue = confirmedSales.reduce((acc, sale) => acc + (Number(sale.amount) || 0), 0);
  const totalOrders = confirmedSales.length;
  const pendingOrders = sales.filter((s) => {
    const st = String(s.payment_status || '').toLowerCase();
    return st === 'pending' || st === 'under_verification';
  }).length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const filteredSales =
    statusFilter === 'all'
      ? sales
      : sales.filter((s) => {
          const st = String(s.payment_status || 'successful').toLowerCase();
          if (statusFilter === 'successful') return st === 'successful' || st === 'completed';
          if (statusFilter === 'pending') return st === 'pending' || st === 'under_verification';
          return st === 'failed' || st === 'cancelled';
        });

  const renderStatusBadge = (rawStatus?: string) => {
    const st = String(rawStatus || 'successful').toLowerCase();
    if (st === 'successful' || st === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
          <CheckCircle2 className="w-3.5 h-3.5" /> Successful
        </span>
      );
    }
    if (st === 'under_verification') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" /> Under Verification
        </span>
      );
    }
    if (st === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    if (st === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500">
          <XCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
        <XCircle className="w-3.5 h-3.5" /> Failed
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Top Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#16a34a] mb-1">
            Hardware Logistics &amp; Orders
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            NFC Card Sales &amp; Orders
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Verified Flutterwave checkouts, design-proof queue, buyer delivery states, and historical sales records.
          </p>
        </div>
        <button
          onClick={fetchSales}
          disabled={loading}
          className="px-4 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Verified Volume
            </span>
            <span className="p-2 rounded-xl bg-[#16a34a]/15 text-[#16a34a]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight tabular-nums">
            ₦{totalRevenue.toLocaleString('en-NG')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Confirmed settled payments only</p>
        </div>

        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Confirmed Orders
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {totalOrders}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {pendingOrders > 0 ? `${pendingOrders} pending / under verification` : 'All tracked orders settled'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Average Ticket
            </span>
            <span className="p-2 rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight tabular-nums">
            ₦{avgOrder.toLocaleString('en-NG')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Average verified order value</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-neutral-950 dark:text-white text-base">Customer Transaction History</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Aggregated across Flutterwave verified orders &amp; preserved historical sales
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${sales.length})` },
              { id: 'successful', label: `Confirmed (${confirmedSales.length})` },
              { id: 'pending', label: `Pending (${pendingOrders})` },
              { id: 'failed', label: 'Failed / Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                    : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Date &amp; Order</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Product / Card</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    No hardware card orders match this filter yet.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {new Date(sale.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      {sale.order_number && (
                        <div className="font-mono text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                          {sale.order_number}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-950 dark:text-white text-sm">
                        {sale.name}
                        {sale.business_name ? (
                          <span className="text-xs font-normal text-neutral-500"> · {sale.business_name}</span>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {sale.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-neutral-400" /> {sale.email}
                          </div>
                        )}
                        {sale.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-neutral-400" /> {sale.phone}
                          </div>
                        )}
                        {sale.delivery_state && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-neutral-400" /> {sale.delivery_state}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-900 dark:text-white text-xs sm:text-sm">
                        {sale.card_type}
                      </div>
                      {sale.logo_url && (
                        <a
                          href={sale.logo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] hover:underline mt-1"
                        >
                          View Uploaded Logo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderStatusBadge(sale.payment_status)}
                      {sale.payment_gateway && (
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
                          {sale.payment_gateway}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-neutral-950 dark:text-white text-sm tabular-nums whitespace-nowrap">
                      ₦{Number(sale.amount || 0).toLocaleString('en-NG')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-mono text-xs bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-md">
                        {sale.payment_reference}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
