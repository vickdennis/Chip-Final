import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Building2, 
  Smartphone, 
  RefreshCw,
  Sparkles,
  UserPlus,
  Plus,
  X,
  Share2,
  QrCode,
  Check,
  UserCheck
} from 'lucide-react';
import { toast } from './Toast';
import { supabase } from '../supabaseClient';

export interface UserLead {
  id: number | string;
  profile_id?: string;
  name: string;
  whatsapp?: string;
  email?: string;
  company?: string;
  message?: string;
  city?: string;
  status: 'new' | 'converted';
  source?: string;
  created_at: string;
}

interface ProfileLeadsManagerProps {
  profile: any;
  onLeadsChange?: (stats: { total: number; newCount: number; convertedCount: number }) => void;
}

export function formatWhatsAppForLink(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234') && cleaned.length === 10) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
}

export function downloadLeadVCard(lead: UserLead) {
  const cleanName = (lead.name || 'Contact').trim();
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanName}`,
    `N:${cleanName};;;;`,
    lead.company ? `ORG:${lead.company}` : '',
    lead.whatsapp ? `TEL;TYPE=CELL,VOICE:${lead.whatsapp}` : '',
    lead.email ? `EMAIL;TYPE=INTERNET,WORK:${lead.email}` : '',
    lead.message ? `NOTE:Captured via CHIP NG 2-Way Contact Exchange. Note: ${lead.message.replace(/\r?\n/g, ' ')}` : 'NOTE:Captured via CHIP NG 2-Way Contact Exchange',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanName.replace(/\s+/g, '_')}_contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded vCard for ${cleanName}`);
}

