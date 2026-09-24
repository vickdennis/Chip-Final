import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Mail, Phone, ShoppingBag, RefreshCw, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AdminSalesManager() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.sales) {
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

  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.amount || 0) / 100, 0);
  const totalOrders = sales.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Top Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span> Hardware Logistics & Orders
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            NFC Card Sales & Orders
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time physical card checkout logs, buyer shipping details, and Paystack settlement status.
          </p>
        </div>
        <button 
          onClick={fetchSales} 
          disabled={loading}
          className="px-4 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-full font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Gross Volume</span>
            <span className="p-2 rounded-xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843]"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            ₦{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">All completed hardware payments</p>
        </div>

        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cards Dispatched</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"><ShoppingBag className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            {totalOrders}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Successfully settled orders
          </p>
        </div>

        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Average Ticket</span>
            <span className="p-2 rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"><CreditCard className="w-4 h-4" /></span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            ₦{avgOrder.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Average purchase per transaction</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-950 dark:text-white text-base">Customer Transaction History</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Direct records received via Paystack webhook and direct checkout</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300">
            {sales.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Product / Card</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6 text-right">Payment Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    Loading sales records...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs">
                    No hardware card sales recorded yet. New purchases from the homepage or store will automatically appear here.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        {new Date(sale.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-950 dark:text-white text-sm">{sale.name}</div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-neutral-400" /> {sale.email}</div>
                        {sale.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-neutral-400" /> {sale.phone}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30">
                        <ShoppingBag className="w-3 h-3" />
                        {sale.card_type}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-neutral-950 dark:text-white text-sm">
                      ₦{(sale.amount / 100).toLocaleString()}
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
