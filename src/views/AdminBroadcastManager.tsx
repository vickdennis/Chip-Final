import React, { useState, useEffect } from 'react';
import { Send, Filter, FileText, MessageCircle, AlertCircle, PhoneForwarded, CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AdminBroadcastManager() {
  const [sendType, setSendType] = useState<'post' | 'custom'>('post');
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalLeads: 0, sent7Days: 0, sent1Hour: 0, remainingHour: 50 });
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'city' | 'source'>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  
  const [customMessage, setCustomMessage] = useState<string>('Hi {Name}, check out our newest updates on CHIPNG NFC digital cards...');
  
  const [loading, setLoading] = useState(false);
  const [senderMode, setSenderMode] = useState(false);
  
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
    const date = new Date(dateString.endsWith("Z") ? dateString : dateString.replace(" ", "T") + "Z");
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

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
    
    let phone = lead.whatsapp.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '234' + phone.slice(1);
    
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;
    window.open(waUrl, '_blank');

    try {
      const res = await fetch('/api/broadcast/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id })
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === lead.id ? { ...l, last_broadcast_at: new Date().toISOString() } : l));
        setStats((s: any) => ({ ...s, remainingHour: s.remainingHour - 1, sent7Days: s.sent7Days + 1 }));
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111318] p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSenderMode(false)} 
              className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 font-semibold text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Back to Setup
            </button>
            <h2 className="font-bold text-base text-neutral-950 dark:text-white">Direct WhatsApp Dispatch Queue</h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className={stats.remainingHour < 10 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}>
              {stats.remainingHour} Safe Sends Remaining This Hour
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6">
          <div className="space-y-3">
            {paginatedLeads.map(lead => (
              <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
                <div>
                  <div className="font-bold text-neutral-950 dark:text-white text-sm">{lead.name}</div>
                  <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{lead.whatsapp} • {lead.city || 'No City'}</div>
                </div>
                <button
                  onClick={() => handleSendOne(lead)}
                  disabled={stats.remainingHour <= 0}
                  className="px-4 py-2 rounded-full bg-[#25D366] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" /> Open Chat & Send
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200/80 dark:border-white/10">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-neutral-400">Page {currentPage} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => c + 1)}
                className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Configuration Column */}
      <div className="lg:col-span-7 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
          <Send className="w-3.5 h-3.5" /> WhatsApp Push Engine
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white mb-1">
          WhatsApp Broadcast Manager
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
          Reach opted-in customers with new article alerts or targeted NFC promotions with zero spam risk.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Campaign Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer text-neutral-900 dark:text-neutral-200">
                <input type="radio" name="sendType" checked={sendType === 'post'} onChange={() => setSendType('post')} className="accent-neutral-950 dark:accent-[#D2F843]" />
                <FileText className="w-4 h-4" /> Share Blog Post
              </label>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer text-neutral-900 dark:text-neutral-200">
                <input type="radio" name="sendType" checked={sendType === 'custom'} onChange={() => setSendType('custom')} className="accent-neutral-950 dark:accent-[#D2F843]" />
                <MessageCircle className="w-4 h-4" /> Custom Message
              </label>
            </div>
          </div>

          {sendType === 'post' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Choose Article</label>
              <select 
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
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

          {sendType === 'custom' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Message Template (Use {'{Name}'})</label>
              <textarea 
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] h-32"
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
              />
            </div>
          )}

          <div className="pt-4 border-t border-neutral-200/80 dark:border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Target Audience Segment
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select 
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                value={audienceFilter}
                onChange={e => {
                  setAudienceFilter(e.target.value as any);
                  if (e.target.value === 'city') setFilterValue(uniqueCities[0] || '');
                  else if (e.target.value === 'source') setFilterValue(uniqueSources[0] || '');
                  else setFilterValue('');
                }}
              >
                <option value="all">All Eligible Leads</option>
                <option value="city">Filter by City</option>
                <option value="source">Filter by Source Post</option>
              </select>

              {audienceFilter === 'city' && (
                <select className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                  {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {audienceFilter === 'source' && (
                <select className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]" value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                  {uniqueSources.map(s => <option key={s} value={s}>/{s}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4 flex items-center gap-2">
            Recipient Chat Preview
          </h3>
          <div className="bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-2xl relative overflow-hidden flex flex-col justify-end min-h-[260px] border border-neutral-300 dark:border-neutral-800">
            <div className="relative z-10 bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-3.5 rounded-2xl rounded-tr-none self-end max-w-[90%] shadow-sm text-xs leading-relaxed whitespace-pre-wrap">
              {generateMessage('Chidi', false)}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200/80 dark:border-white/10">
          <div className="flex items-start gap-2 text-xs text-neutral-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#6c8600] dark:text-[#D2F843] mt-0.5" />
            <p><strong>{eligibleLeads.length} recipients</strong> ready. Auto-skips users messaged within 7 days or who requested opt-out.</p>
          </div>
          
          <button 
            onClick={handleGenerateLinks}
            disabled={eligibleLeads.length === 0 || (sendType === 'post' && !selectedPost)}
            className="w-full py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-50 font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Launch Dispatch Queue ({eligibleLeads.length})
          </button>
        </div>
      </div>
    </div>
  );
}
