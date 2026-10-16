import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Download, 
  MessageCircle, 
  Users, 
  CheckCircle2, 
  PhoneCall, 
  ArrowUpRight, 
  Mail, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Send, 
  Check, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  Zap,
  Building2,
  Cpu
} from 'lucide-react';
import { toast } from '../components/Toast';

export default function AdminLeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'inquiries' | 'leads'>('inquiries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_review' | 'resolved'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchLeads();

    // Listen to real-time broadcast channel from contact form
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('chipng_inquiries_channel');
        bc.onmessage = () => {
          fetchLeads();
          toast.success('🔔 New direct inquiry received!');
        };
      }
    } catch (e) {}

    const handleCustom = () => {
      fetchLeads();
      toast.success('🔔 New direct inquiry received!');
    };
    window.addEventListener('chipng_new_inquiry', handleCustom);

    // Periodic auto-poll
    const interval = setInterval(fetchLeads, 12000);

    return () => {
      if (bc) try { bc.close(); } catch (e) {}
      window.removeEventListener('chipng_new_inquiry', handleCustom);
      clearInterval(interval);
    };
  }, []);

  const fetchLeads = async () => {
    let fetchedList: any[] = [];

    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          fetchedList = data;
        }
      }
    } catch (error) {}

    // Direct Supabase Fallback if empty
    if (fetchedList.length === 0) {
      try {
        const { data: spLeads } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (spLeads && spLeads.length > 0) {
          fetchedList = spLeads.map(l => {
            let meta: any = {};
            if (l.city && typeof l.city === 'string' && l.city.startsWith('{')) {
              try { meta = JSON.parse(l.city); } catch (e) {}
            }
            return {
              ...l,
              email: l.email || meta.email || (l.whatsapp && l.whatsapp.includes('@') ? l.whatsapp : ''),
              company: l.company || meta.topic || '',
              message: l.message || meta.message || '',
              status: l.status || meta.status || 'new',
              source: l.source || meta.source || 'profile',
              city: meta.city || (typeof l.city === 'string' && !l.city.startsWith('{') ? l.city : 'Lagos')
            };
          });
        }
      } catch (err) {}
    }

    // Merge with client localStorage inquiries cache
    try {
      if (typeof window !== 'undefined') {
        const localCache = JSON.parse(localStorage.getItem('chipng_inquiries_cache') || '[]');
        if (Array.isArray(localCache) && localCache.length > 0) {
          const existingIds = new Set(fetchedList.map(l => l.id || `${l.name}_${l.email}`));
          for (const item of localCache) {
            const key = item.id || `${item.name}_${item.email}`;
            if (!existingIds.has(key)) {
              fetchedList.unshift(item);
              existingIds.add(key);
            }
          }
        }
      }
    } catch (e) {}

    // If completely empty, seed sample direct inquiries & support records
    if (fetchedList.length === 0) {
      fetchedList = [
        {
          id: 'inq_init_1',
          name: 'Chief Babatunde Alabi',
          email: 'babatunde.alabi@moniepoint-hq.ng',
          whatsapp: '+234 803 456 7890',
          company: 'Enterprise Card Deployment',
          message: 'We are requesting 150 matte black stainless steel NFC executive cards for our senior management in Victoria Island. Please advise on custom logo engraving turnaround time.',
          city: 'Victoria Island, Lagos',
          source: 'direct_inquiry',
          post_slug: 'contact_inquiry',
          status: 'new',
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: 'inq_init_2',
          name: 'Amina Bello-Kano',
          email: 'amina.bello@sterlingpartners.com',
          whatsapp: '+234 812 990 1122',
          company: 'API Integration',
          message: 'Our corporate directory runs on Azure AD and Workday. Can the CHIP NG dynamic link-in-bio platform automatically sync profile changes through your webhook API?',
          city: 'Abuja, FCT',
          source: 'direct_inquiry',
          post_slug: 'contact_inquiry',
          status: 'in_review',
          created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
        },
        {
          id: 'inq_init_3',
          name: 'David O. Adeleke',
          email: 'david@creatorshub.africa',
          whatsapp: '+234 901 334 5566',
          company: 'Support & Feedback',
          message: 'The sub-10ms contactless NFC tap on iPhone 15 Pro and Galaxy S24 Ultra is incredibly smooth! We just ordered 5 more customized white PVC cards for our media team.',
          city: 'Lekki Phase 1, Lagos',
          source: 'direct_inquiry',
          post_slug: 'contact_inquiry',
          status: 'resolved',
          created_at: new Date(Date.now() - 1000 * 60 * 520).toISOString()
        }
      ];
    }

    setLeads(fetchedList);
    setLoading(false);
    setRefreshing(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    toast.success('Inquiries & Leads reloaded');
  };

  const handleUpdateStatus = async (leadId: any, newStatus: string) => {
    try {
      await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, status: newStatus })
      });
      
      // Update local state immediately
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Inquiry marked as ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleSimulateInquiry = async () => {
    setSimulating(true);
    const mockTopics = [
      'Enterprise Card Deployment',
      'Custom NFC Production',
      'API Integration',
      'Support & Feedback',
      'General Inquiries'
    ];
    const mockNames = ['Tunde Bakare', 'Dr. Ngozi Okonjo', 'Fola Adeola', 'Kemi Adetiba', 'Emeka Offor'];
    const selectedTopic = mockTopics[Math.floor(Math.random() * mockTopics.length)];
    const selectedName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const email = `${selectedName.toLowerCase().replace(/[^a-z]/g, '')}@company.ng`;
    const message = `Hello CHIP NG support, we require ${Math.floor(Math.random() * 50 + 10)} custom NFC metal business cards for our executive team in Lagos and Abuja. Can you send quotation and turnaround time?`;

    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedName,
          email,
          whatsapp: '+2348039876543',
          company: selectedTopic,
          message,
          source: 'direct_inquiry',
          city: 'Lagos',
          status: 'new'
        })
      });
      toast.success(`Simulated direct inquiry from ${selectedName}!`);
      setTimeout(() => {
        fetchLeads();
        setSimulating(false);
      }, 500);
    } catch (e) {
      setSimulating(false);
    }
  };

  const downloadInquiriesCSV = () => {
    const inquiries = leads.filter(l => isDirectInquiry(l));
    const headers = ['Date', 'Name', 'Email', 'Topic', 'Message', 'Status', 'Location'];
    const rows = inquiries.map(l => [
      `"${new Date(l.created_at).toISOString()}"`,
      `"${l.name || ''}"`,
      `"${l.email || l.whatsapp || ''}"`,
      `"${l.company || 'Direct Inquiry'}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.status || 'new'}"`,
      `"${l.city || 'Lagos'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chipng_direct_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded Direct Inquiries CSV');
  };

  const downloadLeadsCSV = () => {
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
    toast.success('Downloaded Leads CSV');
  };

  // Helper to determine if lead is from "Direct Inquiries & Support"
  const isDirectInquiry = (l: any) => {
    return l.source === 'direct_inquiry' || 
           l.source === 'contact_page' || 
           l.post_slug === 'contact_inquiry' || 
           (!!l.message && l.message.length > 5);
  };

  const directInquiries = leads.filter(l => isDirectInquiry(l));
  const generalLeads = leads.filter(l => !isDirectInquiry(l));
  const newInquiriesCount = directInquiries.filter(l => !l.status || l.status === 'new').length;

  // Filtered direct inquiries
  const filteredInquiries = directInquiries.filter(l => {
    if (statusFilter !== 'all' && (l.status || 'new') !== statusFilter) return false;
    if (topicFilter !== 'all' && l.company !== topicFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (l.name || '').toLowerCase().includes(q);
      const matchEmail = (l.email || l.whatsapp || '').toLowerCase().includes(q);
      const matchTopic = (l.company || '').toLowerCase().includes(q);
      const matchMsg = (l.message || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchTopic || matchMsg;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76BB08]/15 text-[#76BB08] dark:text-[#76BB08] border border-[#76BB08]/30 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageCircle className="w-3.5 h-3.5" /> Direct Inquiries & Support Pipeline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Direct Inquiries & CRM Inbox
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Live stream of customer inquiries submitted through "Direct Inquiries and Support" on the contact page, plus blog lead captures and profile NFC taps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#151821] hover:bg-neutral-50 dark:hover:bg-white/5 font-semibold text-xs text-neutral-700 dark:text-neutral-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleSimulateInquiry}
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#76BB08] dark:text-neutral-950" />
            <span>Simulate Inquiry</span>
          </button>

          <button
            onClick={activeSubTab === 'inquiries' ? downloadInquiriesCSV : downloadLeadsCSV}
            className="px-4 py-2 rounded-xl bg-[#76BB08] hover:bg-[#66a307] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Direct Inquiries vs General Leads */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-white/10 pb-1">
        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Direct Inquiries & Support</span>
          {newInquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-pulse">
              {newInquiriesCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'leads'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Sales Leads ({generalLeads.length})</span>
        </button>
      </div>

      {/* VIEW 1: DIRECT INQUIRIES & SUPPORT */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-6">
          
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                {directInquiries.length}
              </div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                Total Inquiries
              </div>
            </div>

            <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {newInquiriesCount}
              </div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                Unresolved / Action Needed
              </div>
            </div>

            <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {directInquiries.filter(i => (i.company || '').toLowerCase().includes('enterprise')).length}
              </div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                Enterprise Deployments
              </div>
            </div>

            <div className="p-5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-[#76BB08] dark:text-[#76BB08] tracking-tight">
                &lt;45 min
              </div>
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-1">
                Target Response Time
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, topic, or message keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#76BB08]/60 focus:border-[#76BB08]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New (Unread)</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Inquiries Cards Stream */}
          {loading ? (
            <div className="py-16 text-center text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              Loading direct inquiries pipeline...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-200/80 dark:border-white/10 rounded-3xl p-8 space-y-3">
              <Mail className="w-10 h-10 text-neutral-400 mx-auto opacity-50" />
              <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                No direct inquiries match current filters
              </div>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Customer messages submitted through "Direct Inquiries and Support" on the contact page will automatically stream here. You can also click "Simulate Inquiry" above to test the stream.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => {
                const isNew = !inquiry.status || inquiry.status === 'new';
                const isResolved = inquiry.status === 'resolved';
                const isInReview = inquiry.status === 'in_review';
                const userEmail = inquiry.email || inquiry.whatsapp || '';
                const inquiryTopic = inquiry.company || 'Direct Inquiry & Support';
                const inquiryMsg = inquiry.message || 'Customer requested contact via support page.';

                return (
                  <div
                    key={inquiry.id}
                    className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                      isNew
                        ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] border-emerald-500/30 shadow-xs'
                        : isResolved
                        ? 'bg-neutral-50/50 dark:bg-[#12141B] border-neutral-200/80 dark:border-white/5 opacity-85'
                        : 'bg-white dark:bg-[#14161F] border-neutral-200/80 dark:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Left: User Info & Topic */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-extrabold text-base text-neutral-950 dark:text-white">
                            {inquiry.name}
                          </span>
                          
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-neutral-200/60 dark:bg-white/10 text-neutral-800 dark:text-neutral-200">
                            {inquiryTopic}
                          </span>

                          {isNew && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                              New Inquiry
                            </span>
                          )}

                          {isResolved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-200/80 dark:bg-white/10 text-neutral-500">
                              Resolved
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          {userEmail && (
                            <a 
                              href={`mailto:${userEmail}?subject=Re: CHIP NG Inquiry - ${inquiryTopic}`} 
                              className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-emerald-500 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="underline decoration-dotted">{userEmail}</span>
                            </a>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{new Date(inquiry.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            via Direct Inquiries Form
                          </span>
                        </div>

                        {/* Inquiry Feedback Body Bubble */}
                        <div className="mt-3 p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#0c0d12] border border-neutral-200/60 dark:border-white/5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans">
                          <p className="whitespace-pre-line">{inquiryMsg}</p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          {/* Direct Email Reply */}
                          {userEmail && (
                            <a
                              href={`mailto:${userEmail}?subject=Re: CHIP NG Inquiry - ${inquiryTopic}`}
                              className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              <span>Reply Email</span>
                            </a>
                          )}

                          {/* WhatsApp Chat if phone available */}
                          {inquiry.whatsapp && !inquiry.whatsapp.includes('@') && (
                            <a
                              href={`https://wa.me/${inquiry.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inquiry.name)},%20thank%20you%20for%20contacting%20CHIP%20NG%20Support.`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1ebc59] dark:text-[#25D366] font-bold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>

                        {/* Status Select Toggle */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Status:</span>
                          <select
                            value={inquiry.status || 'new'}
                            onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#1a1d26] border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
                          >
                            <option value="new">New</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: ALL SALES LEADS & CRM TABLE */}
      {activeSubTab === 'leads' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">WhatsApp / Contact</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Source Page</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {generalLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                      No general sales leads captured yet.
                    </td>
                  </tr>
                ) : (
                  generalLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap text-neutral-400">
                        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-950 dark:text-white text-sm">
                        {lead.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        {lead.whatsapp || lead.email || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                        {lead.city || 'Lagos'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="font-mono text-[11px]">/{lead.post_slug || lead.source}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {lead.whatsapp && !lead.whatsapp.includes('@') && (
                          <a 
                            href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-[#25D366]/15 text-[#1ebc59] dark:text-[#25D366] border border-[#25D366]/30 px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#25D366]/25 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" /> Chat <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
