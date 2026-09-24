import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, MessageCircle, Users, CheckCircle2, PhoneCall, ArrowUpRight } from 'lucide-react';

export default function AdminLeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        console.error("Error fetching leads:", await res.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Name', 'WhatsApp', 'City', 'Post Slug', 'Source'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + leads.map(l => {
          return `"${new Date(l.created_at).toISOString()}","${l.name}","${l.whatsapp}","${l.city || ''}","${l.post_slug}","${l.source}"`;
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chipng_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inlineCount = leads.filter(l => l.source === 'inline').length;
  const stickyCount = leads.filter(l => l.source === 'sticky').length;

  return (
    <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageCircle className="w-3.5 h-3.5" /> Direct Conversion Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            WhatsApp Sales Leads
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Prospects captured via blog post inquiries, sticky callout bars, and NFC product interest forms.
          </p>
        </div>
        <button 
          onClick={downloadCSV} 
          disabled={leads.length === 0}
          className="px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{leads.length}</div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">Total Leads Ingested</div>
        </div>
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{inlineCount}</div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">Article In-Text Converts</div>
        </div>
        <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#596e00] dark:text-[#D2F843] tracking-tight">{stickyCount}</div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">Sticky Floating Bar Converts</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
          Loading leads database...
        </div>
      ) : leads.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-xs border border-dashed border-neutral-200/80 dark:border-white/10 rounded-2xl">
          No leads captured yet. Lead opt-in forms across the blog and landing pages will automatically stream here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">WhatsApp Phone</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Source Page</th>
                <th className="py-3.5 px-4">Variant</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap text-neutral-400">
                    {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-950 dark:text-white text-sm">
                    {lead.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {lead.whatsapp}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {lead.city || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] truncate max-w-[150px]">/{lead.post_slug}</span>
                      <span className="text-[10px] text-neutral-400">via {lead.source}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {lead.clicked_variant || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/broadcast/toggle-optout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ lead_id: lead.id, opt_out: lead.opt_out === 1 ? 0 : 1 })
                            });
                            fetchLeads();
                          } catch(e) { console.error(e); }
                        }}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                          lead.opt_out === 1 
                            ? 'border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/40' 
                            : 'border-neutral-200/80 dark:border-white/10 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {lead.opt_out === 1 ? 'Opted Out' : 'Subscribed'}
                      </button>
                      <a 
                        href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-[#25D366]/15 text-[#1ebc59] dark:text-[#25D366] border border-[#25D366]/30 px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#25D366]/25 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
