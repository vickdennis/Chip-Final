import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, AlertTriangle, Plus, Trash2, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminSeoManager() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [report, setReport] = useState<any>({ total: 0, broken: 0, logs: [] });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ keyword_phrase: '', target_url_slug: '', type: 'post' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kwRes, repRes] = await Promise.all([
        fetch('/api/seo/keywords'),
        fetch('/api/seo/links-report')
      ]);
      if (kwRes.ok) setKeywords(await kwRes.json());
      if (repRes.ok) setReport(await repRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ keyword_phrase: '', target_url_slug: '', type: 'post' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteKeyword = async (id: number) => {
    if (!confirm('Delete keyword?')) return;
    try {
      await fetch('/api/seo/keywords/' + id, { method: 'DELETE' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const [checkingLinks, setCheckingLinks] = useState(false);

  const handleRunCron = async () => {
    setCheckingLinks(true);
    try {
      const res = await fetch('/api/seo/check-links', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setReport({
          total: json.total || report.total,
          broken: json.broken || 0,
          logs: json.logs || report.logs
        });
      }
    } catch (e) { 
      console.error(e); 
    } finally {
      setCheckingLinks(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Keyword Bank */}
      <div className="lg:col-span-8 bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
          <Search className="w-3.5 h-3.5" /> Organic Search & Internal Linking
        </div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mb-1">
          Auto-Link Keyword Bank
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
          Define target anchor keywords to automatically generate contextual internal backlinks in published articles.
        </p>

        <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row gap-2.5 mb-6">
          <input 
            required 
            placeholder="Keyword Phrase (e.g. NFC card)" 
            className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" 
            value={form.keyword_phrase} 
            onChange={e=>setForm({...form, keyword_phrase: e.target.value})} 
          />
          <input 
            required 
            placeholder="Target Slug (e.g. /blog/nfc-guide)" 
            className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" 
            value={form.target_url_slug} 
            onChange={e=>setForm({...form, target_url_slug: e.target.value})} 
          />
          <select 
            className="px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" 
            value={form.type} 
            onChange={e=>setForm({...form, type: e.target.value})}
          >
            <option value="post">Post</option>
            <option value="product">Product</option>
            <option value="page">Page</option>
          </select>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 rounded-full font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </form>

        {loading ? (
          <div className="py-12 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">Loading keywords...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Keyword Phrase</th>
                  <th className="py-3 px-4">Target Slug</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {keywords.map(kw => (
                  <tr key={kw.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-neutral-950 dark:text-white text-xs sm:text-sm">{kw.keyword_phrase}</td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">{kw.target_url_slug}</td>
                    <td className="py-3 px-4">
                      <span className="bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase">
                        {kw.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteKeyword(kw.id)} 
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {keywords.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-neutral-400 text-xs">No keywords added to link bank.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broken Link Report */}
      <div className="lg:col-span-4 bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#6c8600] dark:text-[#D2F843]" />
            Internal Link Health Monitor
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-neutral-950 dark:text-white mb-1">{report.total}</div>
              <div className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">Total Active Links</div>
            </div>
            <div className="bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 p-4 rounded-2xl text-center">
              <div className="text-2xl font-extrabold text-rose-500 mb-1">{report.broken}</div>
              <div className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">Broken Paths</div>
            </div>
          </div>

          <button 
            disabled={checkingLinks}
            onClick={handleRunCron} 
            className="w-full py-2.5 px-4 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer mb-6 disabled:opacity-50"
          >
            {checkingLinks ? 'Auditing Link Targets...' : 'Run Deep Link Audit'}
          </button>

          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Recent Auto-Link Actions</h4>
          <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
            {report.logs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="text-xs border border-neutral-200/80 dark:border-white/10 p-3 rounded-xl bg-neutral-50 dark:bg-[#151821]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-neutral-950 dark:text-white">/{log.post_slug}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">{log.status}</span>
                </div>
                <div className="text-neutral-400 font-mono text-[11px] truncate">To: {log.linked_url}</div>
                <div className="mt-1 text-[11px] text-neutral-500">Keyword: "{log.keyword_used}"</div>
              </div>
            ))}
            {report.logs.length === 0 && <p className="text-xs text-neutral-400 text-center py-4">No automated links logged yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
