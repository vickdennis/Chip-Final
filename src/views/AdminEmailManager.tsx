import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mail, 
  Send, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  Users, 
  Plus, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Monitor,
  ShieldCheck,
  Zap,
  Sparkles,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2
} from 'lucide-react';
import { toast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import { isValidEmail } from '../utils/contactExtractor';
import { wrapChipngSupportEmail } from '../utils/resendEmailTemplates';
import { getAdminAuthHeaders, parseTimestamp } from '../utils/adminApi';

interface AdminEmailManagerProps {
  users?: any[];
  onRefresh?: () => void;
}

interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  resend_message_id?: string;
  status: string;
  error_message?: string;
  created_at: string;
}

export default function AdminEmailManager({ users = [], onRefresh }: AdminEmailManagerProps) {
  // --- Form State ---
  const [recipientsInput, setRecipientsInput] = useState<string>('');
  const [recipientList, setRecipientList] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>(
`Hello,

Thank you for choosing CHIPNG — Nigeria's premier contactless smart business card and dynamic link-in-bio platform.

We are reaching out to verify your account credentials and ensure your contactless smart card is operating with sub-10ms response time.

If you have any questions or require custom laser engraving for your team, simply reply directly to this email or visit your dashboard.

Warm regards,
CHIPNG Support Team`
  );
  const [replyTo, setReplyTo] = useState<string>('support@chipng.com');

  // --- UI State ---
  const [isSending, setIsSending] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Email Logs State ---
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');

  // Editor ref for inserting formatting
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [recipientHealth, setRecipientHealth] = useState<Record<string, { status: 'checking' | 'valid' | 'misconfigured'; reason?: string }>>({});

  const checkRecipientDeliverability = async (email: string) => {
    try {
      setRecipientHealth(prev => ({ ...prev, [email]: { status: 'checking' } }));
      const authHeaders = await getAdminAuthHeaders();
      const res = await fetch(`/api/admin/diagnose-recipient?email=${encodeURIComponent(email)}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.isMisconfiguredRemote) {
          setRecipientHealth(prev => ({
            ...prev,
            [email]: {
              status: 'misconfigured',
              reason: data.diagnosis || 'Remote mail server misconfigured (550 Relay rejected)'
            }
          }));
          toast.info(`Note: ${email}'s mail server is misconfigured and may reject incoming messages (550 relay).`);
          return;
        }
      }
      setRecipientHealth(prev => ({ ...prev, [email]: { status: 'valid' } }));
    } catch (e) {
      setRecipientHealth(prev => ({ ...prev, [email]: { status: 'valid' } }));
    }
  };

  // Add recipient to list
  const handleAddRecipient = (emailToAdd: string) => {
    const clean = emailToAdd.trim().toLowerCase();
    if (!clean) return;
    if (!isValidEmail(clean)) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }
    if (recipientList.includes(clean)) {
      toast.info('This recipient is already in the list.');
      return;
    }
    setRecipientList(prev => [...prev, clean]);
    setRecipientsInput('');
    checkRecipientDeliverability(clean);
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setRecipientList(prev => prev.filter(e => e !== emailToRemove));
    setRecipientHealth(prev => {
      const copy = { ...prev };
      delete copy[emailToRemove];
      return copy;
    });
  };

  const handleKeyDownRecipients = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddRecipient(recipientsInput);
    }
  };

  // Text formatting helpers for the composer
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = message;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setMessage(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  // Fetch recent email logs
  const fetchEmailLogs = async () => {
    setIsLoadingLogs(true);
    try {
      // 1. Try fetching via API proxy
      const session = (await supabase.auth.getSession()).data.session;
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/admin/email-logs', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
          setIsLoadingLogs(false);
          return;
        }
      }

      // 2. Fallback to Supabase email_logs table directly
      const { data: dbLogs } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbLogs && Array.isArray(dbLogs)) {
        setLogs(dbLogs);
      }
    } catch (e) {
      console.warn('Failed to load email logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    if (!logSearch || !logSearch.trim()) return logs;
    const q = logSearch.toLowerCase().trim();
    return logs.filter(l => {
      if (!l) return false;
      const rec = String(l.recipient || '').toLowerCase();
      const sub = String(l.subject || '').toLowerCase();
      const mid = String(l.resend_message_id || '').toLowerCase();
      return rec.includes(q) || sub.includes(q) || mid.includes(q);
    });
  }, [logs, logSearch]);

  // Combined active recipient list
  const allActiveRecipients = useMemo(() => {
    const list = [...recipientList];
    if (recipientsInput.trim() && isValidEmail(recipientsInput.trim())) {
      list.push(recipientsInput.trim().toLowerCase());
    }
    return Array.from(new Set(list));
  }, [recipientList, recipientsInput]);

  // Generated preview HTML
  const generatedPreviewHtml = useMemo(() => {
    return wrapChipngSupportEmail(message, subject || 'CHIPNG Support');
  }, [message, subject]);

  // Handle Send Email Dispatch with Multi-Tier Fallback
  const handleSendEmail = async (overrideRecipients?: string[]) => {
    const recipientsToSend = (overrideRecipients && overrideRecipients.length > 0)
      ? overrideRecipients
      : allActiveRecipients;

    // 1. Field Validations
    if (recipientsToSend.length === 0) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }

    const invalidRecipients = recipientsToSend.filter(e => !isValidEmail(e));
    if (invalidRecipients.length > 0) {
      toast.error(`Invalid email format: ${invalidRecipients.join(', ')}`);
      return;
    }

    // Auto-populate subject if quick testing
    let effectiveSubject = subject.trim();
    if (!effectiveSubject && overrideRecipients && overrideRecipients.length > 0) {
      effectiveSubject = `CHIP NG System Verification • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setSubject(effectiveSubject);
    }

    if (!effectiveSubject) {
      toast.error('Please enter an email subject.');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter an email message.');
      return;
    }

    if (replyTo.trim() && !isValidEmail(replyTo.trim())) {
      toast.error('Please enter a valid Reply-To email address.');
      return;
    }

    // 2. Prevent Double Submissions
    if (isSending) return;
    setIsSending(true);

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const effectiveHtml = wrapChipngSupportEmail(message, effectiveSubject);
      const payload = {
        to: recipientsToSend,
        subject: effectiveSubject,
        message: message.trim(),
        html: effectiveHtml,
        replyTo: replyTo.trim() || 'support@chipng.com'
      };

      let safeMessageId: string | null = null;
      let dispatchSuccess = false;

      // Safe string error extractor helper to prevent [object Object] in toasts
      const extractErrorText = (data: any, fallback: string = 'Unable to send the email right now. Please try again.'): string => {
        if (!data) return fallback;
        if (typeof data === 'string') {
          const trimmed = data.trim();
          if (trimmed === '[object Object]' || trimmed === '[object Error]' || trimmed === '') return fallback;
          return trimmed;
        }
        if (typeof data === 'object') {
          if (typeof data.message === 'string' && data.message && data.message !== '[object Object]') {
            return data.message.trim();
          }
          if (typeof data.error === 'string' && data.error && data.error !== '[object Object]') {
            return data.error.trim();
          }
          if (data.error && typeof data.error === 'object' && typeof data.error.message === 'string') {
            return data.error.message.trim();
          }
          if (typeof data.details === 'string' && data.details && data.details !== '[object Object]') {
            return data.details.trim();
          }
          if (typeof data.error_description === 'string' && data.error_description) {
            return data.error_description.trim();
          }
          try {
            const s = JSON.stringify(data);
            if (s && s !== '{}') return s.slice(0, 160);
          } catch (e) {}
        }
        return fallback;
      };

      // Tier 1: Dispatch via /api/admin/send-email (Local Node & Vercel Serverless)
      let lastErrorMessage = '';
      const endpointsToTry = [
        '/api/admin/send-email',
      ];

      for (const endpoint of endpointsToTry) {
        if (dispatchSuccess) break;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data.success !== false) {
              safeMessageId = String(data.messageId || data.id || 'resend_ack');
              dispatchSuccess = true;
              break;
            } else if (data.error) {
              lastErrorMessage = extractErrorText(data.error, lastErrorMessage);
            }
          } else {
            try {
              const errData = await res.json().catch(() => ({}));
              lastErrorMessage = extractErrorText(errData.error || errData.details || errData.message || errData, lastErrorMessage);
            } catch (e) {}
          }
        } catch (fetchErr: any) {
          console.warn(`Dispatch attempt to ${endpoint} failed:`, fetchErr);
        }
      }

      if (!dispatchSuccess || !safeMessageId) {
        const cleanMsg = extractErrorText(lastErrorMessage, 'Unable to send the email right now. Please verify recipient and try again.');
        throw new Error(cleanMsg);
      }

      setLastMessageId(safeMessageId);
      toast.success(`Email sent successfully.\nMessage ID: ${safeMessageId}`);

      // Non-blocking log recording to Supabase email_campaigns
      try {
        await supabase.from('email_campaigns').insert([{
          title: `Support: ${effectiveSubject.slice(0, 50)}`,
          subject_template: effectiveSubject,
          body_template: message.trim().slice(0, 300),
          sender_name: 'CHIPNG Support',
          sender_email: 'support@chipng.com',
          provider: 'resend',
          total_recipients: recipientsToSend.length,
          sent_count: recipientsToSend.length,
          status: 'completed',
          resend_batch_id: safeMessageId,
          metadata: { recipients: recipientsToSend, replyTo },
          created_at: new Date().toISOString()
        }]);
      } catch (e) {}

      // Reset recipients only if sent normally (not quick test)
      if (!overrideRecipients) {
        setRecipientList([]);
        setRecipientsInput('');
      }

      // Refresh log stream safely
      fetchEmailLogs();
    } catch (err: any) {
      console.error('Email dispatch error:', err);
      const displayMsg = (err?.message && err.message !== '[object Object]') 
        ? err.message 
        : 'Unable to send the email right now. Please try again.';
      toast.error(displayMsg);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: any, id: string) => {
    const str = typeof text === 'string' ? text : String(text || '');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(str).catch(() => {});
    }
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Infrastructure Status */}
      <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" /> Verified Resend Production Integration
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Admin Email Center
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Compose, preview, and dispatch official executive communications from your verified domain{' '}
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">chipng.com</span> with zero client-side secret exposure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Sender Identity</span>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  CHIPNG Support &lt;support@chipng.com&gt;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Composer & Live Preview / Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Email Composer Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-white/10 pb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#16a34a]" /> Compose Support Email
              </h3>
              <span className="text-[11px] text-neutral-400 font-medium">
                Resend Sub-10ms Transactional Engine
              </span>
            </div>

            {/* Recipient TO Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  To (Recipients) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  Press Enter or comma to add multiple recipients
                </span>
              </div>

              {/* Recipient Chips Container */}
              <div className="p-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex flex-wrap items-center gap-2 min-h-[46px] focus-within:border-[#16a34a] focus-within:ring-1 focus-within:ring-[#16a34a] transition-all">
                {recipientList.map((email) => {
                  const health = recipientHealth[email];
                  const isMisconfigured = health?.status === 'misconfigured';
                  return (
                    <span
                      key={email}
                      title={health?.reason || (isMisconfigured ? 'Remote server misconfigured' : 'Recipient valid')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all shadow-2xs ${
                        isMisconfigured
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200'
                          : 'bg-white dark:bg-[#1e2330] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {isMisconfigured && (
                        <span className="text-amber-500 font-bold" title="550 Relay rejected by remote server">⚠️</span>
                      )}
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-neutral-400 hover:text-rose-500 cursor-pointer ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}

                <input
                  type="email"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  onKeyDown={handleKeyDownRecipients}
                  onBlur={() => {
                    if (recipientsInput.trim() && isValidEmail(recipientsInput.trim())) {
                      handleAddRecipient(recipientsInput);
                    }
                  }}
                  placeholder={recipientList.length === 0 ? "e.g. client@example.com, ceo@company.ng" : "Add another email..."}
                  className="flex-1 min-w-[200px] bg-transparent text-xs font-mono text-neutral-900 dark:text-white outline-none px-2 py-1 placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Your CHIPNG Contactless Smart Card Verification"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all"
              />
            </div>

            {/* Reply-To Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Reply-To (Optional)
                </label>
                <span className="text-[11px] text-neutral-400">Default: support@chipng.com</span>
              </div>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="support@chipng.com"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
              />
            </div>

            {/* Message Body Field with Formatting Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#151821] p-1 rounded-xl border border-neutral-200/80 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n• ', '')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n1. ', '')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('[Link Text](https://', ')')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 cursor-pointer text-xs"
                    title="Add Link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email body message here..."
                className="w-full p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-all resize-y"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Eye className="w-4 h-4 text-[#16a34a]" /> Preview Email
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Fast One-Click Test to Admin */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSendEmail(['vickthor.dennis@gmail.com'])}
                  className="px-4 py-2.5 rounded-xl border border-[#16a34a]/30 hover:bg-[#16a34a]/10 text-[#16a34a] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  title="Dispatch instant test email to vickthor.dennis@gmail.com"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test to Me</span>
                </button>

                <button
                  type="button"
                  disabled={isSending || allActiveRecipients.length === 0}
                  onClick={() => handleSendEmail()}
                  className="px-7 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Email
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success acknowledgement callout */}
            {lastMessageId && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                    Email sent successfully. Message ID: <span className="font-mono">{String(lastMessageId)}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(lastMessageId, 'last_msg_id')}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer ml-2 shrink-0"
                  title="Copy Message ID"
                >
                  {copiedId === 'last_msg_id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live In-Line Preview & Delivery Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mini Preview Box */}
          <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#16a34a]" /> Live Template Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="text-[11px] text-[#16a34a] hover:underline font-bold cursor-pointer"
              >
                Expand View →
              </button>
            </div>

            {/* Email Meta Card */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs space-y-1 font-mono">
              <div className="text-neutral-500 dark:text-neutral-400">
                <span className="font-sans font-bold text-neutral-800 dark:text-neutral-200">From:</span> CHIPNG Support &lt;support@chipng.com&gt;
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">
                <span className="font-sans font-bold text-neutral-800 dark:text-neutral-200">To:</span> {allActiveRecipients.length > 0 ? allActiveRecipients.join(', ') : 'recipient@example.com'}
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">
                <span className="font-sans font-bold text-neutral-800 dark:text-neutral-200">Subject:</span> {subject || 'CHIPNG Support'}
              </div>
            </div>

            {/* Scaled Preview Frame */}
            <div className="border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white shadow-2xs max-h-[360px] overflow-y-auto">
              <iframe
                title="Mini Preview"
                srcDoc={generatedPreviewHtml}
                className="w-full h-[360px] border-none pointer-events-none"
              />
            </div>
          </div>

          {/* Email History Table */}
          <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Email History
              </h3>
              <button
                type="button"
                onClick={fetchEmailLogs}
                disabled={isLoadingLogs}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100/70 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-white/5">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-400">
                        {isLoadingLogs ? 'Loading history...' : 'No emails dispatched yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.slice(0, 15).map((log, idx) => {
                      const rawRec = (log as any)?.recipient;
                      const safeRecipient = typeof rawRec === 'string' 
                        ? rawRec 
                        : (Array.isArray(rawRec) ? rawRec.join(', ') : String(rawRec || '—'));
                      const safeSubject = typeof log?.subject === 'string' ? log.subject : String(log?.subject || '—');
                      let dateStr = '—';
                      try {
                        const parsed = parseTimestamp(log?.created_at);
                        if (parsed) {
                          dateStr = parsed.toLocaleDateString();
                        }
                      } catch {
                        dateStr = '—';
                      }
                      const rawStatus = String(log?.status || 'sent').toLowerCase();
                      const isFailed = rawStatus === 'failed' || rawStatus === 'error' || rawStatus === 'bounced';
                      const isSimulated = rawStatus === 'simulated' || rawStatus === 'pending';
                      const badgeClasses = isFailed
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : isSimulated
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
                      const badgeLabel = isFailed
                        ? 'Failed'
                        : isSimulated
                        ? 'Simulated'
                        : 'Accepted by Resend';
                      return (
                        <tr key={log?.id || `log-${idx}`} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">
                            {safeRecipient}
                          </td>
                          <td className="py-2 px-3 text-[11px] font-semibold text-neutral-900 dark:text-white truncate max-w-[130px]" title={safeSubject}>
                            {safeSubject}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClasses}`}
                              title={log?.error_message || badgeLabel}
                            >
                              {badgeLabel}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[10px] text-neutral-400 whitespace-nowrap">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] max-w-4xl w-full rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    CHIPNG Email Preview
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Subject: {subject || 'CHIPNG Support'}
                  </p>
                </div>
              </div>

              {/* Device Selector & Close */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-100 dark:bg-[#0a0b0e] flex items-center justify-center">
              <div 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ${
                  previewDevice === 'mobile' ? 'w-[375px] max-w-full' : 'w-[640px] max-w-full'
                }`}
              >
                <iframe
                  title="Full Email Preview"
                  srcDoc={generatedPreviewHtml}
                  className="w-full h-[580px] border-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#111318]">
              <span className="text-xs text-neutral-400 font-mono">
                From: CHIPNG Support &lt;support@chipng.com&gt;
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  disabled={isSending || allActiveRecipients.length === 0}
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleSendEmail();
                  }}
                  className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
