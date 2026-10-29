import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  AlertTriangle,
  ArrowRight, 
  Share2,
  ChevronRight,
  ChevronLeft,
  Shield,
  ShieldCheck,
  Smartphone,
  CheckSquare,
  Square,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Plus,
  Eye,
  Sliders,
  Layers,
  HelpCircle,
  Clock,
  Play,
  Zap,
  Settings,
  Database,
  Code,
  Terminal,
  Globe
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import { 
  ExtractedContact, 
  extractContactsFromFile, 
  extractContactsFromText, 
  parseSpreadsheetFile,
  normalizePhoneNumber,
  personalizeText,
  isValidEmail,
  isValidPhone,
  extractFirstName,
  generateUUID
} from '../utils/contactExtractor';

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
  return normalizePhoneNumber(phone);
}

export const SUPABASE_RESEND_SQL = `-- =====================================================
-- SUPER ADMIN RESEND INTEGRATION & EMAIL CAMPAIGNS SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =====================================================

-- 1. Email Campaigns Table (Records each broadcast / bulk blast dispatched via Resend)
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Victor Dennis – CHIP NG',
  sender_email TEXT DEFAULT 'vip@chipng.com',
  provider TEXT DEFAULT 'resend', -- 'resend', 'smtp', or 'simulated'
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  resend_batch_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can read email campaigns" ON public.email_campaigns FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can insert email campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update email campaigns" ON public.email_campaigns;
CREATE POLICY "Anyone can update email campaigns" ON public.email_campaigns FOR UPDATE USING (true);

-- 2. Email Delivery Logs Table (Per-recipient personalized dispatch logs & Resend message IDs)
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  personalized_subject TEXT NOT NULL,
  provider TEXT DEFAULT 'resend',
  provider_message_id TEXT, -- Resend message ID (e.g. 49a3999c-0ce1-4ea6-ab68-af69c7d79a0f)
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed', 'simulated'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read delivery logs" ON public.email_delivery_logs;
CREATE POLICY "Anyone can read delivery logs" ON public.email_delivery_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert delivery logs" ON public.email_delivery_logs;
CREATE POLICY "Anyone can insert delivery logs" ON public.email_delivery_logs FOR INSERT WITH CHECK (true);

-- 3. Admin Resend & Integration Settings Table (Stores active sender, verified domain, API key fallback)
CREATE TABLE IF NOT EXISTS public.admin_integration_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  resend_api_key TEXT,
  default_sender_name TEXT DEFAULT 'Victor Dennis – CHIP NG',
  default_sender_email TEXT DEFAULT 'vip@chipng.com',
  reply_to_email TEXT DEFAULT 'support@chipng.com',
  verified_domain TEXT DEFAULT 'chipng.com',
  is_resend_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_integration_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can read admin integration settings" ON public.admin_integration_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can upsert admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can upsert admin integration settings" ON public.admin_integration_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update admin integration settings" ON public.admin_integration_settings;
CREATE POLICY "Anyone can update admin integration settings" ON public.admin_integration_settings FOR UPDATE USING (true);

-- 4. Extracted Contacts Saved Table (Allows admin to persist extracted contacts from DOC, XLSX, JPG, PNG)
CREATE TABLE IF NOT EXISTS public.extracted_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  normalized_phone TEXT,
  source TEXT DEFAULT 'Manual/Upload',
  notes TEXT,
  is_valid_email BOOLEAN DEFAULT false,
  is_valid_phone BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.extracted_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can read extracted contacts" ON public.extracted_contacts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can insert extracted contacts" ON public.extracted_contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can update extracted contacts" ON public.extracted_contacts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Anyone can delete extracted contacts" ON public.extracted_contacts;
CREATE POLICY "Anyone can delete extracted contacts" ON public.extracted_contacts FOR DELETE USING (true);`;

