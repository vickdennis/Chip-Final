import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Mail, Phone, ShoppingBag, RefreshCw } from 'lucide-react';

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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black dark:text-white tracking-tight mb-1">
            NFC Sales
          </h2>
          <p className="text-[16px] text-black/60 dark:text-white/60">Monitor and manage your NFC card orders.</p>
        </div>
        <button onClick={fetchSales} className="p-3 bg-white/10 hover:bg-white/20 text-black dark:text-white rounded-xl transition-colors border border-black/10 dark:border-white/10 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-sm border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                <th className="p-4 font-mono text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">Date</th>
                <th className="p-4 font-mono text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">Customer Info</th>
                <th className="p-4 font-mono text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">Product</th>
                <th className="p-4 font-mono text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">Amount</th>
                <th className="p-4 font-mono text-[11px] font-bold text-black/50 dark:text-white/50 uppercase tracking-wider">Payment Ref</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black/50 dark:text-white/50">Loading sales data...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black/50 dark:text-white/50">No sales recorded yet.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-[13px] whitespace-nowrap text-black/60 dark:text-white/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sale.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[14px] text-black dark:text-white">{sale.name}</div>
                      <div className="flex flex-col gap-1 mt-1 text-[12px] text-black/60 dark:text-white/60">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {sale.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {sale.phone}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {sale.card_type}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[14px] text-black dark:text-white">
                      ₦{(sale.amount / 100).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] bg-black/5 dark:bg-white/10 px-2 py-1 rounded text-black/70 dark:text-white/70">
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
