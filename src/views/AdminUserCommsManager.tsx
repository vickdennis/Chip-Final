import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  FileSpreadsheet, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Share2,
  ChevronRight,
  ChevronLeft,
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
  Zap,
  Database,
  Terminal,
  Mail,
  X
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from '../components/Toast';
import { supabase } from '../supabaseClient';
import InternationalPhoneInput from '../components/InternationalPhoneInput';
import { 
  ExtractedContact, 
  extractContactsFromFile, 
  extractContactsFromText, 
  normalizePhoneNumber,
  personalizeText,
  isValidEmail,
  isValidPhone,
  extractFirstName,
  generateUUID
} from '../utils/contactExtractor';
import { downloadCsvFile, getAdminAuthHeaders } from '../utils/adminApi';
import { formatResendHtmlEmail } from '../utils/resendEmailTemplates';

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

export const SUPABASE_COMMS_SQL = `-- =====================================================
-- SUPER ADMIN CONTACTS & OUTREACH SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =====================================================

-- Extracted Contacts Saved Table (Allows admin to persist extracted contacts from DOC, XLSX, JPG, PNG)
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
  // Navigation tabs: Extractor, Bulk Email, WhatsApp/SMS, Directory, Supabase Schema
  const [activeSubTab, setActiveSubTab] = useState<'extractor' | 'email' | 'whatsapp' | 'directory' | 'supabase'>('extractor');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // ----------------------------------------------------
  // 1. SMART CONTACT EXTRACTOR STATE
  // ----------------------------------------------------
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chip_extracted_contacts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {}
    return [];
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatusText, setExtractionStatusText] = useState('');
  const [pastedRawText, setPastedRawText] = useState('');
  const [isSyncingWithDb, setIsSyncingWithDb] = useState(false);
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
  // 2. WHATSAPP & SMS OUTREACH STATE
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
  // 2B. BULK EMAIL OUTREACH STATE
  // ----------------------------------------------------
  const [emailAudience, setEmailAudience] = useState<'selected' | 'extracted' | 'registered' | 'all'>('extracted');
  const [emailCampaignTitle, setEmailCampaignTitle] = useState(`CHIPNG Outreach – ${new Date().toLocaleDateString('en-GB')}`);
  const [emailSenderName, setEmailSenderName] = useState('CHIP NG');
  const [emailSenderEmail, setEmailSenderEmail] = useState('support@chipng.com');
  const [emailReplyTo, setEmailReplyTo] = useState('support@chipng.com');
  const [emailSubject, setEmailSubject] = useState('Upgrade Your First Impression with CHIPNG Smart NFC Cards, {first_name}');
  const [emailBody, setEmailBody] = useState(
    'Hello {first_name},\n\nThank you for connecting with CHIPNG — Nigeria\'s premier contactless smart business card and dynamic link-in-bio platform.\n\nWith a single tap of a custom CHIPNG NFC card against any iPhone or Android smartphone, clients can instantly save your contact details, explore your website, and connect with your brand — with zero app required.\n\nExplore our PVC and precision-engraved Metal NFC cards or view your live digital experience below.\n\nBest regards,\nThe CHIPNG Team'
  );
  const [emailPreviewIndex, setEmailPreviewIndex] = useState(0);
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingBulkEmail, setIsSendingBulkEmail] = useState(false);
  const [bulkEmailProgress, setBulkEmailProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    sent: number;
    failed: number;
  } | null>(null);
  const [bulkEmailSummary, setBulkEmailSummary] = useState<{
    sentCount: number;
    failedCount: number;
    total: number;
    provider: string;
    message: string;
    notice?: string | null;
  } | null>(null);
  const [bulkEmailLogs, setBulkEmailLogs] = useState<Array<{
    email: string;
    name: string;
    status: 'sent' | 'simulated' | 'failed';
    provider: string;
    messageId?: string;
    personalizedSubject: string;
    error?: string;
    timestamp: string;
  }>>([]);

  // ----------------------------------------------------
  // 3. REGISTERED MEMBERS DIRECTORY STATE
  // ----------------------------------------------------
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'has_email' | 'has_phone' | 'has_both' | 'missing'>('all');

  // Load persisted contacts from public.extracted_contacts table in Supabase on mount
  useEffect(() => {
    const loadSupabaseContacts = async () => {
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
            const seen = new Set(prev.map(c => (c.email || c.normalizedPhone || c.name).toLowerCase()));
            const localOnly = prev.filter(c => !seen.has((c.email || c.normalizedPhone || c.name).toLowerCase()));
            return [...loaded, ...localOnly];
          });
        }
      } catch (err) {
        console.warn('Supabase extracted_contacts note:', err);
      }
    };

    loadSupabaseContacts();
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

  const currentPhoneRecipient: ExtractedContact = phoneRecipients[smsPreviewIndex] || phoneRecipients[0] || fallbackContact;

  const previewPersonalizedSms = useMemo(() => {
    return personalizeText(smsMessage, currentPhoneRecipient);
  }, [smsMessage, currentPhoneRecipient]);

  // Registered members with valid email addresses
  const registeredEmailUsers = useMemo(() => {
    return processedUsers
      .filter(u => u.hasEmail && isValidEmail(u.email))
      .map(u => ({
        id: `reg_email_${u.id}`,
        name: u.full_name || u.username || 'Member',
        email: u.email.trim().toLowerCase(),
        phone: u.primaryPhone || '',
        normalizedPhone: u.normalizedWa || '',
        username: u.username || '',
        card_url: u.username ? `https://www.chipng.com/@${u.username}` : 'https://www.chipng.com/buy-card',
        source: 'Registered Member',
        isValidEmail: true,
        isValidPhone: u.hasPhone,
        selected: true
      }));
  }, [processedUsers]);

  // Deduplicated bulk email pool before temporary exclusions
  const rawEmailRecipients = useMemo(() => {
    const mapExtracted = (list: ExtractedContact[]) =>
      list
        .filter(c => c.isValidEmail && isValidEmail(c.email))
        .map(c => ({
          ...c,
          email: c.email.trim().toLowerCase(),
          username: '',
          card_url: 'https://www.chipng.com/buy-card'
        }));

    let pool: Array<ExtractedContact & { username?: string; card_url?: string }> = [];
    if (emailAudience === 'selected') {
      pool = mapExtracted(selectedContacts);
    } else if (emailAudience === 'extracted') {
      pool = mapExtracted(extractedContacts);
    } else if (emailAudience === 'registered') {
      pool = registeredEmailUsers;
    } else {
      pool = [...mapExtracted(extractedContacts), ...registeredEmailUsers];
    }

    const seen = new Set<string>();
    return pool.filter(item => {
      const em = item.email.trim().toLowerCase();
      if (!em || seen.has(em)) return false;
      seen.add(em);
      return true;
    });
  }, [emailAudience, selectedContacts, extractedContacts, registeredEmailUsers]);

  const emailRecipients = useMemo(() => {
    return rawEmailRecipients.filter(r => !excludedEmails.has(r.email.toLowerCase()));
  }, [rawEmailRecipients, excludedEmails]);

  const currentEmailRecipient = useMemo(() => {
    if (emailRecipients.length === 0) {
      return { ...fallbackContact, username: '', card_url: 'https://www.chipng.com/buy-card' };
    }
    const safeIdx = Math.min(emailPreviewIndex, emailRecipients.length - 1);
    return emailRecipients[safeIdx] || emailRecipients[0];
  }, [emailRecipients, emailPreviewIndex]);

  const previewPersonalizedEmailSubject = useMemo(() => {
    const cardUrl = currentEmailRecipient.card_url || 'https://www.chipng.com/buy-card';
    return personalizeText(emailSubject, currentEmailRecipient).replace(/{card_url}/gi, cardUrl);
  }, [emailSubject, currentEmailRecipient]);

  const previewPersonalizedEmailBody = useMemo(() => {
    const cardUrl = currentEmailRecipient.card_url || 'https://www.chipng.com/buy-card';
    return personalizeText(emailBody, currentEmailRecipient).replace(/{card_url}/gi, cardUrl);
  }, [emailBody, currentEmailRecipient]);

  const previewEmailHtml = useMemo(() => {
    const cardUrl = currentEmailRecipient.card_url || 'https://www.chipng.com/buy-card';
    return formatResendHtmlEmail(previewPersonalizedEmailBody, cardUrl, '#16a34a', '/chipng_exact_tile.png');
  }, [previewPersonalizedEmailBody, currentEmailRecipient]);

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

    const headers = ['Full Name', 'First Name', 'Email Address', 'Phone Number', 'Normalized Phone (E.164)', 'Source', 'Notes'];
    const rows = list.map(c => [
      c.name,
      extractFirstName(c.name),
      c.email,
      c.phone,
      c.normalizedPhone,
      c.source,
      c.notes || ''
    ]);

    downloadCsvFile(`CHIP_NG_Extracted_Contacts_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${list.length} contacts to CSV`);
  };

  // ----------------------------------------------------
  // SEND PERSONALIZED NUMBERS (SMS / WHATSAPP)
  // ----------------------------------------------------
  const handleSendBulkPersonalizedSms = async () => {
    if (phoneRecipients.length === 0) {
      toast.error('No recipients with valid phone numbers found');
      return;
    }

    setIsSendingBulkSms(true);
    setBulkSmsLogs([]);

    try {
      const authHeaders = await getAdminAuthHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      const res = await fetch('/api/admin/send-bulk-sms', {
        method: 'POST',
        headers: authHeaders,
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
        throw new Error(json.error || `Server rejected request (${res.status})`);
      }

      setBulkSmsLogs(json.logs || []);
      toast.success(`Prepared ${json.queuedCount} personalized messages with 1-click WhatsApp links!`);
    } catch (err: any) {
      toast.error('Failed to process numbers: ' + err.message);
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

  // ----------------------------------------------------
  // BULK EMAIL DISPATCHERS
  // ----------------------------------------------------
  const applyEmailPreset = (preset: 'intro' | 'metal_offer' | 'platform_update') => {
    if (preset === 'intro') {
      setEmailCampaignTitle(`CHIPNG Executive Intro – ${new Date().toLocaleDateString('en-GB')}`);
      setEmailSubject('Upgrade Your First Impression with CHIPNG Smart NFC Cards, {first_name}');
      setEmailBody(
        'Hello {first_name},\n\nThank you for connecting with CHIPNG — Nigeria\'s premier contactless smart business card and dynamic link-in-bio platform.\n\nWith a single tap of a custom CHIPNG NFC card against any iPhone or Android smartphone, clients can instantly save your contact details, explore your website, and connect with your brand — with zero app required.\n\nExplore our PVC and precision-engraved Metal NFC cards or view your live digital experience below.\n\nBest regards,\nThe CHIPNG Team'
      );
      toast.success('Loaded Executive NFC Intro template');
    } else if (preset === 'metal_offer') {
      setEmailCampaignTitle(`CHIPNG Custom Metal Offer – ${new Date().toLocaleDateString('en-GB')}`);
      setEmailSubject('{first_name}, Your Custom Laser-Engraved Metal NFC Card Awaits');
      setEmailBody(
        'Hi {first_name},\n\nReady to leave paper business cards behind? Our signature CNC-engraved Metal NFC Smart Cards come with fast 24–48 hour delivery across Lagos and nationwide DHL/GIG shipping.\n\nEvery card includes a lifetime digital business profile you can update anytime from your phone — no reprinting ever again.\n\nTap below to order your custom card or preview the experience.\n\nWarm regards,\nCHIPNG Concierge Team'
      );
      toast.success('Loaded Custom Metal Card Offer template');
    } else {
      setEmailCampaignTitle(`CHIPNG Platform Update – ${new Date().toLocaleDateString('en-GB')}`);
      setEmailSubject('Important Update for Your CHIPNG Digital Profile, {first_name}');
      setEmailBody(
        'Hello {first_name},\n\nWe have rolled out fresh upgrades to the CHIPNG platform to make sharing your digital business profile faster and more impactful.\n\nLog in to customize your cover banner, social links, direct WhatsApp button, and instant contact download.\n\nIf you need any assistance with your card or profile, simply reply to this email and our support team will help right away.\n\nBest regards,\nCHIPNG Support Team'
      );
      toast.success('Loaded Platform Update template');
    }
  };

  const handleSendBulkEmails = async (
    overrideRecipients?: Array<{ name: string; email: string; phone?: string; username?: string; card_url?: string }>
  ) => {
    const targets = overrideRecipients && overrideRecipients.length > 0
      ? overrideRecipients
      : emailRecipients.map(r => ({
          name: r.name,
          email: r.email,
          phone: r.phone || '',
          username: r.username || '',
          card_url: r.card_url || 'https://www.chipng.com/buy-card'
        }));

    if (targets.length === 0) {
      toast.error('No valid recipient email addresses queued. Extract contacts or select another pool.');
      return;
    }
    if (!emailSubject.trim()) {
      toast.error('Please enter an email subject line.');
      return;
    }
    if (!emailBody.trim()) {
      toast.error('Please enter an email message body.');
      return;
    }

    setIsSendingBulkEmail(true);
    setBulkEmailSummary(null);

    const CHUNK_SIZE = 500;
    const totalBatches = Math.ceil(targets.length / CHUNK_SIZE);
    let totalSent = 0;
    let totalFailed = 0;
    let lastProvider = 'resend';
    let lastNotice: string | null = null;
    let lastMessage = '';
    const combinedLogs: typeof bulkEmailLogs = [];

    try {
      const authHeaders = await getAdminAuthHeaders();

      for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const chunk = targets.slice(batchIdx * CHUNK_SIZE, (batchIdx + 1) * CHUNK_SIZE);
        setBulkEmailProgress({
          currentBatch: batchIdx + 1,
          totalBatches,
          sent: totalSent,
          failed: totalFailed
        });

        const res = await fetch('/api/admin/send-bulk-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            recipients: chunk,
            subjectTemplate: emailSubject.trim(),
            bodyTemplate: emailBody,
            senderName: emailSenderName.trim() || 'CHIP NG',
            senderEmail: emailSenderEmail.trim() || 'support@chipng.com',
            replyTo: emailReplyTo.trim() || 'support@chipng.com',
            provider: 'auto',
            campaignTitle:
              overrideRecipients && overrideRecipients.length === 1
                ? `[Test] ${emailCampaignTitle.trim() || 'CHIPNG Outreach'}`
                : emailCampaignTitle.trim() || `CHIPNG Outreach – ${new Date().toLocaleDateString('en-GB')}`
          })
        });

        const data = await res.json().catch(() => ({}));

        if (Array.isArray(data.logs)) {
          combinedLogs.push(...data.logs);
        }
        totalSent += Number(data.sentCount || 0);
        totalFailed += Number(data.failedCount || (res.ok ? 0 : chunk.length));
        if (data.provider) lastProvider = String(data.provider);
        if (data.notice) lastNotice = String(data.notice);
        if (data.message) lastMessage = String(data.message);

        if (!res.ok && !data.sentCount) {
          throw new Error(data.message || data.error || `Bulk email request failed (${res.status})`);
        }
      }

      setBulkEmailLogs(combinedLogs);
      setBulkEmailSummary({
        sentCount: totalSent,
        failedCount: totalFailed,
        total: targets.length,
        provider: lastProvider,
        message:
          lastMessage ||
          `Dispatched ${totalSent} of ${targets.length} emails via ${lastProvider.toUpperCase()}`,
        notice: lastNotice
      });

      if (totalSent > 0 && totalFailed === 0) {
        toast.success(
          overrideRecipients && overrideRecipients.length === 1
            ? `Test email sent to ${targets[0].email} via ${lastProvider.toUpperCase()}`
            : `Successfully dispatched ${totalSent} bulk emails via ${lastProvider.toUpperCase()}`
        );
      } else if (totalSent > 0) {
        toast.info(`Dispatched ${totalSent} emails (${totalFailed} failed). Review the delivery log below.`);
      } else {
        toast.error(lastMessage || 'Bulk email dispatch failed.');
      }
    } catch (err: any) {
      setBulkEmailLogs(combinedLogs);
      toast.error(err?.message || 'Failed to send bulk emails.');
    } finally {
      setIsSendingBulkEmail(false);
      setBulkEmailProgress(null);
    }
  };

  const handleSendTestEmail = () => {
    const clean = testEmailAddress.trim().toLowerCase();
    if (!isValidEmail(clean)) {
      toast.error('Enter a valid email address for the test send.');
      return;
    }
    handleSendBulkEmails([
      {
        name: currentEmailRecipient.name || 'CHIPNG Admin',
        email: clean,
        phone: currentEmailRecipient.phone || '',
        card_url: currentEmailRecipient.card_url || 'https://www.chipng.com/buy-card'
      }
    ]);
  };

  const handleExportBulkEmailLogsCsv = () => {
    if (bulkEmailLogs.length === 0) {
      toast.error('No delivery logs to export yet.');
      return;
    }
    const headers = ['Recipient Name', 'Recipient Email', 'Status', 'Provider', 'Subject', 'Message ID', 'Error', 'Timestamp'];
    const rows = bulkEmailLogs.map(l => [
      l.name || '',
      l.email || '',
      l.status || '',
      l.provider || '',
      l.personalizedSubject || '',
      l.messageId || '',
      l.error || '',
      l.timestamp || ''
    ]);
    downloadCsvFile(`chipng-bulk-email-logs-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    toast.success(`Exported ${bulkEmailLogs.length} email delivery logs`);
  };

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

        {/* Valid Emails Ready for Bulk Send */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bulk Email Ready</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {extractedContacts.filter(c => c.isValidEmail).length}
            </span>
            <button
              type="button"
              onClick={() => {
                setEmailAudience(selectedContacts.filter(c => c.isValidEmail).length > 0 ? 'selected' : extractedContacts.filter(c => c.isValidEmail).length > 0 ? 'extracted' : 'registered');
                setActiveSubTab('email');
              }}
              className="text-[11px] text-[#16a34a] hover:underline font-bold mt-0.5 block cursor-pointer"
            >
              Launch Bulk Email ({emailRecipients.length}) →
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Valid Phone Numbers Ready */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">WhatsApp &amp; SMS Ready</span>
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

        {/* Registered Platform Profiles & Storage */}
        <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Platform Members</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 block">
              {processedUsers.length}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="text-[11px] text-blue-500 hover:underline font-bold cursor-pointer"
              >
                Directory →
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <button
                type="button"
                onClick={() => setActiveSubTab('supabase')}
                className="text-[11px] text-[#16a34a] hover:underline font-bold cursor-pointer"
              >
                SQL
              </button>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Modern Sub-Tab Navigation */}
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
            <span>Bulk Email Outreach</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/15 text-emerald-500 font-extrabold">
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
            <span>WhatsApp &amp; SMS Outreach</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-[#25D366]/10 text-[#25D366] font-extrabold">
              {phoneRecipients.length}
            </span>
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
                <h3 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                  Universal Contact Ingestion &amp; Extractor
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Upload spreadsheets, business card photos, raw Word documents, or paste unformatted text. Our system parses phone numbers (normalized with international country codes and E.164 standards), email addresses, and full names automatically.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-900 dark:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4 text-[#16a34a]" /> Add Manually
                </button>

                <button
                  type="button"
                  onClick={handleImportRegisteredMembers}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Users className="w-4 h-4" /> Load Platform Members ({processedUsers.length})
                </button>
              </div>
            </div>

            {/* Ingestion Dropzone and Paste Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              {/* File Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handleProcessFiles(e.dataTransfer.files);
                }}
                className="group border-2 border-dashed border-neutral-300 dark:border-white/15 hover:border-[#16a34a] dark:hover:border-[#16a34a] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-neutral-50/50 dark:bg-white/[0.01] hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    if (e.target.files) handleProcessFiles(e.target.files);
                  }}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-[#16a34a]/10 group-hover:bg-[#16a34a]/20 text-[#16a34a] flex items-center justify-center mb-3 transition-all group-hover:scale-105">
                  <Upload className="w-7 h-7" />
                </div>

                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Drop Documents, Spreadsheets, or Images
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                  Supports Excel (.xlsx, .csv), Word (.docx, .doc), Text (.txt), and Business Card Photos (.jpg, .png)
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                    Excel / CSV
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                    Word (.docx)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-200 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                    Card Photos (.jpg/.png)
                  </span>
                </div>
              </div>

              {/* Paste Raw Text Box */}
              <div className="border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 bg-neutral-50/30 dark:bg-[#151821] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#16a34a]" /> Paste Unstructured Text or Lists
                    </label>
                    <span className="text-[10px] text-neutral-400 font-medium">Automatic Regex Parser</span>
                  </div>
                  <textarea
                    rows={4}
                    value={pastedRawText}
                    onChange={(e) => setPastedRawText(e.target.value)}
                    placeholder="Paste emails, phone numbers, or lead lists here...&#10;e.g. Victor Dennis 08123456789 victor@chipng.com&#10;Tola Johnson +234 803 123 4567"
                    className="w-full p-3 bg-white dark:bg-[#111318] border border-neutral-200 dark:border-white/10 rounded-2xl text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[11px] text-neutral-500">
                    Worldwide phone normalization (all country codes)
                  </span>
                  <button
                    type="button"
                    disabled={isExtracting || !pastedRawText.trim()}
                    onClick={handleParsePastedText}
                    className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Parse Text
                  </button>
                </div>
              </div>
            </div>

            {/* Ingestion Loading Indicator */}
            {isExtracting && (
              <div className="mt-4 p-4 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-5 h-5 text-[#16a34a] animate-spin" />
                <span className="text-xs font-bold text-[#16a34a]">{extractionStatusText}</span>
              </div>
            )}
          </div>

          {/* Extracted Contacts Table & Management Toolbar */}
          <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Filter extracted..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl outline-none focus:border-[#16a34a]"
                  />
                </div>

                {/* Filter Selector */}
                <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#151821] rounded-xl border border-neutral-200/80 dark:border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setContactFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${contactFilter === 'all' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'}`}
                  >
                    All ({extractedContacts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('phone')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${contactFilter === 'phone' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'}`}
                  >
                    Phone ({extractedContacts.filter(c => c.isValidPhone).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactFilter('email')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${contactFilter === 'email' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'}`}
                  >
                    Email ({extractedContacts.filter(c => c.isValidEmail).length})
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelectedContacts}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedContacts.length})
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSyncingWithDb || extractedContacts.length === 0}
                  onClick={handleSaveContactsToSupabase}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  title="Persist extracted contacts into Supabase extracted_contacts table"
                >
                  {isSyncingWithDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-blue-500" />}
                  <span>Save to Supabase</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportContactsCsv}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const hasSelectedEmails = selectedContacts.filter(c => c.isValidEmail).length > 0;
                    setEmailAudience(hasSelectedEmails ? 'selected' : 'extracted');
                    setExcludedEmails(new Set());
                    setEmailPreviewIndex(0);
                    setActiveSubTab('email');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#16a34a]" /> Send Bulk Email ({selectedContacts.filter(c => c.isValidEmail).length > 0 ? selectedContacts.filter(c => c.isValidEmail).length : extractedContacts.filter(c => c.isValidEmail).length}) →
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
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Email Address</th>
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
                            {contact.isValidEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  setExtractedContacts(prev => prev.map(c => ({ ...c, selected: c.id === contact.id })));
                                  setEmailAudience('selected');
                                  setExcludedEmails(new Set());
                                  setEmailPreviewIndex(0);
                                  setActiveSubTab('email');
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                                title="Send Email to Contact"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            )}
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
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" /> {extractedContacts.filter(c => c.isValidPhone).length} Numbers Ready
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {extractedContacts.filter(c => c.isValidEmail).length} Emails Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 1B: BULK EMAIL OUTREACH STUDIO */}
      {/* ==================================================== */}
      {activeSubTab === 'email' && (
        <div className="space-y-6">
          {/* Top Bulk Email Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0f17] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-neutral-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src="/chipng_exact_tile.png"
                  alt="CHIPNG"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight">CHIPNG Bulk Email Outreach</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {emailRecipients.length} Valid Emails Queued
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Send personalized bulk HTML emails branded with the official CHIPNG logo header via Resend / SMTP with per-recipient delivery logs.
                </p>
              </div>
            </div>

            {excludedEmails.size > 0 && (
              <button
                type="button"
                onClick={() => setExcludedEmails(new Set())}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/10 hover:bg-white/15 text-neutral-200 cursor-pointer transition-colors self-start md:self-center"
              >
                Restore {excludedEmails.size} excluded
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Audience, Sender & Composer */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#16a34a]" /> Campaign &amp; Audience
                  </h4>
                  <span className="text-xs font-bold text-[#16a34a]">
                    {emailRecipients.length} Recipient{emailRecipients.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Email Recipient Pool
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailAudience('selected');
                        setEmailPreviewIndex(0);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        emailAudience === 'selected'
                          ? 'border-[#16a34a] bg-emerald-50/30 dark:bg-emerald-950/25 text-neutral-950 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">Checked Rows</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {selectedContacts.filter(c => c.isValidEmail).length} valid emails
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailAudience('extracted');
                        setEmailPreviewIndex(0);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        emailAudience === 'extracted'
                          ? 'border-[#16a34a] bg-emerald-50/30 dark:bg-emerald-950/25 text-neutral-950 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">All Extracted</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {extractedContacts.filter(c => c.isValidEmail).length} valid emails
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailAudience('registered');
                        setEmailPreviewIndex(0);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        emailAudience === 'registered'
                          ? 'border-[#16a34a] bg-emerald-50/30 dark:bg-emerald-950/25 text-neutral-950 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">Platform Users</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {registeredEmailUsers.length} members
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailAudience('all');
                        setEmailPreviewIndex(0);
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        emailAudience === 'all'
                          ? 'border-[#16a34a] bg-emerald-50/30 dark:bg-emerald-950/25 text-neutral-950 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">All Combined</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        Deduplicated list
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quick Templates */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Quick Outreach Templates
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyEmailPreset('intro')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 cursor-pointer transition-all"
                    >
                      Executive NFC Intro
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEmailPreset('metal_offer')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 cursor-pointer transition-all"
                    >
                      Custom Metal Card Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => applyEmailPreset('platform_update')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 cursor-pointer transition-all"
                    >
                      Platform Update
                    </button>
                  </div>
                </div>

                {/* Campaign & Sender Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={emailCampaignTitle}
                      onChange={(e) => setEmailCampaignTitle(e.target.value)}
                      placeholder="e.g. Lagos Founders NFC Outreach"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={emailSenderName}
                      onChange={(e) => setEmailSenderName(e.target.value)}
                      placeholder="CHIP NG"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      From Email (Verified Domain)
                    </label>
                    <input
                      type="email"
                      value={emailSenderEmail}
                      onChange={(e) => setEmailSenderEmail(e.target.value)}
                      placeholder="support@chipng.com"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Reply-To Email
                    </label>
                    <input
                      type="email"
                      value={emailReplyTo}
                      onChange={(e) => setEmailReplyTo(e.target.value)}
                      placeholder="support@chipng.com"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                    />
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Subject Line (Supports Personalization Tags)
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter compelling email subject..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Email Body Content
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      {emailBody.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={9}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs leading-relaxed text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                  />

                  {/* Personalization Tag Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-neutral-400 font-bold mr-1">Insert tag:</span>
                    {['{first_name}', '{name}', '{email}', '{card_url}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEmailBody(prev => `${prev}${prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' '}${tag}`)}
                        className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Email Row */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="Send a 1-click test email to your inbox first..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#0e1015] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                  <button
                    type="button"
                    disabled={isSendingBulkEmail || !testEmailAddress.trim()}
                    onClick={handleSendTestEmail}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> Send Test
                  </button>
                </div>

                {/* Primary Dispatch Button */}
                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    disabled={isSendingBulkEmail || emailRecipients.length === 0}
                    onClick={() => handleSendBulkEmails()}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSendingBulkEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>
                          {bulkEmailProgress
                            ? `Dispatching Batch ${bulkEmailProgress.currentBatch}/${bulkEmailProgress.totalBatches}...`
                            : 'Sending Bulk Emails...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Bulk Email to {emailRecipients.length} Recipient{emailRecipients.length === 1 ? '' : 's'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={emailRecipients.length === 0}
                    onClick={() =>
                      handleCopyText(
                        emailRecipients.map(r => r.email).join(', '),
                        'copy_bulk_emails',
                        `Copied ${emailRecipients.length} recipient emails`
                      )
                    }
                    className="px-4 py-3.5 rounded-2xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {copiedType === 'copy_bulk_emails' ? <Check className="w-4 h-4 text-[#16a34a]" /> : <Copy className="w-4 h-4" />}
                    <span>Copy Emails</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Branded Email Preview & Queued Recipients */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Branded Email Preview */}
              <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#16a34a]" /> Live Branded Preview
                  </h4>
                  {emailRecipients.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEmailPreviewIndex(prev => (prev > 0 ? prev - 1 : emailRecipients.length - 1))}
                        className="p-1 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 cursor-pointer"
                        title="Previous recipient"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-bold text-neutral-500 tabular-nums">
                        {Math.min(emailPreviewIndex + 1, emailRecipients.length)} / {emailRecipients.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailPreviewIndex(prev => (prev + 1 < emailRecipients.length ? prev + 1 : 0))}
                        className="p-1 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 cursor-pointer"
                        title="Next recipient"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Metadata Strip */}
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/70 dark:border-white/10 text-[11px] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-400 w-14 shrink-0">From:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {emailSenderName || 'CHIP NG'} &lt;{emailSenderEmail || 'support@chipng.com'}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-400 w-14 shrink-0">To:</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate">
                      {currentEmailRecipient.name} &lt;{currentEmailRecipient.email}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-400 w-14 shrink-0">Subject:</span>
                    <span className="font-bold text-neutral-900 dark:text-white truncate">
                      {previewPersonalizedEmailSubject || '(No subject)'}
                    </span>
                  </div>
                </div>

                {/* Sandboxed HTML Preview Frame showing actual CHIPNG brand logo */}
                <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-[#f1f5f9]">
                  <iframe
                    title="CHIPNG Branded Bulk Email Preview"
                    sandbox=""
                    srcDoc={previewEmailHtml}
                    className="w-full h-[460px] border-0 bg-[#f1f5f9]"
                  />
                </div>
              </div>

              {/* Queued Recipients Panel */}
              <div className="bg-white dark:bg-[#111318] p-5 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider">
                    Queued Email Recipients ({emailRecipients.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('extractor')}
                    className="text-[11px] font-bold text-[#16a34a] hover:underline cursor-pointer"
                  >
                    + Extract More
                  </button>
                </div>

                {emailRecipients.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    <Mail className="w-7 h-7 mx-auto mb-2 opacity-35" />
                    <p className="font-bold text-neutral-700 dark:text-neutral-300">No valid emails in this pool</p>
                    <p className="text-[11px] mt-0.5">Upload a file or paste contacts in Contact Extractor, or switch to Platform Users.</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-neutral-200/60 dark:divide-white/5 pr-1">
                    {emailRecipients.slice(0, 100).map((rec, idx) => (
                      <div key={rec.email} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setEmailPreviewIndex(idx)}
                          className="min-w-0 text-left flex-1 hover:text-[#16a34a] transition-colors cursor-pointer"
                        >
                          <p className="font-bold text-neutral-900 dark:text-white truncate">{rec.name || 'Recipient'}</p>
                          <p className="text-[11px] font-mono text-neutral-500 truncate">{rec.email}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcludedEmails(prev => new Set([...prev, rec.email.toLowerCase()]))}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                          title="Exclude from this send"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {emailRecipients.length > 100 && (
                      <p className="pt-2.5 text-[11px] text-center text-neutral-500 font-semibold">
                        + {emailRecipients.length - 100} more queued recipients
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Email Dispatch Summary & Per-Recipient Delivery Logs */}
          {(bulkEmailSummary || bulkEmailLogs.length > 0) && (
            <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> Bulk Email Delivery Report
                  </h4>
                  {bulkEmailSummary && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {bulkEmailSummary.message}
                      {bulkEmailSummary.notice ? ` — ${bulkEmailSummary.notice}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {bulkEmailSummary && (
                    <>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Sent: {bulkEmailSummary.sentCount}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Failed: {bulkEmailSummary.failedCount}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 uppercase">
                        {bulkEmailSummary.provider}
                      </span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleExportBulkEmailLogsCsv}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Logs
                  </button>
                </div>
              </div>

              {bulkEmailLogs.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100/70 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-4">Recipient</th>
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Engine</th>
                        <th className="py-2.5 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-white/5">
                      {bulkEmailLogs.map((log, idx) => (
                        <tr key={`${log.email}-${idx}`} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">{log.name || 'Recipient'}</td>
                          <td className="py-2.5 px-4 font-mono text-neutral-600 dark:text-neutral-300">{log.email}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                log.status === 'sent'
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : log.status === 'simulated'
                                    ? 'bg-amber-500/15 text-amber-600'
                                    : 'bg-rose-500/15 text-rose-500'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 uppercase font-bold text-neutral-500">{log.provider}</td>
                          <td className="py-2.5 px-4 text-neutral-500 truncate max-w-xs">
                            {log.error ? (
                              <span className="text-rose-500 font-semibold">{log.error}</span>
                            ) : (
                              <span className="font-mono text-[11px]">{log.messageId || 'Delivered'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: WHATSAPP & SMS OUTREACH */}
      {/* ==================================================== */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Top WhatsApp Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                <FaWhatsapp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">Direct WhatsApp &amp; SMS Outreach</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#25D366]/20 text-[#25D366]">
                    {phoneRecipients.length} Numbers Queued
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Launch 1-click personalized WhatsApp messages and queue SMS dispatches with live name and profile URL variables.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Audience & Message Template Composer */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#16a34a]" /> Outreach Configuration
                  </h4>
                  <span className="text-xs font-bold text-[#25D366]">
                    {phoneRecipients.length} Target Numbers
                  </span>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Target Recipient Pool
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneAudience('registered')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        phoneAudience === 'registered'
                          ? 'border-[#16a34a] bg-emerald-50/20 dark:bg-emerald-950/20 text-neutral-900 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">Platform Users</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {registeredPhoneUsers.length} with phone
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneAudience('extracted')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        phoneAudience === 'extracted'
                          ? 'border-[#16a34a] bg-emerald-50/20 dark:bg-emerald-950/20 text-neutral-900 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">All Extracted</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {extractedContacts.filter(c => c.isValidPhone).length} with phone
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPhoneAudience('selected')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        phoneAudience === 'selected'
                          ? 'border-[#16a34a] bg-emerald-50/20 dark:bg-emerald-950/20 text-neutral-900 dark:text-white'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">Checked Rows</span>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {selectedContacts.filter(c => c.isValidPhone).length} selected
                      </span>
                    </button>
                  </div>
                </div>

                {/* SMS Sender ID */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    SMS Sender ID (Alphanumeric)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                  />
                </div>

                {/* Message Body Template */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Message Content (Supports Tags)
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      {smsMessage.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    className="w-full p-3.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-[#16a34a]"
                  />

                  {/* Personalization Tag Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-neutral-400 font-bold mr-1">Insert tag:</span>
                    <button
                      type="button"
                      onClick={() => setSmsMessage(prev => prev + ' {first_name}')}
                      className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                    >
                      {'{first_name}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsMessage(prev => prev + ' {name}')}
                      className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                    >
                      {'{name}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsMessage(prev => prev + ' {card_url}')}
                      className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                    >
                      {'{card_url}'}
                    </button>
                  </div>
                </div>

                {/* Dispatch & Action Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleExportContactsCsv}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Phone List CSV
                  </button>

                  <button
                    type="button"
                    disabled={isSendingBulkSms || phoneRecipients.length === 0}
                    onClick={handleSendBulkPersonalizedSms}
                    className="px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-neutral-950 font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    {isSendingBulkSms ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Preparing Links...
                      </>
                    ) : (
                      <>
                        <FaWhatsapp className="w-4 h-4" /> Batch WhatsApp Queue ({phoneRecipients.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Recipient Message Preview & 1-Click Launch */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#25D366]" /> Live Recipient Preview
                  </h4>

                  {phoneRecipients.length > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSmsPreviewIndex(prev => (prev > 0 ? prev - 1 : phoneRecipients.length - 1))}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"
                        title="Previous Recipient"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono text-neutral-500 px-1">
                        {smsPreviewIndex + 1} / {phoneRecipients.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSmsPreviewIndex(prev => (prev < phoneRecipients.length - 1 ? prev + 1 : 0))}
                        className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"
                        title="Next Recipient"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Recipient Details Card */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-bold uppercase text-[10px]">Previewing For:</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{currentPhoneRecipient.source}</span>
                  </div>
                  <div className="font-extrabold text-neutral-900 dark:text-white text-sm">
                    {currentPhoneRecipient.name}
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400 font-mono text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>{currentPhoneRecipient.phone}</span>
                    <span className="text-neutral-400 text-[10px]">({currentPhoneRecipient.normalizedPhone})</span>
                  </div>
                </div>

                {/* Rendered Preview Box (WhatsApp Style) */}
                <div className="p-4 rounded-2xl bg-[#0b141a] text-white border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-1 text-[#25D366]">
                      <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp Message Bubble
                    </span>
                    <span>Sub-10ms Outreach</span>
                  </div>

                  <div className="p-3.5 bg-[#202c33] rounded-2xl rounded-tr-xs text-xs whitespace-pre-wrap leading-relaxed font-sans text-neutral-100">
                    {previewPersonalizedSms}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(previewPersonalizedSms, 'sms_copy', 'Copied personalized message!')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchWhatsAppIndividual(currentPhoneRecipient)}
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-neutral-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FaWhatsapp className="w-4 h-4" /> Send to {extractFirstName(currentPhoneRecipient.name)}
                    </button>
                  </div>
                </div>

                {/* Quick Individual Launch List */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                    Quick 1-Click Launch Queue ({phoneRecipients.length})
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {phoneRecipients.map((rec, i) => {
                      const isDispatched = dispatchedPhoneIds.has(rec.id);
                      return (
                        <div
                          key={rec.id}
                          className="p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-[#25D366] bg-neutral-50 dark:bg-[#151821] flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <span className="font-bold text-neutral-900 dark:text-white block truncate">
                              {rec.name}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500 block">
                              {rec.phone}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDispatched && (
                              <span className="text-[10px] text-[#25D366] font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Sent
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSmsPreviewIndex(i);
                                handleLaunchWhatsAppIndividual(rec);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-neutral-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <FaWhatsapp className="w-3.5 h-3.5" /> Launch
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: PLATFORM MEMBER DIRECTORY */}
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
                Supabase Tables &amp; SQL Schema for Contacts &amp; Outreach
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Copy and run this idempotent SQL migration in your Supabase SQL Editor to enable persistent contact storage and lead management.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyText(SUPABASE_COMMS_SQL, 'supabase_sql_copy', 'Copied complete SQL migration to clipboard!')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Copy className="w-4 h-4" /> Copy Complete SQL Code
            </button>
          </div>

          {/* Database Tables Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">public.extracted_contacts</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Contacts extracted from DOC, XLSX, TXT, JPG &amp; PNG</span>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Table</span>
              <span className="text-sm font-bold text-neutral-950 dark:text-white font-mono mt-0.5 block">public.profiles</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Platform registered members, card handles &amp; bio data</span>
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
                onClick={() => handleCopyText(SUPABASE_COMMS_SQL, 'sql_code', 'Copied SQL!')}
                className="hover:text-white flex items-center gap-1 cursor-pointer font-sans"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto text-neutral-300 leading-relaxed max-h-96 overflow-y-auto">
              {SUPABASE_COMMS_SQL}
            </pre>
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
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Phone / WhatsApp Number *</label>
                <InternationalPhoneInput
                  value={newContactForm.phone}
                  onChange={(val) => setNewContactForm({ ...newContactForm, phone: val })}
                  placeholder="e.g. 812 345 6789 or 7911 123456"
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
    </div>
  );
}
