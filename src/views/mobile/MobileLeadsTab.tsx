import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MessageSquare, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Trash2, 
  UserPlus, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { toast } from '../../components/Toast';
import { supabase } from '../../supabaseClient';

interface MobileLeadsTabProps {
  leads: any[];
  setLeads: React.Dispatch<React.SetStateAction<any[]>>;
  profile: any;
  onRefresh?: () => void;
}

export const MobileLeadsTab: React.FC<MobileLeadsTabProps> = ({
  leads,
  setLeads,
  profile,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'converted'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status updates
  const handleToggleStatus = async (leadId: string | number, currentStatus: string) => {
    const nextStatus = currentStatus === 'converted' ? 'new' : 'converted';
    const targetLead = leads.find(l => l.id === leadId);

    // 1. Immediately cache locally in localStorage
    try {
      localStorage.setItem(`chipng_lead_status_${leadId}`, nextStatus);
      if (profile?.id) {
        localStorage.setItem(`chipng_lead_status_${profile.id}_${leadId}`, nextStatus);
      }
    } catch (e) {}

    // 2. Optimistic local state update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: nextStatus } : l));
    toast.success(nextStatus === 'converted' ? 'Marked as Converted!' : 'Reverted to New');

    // 3. Persist to Supabase
    try {
      const { data: spLead } = await supabase.from('leads').select('city').eq('id', leadId).maybeSingle();
      let meta: any = {};
      if (spLead?.city && typeof spLead.city === 'string' && spLead.city.startsWith('{')) {
        try { meta = JSON.parse(spLead.city); } catch (e) {}
      } else if (targetLead) {
        meta = {
          profile_id: targetLead.profile_id,
          email: targetLead.email,
          whatsapp: targetLead.whatsapp,
          company: targetLead.company,
          message: targetLead.message
        };
      }
      meta.status = nextStatus;
      meta.updated_at = new Date().toISOString();

      await supabase.from('leads').update({ city: JSON.stringify(meta) }).eq('id', leadId);
      try {
        await supabase.from('leads').update({ status: nextStatus }).eq('id', leadId);
      } catch (e) {}
    } catch (e) {}

    // 4. Persist to backend API
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, profile_id: profile?.id })
      }).catch(() => {});
    } catch (e) {}
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string | number) => {
    if (!window.confirm('Delete this captured contact?')) return;
    try {
      await supabase.from('leads').delete().eq('id', leadId);
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' }).catch(() => {});
      setLeads(prev => prev.filter(l => l.id !== leadId));
      toast.success('Contact deleted');
    } catch (e) {
      toast.error('Failed to delete contact');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    const headers = ['Name', 'Phone/WhatsApp', 'Email', 'Company', 'Status', 'Date Captured'];
    const rows = leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.whatsapp || ''}"`,
      `"${l.email || ''}"`,
      `"${l.company || ''}"`,
      `"${l.status || 'new'}"`,
      `"${l.created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chipng-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads CSV exported!');
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.whatsapp?.includes(searchQuery) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = lead.status || 'new';
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'new' && (status === 'new' || !status)) ||
        (statusFilter === 'converted' && status === 'converted') ||
        (statusFilter === 'contacted' && status === 'contacted');

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  return (
    <div className="space-y-5 pb-28 text-left">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            2-Way CRM
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {leads.length} Contacts Gathered
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await onRefresh();
                setTimeout(() => setIsRefreshing(false), 500);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts by name, company, or WhatsApp..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#D2F843] focus:outline-none transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs font-mono">
        {[
          { id: 'all', label: `All (${leads.length})` },
          { id: 'new', label: `New (${leads.filter(l => l.status === 'new' || !l.status).length})` },
          { id: 'converted', label: `Converted (${leads.filter(l => l.status === 'converted').length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-[#D2F843] text-neutral-950'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Cards List */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No leads found</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              {searchQuery
                ? 'No contacts match your search query.'
                : 'Your next connection could become your next customer. Tap your NFC card or share your QR code to gather leads.'}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isConverted = lead.status === 'converted';
            const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={lead.id}
                className="p-4 rounded-3xl bg-neutral-900/80 border border-white/5 hover:border-white/15 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{lead.name}</h4>
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        isConverted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#D2F843]/10 text-[#D2F843] border border-[#D2F843]/20'
                      }`}>
                        {isConverted ? 'Converted' : 'New Contact'}
                      </span>
                    </div>

                    {lead.company && (
                      <p className="text-xs text-neutral-400 mt-0.5 font-medium truncate">
                        {lead.company}
                      </p>
                    )}

                    <div className="text-[10px] font-mono text-neutral-500 mt-1 flex items-center gap-2">
                      <span>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recent'}</span>
                      <span>•</span>
                      <span className="capitalize">{lead.source || 'profile tap'}</span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(lead.id, lead.status || 'new')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isConverted
                        ? 'bg-white/10 hover:bg-white/15 text-neutral-300'
                        : 'bg-[#D2F843] hover:bg-[#c3eb34] text-neutral-950 shadow-sm'
                    }`}
                  >
                    {isConverted ? 'Revert to New' : '✓ Mark Converted'}
                  </button>
                </div>

                {/* Message preview if any */}
                {lead.message && (
                  <p className="text-xs text-neutral-300 bg-black/30 p-2.5 rounded-xl border border-white/5 italic">
                    "{lead.message}"
                  </p>
                )}

                {/* Contact Action Bar (WhatsApp, Call, Email, Delete) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}

                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
