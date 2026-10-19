import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  AtSign, 
  FileSpreadsheet, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Share2,
  ChevronRight,
  Shield,
  Smartphone,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from '../components/Toast';

interface AdminUserCommsManagerProps {
  users: any[];
  onRefresh?: () => void;
}

export function parseUserPhones(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(p => String(p).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(p => String(p).trim()).filter(Boolean);
        }
      } catch (e) {}
    }
    return trimmed.split(/[,/]/).map(p => p.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '234' + digits.slice(1);
  } else if (!digits.startsWith('234') && digits.length === 10) {
    digits = '234' + digits;
  }
  return digits;
}

export default function AdminUserCommsManager({ users, onRefresh }: AdminUserCommsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'email' | 'whatsapp'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_email' | 'has_phone' | 'has_both' | 'missing'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Email state
  const [emailSubject, setEmailSubject] = useState('Important Update on Your CHIP NG Digital Business Card');
  const [emailBody, setEmailBody] = useState(
`Hello {Name},

We are excited to share some powerful new updates to your CHIP NG contactless card and dynamic link-in-bio profile.

You can view your live digital business card anytime at:
{CardUrl}

Log in to your dashboard to customize your themes, view real-time card tap analytics, and manage your 2-way contacts.

Warm regards,
Victor Dennis & The CHIP NG Team
https://chipng.com`
  );

  // WhatsApp state
  const [waMessage, setWaMessage] = useState(
`Hi {Name}! 👋 

This is Victor from CHIP NG. We've rolled out new contactless features and speed enhancements for your smart business card.

Check out your live profile here:
{CardUrl}

Need assistance or want to order a custom laser-engraved metal card? Simply reply to this message!`
  );

  const [dispatchedWaIds, setDispatchedWaIds] = useState<Set<string>>(new Set());

  // Normalized users list with extracted contacts
  const processedUsers = useMemo(() => {
    return users.map(u => {
      const email = (u.contact_email || u.email || '').trim();
      const phones = parseUserPhones(u.phone_number);
      const primaryPhone = phones[0] || '';
      const normalizedWa = normalizeWhatsAppNumber(primaryPhone);
      const hasEmail = Boolean(email && email.includes('@'));
      const hasPhone = Boolean(primaryPhone && normalizedWa.length >= 10);

      return {
        ...u,
        email,
        phones,
        primaryPhone,
        normalizedWa,
        hasEmail,
        hasPhone
      };
    });
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return processedUsers.filter(u => {
      // Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.primaryPhone && u.primaryPhone.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Contact filter
      if (filterType === 'has_email') return u.hasEmail;
      if (filterType === 'has_phone') return u.hasPhone;
      if (filterType === 'has_both') return u.hasEmail && u.hasPhone;
      if (filterType === 'missing') return !u.hasEmail && !u.hasPhone;
      return true;
    });
  }, [processedUsers, searchTerm, filterType]);

  // Bulk recipient lists based on current selection or all filtered
  const targetUsers = useMemo(() => {
    if (selectedUserIds.size > 0) {
      return processedUsers.filter(u => selectedUserIds.has(u.id));
    }
    return filteredUsers;
  }, [selectedUserIds, processedUsers, filteredUsers]);

  const targetEmails = useMemo(() => {
    const emails = targetUsers.map(u => u.email).filter(Boolean);
    return Array.from(new Set(emails));
  }, [targetUsers]);

  const targetPhones = useMemo(() => {
    const phones = targetUsers.map(u => u.normalizedWa).filter(Boolean);
    return Array.from(new Set(phones));
  }, [targetUsers]);

  // Select all / Deselect all
  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUserIds(next);
  };

  // Copy helper
  const handleCopy = (text: string, typeKey: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(typeKey);
    toast.success(successMsg);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Full Name', 'Username', 'Email', 'Phone Numbers', 'Normalized WhatsApp', 'Profile Link', 'Status'];
    const rows = targetUsers.map(u => [
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.username || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.phones.join('; ').replace(/"/g, '""')}"`,
      `"${u.normalizedWa || ''}"`,
      `"https://chipng.com/${u.username || ''}"`,
      `"${u.is_verified ? 'Verified' : 'Standard'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHIP_NG_User_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetUsers.length} user contacts to CSV`);
  };

  // Export WhatsApp vCard (.vcf)
  const handleExportVcf = () => {
    const vcardEntries = targetUsers
      .filter(u => u.hasPhone)
      .map(u => {
        const name = (u.full_name || u.username || 'User').trim();
        const phone = u.normalizedWa ? `+${u.normalizedWa}` : u.primaryPhone;
        const email = u.email || '';
        return `BEGIN:VCARD
VERSION:3.0
FN:CHIP - ${name}
N:${name};CHIP;;;
TEL;TYPE=CELL:${phone}
${email ? `EMAIL;TYPE=INTERNET:${email}` : ''}
URL:https://chipng.com/${u.username || ''}
NOTE:CHIP NG Contactless Smart Card Member
END:VCARD`;
      })
      .join('\n');

    if (!vcardEntries) {
      toast.error('No valid phone numbers found among selected users');
      return;
    }

    const blob = new Blob([vcardEntries], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CHIP_NG_WhatsApp_Broadcast_Contacts_${new Date().toISOString().slice(0, 10)}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Generated WhatsApp VCF for ${targetUsers.filter(u => u.hasPhone).length} users. Import to your phone to create native WhatsApp Broadcast Lists!`);
  };

  // Build Mailto link with BCC
  const generateMailtoUrl = () => {
    const bccList = targetEmails.join(',');
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(
      emailBody.replace(/{Name}/g, 'Valued Member').replace(/{Username}/g, 'user').replace(/{CardUrl}/g, 'https://chipng.com')
    );
    return `mailto:?bcc=${bccList}&subject=${encodedSubject}&body=${encodedBody}`;
  };

  // Build Gmail web compose link with BCC
  const generateGmailWebUrl = () => {
    const bccList = encodeURIComponent(targetEmails.join(','));
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(
      emailBody.replace(/{Name}/g, 'Valued Member').replace(/{Username}/g, 'user').replace(/{CardUrl}/g, 'https://chipng.com')
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&bcc=${bccList}&su=${encodedSubject}&body=${encodedBody}`;
  };

  // WhatsApp individual link generator
  const getWhatsAppPersonalizedUrl = (user: any) => {
    const nameStr = user.full_name && user.full_name.trim() ? user.full_name.trim().split(' ')[0] : 'there';
    const usernameStr = user.username || '';
    const cardUrlStr = usernameStr ? `https://chipng.com/${usernameStr}` : 'https://chipng.com';

    const personalized = waMessage
      .replace(/{Name}/gi, nameStr)
      .replace(/{Username}/gi, usernameStr)
      .replace(/{CardUrl}/gi, cardUrlStr);

    return `https://wa.me/${user.normalizedWa}?text=${encodeURIComponent(personalized)}`;
  };

  const handleLaunchWhatsApp = (user: any) => {
    const url = getWhatsAppPersonalizedUrl(user);
    window.open(url, '_blank', 'noopener,noreferrer');
    setDispatchedWaIds(prev => new Set([...prev, user.id]));
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Total Registered Users</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {processedUsers.length}
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Across entire CHIP NG database</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-800 dark:text-white">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Valid Emails */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Reachable by Email</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#76BB08] mt-1 block">
              {processedUsers.filter(u => u.hasEmail).length}
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {Math.round((processedUsers.filter(u => u.hasEmail).length / (processedUsers.length || 1)) * 100)}% email coverage
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#76BB08]/15 flex items-center justify-center text-[#76BB08]">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Valid WhatsApp */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Reachable by WhatsApp</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mt-1 block">
              {processedUsers.filter(u => u.hasPhone).length}
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {Math.round((processedUsers.filter(u => u.hasPhone).length / (processedUsers.length || 1)) * 100)}% phone coverage
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Selected Target Audience */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Active Selection Target</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {selectedUserIds.size > 0 ? selectedUserIds.size : filteredUsers.length}
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {selectedUserIds.size > 0 ? 'Custom subset selected' : 'All filtered users active'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Header & Fast Action Toolbar */}
      <div className="bg-white dark:bg-[#111318] p-4 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 dark:border-white/5 pb-5">
          {/* Sub tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 gap-1">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'directory'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory ({filteredUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('email')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'email'
                  ? 'bg-[#76BB08] text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Bulk Email Dispatch ({targetEmails.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('whatsapp')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'whatsapp'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bulk WhatsApp Queue ({targetPhones.length})</span>
            </button>
          </div>

          {/* Quick Exports */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download full CSV contact database"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#76BB08]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportVcf}
              className="px-3.5 py-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download .vcf file to import into phone contacts for WhatsApp Broadcast"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export WhatsApp vCard</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
                title="Refresh user data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by user name, @handle, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#76BB08]/60 focus:border-[#76BB08] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'has_email', label: 'With Email' },
              { id: 'has_phone', label: 'With Phone / WA' },
              { id: 'has_both', label: 'With Both' },
              { id: 'missing', label: 'Missing Info' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                    : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: User Contact Directory */}
      {activeSubTab === 'directory' && (
        <div className="bg-white dark:bg-[#111318] rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer select-none"
              >
                {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-[#76BB08]" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-400" />
                )}
                <span>
                  {selectedUserIds.size > 0 
                    ? `Selected (${selectedUserIds.size}/${filteredUsers.length})` 
                    : `Select All (${filteredUsers.length})`}
                </span>
              </button>

              {selectedUserIds.size > 0 && (
                <button
                  onClick={() => setSelectedUserIds(new Set())}
                  className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(targetEmails.join(', '), 'emails_quick', `Copied ${targetEmails.length} emails to clipboard!`)}
                disabled={targetEmails.length === 0}
                className="px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'emails_quick' ? <Check className="w-3.5 h-3.5 text-[#76BB08]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy {targetEmails.length} Emails</span>
              </button>

              <button
                onClick={() => handleCopy(targetPhones.join(', '), 'phones_quick', `Copied ${targetPhones.length} phone numbers to clipboard!`)}
                disabled={targetPhones.length === 0}
                className="px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                {copiedType === 'phones_quick' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                <span>Copy {targetPhones.length} Phones</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">Select</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone / WhatsApp</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filteredUsers.map(u => {
                  const isSelected = selectedUserIds.has(u.id);
                  return (
                    <tr 
                      key={u.id}
                      className={`hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-[#76BB08]/5 dark:bg-[#76BB08]/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectUser(u.id)}
                          className="cursor-pointer text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#76BB08]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.cover_image_url ? (
                            <img src={u.cover_image_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-white/10 shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-[#1C202B] text-neutral-700 dark:text-neutral-200 font-bold flex items-center justify-center text-xs shrink-0">
                              {(u.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-950 dark:text-white text-xs sm:text-sm truncate">
                              {u.full_name || 'No Name Set'}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <a
                                href={`/${u.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-neutral-500 hover:text-[#76BB08] transition-colors truncate"
                              >
                                @{u.username || 'unknown'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.hasEmail ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all truncate max-w-[200px]" title={u.email}>
                              {u.email}
                            </span>
                            <button
                              onClick={() => handleCopy(u.email, `email_${u.id}`, 'Email copied!')}
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy email"
                            >
                              {copiedType === `email_${u.id}` ? <Check className="w-3 h-3 text-[#76BB08]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 italic">
                            <AlertCircle className="w-3 h-3 text-amber-500/80" /> No email set
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.hasPhone ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200 select-all">
                              {u.normalizedWa ? `+${u.normalizedWa}` : u.primaryPhone}
                            </span>
                            <button
                              onClick={() => handleCopy(u.normalizedWa ? `+${u.normalizedWa}` : u.primaryPhone, `phone_${u.id}`, 'Phone number copied!')}
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy phone"
                            >
                              {copiedType === `phone_${u.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 italic">
                            <AlertCircle className="w-3 h-3 text-neutral-400" /> No phone set
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {u.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                              Verified
                            </span>
                          )}
                          {u.is_admin && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#76BB08]/15 text-[#76BB08] border border-[#76BB08]/30 text-[10px] font-bold">
                              Admin
                            </span>
                          )}
                          {!u.is_verified && !u.is_admin && (
                            <span className="text-[11px] text-neutral-400">Standard</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.hasPhone && (
                            <button
                              onClick={() => handleLaunchWhatsApp(u)}
                              className="p-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                              title={`Open WhatsApp chat with ${u.full_name || 'user'}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {u.hasEmail && (
                            <a
                              href={`mailto:${u.email}?subject=Message from CHIP NG Admin`}
                              className="p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 transition-colors"
                              title={`Send direct email to ${u.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400 text-sm">
                      No users match your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Email Dispatch */}
      {activeSubTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Email Composer */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-6">
            <div className="border-b border-neutral-100 dark:border-white/5 pb-4">
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#76BB08]" />
                <span>Bulk Email Campaign Composer</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Draft your announcement. Emails will be dispatched in <strong>BCC mode</strong> to protect user privacy.
              </p>
            </div>

            {/* Recipient summary badge */}
            <div className="p-4 rounded-2xl bg-[#76BB08]/10 border border-[#76BB08]/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  {targetEmails.length} Email Recipients Ready
                </span>
                <span className="text-[11px] text-neutral-600 dark:text-neutral-400 block mt-0.5">
                  {selectedUserIds.size > 0 ? 'From your selected user list' : 'From all currently filtered users'}
                </span>
              </div>
              <button
                onClick={() => handleCopy(targetEmails.join(', '), 'all_emails_comp', 'All emails copied!')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#151821] border border-neutral-200 dark:border-white/10 text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-neutral-50"
              >
                {copiedType === 'all_emails_comp' ? <Check className="w-3.5 h-3.5 text-[#76BB08]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy List</span>
              </button>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Email Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-sm font-semibold text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#76BB08]/60 focus:border-[#76BB08]"
                placeholder="Enter subject line..."
              />
            </div>

            {/* Template Variables Helper */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Available Dynamic Variables
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300">
                  {'{Name}'} &rarr; First Name
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300">
                  {'{Username}'} &rarr; @handle
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300">
                  {'{CardUrl}'} &rarr; chipng.com/handle
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Message Body
              </label>
              <textarea
                rows={9}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#76BB08]/60 focus:border-[#76BB08] leading-relaxed resize-y font-sans"
                placeholder="Write your email body here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={generateMailtoUrl()}
                className="flex-1 px-5 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-sm transition-all"
              >
                <Mail className="w-4 h-4 text-[#76BB08] dark:text-neutral-950" />
                <span>Launch in Default Email App (BCC)</span>
              </a>

              <a
                href={generateGmailWebUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-full border border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[#76BB08]" />
                <span>Open in Gmail Webmail</span>
              </a>
            </div>
          </div>

          {/* Email Preview & Distribution Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#76BB08]" />
                <span>Campaign Preview (Sample)</span>
              </h4>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Subject:</span>
                  <p className="text-xs font-bold text-neutral-950 dark:text-white">{emailSubject}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Body Sample (for {targetUsers[0]?.full_name || 'John Doe'}):</span>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 whitespace-pre-wrap leading-relaxed font-sans bg-white dark:bg-black/30 p-3 rounded-xl border border-neutral-200/60 dark:border-white/5">
                    {emailBody
                      .replace(/{Name}/g, (targetUsers[0]?.full_name || 'John Doe').split(' ')[0])
                      .replace(/{Username}/g, targetUsers[0]?.username || 'johndoe')
                      .replace(/{CardUrl}/g, `https://chipng.com/${targetUsers[0]?.username || 'johndoe'}`)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-white/5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">Bulk Email Best Practices:</span>
                <ul className="text-xs text-neutral-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>BCC Mode:</strong> Recipients cannot see each other's email addresses, complying with global data privacy rules.</li>
                  <li><strong>Email Limit:</strong> Webmail clients typically allow up to 100-500 BCC recipients per message. For very large sends, copy the list into Mailchimp, Resend, or Brevo.</li>
                  <li><strong>Deliverability:</strong> Clear sender identity improves inbox placement and reduces spam scores.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Bulk WhatsApp Queue */}
      {activeSubTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* WhatsApp Message Template Config */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
              <div className="border-b border-neutral-100 dark:border-white/5 pb-4">
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  <span>WhatsApp Message Template</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Craft the message sent to each user via WhatsApp Click-to-Chat.
                </p>
              </div>

              {/* Quick Template Switcher */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Quick Pre-made Templates
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setWaMessage(
`Hi {Name}! 👋 

This is Victor from CHIP NG. We've rolled out new contactless features and speed enhancements for your smart business card.

Check out your live profile here:
{CardUrl}

Need assistance or want to order a custom laser-engraved metal card? Simply reply to this message!`
                    )}
                    className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:border-emerald-500/50 bg-neutral-50 dark:bg-white/5 text-left text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    Feature & Speed Updates
                  </button>

                  <button
                    onClick={() => setWaMessage(
`Hello {Name},

Special loyalty offer from CHIP NG! 💳✨
Upgrade your contactless card to our premium Matte Black PVC or Heavyweight Metal finish with a 20% member voucher code: CHIPVIP20.

Preview your card branding:
{CardUrl}

Reply YES if you'd like us to custom design your layout!`
                    )}
                    className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:border-emerald-500/50 bg-neutral-50 dark:bg-white/5 text-left text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    Card Upgrade & Promo Voucher
                  </button>

                  <button
                    onClick={() => setWaMessage(
`Hi {Name},

Quick reminder from CHIP NG: ensure your 2-Way Leads contact form and social media links are up to date!

Your link-in-bio:
{CardUrl}

Log in to your dashboard anytime to track taps and views.`
                    )}
                    className="p-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 hover:border-emerald-500/50 bg-neutral-50 dark:bg-white/5 text-left text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
                  >
                    Profile Audit & Reminder
                  </button>
                </div>
              </div>

              {/* Message text area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Custom WhatsApp Message
                </label>
                <textarea
                  rows={8}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 leading-relaxed resize-y font-sans"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={handleExportVcf}
                  className="w-full px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WhatsApp vCard for Native Broadcast</span>
                </button>
                <p className="text-[11px] text-neutral-400 text-center leading-snug">
                  Import the .vcf into your phone contacts to broadcast to everyone in WhatsApp at once without manual tapping.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive WhatsApp 1-Click Dispatch Queue */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                  <span>1-Click WhatsApp Dispatch Queue</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Send personalized WhatsApp messages directly to each member in seconds.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500">
                  Dispatched: <strong>{dispatchedWaIds.size}</strong> / {targetUsers.filter(u => u.hasPhone).length}
                </span>
                {dispatchedWaIds.size > 0 && (
                  <button
                    onClick={() => setDispatchedWaIds(new Set())}
                    className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* User cards list */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {targetUsers.filter(u => u.hasPhone).map(u => {
                const isSent = dispatchedWaIds.has(u.id);
                return (
                  <div
                    key={u.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSent 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30' 
                        : 'bg-neutral-50/50 dark:bg-[#151821] border-neutral-200/80 dark:border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {(u.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-950 dark:text-white text-xs sm:text-sm truncate">
                            {u.full_name || 'No Name'}
                          </span>
                          {isSent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Dispatched
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mt-0.5">
                          <span>+{u.normalizedWa}</span>
                          <span>&bull;</span>
                          <span>@{u.username || 'unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchWhatsApp(u)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                        isSent
                          ? 'bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSent ? 'Message Again' : 'Send WhatsApp'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {targetUsers.filter(u => u.hasPhone).length === 0 && (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  No users with valid WhatsApp phone numbers found in current selection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