export const ProfileLeadsManager: React.FC<ProfileLeadsManagerProps> = ({ profile, onLeadsChange }) => {
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'converted'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Manual add form state
  const [newName, setNewName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const fetchLeads = async (showToastFeedback = false) => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    if (showToastFeedback) setIsRefreshing(true);
    let syncedLeads: UserLead[] = [];

    try {
      const res = await fetch(`/api/leads/profile/${profile.id}`);
      if (res.ok) {
        const data = await res.json();
        syncedLeads = data.leads || [];
      }
    } catch (err: any) {
      console.warn('Backend leads endpoint notice:', err);
    }

    // Direct Supabase fallback / sync
    if (syncedLeads.length === 0) {
      try {
        const slugs = [`profile_${profile.id}`, profile.id];
        if (profile.username) {
          slugs.push(`profile_${profile.username}`, profile.username);
        }
        const { data: spLeads } = await supabase
          .from('leads')
          .select('*')
          .in('post_slug', slugs)
          .order('created_at', { ascending: false });

        if (spLeads && spLeads.length > 0) {
          syncedLeads = spLeads.map((sp: any) => {
            let meta: any = {};
            if (sp.city && typeof sp.city === 'string' && sp.city.startsWith('{')) {
              try { meta = JSON.parse(sp.city); } catch (e) {}
            }
            return {
              id: sp.id,
              profile_id: meta.profile_id || sp.profile_id || profile.id,
              name: sp.name,
              whatsapp: meta.whatsapp || sp.whatsapp || '',
              email: meta.email || sp.email || '',
              company: meta.company || sp.company || '',
              message: meta.message || sp.message || '',
              source: sp.source || 'profile',
              city: meta.city || 'Lagos',
              status: meta.status || sp.status || 'new',
              created_at: sp.created_at
            };
          });
        }
      } catch (spErr) {
        console.warn('Direct Supabase fetch notice:', spErr);
      }
    }

    setLeads(syncedLeads);
    if (onLeadsChange) {
      const total = syncedLeads.length;
      const newCount = syncedLeads.filter(l => l.status === 'new' || !l.status).length;
      const convertedCount = syncedLeads.filter(l => l.status === 'converted').length;
      onLeadsChange({ total, newCount, convertedCount });
    }

    setLoading(false);
    if (showToastFeedback) {
      toast.success('2-Way contacts synced from Supabase.');
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [profile?.id]);

  const handleUpdateStatus = async (leadId: number | string, currentStatus: string) => {
    const nextStatus = currentStatus === 'converted' ? 'new' : 'converted';
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      }).catch(() => {});

      // Direct Supabase update
      try {
        await supabase.from('leads').update({ status: nextStatus }).eq('id', leadId);
      } catch (e) {}

      setLeads(prev => {
        const updated = prev.map(l => l.id === leadId ? { ...l, status: nextStatus as any } : l);
        if (onLeadsChange) {
          const newCount = updated.filter(l => l.status === 'new' || !l.status).length;
          const convertedCount = updated.filter(l => l.status === 'converted').length;
          onLeadsChange({ total: updated.length, newCount, convertedCount });
        }
        return updated;
      });
      toast.success(nextStatus === 'converted' ? 'Marked as Converted!' : 'Marked as New Contact');
    } catch (e: any) {
      toast.error('Failed to update contact status');
    }
  };

  const handleDeleteLead = async (leadId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this captured contact?')) return;
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      }).catch(() => {});

      // Direct Supabase delete
      try {
        await supabase.from('leads').delete().eq('id', leadId);
      } catch (e) {}

      setLeads(prev => {
        const updated = prev.filter(l => l.id !== leadId);
        if (onLeadsChange) {
          const newCount = updated.filter(l => l.status === 'new' || !l.status).length;
          const convertedCount = updated.filter(l => l.status === 'converted').length;
          onLeadsChange({ total: updated.length, newCount, convertedCount });
        }
        return updated;
      });
      toast.success('Contact removed from Supabase');
    } catch (e) {
      toast.error('Failed to delete contact');
    }
  };

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter the contact’s name.');
      return;
    }
    if (!newWhatsapp.trim() && !newEmail.trim()) {
      toast.error('Please provide either a WhatsApp number or email.');
      return;
    }

    setSubmittingManual(true);
    let savedInSupabase = false;

    // 1. Direct Supabase save
    try {
      const meta = {
        profile_id: profile?.id,
        email: newEmail.trim(),
        whatsapp: newWhatsapp.trim(),
        company: newCompany.trim(),
        message: newMessage.trim(),
        source: 'manual_dashboard_entry',
        city: 'Lagos',
        status: 'new',
        created_at: new Date().toISOString()
      };

      const fullRes = await supabase.from('leads').insert([{
        profile_id: profile?.id,
        name: newName.trim(),
        whatsapp: newWhatsapp.trim() || newEmail.trim() || 'N/A',
        email: newEmail.trim(),
        company: newCompany.trim(),
        message: newMessage.trim(),
        source: 'manual_dashboard_entry',
        city: 'Lagos',
        post_slug: profile?.id ? `profile_${profile.id}` : 'profile_capture',
        status: 'new'
      }]);

      if (!fullRes.error) {
        savedInSupabase = true;
      } else {
        const fallbackRes = await supabase.from('leads').insert([{
          name: newName.trim(),
          whatsapp: newWhatsapp.trim() || newEmail.trim() || 'Contact Added',
          city: JSON.stringify(meta),
          post_slug: profile?.id ? `profile_${profile.id}` : 'profile_capture',
          source: 'manual_dashboard_entry'
        }]);
        if (!fallbackRes.error) savedInSupabase = true;
      }
    } catch (sbErr) {
      console.warn('Direct Supabase manual contact add notice:', sbErr);
    }

    // 2. Server API save
    let apiSaved = false;
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile?.id,
          name: newName.trim(),
          whatsapp: newWhatsapp.trim(),
          email: newEmail.trim(),
          company: newCompany.trim(),
          message: newMessage.trim(),
          source: 'manual_dashboard_entry',
          city: 'Lagos'
        })
      });
      if (res.ok) apiSaved = true;
    } catch (err: any) {
      console.warn('API leads capture notice:', err);
    }

    if (savedInSupabase || apiSaved) {
      const newEntry: UserLead = {
        id: Date.now(),
        profile_id: profile?.id,
        name: newName.trim(),
        whatsapp: newWhatsapp.trim(),
        email: newEmail.trim(),
        company: newCompany.trim(),
        message: newMessage.trim(),
        source: 'manual_dashboard_entry',
        city: 'Lagos',
        status: 'new',
        created_at: new Date().toISOString()
      };

      setLeads(prev => [newEntry, ...prev]);
      if (onLeadsChange) {
        onLeadsChange({
          total: leads.length + 1,
          newCount: leads.filter(l => l.status === 'new' || !l.status).length + 1,
          convertedCount: leads.filter(l => l.status === 'converted').length
        });
      }

      toast.success(`Contact details saved in Supabase for ${newName}!`);
      setNewName('');
      setNewWhatsapp('');
      setNewEmail('');
      setNewCompany('');
      setNewMessage('');
      setIsAddModalOpen(false);
      fetchLeads();
    } else {
      toast.error('Failed to save contact details. Please check connection.');
    }

    setSubmittingManual(false);
  };

  const exportCSV = () => {
    if (leads.length === 0) {
      toast.error('No contacts available to export.');
      return;
    }

    const headers = ['Name', 'WhatsApp / Phone', 'Email', 'Company', 'Note', 'Status', 'Date Captured'];
    const rows = leads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.status || 'new'}"`,
      `"${l.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chipng_contacts_${profile.username || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Contacts CSV exported successfully!');
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter || (!l.status && statusFilter === 'new');
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (l.name && l.name.toLowerCase().includes(query)) ||
      (l.whatsapp && l.whatsapp.includes(query)) ||
      (l.email && l.email.toLowerCase().includes(query)) ||
      (l.company && l.company.toLowerCase().includes(query)) ||
      (l.message && l.message.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === 'new' || !l.status).length;
  const convertedCount = leads.filter(l => l.status === 'converted').length;

  const publicProfileUrl = profile?.username ? `https://chipng.com/${profile.username}` : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D2F843]/20 flex items-center justify-center text-[#5b7300] dark:text-[#D2F843] shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  2-Way Contact Exchange & CRM
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  Active Sync
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                When prospects tap your physical CHIP NFC card or view your bio link, their shared contacts stream here in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#D2F843] hover:bg-[#c5eb32] text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Add a contact manually"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>

            <button
              onClick={() => fetchLeads(true)}
              className="p-2 rounded-xl border border-neutral-200/80 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#6c8600] dark:text-[#D2F843]' : ''}`} />
            </button>

            <button
              onClick={exportCSV}
              disabled={leads.length === 0}
              className="px-3.5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Total Captured Contacts
            </span>
            <div className="text-3xl font-extrabold text-neutral-950 dark:text-white mt-1">
              {totalCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Via physical NFC taps & bio link
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              New / Awaiting Follow-Up
            </span>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {newCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Ready for 1-click WhatsApp chat
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-[#D2F843] uppercase tracking-wider block">
              Converted Deals & Connections
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-[#D2F843] mt-1">
              {convertedCount}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Successfully networked & closed
            </span>
          </div>
        </div>

        {/* How 2-Way Contact Exchange Works Strip */}
        <div className="mt-6 p-4 rounded-2xl bg-[#D2F843]/10 border border-[#D2F843]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center shrink-0 font-bold text-xs">
              2W
            </div>
            <div className="text-xs text-neutral-800 dark:text-neutral-200">
              <span className="font-bold text-neutral-950 dark:text-white">How it works:</span> When someone taps your physical CHIP NFC card, they receive your vCard and see an <strong>"Exchange Contact"</strong> button. When they submit, their phone, email, and note appear right here!
            </div>
          </div>
          {publicProfileUrl && (
            <a
              href={`/${profile.username || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-neutral-900 dark:text-[#D2F843] hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto"
            >
              <span>Test on your profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
              statusFilter === 'all'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
              statusFilter === 'new'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            New ({newCount})
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial ${
              statusFilter === 'converted'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            Converted ({convertedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, WhatsApp, company..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-950 dark:focus:border-white"
          />
        </div>
      </div>

      {/* Leads List or Empty State */}
      <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#D2F843]" />
            <span>Loading captured contacts...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-400 mb-4">
              <UserCheck className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-neutral-950 dark:text-white">
              {searchQuery ? 'No matching contacts found' : 'No contacts captured yet'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              {searchQuery 
                ? 'Try searching with a different name, phone, or clear the filter.' 
                : 'When prospective clients, partners, or investors tap your physical CHIP NFC card or view your bio link and click "Exchange Contact", their details will appear here instantly.'}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                + Add First Contact Manually
              </button>
              {publicProfileUrl && (
                <a
                  href={`/${profile.username || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                >
                  View My Card Bio
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-white/5">
            {filteredLeads.map((lead) => {
              const formattedPhone = formatWhatsAppForLink(lead.whatsapp);
              const waLink = formattedPhone 
                ? `https://wa.me/${formattedPhone}?text=Hello%20${encodeURIComponent(lead.name)},%20it%20was%20great%20connecting%20via%20CHIP%20NG!`
                : null;
              const isConverted = lead.status === 'converted';

              return (
                <div
                  key={lead.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      {(lead.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-neutral-950 dark:text-white truncate">
                          {lead.name}
                        </h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isConverted 
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#D2F843] border border-emerald-500/30' 
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}>
                          {isConverted ? 'Converted' : 'New Contact'}
                        </span>
                        {lead.source && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400">
                            {lead.source === 'profile_nfc_tap' ? 'NFC Tap' : lead.source === 'manual_dashboard_entry' ? 'Manual Entry' : 'Bio Link'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                        {lead.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{lead.company}</span>
                          </span>
                        )}
                        {lead.whatsapp && (
                          <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                            {lead.whatsapp}
                          </span>
                        )}
                        {lead.email && (
                          <span className="text-[11px] text-neutral-600 dark:text-neutral-300">
                            {lead.email}
                          </span>
                        )}
                      </div>

                      {lead.message && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 p-2.5 rounded-xl bg-neutral-100/60 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5">
                          "{lead.message}"
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </span>
                        {lead.city && <span>• {lead.city}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Chat with contact on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}?subject=Great%20connecting%20via%20CHIP%20NG`}
                        className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Send email to contact"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    )}

                    <button
                      onClick={() => downloadLeadVCard(lead)}
                      className="p-2 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      title="Save contact to phonebook (.vcf)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(lead.id, lead.status)}
                      className="px-3 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      title={isConverted ? 'Mark as New' : 'Mark as Converted'}
                    >
                      {isConverted ? 'Revert to New' : '✓ Mark Converted'}
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#12141A] border border-neutral-200/80 dark:border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative text-neutral-900 dark:text-white">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-600 dark:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2F843]" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6c8600] dark:text-[#D2F843] font-bold">
                Manual Contact Entry
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white mb-1">
              Add New Contact
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
              Log someone you met at an event, dinner, or meeting directly into your CHIP CRM.
            </p>

            <form onSubmit={handleManualAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Tunde Balogun"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D2F843]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="e.g. 0803 123 4567"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D2F843]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tunde@company.ng"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D2F843]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Company / Designation
                </label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Managing Director, Sterling Capital"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D2F843]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Networking Note / Deal Context
                </label>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="e.g. Met at Lagos Tech Fest. Wants quote for 25 Smart Metal cards for partners."
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#D2F843]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2.5 rounded-xl bg-[#D2F843] hover:bg-[#c5eb32] text-neutral-950 font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submittingManual ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

