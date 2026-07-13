import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, AlertTriangle, Plus, Trash2, Activity } from 'lucide-react';

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

  const handleRunCron = async () => {
    try {
      alert("Running Link Checker...");
      await fetch('/api/seo/check-links', { method: 'POST' });
      fetchData();
      alert("Check complete!");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Keyword Bank */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-bold text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Auto-Link Keyword Bank
            </h3>
            <button className="text-xs bg-gray-100 dark:bg-[#222] px-3 py-1 rounded border border-black/10 dark:border-white/10 font-bold">
              Upload CSV
            </button>
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2 mb-6">
            <input required placeholder="Keyword Phrase (e.g. nfc card)" className="flex-1 px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-sm" value={form.keyword_phrase} onChange={e=>setForm({...form, keyword_phrase: e.target.value})} />
            <input required placeholder="Target Slug (e.g. /blog/post-slug)" className="flex-1 px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-sm" value={form.target_url_slug} onChange={e=>setForm({...form, target_url_slug: e.target.value})} />
            <select className="px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-sm" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
              <option value="post">Post</option>
              <option value="product">Product</option>
              <option value="page">Page</option>
            </select>
            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          {loading ? <p>Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="pb-3 font-medium">Keyword</th>
                    <th className="pb-3 font-medium">Target URL</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cfc4c5] dark:divide-[#333]">
                  {keywords.map(kw => (
                    <tr key={kw.id}>
                      <td className="py-3 font-bold">{kw.keyword_phrase}</td>
                      <td className="py-3 text-black/40 dark:text-white/40">{kw.target_url_slug}</td>
                      <td className="py-3"><span className="bg-gray-100 dark:bg-[#222] px-2 py-1 rounded text-xs">{kw.type}</span></td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDeleteKeyword(kw.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {keywords.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">No keywords added.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Broken Link Report */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-sans font-bold text-lg flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-green-500" />
            Link Health Report
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-black/10 dark:border-white/10 p-4 rounded-2xl text-center">
              <div className="text-3xl font-mono font-bold mb-1">{report.total}</div>
              <div className="text-xs text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Total Links</div>
            </div>
            <div className="border border-black/10 dark:border-white/10 p-4 rounded-2xl text-center">
              <div className="text-3xl font-mono font-bold mb-1 text-red-500">{report.broken}</div>
              <div className="text-xs text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Broken Links</div>
            </div>
          </div>

          <button onClick={handleRunCron} className="w-full mb-6 border border-black dark:border-white py-2 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
            Run Manual Link Check
          </button>

          <h4 className="font-bold text-sm mb-3">Recent Auto-Links</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {report.logs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="text-xs border border-black/10 dark:border-white/10 p-3 rounded bg-gray-50 dark:bg-[#1a1a1a]">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">From: /{log.post_slug}</span>
                  <span className="text-green-600 font-bold">{log.status}</span>
                </div>
                <div className="text-black/40 dark:text-white/40 break-all">To: {log.linked_url}</div>
                <div className="mt-1 opacity-70">Keyword: "{log.keyword_used}"</div>
              </div>
            ))}
            {report.logs.length === 0 && <p className="text-sm text-gray-500">No links logged yet.</p>}
          </div>

        </div>
      </div>

    </div>
  );
}