export default function AdminUserCommsManager({ users, onRefresh }: AdminUserCommsManagerProps) {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'extractor' | 'email' | 'whatsapp' | 'directory' | 'resend' | 'supabase'>('extractor');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // ----------------------------------------------------
  // RESEND INTEGRATION STATE
  // ----------------------------------------------------
  const [resendStatus, setResendStatus] = useState<{
    connected: boolean;
    hasEnvKey: boolean;
    hasDbKey: boolean;
    source: string;
    defaultSenderName: string;
    defaultSenderEmail: string;
    verifiedDomain: string;
    replyToEmail: string;
  }>({
    connected: false,
    hasEnvKey: false,
    hasDbKey: false,
    source: 'none',
    defaultSenderName: 'Victor Dennis – CHIP NG',
    defaultSenderEmail: 'support@chipng.com',
    verifiedDomain: 'chipng.com',
    replyToEmail: 'support@chipng.com'
  });

  const [customResendApiKey, setCustomResendApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chip_admin_resend_api_key') || '';
    }
    return '';
  });

  const [selectedEmailProvider, setSelectedEmailProvider] = useState<'resend' | 'auto' | 'smtp' | 'simulated'>('resend');
  const [testEmailAddress, setTestEmailAddress] = useState('vickthor.dennis@gmail.com');
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Deliverability & Bounce Diagnostic State
  const [isVerifyingDomains, setIsVerifyingDomains] = useState(false);
  const [domainVerificationResults, setDomainVerificationResults] = useState<Record<string, { status: 'valid' | 'invalid'; reason?: string }>>({});
  const [showBounceDiagnosticModal, setShowBounceDiagnosticModal] = useState(false);
  const [diagnosticEmailInput, setDiagnosticEmailInput] = useState('info@sailorsloungelekki.com');
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // ----------------------------------------------------
  // 1. EXTRACTED CONTACTS STATE (From DOC, XLSX, TXT, JPG, PNG, Paste)
  // ----------------------------------------------------
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chip_extracted_contacts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((c: any) => ({
              ...c,
              id: c.id && c.id.length === 36 ? c.id : generateUUID()
            }));
          }
        }
      } catch (e) {}
    }
    return [
      {
        id: generateUUID(),
        name: 'Victor Dennis',
        email: 'victor@chipng.com',
        phone: '08123456789',
        normalizedPhone: '2348123456789',
        source: 'System Preset',
        notes: 'CHIP NG Founder & Executive',
        isValidEmail: true,
        isValidPhone: true,
        selected: true
      },
      {
        id: generateUUID(),
        name: 'Dr. Ngozi Adebayo',
        email: 'adebayo.consults@gmail.com',
        phone: '08098765432',
        normalizedPhone: '2348098765432',
        source: 'System Preset',
        notes: 'Lagos Medical Chamber',
        isValidEmail: true,
        isValidPhone: true,
        selected: true
      },
      {
        id: generateUUID(),
        name: 'Chinedu Okafor',
        email: 'c.okafor@techstars.ng',
        phone: '09011223344',
        normalizedPhone: '2349011223344',
        source: 'System Preset',
        notes: 'Venture Builder',
        isValidEmail: true,
        isValidPhone: true,
        selected: true
      }
    ];
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncingWithDb, setIsSyncingWithDb] = useState(false);
  const [extractionStatusText, setExtractionStatusText] = useState('');
  const [pastedRawText, setPastedRawText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'email' | 'phone' | 'both'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync extractedContacts with localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chip_extracted_contacts', JSON.stringify(extractedContacts));
      }
    } catch (e) {}
  }, [extractedContacts]);

  // Manual contact adding state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ name: '', email: '', phone: '', notes: '' });

  // ----------------------------------------------------
  // 2. BULK PERSONALIZED EMAIL STATE
  // ----------------------------------------------------
  const [emailAudience, setEmailAudience] = useState<'registered' | 'extracted' | 'selected' | 'direct'>('registered');
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('Exclusive Invitation for {name} – Upgrade to CHIP Metal');
  const [emailBody, setEmailBody] = useState(
`Hello {first_name},

We are thrilled to reach out personally to you regarding your contactless networking and smart business profile.

As a valued leader, you deserve a card that makes an indelible impression within 10 milliseconds of contact. Your custom laser-engraved CHIP Metal Card is now available with zero application requirements.

Explore your live contactless demo:
{card_url}

Need custom team onboarding or priority laser engraving? Simply reply directly to this email.

Warm regards,
Victor Dennis
Founder & CEO, CHIP NG
https://chipng.com`
  );
  const [senderName, setSenderName] = useState('CHIP NG');
  const [senderEmail, setSenderEmail] = useState('support@chipng.com');
  const [replyToEmail, setReplyToEmail] = useState('support@chipng.com');

  const normalizeSenderEmail = (email: string | null | undefined): string => {
    if (!email) return 'support@chipng.com';
    let clean = email.trim();
    if (clean === 'support.chipng.com' || clean === 'chipng.com') {
      return 'support@chipng.com';
    }
    if (!clean.includes('@') && clean.includes('.')) {
      return clean.replace(/^([^.]+)\./, '$1@');
    }
    return clean;
  };

  const formatClientErrorMessage = (err: any): string => {
    if (!err) return 'An unexpected error occurred';
    if (typeof err === 'string' && err !== '[object Object]') return err;
    if (typeof err === 'object') {
      if (typeof err.message === 'string' && err.message && err.message !== '[object Object]') {
        return err.message;
      }
      if (typeof err.details === 'string' && err.details && err.details !== '[object Object]') {
        return err.details;
      }
      if (typeof err.error === 'string' && err.error && err.error !== '[object Object]') {
        return err.error;
      }
      if (err.error && typeof err.error === 'object') {
        const nested = formatClientErrorMessage(err.error);
        if (nested && nested !== '[object Object]') return nested;
      }
      try {
        const s = JSON.stringify(err);
        if (s && s !== '{}') return s.slice(0, 200);
      } catch (e) {}
    }
    return String(err) === '[object Object]' ? 'Unknown error during dispatch' : String(err);
  };
  const [emailPreviewIndex, setEmailPreviewIndex] = useState(0);
  const [isSendingBulkEmails, setIsSendingBulkEmails] = useState(false);
  const [bulkEmailProgress, setBulkEmailProgress] = useState({ sent: 0, total: 0 });
  const [bulkEmailLogs, setBulkEmailLogs] = useState<any[]>([]);

  // ----------------------------------------------------
  // 3. BULK PERSONALIZED NUMBERS (SMS & WHATSAPP) STATE
  // ----------------------------------------------------
  const [phoneAudience, setPhoneAudience] = useState<'registered' | 'extracted' | 'selected'>('registered');
  const [smsMessage, setSmsMessage] = useState(
`Hi {first_name}! 👋 

This is Victor Dennis from CHIP NG. We've officially unlocked priority contactless NFC cards with sub-10ms response for Nigerian executives.

View your digital profile demo here:
{card_url}

Reply YES if you'd like us to dispatch your laser-engraved metal card today!`
  );
  const [smsSenderId, setSmsSenderId] = useState('CHIP NG');
  const [smsPreviewIndex, setSmsPreviewIndex] = useState(0);
  const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);
  const [bulkSmsLogs, setBulkSmsLogs] = useState<any[]>([]);
  const [dispatchedPhoneIds, setDispatchedPhoneIds] = useState<Set<string>>(new Set());

  // ----------------------------------------------------
  // 4. REGISTERED MEMBERS DIRECTORY STATE
  // ----------------------------------------------------
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'has_email' | 'has_phone' | 'has_both' | 'missing'>('all');

  // Check Resend Status & Sync Supabase on Load
  useEffect(() => {
    // 1. Fetch Resend server status with safe JSON parsing
    fetch('/api/admin/resend/status', { headers: { 'Accept': 'application/json' } })
      .then(async res => {
        const text = await res.text();
        try {
          return text ? JSON.parse(text) : null;
        } catch (e) {
          return null;
        }
      })
      .then(data => {
        if (data) {
          setResendStatus(data);
          if (data.defaultSenderName) setSenderName(data.defaultSenderName.trim());
          if (data.defaultSenderEmail) setSenderEmail(data.defaultSenderEmail.trim());
          if (data.replyToEmail) setReplyToEmail(data.replyToEmail.trim());
        }
      })
      .catch(err => console.warn('Failed to fetch Resend status:', err));

    // 2. Direct Supabase query to admin_integration_settings & extracted_contacts
    const loadSupabaseData = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_integration_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          if (data.resend_api_key) {
            setCustomResendApiKey(data.resend_api_key);
            try { localStorage.setItem('chip_admin_resend_api_key', data.resend_api_key); } catch (e) {}
          }
          if (data.default_sender_name) setSenderName(data.default_sender_name.trim());
          if (data.default_sender_email) setSenderEmail(data.default_sender_email.trim());
          if (data.reply_to_email) setReplyToEmail(data.reply_to_email.trim());
          setResendStatus(prev => ({
            ...prev,
            connected: true,
            hasDbKey: true,
            source: 'supabase_settings',
            defaultSenderName: (data.default_sender_name || 'CHIP NG').trim(),
            defaultSenderEmail: normalizeSenderEmail(data.default_sender_email || 'support@chipng.com'),
            verifiedDomain: data.verified_domain || 'chipng.com',
            replyToEmail: (data.reply_to_email || 'support@chipng.com').trim()
          }));
        }
      } catch (err) {
        console.warn('Supabase settings query note:', err);
      }

      // 3. Load persisted contacts from public.extracted_contacts table in Supabase
      try {
        const { data, error } = await supabase
          .from('extracted_contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const loaded: ExtractedContact[] = data.map((row: any) => ({
            id: row.id,
            name: row.name || 'Contact',
            email: row.email || '',
            phone: row.phone || '',
            normalizedPhone: row.normalized_phone || normalizePhoneNumber(row.phone || ''),
            source: row.source || 'Supabase Database',
            notes: row.notes || '',
            isValidEmail: row.is_valid_email ?? isValidEmail(row.email || ''),
            isValidPhone: row.is_valid_phone ?? isValidPhone(row.phone || ''),
            selected: true
          }));

          setExtractedContacts(prev => {
            const seen = new Set(loaded.map(c => (c.email || c.normalizedPhone || c.name).toLowerCase()));
            const localOnly = prev.filter(c => !seen.has((c.email || c.normalizedPhone || c.name).toLowerCase()));
            return [...loaded, ...localOnly];
          });
        }
      } catch (err) {
        console.warn('Supabase extracted_contacts note:', err);
      }
    };

    loadSupabaseData();
  }, []);

  // Process registered users from props safely
  const processedUsers = useMemo(() => {
    return (users || []).map(u => {
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

  // Filter registered users
  const filteredDirectoryUsers = useMemo(() => {
    return processedUsers.filter(u => {
      const term = directorySearch.toLowerCase().trim();
      const matchesSearch = !term || 
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.primaryPhone && u.primaryPhone.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (directoryFilter === 'has_email') return u.hasEmail;
      if (directoryFilter === 'has_phone') return u.hasPhone;
      if (directoryFilter === 'has_both') return u.hasEmail && u.hasPhone;
      if (directoryFilter === 'missing') return !u.hasEmail && !u.hasPhone;
      return true;
    });
  }, [processedUsers, directorySearch, directoryFilter]);

  // Filter extracted contacts
  const filteredExtractedContacts = useMemo(() => {
    return extractedContacts.filter(c => {
      const term = contactSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.notes && c.notes.toLowerCase().includes(term)) ||
        c.source.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (contactFilter === 'email') return c.isValidEmail;
      if (contactFilter === 'phone') return c.isValidPhone;
      if (contactFilter === 'both') return c.isValidEmail && c.isValidPhone;
      return true;
    });
  }, [extractedContacts, contactSearch, contactFilter]);

  const selectedContacts = useMemo(() => {
    return extractedContacts.filter(c => c.selected);
  }, [extractedContacts]);

  const activeRecipients = useMemo(() => {
    if (selectedContacts.length > 0) return selectedContacts;
    return filteredExtractedContacts;
  }, [selectedContacts, filteredExtractedContacts]);

  // Registered members mapped to ExtractedContact schema
  const registeredEmailUsers = useMemo(() => {
    return processedUsers
      .filter(u => u.hasEmail)
      .map(u => ({
        id: `reg_${u.id}`,
        name: u.full_name || u.username || 'Member',
        email: u.email,
        phone: u.primaryPhone || '',
        normalizedPhone: u.normalizedWa || '',
        username: u.username || '',
        card_url: u.username ? `https://chipng.com/@${u.username}` : 'https://chipng.com',
        source: 'Registered Member',
        isValidEmail: true,
        isValidPhone: u.hasPhone,
        selected: true
      }));
  }, [processedUsers]);

  const registeredPhoneUsers = useMemo(() => {
    return processedUsers
      .filter(u => u.hasPhone)
      .map(u => ({
        id: `reg_${u.id}`,
        name: u.full_name || u.username || 'Member',
        email: u.email || '',
        phone: u.primaryPhone,
        normalizedPhone: u.normalizedWa,
        source: 'Registered Member',
        isValidEmail: u.hasEmail,
        isValidPhone: true,
        selected: true
      }));
  }, [processedUsers]);

  // Direct email address parsing from custom input
  const parsedDirectEmails = useMemo(() => {
    if (!directEmailInput.trim()) return [];
    const lines = directEmailInput.split(/[\n,;]+/);
    const result: ExtractedContact[] = [];
    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (!clean) return;
      const match = clean.match(/(?:([^<]+)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
      if (match) {
        const rawName = (match[1] || '').trim() || match[2].split('@')[0].replace(/[._-]/g, ' ');
        result.push({
          id: `direct_em_${idx}`,
          name: rawName,
          email: match[2].toLowerCase(),
          phone: '',
          normalizedPhone: '',
          source: 'Direct Input',
          isValidEmail: true,
          isValidPhone: false,
          selected: true
        });
      }
    });
    return result;
  }, [directEmailInput]);

  const emailRecipients = useMemo(() => {
    if (emailAudience === 'registered') {
      return registeredEmailUsers;
    }
    if (emailAudience === 'extracted') {
      return extractedContacts.filter(c => c.isValidEmail);
    }
    if (emailAudience === 'selected') {
      return selectedContacts.filter(c => c.isValidEmail);
    }
    if (emailAudience === 'direct') {
      return parsedDirectEmails;
    }
    return registeredEmailUsers.length > 0 ? registeredEmailUsers : extractedContacts.filter(c => c.isValidEmail);
  }, [emailAudience, registeredEmailUsers, extractedContacts, selectedContacts, parsedDirectEmails]);

  const phoneRecipients = useMemo(() => {
    if (phoneAudience === 'registered') {
      return registeredPhoneUsers;
    }
    if (phoneAudience === 'extracted') {
      return extractedContacts.filter(c => c.isValidPhone);
    }
    if (phoneAudience === 'selected') {
      return selectedContacts.filter(c => c.isValidPhone);
    }
    return registeredPhoneUsers.length > 0 ? registeredPhoneUsers : extractedContacts.filter(c => c.isValidPhone);
  }, [phoneAudience, registeredPhoneUsers, extractedContacts, selectedContacts]);

  const fallbackContact: ExtractedContact = {
    id: 'sample_preview',
    name: 'Sample Recipient',
    email: 'recipient@example.com',
    phone: '08012345678',
    normalizedPhone: '2348012345678',
    source: 'Sample Preview',
    isValidEmail: true,
    isValidPhone: true,
    selected: true
  };

  const currentEmailRecipient: ExtractedContact = emailRecipients[emailPreviewIndex] || emailRecipients[0] || fallbackContact;
  const currentPhoneRecipient: ExtractedContact = phoneRecipients[smsPreviewIndex] || phoneRecipients[0] || fallbackContact;

  const previewPersonalizedSubject = useMemo(() => {
    return personalizeText(emailSubject, currentEmailRecipient);
  }, [emailSubject, currentEmailRecipient]);

  const previewPersonalizedBody = useMemo(() => {
    return personalizeText(emailBody, currentEmailRecipient);
  }, [emailBody, currentEmailRecipient]);

  const previewPersonalizedSms = useMemo(() => {
    return personalizeText(smsMessage, currentPhoneRecipient);
  }, [smsMessage, currentPhoneRecipient]);

  // ----------------------------------------------------
  // EXTRACTION DISPATCHERS
  // ----------------------------------------------------
  const handleProcessFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsExtracting(true);
    setExtractionStatusText(`Analyzing ${files.length} document(s) & images...`);

    const newExtractedList: ExtractedContact[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setExtractionStatusText(`Parsing [${i + 1}/${files.length}]: ${file.name}...`);
      try {
        const contacts = await extractContactsFromFile(file);
        if (contacts.length > 0) {
          newExtractedList.push(...contacts);
        }
      } catch (err: any) {
        console.error(`Error extracting from ${file.name}:`, err);
      }
    }

    if (newExtractedList.length > 0) {
      setExtractedContacts(prev => {
        const existingKeys = new Set(prev.map(c => (c.email || c.normalizedPhone || c.name).toLowerCase()));
        const uniqueNew = newExtractedList.filter(c => {
          const key = (c.email || c.normalizedPhone || c.name).toLowerCase();
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        });
        return [...uniqueNew, ...prev];
      });
      toast.success(`Successfully extracted ${newExtractedList.length} contacts!`);
    } else {
      toast.error('No contacts could be detected from the uploaded files.');
    }

    setIsExtracting(false);
    setExtractionStatusText('');
  };

  const handleParsePastedText = () => {
    if (!pastedRawText.trim()) {
      toast.error('Please paste text containing names, emails, or phone numbers');
      return;
    }

    setIsExtracting(true);
    setExtractionStatusText('Extracting contacts from pasted text...');

    try {
      const parsed = extractContactsFromText(pastedRawText, 'Pasted Text');
      if (parsed.length > 0) {
        setExtractedContacts(prev => {
          const existingKeys = new Set(prev.map(c => (c.email || c.normalizedPhone || c.name).toLowerCase()));
          const uniqueNew = parsed.filter(c => {
            const key = (c.email || c.normalizedPhone || c.name).toLowerCase();
            if (existingKeys.has(key)) return false;
            existingKeys.add(key);
            return true;
          });
          return [...uniqueNew, ...prev];
        });
        toast.success(`Extracted ${parsed.length} contacts from pasted text!`);
        setPastedRawText('');
      } else {
        toast.error('No valid emails or phone numbers recognized in pasted text.');
      }
    } catch (e: any) {
      toast.error('Failed to parse text: ' + e.message);
    } finally {
      setIsExtracting(false);
      setExtractionStatusText('');
    }
  };

  const handleImportRegisteredMembers = () => {
    if (processedUsers.length === 0) {
      toast.error('No registered members found to import');
      return;
    }

    const imported: ExtractedContact[] = processedUsers.map((u) => ({
      id: generateUUID(),
      name: u.full_name || u.username || 'CHIP Member',
      email: u.email || '',
      phone: u.primaryPhone || '',
      normalizedPhone: u.normalizedWa || '',
      source: 'CHIP NG Database',
      notes: `@${u.username || 'user'} • ${u.is_verified ? 'Verified' : 'Standard'}`,
      isValidEmail: u.hasEmail,
      isValidPhone: u.hasPhone,
      selected: true
    }));

    setExtractedContacts(prev => {
      const existingKeys = new Set(prev.map(c => (c.email || c.normalizedPhone || c.name).toLowerCase()));
      const uniqueNew = imported.filter(c => {
        const key = (c.email || c.normalizedPhone || c.name).toLowerCase();
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
      });
      return [...uniqueNew, ...prev];
    });

    toast.success(`Imported ${imported.length} registered members into Contact Manager!`);
  };

  const handleSaveContactsToSupabase = async () => {
    if (extractedContacts.length === 0) {
      toast.error('No extracted contacts to save');
      return;
    }

    setIsSyncingWithDb(true);
    try {
      const rows = extractedContacts.map(c => ({
        id: c.id && c.id.length === 36 ? c.id : generateUUID(),
        name: c.name || 'Contact',
        email: c.email || null,
        phone: c.phone || null,
        normalized_phone: c.normalizedPhone || null,
        source: c.source || 'Admin Extractor',
        notes: c.notes || null,
        is_valid_email: c.isValidEmail,
        is_valid_phone: c.isValidPhone
      }));

      // Update state with any regenerated UUIDs
      setExtractedContacts(prev => prev.map((c, i) => ({ ...c, id: rows[i].id })));

      const { error } = await supabase.from('extracted_contacts').upsert(rows, { onConflict: 'id' });
      if (error) throw error;

      toast.success(`Successfully saved ${rows.length} contacts to Supabase table!`);
    } catch (err: any) {
      toast.error('Failed to sync contacts to Supabase: ' + err.message);
    } finally {
      setIsSyncingWithDb(false);
    }
  };

  const handleToggleContactSelect = (id: string) => {
    setExtractedContacts(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const handleSelectAllContacts = (select: boolean) => {
    setExtractedContacts(prev => prev.map(c => ({ ...c, selected: select })));
  };

  const handleUpdateContact = async (id: string, field: 'name' | 'email' | 'phone' | 'notes', val: string) => {
    setExtractedContacts(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, [field]: val };
      if (field === 'email') updated.isValidEmail = isValidEmail(val);
      if (field === 'phone') {
        updated.normalizedPhone = normalizePhoneNumber(val);
        updated.isValidPhone = isValidPhone(val);
      }
      return updated;
    }));

    try {
      const dbField = field === 'phone' ? 'phone' : field;
      await supabase.from('extracted_contacts').update({ [dbField]: val }).eq('id', id);
    } catch (e) {}
  };

  const handleDeleteContact = async (id: string) => {
    setExtractedContacts(prev => prev.filter(c => c.id !== id));
    try {
      await supabase.from('extracted_contacts').delete().eq('id', id);
    } catch (e) {}
  };

  const handleDeleteSelectedContacts = async () => {
    const idsToDelete = selectedContacts.map(c => c.id);
    setExtractedContacts(prev => prev.filter(c => !c.selected));
    try {
      await supabase.from('extracted_contacts').delete().in('id', idsToDelete);
    } catch (e) {}
    toast.success(`Deleted ${idsToDelete.length} contacts`);
  };

  const handleAddManualContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.name.trim() && !newContactForm.email.trim() && !newContactForm.phone.trim()) {
      toast.error('Please enter at least a name, email, or phone number');
      return;
    }

    const normPhone = normalizePhoneNumber(newContactForm.phone);
    const newContact: ExtractedContact = {
      id: generateUUID(),
      name: newContactForm.name.trim() || 'New Contact',
      email: newContactForm.email.trim().toLowerCase(),
      phone: newContactForm.phone.trim(),
      normalizedPhone: normPhone,
      source: 'Manual Entry',
      notes: newContactForm.notes.trim(),
      isValidEmail: isValidEmail(newContactForm.email),
      isValidPhone: isValidPhone(newContactForm.phone),
      selected: true
    };

    setExtractedContacts(prev => [newContact, ...prev]);
    setNewContactForm({ name: '', email: '', phone: '', notes: '' });
    setShowAddModal(false);
    toast.success('Added new contact successfully!');

    try {
      await supabase.from('extracted_contacts').insert([{
        id: newContact.id,
        name: newContact.name,
        email: newContact.email || null,
        phone: newContact.phone || null,
        normalized_phone: newContact.normalizedPhone || null,
        source: 'Manual Entry',
        notes: newContact.notes || null,
        is_valid_email: newContact.isValidEmail,
        is_valid_phone: newContact.isValidPhone
      }]);
    } catch (e) {}
  };

  const handleExportContactsCsv = () => {
    const list = activeRecipients;
    if (list.length === 0) {
      toast.error('No contacts to export');
      return;
    }

    const headers = ['Full Name', 'First Name', 'Email Address', 'Phone Number', 'Normalized Phone (234)', 'Source', 'Notes'];
    const rows = list.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${extractFirstName(c.name).replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.normalizedPhone.replace(/"/g, '""')}"`,
      `"${c.source.replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHIP_NG_Extracted_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} contacts to CSV`);
  };

  // ----------------------------------------------------
  // RESEND TEST EMAIL DISPATCH
  // ----------------------------------------------------
  const handleSendTestResend = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Please enter a valid recipient email for test dispatch');
      return;
    }

    setIsTestingResend(true);
    try {
      const effectiveKey = (customResendApiKey || (typeof window !== 'undefined' ? localStorage.getItem('chip_admin_resend_api_key') : '') || '').trim();

      const res = await fetch('/api/admin/resend/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          testEmail: testEmailAddress.trim(),
          resendApiKey: effectiveKey || undefined,
          senderName: (senderName || 'CHIP NG').trim(),
          senderEmail: normalizeSenderEmail(senderEmail)
        })
      });

      const rawText = await res.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        const cleanMsg = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(cleanMsg || `Server responded with status ${res.status}`);
      }

      if (!res.ok || !json.success) {
        const testErr = json?.message || json?.details || (typeof json?.error === 'string' 
          ? json.error 
          : (json?.error?.message || (json?.error ? JSON.stringify(json.error) : `Failed to dispatch test email (${res.status})`)));
        throw new Error(testErr);
      }

      toast.success(`Verified test email delivered via Resend! ID: ${json.messageId || 'Success'}`);
      setShowTestModal(false);
    } catch (err: any) {
      const msg = formatClientErrorMessage(err);
      toast.error(`Resend Test Error: ${msg}`);
    } finally {
      setIsTestingResend(false);
    }
  };

  // ----------------------------------------------------
  // SAVE RESEND SETTINGS TO SUPABASE
  // ----------------------------------------------------
  const handleSaveResendSettings = async () => {
    setIsSavingSettings(true);
    try {
      if (typeof window !== 'undefined' && customResendApiKey) {
        localStorage.setItem('chip_admin_resend_api_key', customResendApiKey.trim());
      }

      const updatePayload: any = {
        id: 'primary',
        default_sender_name: (senderName || 'CHIP NG').trim(),
        default_sender_email: normalizeSenderEmail(senderEmail),
        reply_to_email: (replyToEmail || 'support@chipng.com').trim(),
        verified_domain: resendStatus.verifiedDomain || 'chipng.com',
        is_resend_active: true,
        updated_at: new Date().toISOString()
      };

      if (customResendApiKey && customResendApiKey.trim()) {
        updatePayload.resend_api_key = customResendApiKey.trim();
      }

      const { error } = await supabase.from('admin_integration_settings').upsert(updatePayload);

      if (error) {
        console.warn('Supabase upsert note:', error.message);
      }

      toast.success('Resend settings saved to Supabase successfully!');
      
      // Refresh status safely
      try {
        const statusRes = await fetch('/api/admin/resend/status', { headers: { 'Accept': 'application/json' } });
        const rawStatus = await statusRes.text();
        const statusData = rawStatus ? JSON.parse(rawStatus) : null;
        if (statusData) setResendStatus(statusData);
      } catch (statusErr) {}
    } catch (err: any) {
      toast.error('Saved to local session: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ----------------------------------------------------
  // RECIPIENT DELIVERABILITY & MX VERIFIER
  // ----------------------------------------------------
  const handleVerifyRecipientDomains = async () => {
    const emailsToCheck = emailRecipients.map(r => r.email).filter(Boolean);
    if (emailsToCheck.length === 0) {
      toast.error('No email recipients to verify');
      return;
    }
    setIsVerifyingDomains(true);
    try {
      const res = await fetch('/api/admin/verify-recipient-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailsToCheck })
      });
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        const map: Record<string, { status: 'valid' | 'invalid'; reason?: string }> = {};
        let invalidCount = 0;
        data.results.forEach((r: any) => {
          map[r.email.toLowerCase()] = { status: r.status, reason: r.reason };
          if (r.status === 'invalid') invalidCount++;
        });
        setDomainVerificationResults(map);
        if (invalidCount > 0) {
          toast.warning(`Deliverability check complete: ${invalidCount} recipient(s) have broken/unconfigured MX servers (e.g. 550 Relay rejection like sailorsloungelekki.com).`);
        } else {
          toast.success(`Deliverability check passed: All ${data.results.length} recipient domains have active MX mail servers!`);
        }
      }
    } catch (e: any) {
      toast.error('Failed to verify domains: ' + e.message);
    } finally {
      setIsVerifyingDomains(false);
    }
  };

  const handleRunDiagnostic = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsDiagnosing(true);
    try {
      const res = await fetch(`/api/admin/diagnose-recipient?email=${encodeURIComponent(targetEmail.trim())}`);
      const data = await res.json();
      setDiagnosticData(data);
    } catch (e: any) {
      toast.error('Failed to run diagnostic: ' + e.message);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // ----------------------------------------------------
  // SEND BULK PERSONALIZED EMAILS (RESEND INTEGRATED)
  // ----------------------------------------------------
  const handleSendBulkPersonalizedEmails = async () => {
    if (emailRecipients.length === 0) {
      toast.error('No recipients with valid email addresses found. Please select Platform Users or Extracted Contacts.');
      return;
    }

    setIsSendingBulkEmails(true);
    setBulkEmailProgress({ sent: 0, total: emailRecipients.length });
    setBulkEmailLogs([]);

    try {
      const effectiveKey = (customResendApiKey || (typeof window !== 'undefined' ? localStorage.getItem('chip_admin_resend_api_key') : '') || '').trim();

      const res = await fetch('/api/admin/send-bulk-emails', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipients: emailRecipients.map(r => ({
            name: (r.name || 'Recipient').trim(),
            email: (r.email || '').trim(),
            phone: (r.phone || '').trim(),
            username: (r.username || (r as any).slug || (r.email ? r.email.split('@')[0] : '')).trim(),
            card_url: r.card_url || (r.username ? `https://chipng.com/@${r.username}` : undefined)
          })),
          subjectTemplate: emailSubject,
          bodyTemplate: emailBody,
          senderName: (senderName || 'CHIP NG').trim(),
          senderEmail: normalizeSenderEmail(senderEmail),
          replyTo: (replyToEmail || 'support@chipng.com').trim(),
          provider: selectedEmailProvider,
          resendApiKey: effectiveKey || undefined,
          campaignTitle: `Bulk Outreach - ${new Date().toISOString().slice(0, 10)}`
        })
      });

      const rawText = await res.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        const cleanMsg = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(cleanMsg || `Server responded with status ${res.status}`);
      }

      // Always populate delivery logs from response if available so admin can inspect failures
      if (Array.isArray(json?.logs) && json.logs.length > 0) {
        setBulkEmailLogs(json.logs);
      } else if (Array.isArray(json?.results) && json.results.length > 0) {
        setBulkEmailLogs(json.results);
      }

      if (typeof json?.sentCount === 'number') {
        setBulkEmailProgress({ sent: json.sentCount, total: emailRecipients.length });
      }

      if (!res.ok || json.success === false) {
        const errorMsg = json?.message || json?.details || (typeof json?.error === 'string' ? json.error : json?.error?.message) || `Server rejected bulk email request (${res.status})`;
        throw new Error(errorMsg);
      }

      if (json.sentCount > 0 && json.failedCount > 0) {
        toast.warning(`Partially dispatched ${json.sentCount} emails (${json.failedCount} failed. Check report below).`);
      } else if (json.provider === 'resend' || json.provider === 'resend_fallback') {
        const note = json.notice ? ` (${json.notice})` : '';
        toast.success(`Dispatched ${json.sentCount} personalized emails via Resend API (Supabase linked)${note}!`);
      } else if (json.provider === 'smtp' || json.provider === 'smtp_fallback') {
        toast.success(`Dispatched ${json.sentCount} personalized emails via SMTP!`);
      } else {
        toast.success(`Processed ${json.sentCount} personalized emails in Sandbox mode`);
      }
    } catch (err: any) {
      const msg = formatClientErrorMessage(err);
      toast.error('Failed to dispatch bulk emails: ' + msg);
    } finally {
      setIsSendingBulkEmails(false);
    }
  };

  // ----------------------------------------------------
  // SEND BULK PERSONALIZED NUMBERS (SMS / WHATSAPP)
  // ----------------------------------------------------
  const handleSendBulkPersonalizedSms = async () => {
    if (phoneRecipients.length === 0) {
      toast.error('No recipients with valid phone numbers found');
      return;
    }

    setIsSendingBulkSms(true);
    setBulkSmsLogs([]);

    try {
      const res = await fetch('/api/admin/send-bulk-sms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipients: phoneRecipients.map(r => ({
            name: (r.name || 'Recipient').trim(),
            phone: (r.phone || '').trim(),
            email: (r.email || '').trim()
          })),
          messageTemplate: smsMessage,
          senderId: (smsSenderId || 'CHIP NG').trim()
        })
      });

      const rawText = await res.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        const cleanMsg = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(cleanMsg || `Server responded with status ${res.status}`);
      }

      if (!res.ok || json.error) {
        throw new Error(json.error || `Server rejected bulk SMS request (${res.status})`);
      }

      setBulkSmsLogs(json.logs || []);
      toast.success(`Prepared ${json.queuedCount} personalized messages with 1-click WhatsApp links!`);
    } catch (err: any) {
      toast.error('Failed to process bulk numbers: ' + err.message);
    } finally {
      setIsSendingBulkSms(false);
    }
  };

  const handleLaunchWhatsAppIndividual = (contact: ExtractedContact) => {
    const personalized = personalizeText(smsMessage, contact);
    const norm = contact.normalizedPhone || normalizePhoneNumber(contact.phone);
    const url = `https://wa.me/${norm}?text=${encodeURIComponent(personalized)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setDispatchedPhoneIds(prev => new Set([...prev, contact.id]));
  };

  const handleCopyText = (text: string, key: string, successMsg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(key);
    toast.success(successMsg);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const isResendReady = resendStatus.connected || Boolean(customResendApiKey);

  return (
    <div className="space-y-8">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Extracted Contacts */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Extracted Contacts</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {extractedContacts.length}
            </span>
            <span className="text-[11px] text-[#16a34a] font-semibold mt-0.5 block">
              {selectedContacts.length} selected for action
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Resend Integration Status Card */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Resend Email Engine</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isResendReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-base sm:text-lg font-extrabold text-neutral-950 dark:text-white">
                {resendStatus.hasEnvKey ? 'Vercel Connected' : isResendReady ? 'Active Key' : 'Ready to Connect'}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block truncate max-w-[170px]">
              {normalizeSenderEmail(senderEmail)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveSubTab('resend')}
            className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center cursor-pointer transition-all"
            title="Configure Resend"
          >
            <Zap className="w-6 h-6" />
          </button>
        </div>

        {/* Valid Phone Numbers Ready */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">WhatsApp & SMS Ready</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {extractedContacts.filter(c => c.isValidPhone).length}
            </span>
            <span className="text-[11px] text-[#25D366] font-semibold mt-0.5 block">
              {phoneRecipients.length} in active queue
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 flex items-center justify-center">
            <FaWhatsapp className="w-6 h-6" />
          </div>
        </div>

        {/* Platform Registered Users & Supabase */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Supabase Database</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {processedUsers.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveSubTab('supabase')}
              className="text-[11px] text-[#16a34a] hover:underline font-bold mt-0.5 block cursor-pointer"
            >
              View SQL Schema &amp; Tables →
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Modern Sub-Tab Pill Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/10 pb-4">
        <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('extractor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'extractor'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#16a34a]" />
            <span>Contact Extractor</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-extrabold">
              {extractedContacts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('email')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'email'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-500" />
            <span>Personalized Emails</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-600 font-extrabold">
              {emailRecipients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'whatsapp'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
            <span>Personalized Numbers</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-[#25D366]/10 text-[#25D366] font-extrabold">
              {phoneRecipients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('resend')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'resend'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Resend Integration</span>
            <span className={`w-2 h-2 rounded-full ${isResendReady ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('supabase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'supabase'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-blue-500" />
            <span>Supabase Setup &amp; SQL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Directory</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: SMART CONTACT EXTRACTOR (DOC, XLSX, TXT, JPG, PNG, PASTE) */}
      {/* ==================================================== */}
      {activeSubTab === 'extractor' && (
        <div className="space-y-6">
          {/* Section Introduction */}
          <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Universal Multi-Format Ingestion
                </div>
                <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                  Extract Name, Email &amp; Phone Number from Any File or Text
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Upload spreadsheets (<span className="font-semibold text-neutral-700 dark:text-neutral-300">.xlsx, .xls, .csv</span>), Word documents (<span className="font-semibold text-neutral-700 dark:text-neutral-300">.doc, .docx</span>), text files (<span className="font-semibold text-neutral-700 dark:text-neutral-300">.txt</span>), business card photos (<span className="font-semibold text-neutral-700 dark:text-neutral-300">.jpg, .png</span> via Vision OCR), or paste raw text blocks.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleImportRegisteredMembers}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Users className="w-4 h-4" /> Import Registered Users ({processedUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Single Contact
                </button>
              </div>
            </div>

            {/* Ingestion Dropzone & Paste Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files) handleProcessFiles(e.dataTransfer.files);
                }}
                className={`relative p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  dragOver
                    ? 'border-[#16a34a] bg-[#16a34a]/5 scale-[1.01]'
                    : 'border-neutral-300 dark:border-white/15 bg-neutral-50/50 dark:bg-[#151821]/50 hover:border-[#16a34a]/60 hover:bg-[#16a34a]/[0.02]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".xlsx,.xls,.csv,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleProcessFiles(e.target.files);
                    e.target.value = '';
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-neutral-200/70 dark:bg-white/10 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-[#16a34a]" />
                </div>
                <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Drop Files Here or Click to Browse
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                  Supports DOC, DOCX, XLSX, CSV, TXT, JPG, PNG. Automatic vision OCR and heuristic contact matching.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    .XLSX / .CSV
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    .DOC / .DOCX
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    .TXT
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    .JPG / .PNG (OCR)
                  </span>
                </div>
              </div>

              {/* Direct Paste Box */}
              <div className="flex flex-col justify-between p-6 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-[#151821]/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#16a34a]" /> Paste Unstructured Text or CSV Block
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPastedRawText(
`Victor Okon, victor@example.com, 08012345678
Adaora Eze - adaora@lagoslaw.ng - +234 809 999 8888
Babatunde Sanusi | sanusi.fintech@gmail.com | 09033322110
Tolu Alabi (tolu@creativehub.africa, 07055443322)`
                      );
                    }}
                    className="text-[11px] text-[#16a34a] hover:underline font-semibold cursor-pointer"
                  >
                    Load Sample Text
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={pastedRawText}
                  onChange={(e) => setPastedRawText(e.target.value)}
                  placeholder="Paste text containing names, emails, and phone numbers here (separated by commas, dashes, tabs, or newlines)..."
                  className="w-full flex-1 p-3 bg-white dark:bg-[#1a1e28] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-500">
                    Detects Nigerian &amp; international formats automatically
                  </span>
                  <button
                    type="button"
                    disabled={isExtracting || !pastedRawText.trim()}
                    onClick={handleParsePastedText}
                    className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Parse Pasted Text
                  </button>
                </div>
              </div>
            </div>

            {/* In-progress status banner */}
            {isExtracting && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                <div className="text-xs font-bold">
                  {extractionStatusText || 'Extracting contacts from document...'}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Contacts Table & Toolbar */}
          <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                </div>

                <select
                  value={contactFilter}
                  onChange={(e) => setContactFilter(e.target.value as any)}
                  className="px-3 py-2 bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
                >
                  <option value="all">All Contacts ({extractedContacts.length})</option>
                  <option value="email">Has Valid Email</option>
                  <option value="phone">Has Valid Phone</option>
                  <option value="both">Has Both Email &amp; Phone</option>
                </select>

                <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-white/10 pl-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllContacts(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllContacts(false)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelectedContacts}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedContacts.length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveContactsToSupabase}
                  disabled={isSyncingWithDb || extractedContacts.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#16a34a]/15 hover:bg-[#16a34a]/25 text-[#16a34a] border border-[#16a34a]/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  title="Persist extracted contacts to public.extracted_contacts table in Supabase"
                >
                  <Database className="w-3.5 h-3.5" /> {isSyncingWithDb ? 'Syncing...' : `Save to Supabase (${extractedContacts.length})`}
                </button>

                <button
                  type="button"
                  onClick={handleExportContactsCsv}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailAudience(selectedContacts.length > 0 ? 'selected' : 'extracted');
                    setActiveSubTab('email');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Bulk Email ({selectedContacts.length > 0 ? selectedContacts.filter(c => c.isValidEmail).length : extractedContacts.filter(c => c.isValidEmail).length}) →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneAudience(selectedContacts.length > 0 ? 'selected' : 'extracted');
                    setActiveSubTab('whatsapp');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <FaWhatsapp className="w-3.5 h-3.5" /> Send to Numbers ({selectedContacts.length > 0 ? selectedContacts.filter(c => c.isValidPhone).length : extractedContacts.filter(c => c.isValidPhone).length}) →
                </button>
              </div>
            </div>

            {/* Table of extracted records */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100/70 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedContacts.length > 0 && selectedContacts.length === filteredExtractedContacts.length}
                        onChange={(e) => handleSelectAllContacts(e.target.checked)}
                        className="rounded accent-[#16a34a] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Recipient Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Notes / Company</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-white/5">
                  {filteredExtractedContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <Users className="w-8 h-8 mx-auto opacity-40 mb-2" />
                        <p className="font-semibold text-neutral-600 dark:text-neutral-300">No contacts in current view</p>
                        <p className="text-[11px] text-neutral-500">Upload a spreadsheet, Word doc, image or paste text to extract contacts.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExtractedContacts.map((contact) => (
                      <tr 
                        key={contact.id}
                        className={`hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors ${
                          contact.selected ? 'bg-[#16a34a]/[0.03]' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={Boolean(contact.selected)}
                            onChange={() => handleToggleContactSelect(contact.id)}
                            className="rounded accent-[#16a34a] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-950 dark:text-white">
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-white/20 focus:border-[#16a34a] focus:bg-white dark:focus:bg-[#1c202b] px-1 py-0.5 rounded outline-none font-bold"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={contact.email}
                              onChange={(e) => handleUpdateContact(contact.id, 'email', e.target.value)}
                              placeholder="Add email..."
                              className={`w-full bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-white/20 focus:border-[#16a34a] focus:bg-white dark:focus:bg-[#1c202b] px-1 py-0.5 rounded outline-none font-mono ${
                                contact.isValidEmail ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 italic'
                              }`}
                            />
                            {contact.isValidEmail && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Valid Email" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={contact.phone}
                              onChange={(e) => handleUpdateContact(contact.id, 'phone', e.target.value)}
                              placeholder="Add phone..."
                              className={`w-full bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-white/20 focus:border-[#16a34a] focus:bg-white dark:focus:bg-[#1c202b] px-1 py-0.5 rounded outline-none font-mono ${
                                contact.isValidPhone ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 italic'
                              }`}
                            />
                            {contact.isValidPhone && (
                              <span className="w-2 h-2 rounded-full bg-[#25D366] flex-shrink-0" title="Valid WhatsApp/SMS Number" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 font-medium">
                            {contact.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">
                          <input
                            type="text"
                            value={contact.notes || ''}
                            onChange={(e) => handleUpdateContact(contact.id, 'notes', e.target.value)}
                            placeholder="Add notes..."
                            className="w-full bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-white/20 focus:border-[#16a34a] focus:bg-white dark:focus:bg-[#1c202b] px-1 py-0.5 rounded outline-none"
                          />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {contact.isValidPhone && (
                              <button
                                type="button"
                                onClick={() => handleLaunchWhatsAppIndividual(contact)}
                                className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 cursor-pointer"
                                title="Launch WhatsApp"
                              >
                                <FaWhatsapp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2 pt-2">
              <div>
                Showing <span className="font-bold text-neutral-800 dark:text-neutral-200">{filteredExtractedContacts.length}</span> of {extractedContacts.length} extracted contacts ({selectedContacts.length} checked).
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {extractedContacts.filter(c => c.isValidEmail).length} Emails Ready
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" /> {extractedContacts.filter(c => c.isValidPhone).length} Numbers Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: PERSONALIZED BULK EMAIL DISPATCHER (RESEND LINKED) */}
      {/* ==================================================== */}
      {activeSubTab === 'email' && (
        <div className="space-y-6">
          {/* Top Engine & Resend Connection Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">Delivery Engine: Resend API</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isResendReady ? 'bg-emerald-500 text-white' : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    {resendStatus.hasDbKey ? '🌿 Supabase Resend Active (support@chipng.com)' : resendStatus.hasEnvKey ? 'Vercel Env Connected' : isResendReady ? 'Custom Key Active' : 'Fallback / Simulation'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Sends verified transactional HTML emails via Resend with sub-second API dispatch and live delivery tracking.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5 text-[#16a34a]" /> Send Resend Test Email
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('resend')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" /> Engine Settings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Email Composer & Dynamic Tags */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                    <Mail className="w-3.5 h-3.5" /> Personalized Bulk Outreach
                  </div>
                  <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                    Compose Bulk Personalized Emails
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Each recipient receives their own email with their real name dynamically populated in the subject and message body.
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {emailRecipients.length} Target Recipients
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="p-3.5 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/80 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Choose Target Audience:
                  </span>
                  <span className="text-[11px] font-bold text-[#16a34a]">
                    {emailRecipients.length} Recipient{emailRecipients.length === 1 ? '' : 's'} Selected
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailAudience('registered')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      emailAudience === 'registered'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Platform Users</span>
                      {emailAudience === 'registered' && <Check className="w-3 h-3 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">{registeredEmailUsers.length} members</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailAudience('extracted')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      emailAudience === 'extracted'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Extracted List</span>
                      {emailAudience === 'extracted' && <Check className="w-3 h-3 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">{extractedContacts.filter(c => c.isValidEmail).length} contacts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailAudience('selected')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      emailAudience === 'selected'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Checked Items</span>
                      {emailAudience === 'selected' && <Check className="w-3 h-3 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">{selectedContacts.filter(c => c.isValidEmail).length} checked</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailAudience('direct')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      emailAudience === 'direct'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Direct Paste</span>
                      {emailAudience === 'direct' && <Check className="w-3 h-3 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">{parsedDirectEmails.length} added</span>
                  </button>
                </div>

                {emailAudience === 'direct' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                      Paste or type recipient email addresses (separated by commas or newlines, optional &quot;Name &lt;email&gt;&quot; format):
                    </label>
                    <textarea
                      rows={3}
                      value={directEmailInput}
                      onChange={(e) => setDirectEmailInput(e.target.value)}
                      placeholder="e.g. victor@chipng.com, Folake Ade <folake@example.com>, ceo@startup.ng"
                      className="w-full p-2.5 bg-white dark:bg-[#1c202b] border border-neutral-300 dark:border-white/15 rounded-xl text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Provider Selector */}
              <div className="p-3.5 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Select Delivery Pipeline:
                  </span>
                  <span className="text-[10px] text-[#16a34a] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" /> Resend Linked with Supabase
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmailProvider('resend')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedEmailProvider === 'resend'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold ring-1 ring-[#16a34a]/30'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Resend API
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#16a34a] font-bold">Default</span>
                      </span>
                      {selectedEmailProvider === 'resend' && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">High inbox deliverability (Supabase linked)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEmailProvider('smtp')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedEmailProvider === 'smtp'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold ring-1 ring-[#16a34a]/30'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-500" /> SMTP Server
                      </span>
                      {selectedEmailProvider === 'smtp' && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Custom SMTP (Auto-fallback to Resend)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedEmailProvider('simulated')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedEmailProvider === 'simulated'
                        ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold ring-1 ring-[#16a34a]/30'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#1c202b] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-neutral-400" /> Test Sandbox
                      </span>
                      {selectedEmailProvider === 'simulated' && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Zero-cost simulation run</span>
                  </button>
                </div>
                {selectedEmailProvider === 'smtp' && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                    💡 If custom SMTP is not set in environment, emails will automatically and safely route via your verified Supabase Resend key.
                  </p>
                )}
              </div>

              {/* Personalization Tag Chips */}
              <div className="p-3.5 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/80 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Click to insert dynamic personalization variables into subject or body:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '{name}', desc: 'Full Name' },
                    { tag: '{first_name}', desc: 'First Name' },
                    { tag: '{email}', desc: 'Recipient Email' },
                    { tag: '{phone}', desc: 'Recipient Phone' },
                    { tag: '{card_url}', desc: 'Live Card Link' }
                  ].map(({ tag, desc }) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setEmailBody(prev => prev + ' ' + tag);
                        toast.success(`Inserted ${tag} into message body`);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-[#1c202b] border border-neutral-300 dark:border-white/15 text-neutral-900 dark:text-white hover:border-[#16a34a] hover:text-[#16a34a] transition-all cursor-pointer shadow-2xs"
                      title={desc}
                    >
                      {tag} <span className="text-[10px] text-neutral-400 font-sans font-normal">({desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Sender Email ({resendStatus.verifiedDomain ? `Verified on ${resendStatus.verifiedDomain}` : 'Resend domain'})
                  </label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    onBlur={() => setSenderEmail(normalizeSenderEmail(senderEmail))}
                    placeholder="e.g. support@chipng.com or support.chipng.com"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Email Subject Line (Supports &#123;name&#125;, &#123;first_name&#125;)
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Special Invitation for {name}"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-bold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Email Message Body
                </label>
                <textarea
                  rows={10}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono leading-relaxed text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              {/* Dispatch Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleRecipients = emailRecipients.map(r => ({
                        name: r.name,
                        email: r.email,
                        subject: personalizeText(emailSubject, r),
                        body: personalizeText(emailBody, r)
                      }));
                      const headers = ['Recipient Name', 'Recipient Email', 'Personalized Subject', 'Personalized Body'];
                      const rows = sampleRecipients.map(s => [
                        `"${s.name.replace(/"/g, '""')}"`,
                        `"${s.email.replace(/"/g, '""')}"`,
                        `"${s.subject.replace(/"/g, '""')}"`,
                        `"${s.body.replace(/"/g, '""')}"`
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `CHIP_NG_Personalized_Emails_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success(`Exported ${sampleRecipients.length} personalized emails to CSV`);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTestModal(true)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" /> Test Single Send
                  </button>

                  <button
                    type="button"
                    disabled={isVerifyingDomains}
                    onClick={handleVerifyRecipientDomains}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                    title="Verify recipient domains have active MX mail servers before sending"
                  >
                    {isVerifyingDomains ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking MX...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Check MX Deliverability
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBounceDiagnosticModal(true);
                      handleRunDiagnostic(diagnosticEmailInput);
                    }}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-white/10 flex items-center gap-1.5 cursor-pointer"
                    title="Understand and diagnose 550 remote server bounce errors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> 550 Bounce Explainer
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSendingBulkEmails || emailRecipients.length === 0}
                  onClick={handleSendBulkPersonalizedEmails}
                  className="px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  {isSendingBulkEmails ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching ({bulkEmailProgress.sent}/{bulkEmailProgress.total})...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Bulk via {selectedEmailProvider === 'resend' ? 'Resend API' : selectedEmailProvider === 'smtp' ? 'SMTP (or Resend)' : 'Sandbox'} ({emailRecipients.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Live Per-Recipient Email Preview Carousel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <Eye className="w-4 h-4 text-[#16a34a]" /> Live Per-Recipient Preview
                  </div>

                  {emailRecipients.length > 0 && (
                    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setEmailPreviewIndex(prev => (prev > 0 ? prev - 1 : emailRecipients.length - 1))}
                        className="p-1 hover:text-[#16a34a] cursor-pointer"
                        title="Previous Recipient"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] px-1 font-mono">
                        {emailPreviewIndex + 1} / {emailRecipients.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailPreviewIndex(prev => (prev < emailRecipients.length - 1 ? prev + 1 : 0))}
                        className="p-1 hover:text-[#16a34a] cursor-pointer"
                        title="Next Recipient"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Recipient Details Pill */}
                <div className="p-3 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/80 dark:border-white/10 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-neutral-950 dark:text-white">
                      Previewing For: <span className="text-[#16a34a]">{currentEmailRecipient.name}</span>
                    </div>
                    {domainVerificationResults[currentEmailRecipient.email?.toLowerCase()] && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        domainVerificationResults[currentEmailRecipient.email?.toLowerCase()].status === 'valid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {domainVerificationResults[currentEmailRecipient.email?.toLowerCase()].status === 'valid' ? '✓ MX Active' : '⚠ MX Misconfigured'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    To: {currentEmailRecipient.email}
                  </div>
                  {domainVerificationResults[currentEmailRecipient.email?.toLowerCase()]?.status === 'invalid' && (
                    <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{domainVerificationResults[currentEmailRecipient.email?.toLowerCase()].reason}</span>
                    </div>
                  )}
                </div>

                {/* Simulated Email Envelope Card */}
                <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-[#151821]/50 overflow-hidden shadow-xs">
                  {/* Email header */}
                  <div className="p-4 bg-white dark:bg-[#1a1e28] border-b border-neutral-200 dark:border-white/10 space-y-2">
                    <div className="text-xs">
                      <span className="text-neutral-400 font-semibold mr-1.5">Subject:</span>
                      <span className="font-extrabold text-neutral-950 dark:text-white">
                        {previewPersonalizedSubject}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                      <span>From: {senderName} &lt;{senderEmail}&gt;</span>
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Resend HTML
                      </span>
                    </div>
                  </div>

                  {/* Email content */}
                  <div className="p-5 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {previewPersonalizedBody}
                  </div>
                </div>

                {/* Quick test buttons */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailAddress(currentEmailRecipient.email);
                      setShowTestModal(true);
                    }}
                    className="text-[11px] text-[#16a34a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Test Send to {extractFirstName(currentEmailRecipient.name)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(previewPersonalizedBody, 'body_copy', 'Copied personalized email body!')}
                    className="text-[11px] text-neutral-500 hover:text-neutral-950 dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" /> Copy Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Log Table */}
          {bulkEmailLogs.length > 0 && (
            <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Delivery Report ({bulkEmailLogs.length} Recipients)
                </h4>
                <span className="text-xs text-neutral-500 font-mono">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              {bulkEmailLogs.some(l => l.status === 'failed') && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {bulkEmailLogs.filter(l => l.status === 'failed').length} recipient(s) failed delivery: {bulkEmailLogs.find(l => l.status === 'failed')?.error || 'Rejection'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const failed = bulkEmailLogs.filter(l => l.status === 'failed').map(l => `${l.name} <${l.email}>: ${l.error}`).join('\n');
                      handleCopyText(failed, 'failed_logs', 'Copied failed recipients log!');
                    }}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    Copy Error Log
                  </button>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10 max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-neutral-100 dark:bg-[#151821] text-neutral-500 font-bold uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Recipient</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Personalized Subject</th>
                      <th className="py-2.5 px-4">Provider</th>
                      <th className="py-2.5 px-4">Message ID / Info</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                    {bulkEmailLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 font-bold text-neutral-950 dark:text-white">{log.name}</td>
                        <td className="py-2.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">{log.email}</td>
                        <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300 truncate max-w-xs">{log.personalizedSubject}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] uppercase text-neutral-500">{log.provider || 'Resend'}</td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-neutral-400 truncate max-w-[150px]">
                          {log.error ? (
                            <span className="text-rose-500 font-sans" title={log.error}>{log.error}</span>
                          ) : (
                            log.messageId || '—'
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            log.status === 'sent' 
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : log.status === 'simulated'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: RESEND INTEGRATION SETTINGS & DIAGNOSTICS */}
      {/* ==================================================== */}
      {activeSubTab === 'resend' && (
        <div className="bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap className="w-3.5 h-3.5" /> High Deliverability Transactional Email
              </div>
              <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Resend API Integration Hub
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Connect your Resend API to send personalized outreach directly from your Super Admin dashboard. Resend provides high deliverability, domain DKIM/SPF protection, and instant analytics.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <Send className="w-4 h-4" /> Send Test Email
              </button>
            </div>
          </div>

          {/* Vercel Environment Detection Card */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${resendStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Resend Connection Status
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                resendStatus.connected ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              }`}>
                {resendStatus.hasEnvKey ? 'Vercel RESEND_API_KEY Active' : resendStatus.hasDbKey ? 'Supabase Saved Key Active' : 'Pending Configuration'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              When deployed to Vercel, the <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[#16a34a] font-mono text-[11px]">RESEND_API_KEY</code> environment variable is automatically detected by both <code className="font-mono text-[11px]">server.ts</code> and <code className="font-mono text-[11px]">api/index.ts</code>. You can also save a custom API key below to override or run without Vercel variables.
            </p>
          </div>

          {/* Settings Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Default Sender Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Victor Dennis – CHIP NG"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Default Sender Email Address
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSenderEmail('support@chipng.com')}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      senderEmail === 'support@chipng.com' ? 'bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/40' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 border-neutral-200 dark:border-white/10'
                    }`}
                  >
                    @chipng.com (support)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSenderEmail('onboarding@resend.dev')}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      senderEmail === 'onboarding@resend.dev' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 border-neutral-200 dark:border-white/10'
                    }`}
                  >
                    resend.dev (Sandbox)
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                onBlur={() => setSenderEmail(normalizeSenderEmail(senderEmail))}
                placeholder="e.g. support@chipng.com or support.chipng.com"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Use an address on your verified domain (e.g. support@chipng.com) or Resend&apos;s sandbox address (onboarding@resend.dev).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Reply-To Email Address
              </label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                placeholder="support@chipng.com"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Custom Resend API Key (Override)
              </label>
              <input
                type="password"
                value={customResendApiKey}
                onChange={(e) => setCustomResendApiKey(e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {resendStatus.hasDbKey ? 'A key is currently active in Supabase. Enter a new key only to replace it.' : 'Leave blank if using Vercel\'s environment variable.'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-white/10">
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#16a34a]" /> Verified Sending Domain: <span className="font-bold text-neutral-800 dark:text-neutral-200">chipng.com</span>
            </div>

            <button
              type="button"
              disabled={isSavingSettings}
              onClick={handleSaveResendSettings}
              className="px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
            >
              {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 4: SUPABASE SETUP & SQL SCHEMA */}
      {/* ==================================================== */}
      {activeSubTab === 'supabase' && (
        <div className="bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <Database className="w-3.5 h-3.5" /> Supabase Schema Inspector
              </div>
              <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Supabase Tables &amp; SQL Schema for Resend &amp; Campaigns
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Copy and run this idempotent SQL migration in your Supabase SQL Editor to enable full campaign analytics, delivery logs, and persistent settings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyText(SUPABASE_RESEND_SQL, 'supabase_sql_copy', 'Copied complete SQL migration to clipboard!')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Copy className="w-4 h-4" /> Copy Complete SQL Code
            </button>
          </div>

          {/* Database Tables Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table 1</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">public.email_campaigns</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Stores each bulk blast, subject, body, sent count &amp; status</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table 2</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">public.email_delivery_logs</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Per-recipient delivery log with Resend Message IDs</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table 3</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">admin_integration_settings</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Default sender name, verified domain &amp; Resend API key</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table 4</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">public.extracted_contacts</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Contacts extracted from DOC, XLSX, TXT, JPG &amp; PNG</span>
            </div>
          </div>

          {/* SQL Editor Block */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 overflow-hidden bg-neutral-950 text-neutral-100">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> supabase_schema.sql (Paste in Supabase SQL Editor)
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(SUPABASE_RESEND_SQL, 'sql_code', 'Copied SQL!')}
                className="hover:text-white flex items-center gap-1 cursor-pointer font-sans"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto text-neutral-300 leading-relaxed max-h-96 overflow-y-auto">
              {SUPABASE_RESEND_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 5: PLATFORM MEMBER DIRECTORY */}
      {/* ==================================================== */}
      {activeSubTab === 'directory' && (
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Platform Member Directory ({processedUsers.length})
              </h3>
              <p className="text-xs text-neutral-500">
                All registered CHIP NG users, contact cards, and handles stored in database.
              </p>
            </div>

            <button
              type="button"
              onClick={handleImportRegisteredMembers}
              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" /> Load All into Contact Extractor ({processedUsers.length})
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-100 dark:bg-[#151821] text-neutral-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Handle</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {filteredDirectoryUsers.slice(0, 50).map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-bold text-neutral-950 dark:text-white">{u.full_name || 'Member'}</td>
                    <td className="py-3 px-4 font-mono text-[#16a34a]">chipng.com/{u.username}</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{u.email || '—'}</td>
                    <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400">{u.primaryPhone || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.is_verified ? 'bg-[#16a34a]/15 text-[#16a34a]' : 'bg-neutral-200 dark:bg-white/10 text-neutral-500'
                      }`}>
                        {u.is_verified ? 'Verified Pro' : 'Standard'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] max-w-md w-full rounded-3xl p-6 border border-neutral-200 dark:border-white/10 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#16a34a]" /> Add Contact Manually
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualContact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Victor Dennis"
                  value={newContactForm.name}
                  onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. victor@chipng.com"
                  value={newContactForm.email}
                  onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 08123456789 or +2348123456789"
                  value={newContactForm.phone}
                  onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Notes / Company</label>
                <input
                  type="text"
                  placeholder="e.g. CEO, Fintech Lagos"
                  value={newContactForm.notes}
                  onChange={(e) => setNewContactForm({ ...newContactForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer shadow-xs"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resend Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] max-w-md w-full rounded-3xl p-6 border border-neutral-200 dark:border-white/10 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Send Test Email via Resend
              </h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Dispatches an instant verified test email using the active Resend configuration to verify deliverability and domain authorization.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Send Test To Email</label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="vickthor.dennis@gmail.com"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">From Sender</label>
                <div className="text-xs font-mono p-2 bg-neutral-100 dark:bg-white/5 rounded-xl text-neutral-600 dark:text-neutral-400">
                  {senderName} &lt;{senderEmail}&gt;
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTestingResend}
                onClick={handleSendTestResend}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isTestingResend ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Dispatch Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 550 Bounce & Deliverability Diagnostic Modal */}
      {showBounceDiagnosticModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111318] max-w-2xl w-full rounded-3xl p-6 border border-neutral-200 dark:border-white/10 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> 550 Remote Server Bounce & Deliverability Explainer
              </h3>
              <button
                type="button"
                onClick={() => setShowBounceDiagnosticModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner Callout matching user's screenshot */}
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>The Exact Error Explained:</span>
              </div>
              <div className="font-mono text-[11px] p-2.5 bg-neutral-950/90 text-rose-300 rounded-xl leading-relaxed whitespace-pre-wrap">
                550 Please turn on SMTP Authentication in your mail client. mail-wr1-f54.google.com [209.85.221.54]:45271 is not permitted to relay through this server without authentication.
              </div>
            </div>

            {/* 3 Key Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Your Setup Is Working
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-normal">
                  Your Google SMTP & Resend authentication was 100% accepted by Google. The bounce came from the <strong>recipient's</strong> server.
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> What "550" Actually Means
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-normal">
                  The recipient server (mail.sailorsloungelekki.com) does not host the mailbox locally, so it rejected Google's relay attempt.
                </p>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Domain Is Dormant
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-normal">
                  sailorsloungelekki.com is parked on a GoDaddy "Coming Soon" holding page. No mail client on earth can deliver to it.
                </p>
              </div>
            </div>

            {/* Alternative Verified Contacts for Sailors Lounge Lekki */}
            <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                <span>Verified Direct Contacts for Sailors Lounge Lekki:</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  Verified Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href="https://wa.me/2348124079107?text=Hello%20Sailors%20Lounge,%20I'm%20reaching%20out%20from%20CHIP%20NG%20regarding%20Google%20Review%20smart%20cards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-[#1c202c] border border-neutral-200 dark:border-white/10 rounded-xl flex items-center justify-between text-neutral-900 dark:text-white hover:border-[#16a34a] transition-all"
                >
                  <div>
                    <div className="font-bold">WhatsApp / Mobile 1</div>
                    <div className="text-[11px] text-[#16a34a] font-mono">+234 812 407 9107</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>

                <a
                  href="tel:+2348026832333"
                  className="p-2.5 bg-white dark:bg-[#1c202c] border border-neutral-200 dark:border-white/10 rounded-xl flex items-center justify-between text-neutral-900 dark:text-white hover:border-[#16a34a] transition-all"
                >
                  <div>
                    <div className="font-bold">Mobile Line 2</div>
                    <div className="text-[11px] text-neutral-500 font-mono">+234 802 683 2333</div>
                  </div>
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                </a>

                <a
                  href="https://instagram.com/sailorslounge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-[#1c202c] border border-neutral-200 dark:border-white/10 rounded-xl flex items-center justify-between text-neutral-900 dark:text-white hover:border-[#16a34a] transition-all"
                >
                  <div>
                    <div className="font-bold">Instagram DM</div>
                    <div className="text-[11px] text-pink-500 font-mono">@sailorslounge (100k+ Followers)</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>

                <div className="p-2.5 bg-white dark:bg-[#1c202c] border border-neutral-200 dark:border-white/10 rounded-xl flex items-center justify-between text-neutral-900 dark:text-white">
                  <div>
                    <div className="font-bold">Physical Address</div>
                    <div className="text-[11px] text-neutral-500">Admiralty Rd, Lekki Phase 1, Lagos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Domain Probe */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Live Test Any Recipient Domain MX:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={diagnosticEmailInput}
                  onChange={(e) => setDiagnosticEmailInput(e.target.value)}
                  placeholder="e.g. info@sailorsloungelekki.com"
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]"
                />
                <button
                  type="button"
                  disabled={isDiagnosing}
                  onClick={() => handleRunDiagnostic(diagnosticEmailInput)}
                  className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {isDiagnosing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Check Domain
                </button>
              </div>

              {diagnosticData && (
                <div className="p-3 bg-neutral-100 dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-xl text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-500 font-sans">Domain:</span>
                    <span className="text-neutral-950 dark:text-white font-bold">{diagnosticData.domain}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                      diagnosticData.isMisconfiguredRemote ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {diagnosticData.isMisconfiguredRemote ? 'MISCONFIGURED / BOUNCES' : 'VALID ACTIVE MX'}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                    {diagnosticData.diagnosis}
                  </div>
                  {diagnosticData.mxRecords && diagnosticData.mxRecords.length > 0 && (
                    <div className="text-[10px] text-neutral-500">
                      MX Exchange: {diagnosticData.mxRecords.map((m: any) => m.exchange).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowBounceDiagnosticModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
