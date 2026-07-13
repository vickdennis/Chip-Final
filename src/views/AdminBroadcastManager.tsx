import React, { useState, useEffect } from 'react';
import { Send, Filter, FileText, MessageCircle, AlertCircle, PhoneForwarded, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminBroadcastManager() {
  const [sendType, setSendType] = useState<'post' | 'custom'>('post');
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalLeads: 0, sent7Days: 0, sent1Hour: 0, remainingHour: 50 });
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'city' | 'source'>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  
  const [customMessage, setCustomMessage] = useState<string>('Hi {Name}, ...');
  
  const [loading, setLoading] = useState(false);
  const [senderMode, setSenderMode] = useState(false);
  
  // Pagination for sender
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: postsData } = await supabase.from('posts').select('*').eq('is_published', true).order('created_at', { ascending: false });
      if (postsData) setPosts(postsData);

      const [leadsRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/broadcast/stats')
      ]);
      
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const isSentLast7Days = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  // Filter leads: opted out or sent in last 7 days are EXCLUDED
  const uniqueCities = Array.from(new Set(leads.map(l => l.city).filter(Boolean)));
  const uniqueSources = Array.from(new Set(leads.map(l => l.post_slug).filter(Boolean)));

  const eligibleLeads = leads.filter(l => {
    if (l.opt_out === 1) return false;
    if (isSentLast7Days(l.last_broadcast_at)) return false;
    if (audienceFilter === 'all') return true;
    if (audienceFilter === 'city') return l.city === filterValue;
    if (audienceFilter === 'source') return l.post_slug === filterValue;
    return true;
  });

  const generateMessage = (leadName: string, includeTracking: boolean = true) => {
    const nameStr = leadName && leadName.trim() ? leadName.trim() : 'there';
    const optOutText = "\n\nReply STOP to opt out";
    
    if (sendType === 'post') {
      if (!selectedPost) return 'Please select a post first.';
      const url = new URL(`https://chipng.com/blog/${selectedPost.slug}`);
      if (includeTracking) {
        url.searchParams.append('utm_source', 'whatsapp_broadcast');
        url.searchParams.append('utm_medium', 'direct');
      }
      return `Hi ${nameStr},\n\nWe just published a new article: "${selectedPost.title}".\n\nRead it here: ${url.toString()}${optOutText}`;
    }
    return customMessage.replace(/{Name}/gi, nameStr) + optOutText;
  };

  const handleGenerateLinks = () => {
    if (eligibleLeads.length === 0) return alert('No eligible leads match this filter.');
    if (sendType === 'post' && !selectedPost) return alert('Select a post.');
    setSenderMode(true);
    setCurrentPage(1);
  };

  const handleSendOne = async (lead: any) => {
    if (stats.remainingHour <= 0) {
      alert("Rate limit reached! Maximum 50 sends per hour to prevent WhatsApp ban.");
      return;
    }

    const message = generateMessage(lead.name, true);
    const encoded = encodeURIComponent(message);
    
    // Clean number
    let phone = lead.whatsapp.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.slice(1);
    
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    
    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Mark sent in DB
    try {
      const res = await fetch('/api/broadcast/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id })
      });
      if (res.ok) {
        // Update local state
        setLeads(leads.map(l => l.id === lead.id ? { ...l, last_broadcast_at: new Date().toISOString() } : l));
        setStats(s => ({ ...s, remainingHour: s.remainingHour - 1, sent7Days: s.sent7Days + 1 }));
      }
    } catch (e) {
      console.error("Failed to mark sent", e);
    }
  };

  if (senderMode) {
    const paginatedLeads = eligibleLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(eligibleLeads.length / itemsPerPage);

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between bg-white/40 dark:bg-black/40 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSenderMode(false)} className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#222]">Back to Setup</button>
            <h2 className="font-sans font-bold text-lg">Send Broadcast (Click-to-Send Bulk)</h2>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className={stats.remainingHour < 10 ? "text-red-500" : "text-green-500"}>
              {stats.remainingHour} Sends Remaining This Hour
            </span>
            <span className="text-gray-500">
              Total Target: {eligibleLeads.length} Leads
            </span>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-sm border border-black/10 dark:border-white/10 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a]">
                <th className="p-4 font-medium">Lead</th>
                <th className="p-4 font-medium">WhatsApp</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cfc4c5] dark:divide-[#333]">
              {paginatedLeads.map(lead => {
                const isSent = isSentLast7Days(lead.last_broadcast_at);
                return (
                  <tr key={lead.id} className={isSent ? "opacity-50" : ""}>
                    <td className="p-4 font-bold">{lead.name || 'Unknown'}</td>
                    <td className="p-4 font-mono text-gray-600 dark:text-gray-400">{lead.whatsapp}</td>
                    <td className="p-4">
                      {isSent ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle className="w-4 h-4" /> Sent</span>
                      ) : (
                        <span className="text-yellow-600 font-bold text-xs">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleSendOne(lead)}
                        disabled={isSent || stats.remainingHour <= 0}
                        className="bg-[#25D366] hover:bg-[#20b858] disabled:opacity-50 text-black dark:text-white font-bold py-2 px-4 rounded-xl transition-colors inline-flex items-center gap-2 text-xs"
                      >
                        <PhoneForwarded className="w-4 h-4" />
                        {isSent ? 'Sent' : 'Open & Send'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a]">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl disabled:opacity-50 text-sm font-bold"
            >
              Previous
            </button>
            <span className="text-sm font-bold font-mono">Page {currentPage} of {totalPages || 1}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl disabled:opacity-50 text-sm font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Configuration Panel */}
      <div className="space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 rounded-2xl text-center">
            <div className="text-2xl font-mono font-bold mb-1">{stats.totalLeads}</div>
            <div className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Total Leads</div>
          </div>
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 rounded-2xl text-center">
            <div className="text-2xl font-mono font-bold mb-1 text-blue-500">{stats.sent7Days}</div>
            <div className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Sent (7 Days)</div>
          </div>
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-4 rounded-2xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 z-0"></div>
            <div className="relative z-10">
              <div className="text-2xl font-mono font-bold mb-1 text-green-600">{stats.remainingHour}</div>
              <div className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">Sends Left / Hr</div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-bold text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Campaign Setup
            </h3>
            <button onClick={fetchData} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-2xl transition-colors"><RefreshCw className="w-4 h-4" /></button>
          </div>

          <div className="space-y-6">
            {/* Send Type */}
            <div>
              <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Send Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="sendType" checked={sendType === 'post'} onChange={() => setSendType('post')} className="accent-black dark:accent-white" />
                  <FileText className="w-4 h-4" /> Blog Post
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="sendType" checked={sendType === 'custom'} onChange={() => setSendType('custom')} className="accent-black dark:accent-white" />
                  <MessageCircle className="w-4 h-4" /> Custom Message
                </label>
              </div>
            </div>

            {/* Post Selection */}
            {sendType === 'post' && (
              <div>
                <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Select Post</label>
                <select 
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[13px] bg-transparent"
                  onChange={(e) => setSelectedPost(posts.find(p => p.id === e.target.value))}
                  value={selectedPost?.id || ''}
                >
                  <option value="">-- Choose a published post --</option>
                  {posts.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Message */}
            {sendType === 'custom' && (
              <div>
                <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Message Template (Use {`{Name}`})</label>
                <textarea 
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[13px] bg-transparent h-32"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                />
              </div>
            )}

            {/* Audience Filter */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10">
              <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Select Audience
              </label>
              <div className="flex flex-col gap-3">
                <select 
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[13px] bg-transparent"
                  value={audienceFilter}
                  onChange={e => {
                    setAudienceFilter(e.target.value as any);
                    if (e.target.value === 'city') setFilterValue(uniqueCities[0] || '');
                    else if (e.target.value === 'source') setFilterValue(uniqueSources[0] || '');
                    else setFilterValue('');
                  }}
                >
                  <option value="all">All Leads</option>
                  <option value="city">Filter by City</option>
                  <option value="source">Filter by Source Post</option>
                </select>

                {audienceFilter === 'city' && (
                  <select className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[13px] bg-transparent" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                    {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}

                {audienceFilter === 'source' && (
                  <select className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl text-[13px] bg-transparent" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                    {uniqueSources.map(s => <option key={s} value={s}>/{s}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview & Action Panel */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 flex flex-col">
        <h3 className="font-sans font-bold text-lg mb-6 flex items-center gap-2">
          Message Preview
        </h3>
        
        <div className="flex-1 bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-end min-h-[300px]">
          {/* WhatsApp chat background mock */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://static.whatsapp.net/rsrc.php/v3/yl/r/r_QPdKzX2h.png')] mix-blend-multiply dark:mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-3 rounded-lg rounded-tr-none self-end max-w-[85%] shadow-sm text-sm whitespace-pre-wrap">
            {generateMessage('John', false)}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex items-start gap-2 text-xs text-black/40 dark:text-white/40 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>{eligibleLeads.length} leads</strong> match criteria. Excludes {leads.length - eligibleLeads.length} leads (opted-out or sent within 7 days).</p>
          </div>
          
          <button 
            onClick={handleGenerateLinks}
            disabled={eligibleLeads.length === 0 || (sendType === 'post' && !selectedPost)}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            Generate Links ({eligibleLeads.length})
          </button>
        </div>
      </div>
    </div>
  );
}
