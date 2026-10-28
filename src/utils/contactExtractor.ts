import * as XLSX from 'xlsx';

export interface ExtractedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  normalizedPhone: string;
  source: string;
  notes?: string;
  username?: string;
  card_url?: string;
  isValidEmail: boolean;
  isValidPhone: boolean;
  selected?: boolean;
}

/**
 * Standard RFC4122 v4 UUID generator compliant with Supabase/PostgreSQL uuid column type
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = String(raw).trim().replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // Nigerian format normalization
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.slice(1);
  } else if (!cleaned.startsWith('234') && cleaned.length === 10 && /^[789][01]/.test(cleaned)) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function extractFirstName(fullName: string): string {
  if (!fullName) return 'there';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || 'there';
}

export function personalizeText(
  template: string, 
  contact: { name?: string; email?: string; phone?: string; username?: string; card_url?: string; [key: string]: any }
): string {
  if (!template) return '';
  const fullName = (contact.name || '').trim() || 'there';
  const firstName = extractFirstName(fullName);
  const email = (contact.email || '').trim();
  const phone = (contact.phone || '').trim();
  const resolvedCardUrl = contact.card_url || (contact.username ? `https://chipng.com/@${contact.username}` : 'https://chipng.com');

  return template
    .replace(/{name}/gi, fullName)
    .replace(/{full_name}/gi, fullName)
    .replace(/{first_name}/gi, firstName)
    .replace(/{email}/gi, email)
    .replace(/{phone}/gi, phone)
    .replace(/{number}/gi, phone)
    .replace(/{card_url}/gi, resolvedCardUrl);
}

/**
 * Deterministic Regex Parser for raw unstructured text, CSV, TSV, or copy-pasted blocks.
 */
export function extractContactsFromText(rawText: string, sourceLabel: string = 'Pasted Text'): ExtractedContact[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: ExtractedContact[] = [];
  const seenKeys = new Set<string>();

  // Helper to add unique contact
  const addContact = (name: string, email: string, phone: string, notes?: string) => {
    const cleanName = (name || '').trim().replace(/^["']|["']$/g, '');
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const normPhone = normalizePhoneNumber(cleanPhone);

    const dedupKey = (cleanEmail || normPhone || cleanName).toLowerCase();
    if (!dedupKey || seenKeys.has(dedupKey)) return;
    seenKeys.add(dedupKey);

    // Skip header labels
    if (['name', 'email', 'phone', 'number', 'mobile'].includes(cleanName.toLowerCase())) return;

    results.push({
      id: generateUUID(),
      name: cleanName || (cleanEmail ? cleanEmail.split('@')[0] : 'Contact'),
      email: cleanEmail,
      phone: cleanPhone,
      normalizedPhone: normPhone,
      source: sourceLabel,
      notes: notes || '',
      isValidEmail: isValidEmail(cleanEmail),
      isValidPhone: isValidPhone(cleanPhone),
      selected: true
    });
  };

  // 1. Line-by-line inspection
  for (const line of lines) {
    // Check if line contains CSV/delimited parts
    const parts = line.split(/[,;\t|]/).map(p => p.trim());
    if (parts.length >= 2) {
      let candidateName = '';
      let candidateEmail = '';
      let candidatePhone = '';

      for (const part of parts) {
        if (!candidateEmail && isValidEmail(part)) {
          candidateEmail = part;
        } else if (!candidatePhone && isValidPhone(part)) {
          candidatePhone = part;
        } else if (!candidateName && part.length >= 2 && !part.includes('@') && !/^\+?[0-9\s()-]{7,}$/.test(part)) {
          candidateName = part;
        }
      }

      if (candidateEmail || candidatePhone) {
        addContact(candidateName, candidateEmail, candidatePhone);
        continue;
      }
    }

    // Pattern matching in unstructured sentences (e.g., "John Doe - john@test.com - 08012345678")
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = line.match(/(?:\+?234|0)[789][01]\d{8}|\+?[1-9]\d{9,14}/);

    const email = emailMatch ? emailMatch[0] : '';
    const phone = phoneMatch ? phoneMatch[0] : '';

    if (email || phone) {
      // Name is likely the remainder of the line with email and phone stripped
      let potentialName = line;
      if (email) potentialName = potentialName.replace(email, '');
      if (phone) potentialName = potentialName.replace(phone, '');
      potentialName = potentialName
        .replace(/^(name|contact|client|customer|mr|mrs|ms|dr|engr)[\s.:-]*/i, '')
        .replace(/[-–—,:;()|]/g, ' ')
        .trim();

      if (potentialName.length < 2 || potentialName.length > 50) {
        potentialName = email ? email.split('@')[0].replace(/[._-]/g, ' ') : '';
      }

      addContact(potentialName, email, phone);
    }
  }

  // 2. Fallback global regex search if line-by-line found very few items
  if (results.length === 0) {
    const allEmails = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const allPhones = rawText.match(/(?:\+?234|0)[789][01]\d{8}|\+?[1-9]\d{9,14}/g) || [];

    const maxCount = Math.max(allEmails.length, allPhones.length);
    for (let i = 0; i < maxCount; i++) {
      const email = allEmails[i] || '';
      const phone = allPhones[i] || '';
      const name = email ? email.split('@')[0].replace(/[._-]/g, ' ') : `Contact ${i + 1}`;
      addContact(name, email, phone);
    }
  }

  return results;
}

/**
 * Parse Excel (XLSX, XLS) or CSV file with SheetJS (xlsx)
 */
export async function parseSpreadsheetFile(file: File): Promise<ExtractedContact[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve([]);
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rows.length === 0) {
          resolve([]);
          return;
        }

        // Header detection
        const headerRow: string[] = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        
        let nameColIdx = headerRow.findIndex(h => /^(full\s*name|name|contact\s*name|customer|client|fullname|first\s*name|recipient)/i.test(h));
        let emailColIdx = headerRow.findIndex(h => /^(email|e-mail|email\s*address|mail)/i.test(h));
        let phoneColIdx = headerRow.findIndex(h => /^(phone|number|phone\s*number|mobile|telephone|tel|whatsapp|contact\s*number)/i.test(h));

        // If headers weren't named standard, inspect row 1 to see which column has @ or digits
        if (nameColIdx === -1 || emailColIdx === -1 || phoneColIdx === -1) {
          for (let c = 0; c < (rows[1] || []).length; c++) {
            const val = String(rows[1][c] || '').trim();
            if (emailColIdx === -1 && isValidEmail(val)) emailColIdx = c;
            else if (phoneColIdx === -1 && isValidPhone(val)) phoneColIdx = c;
            else if (nameColIdx === -1 && val.length > 2 && !val.includes('@') && !isValidPhone(val)) nameColIdx = c;
          }
        }

        const contacts: ExtractedContact[] = [];
        const seen = new Set<string>();

        // Start from row 1 (or 0 if row 0 was already data)
        const startRow = (emailColIdx !== -1 && isValidEmail(String(rows[0][emailColIdx]))) ? 0 : 1;

        for (let r = startRow; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          let name = nameColIdx !== -1 ? String(row[nameColIdx] || '').trim() : '';
          let email = emailColIdx !== -1 ? String(row[emailColIdx] || '').trim() : '';
          let phone = phoneColIdx !== -1 ? String(row[phoneColIdx] || '').trim() : '';

          // If columns were not strict, search across cells in this row
          if (!email || !phone) {
            for (let c = 0; c < row.length; c++) {
              const cellVal = String(row[c] || '').trim();
              if (!email && isValidEmail(cellVal)) email = cellVal;
              else if (!phone && isValidPhone(cellVal)) phone = cellVal;
              else if (!name && cellVal.length > 2 && !cellVal.includes('@') && !isValidPhone(cellVal)) name = cellVal;
            }
          }

          if (!name && !email && !phone) continue;

          const normPhone = normalizePhoneNumber(phone);
          const dedupKey = (email || normPhone || name).toLowerCase();
          if (!dedupKey || seen.has(dedupKey)) continue;
          seen.add(dedupKey);

          contacts.push({
            id: generateUUID(),
            name: name || (email ? email.split('@')[0] : `Recipient ${r}`),
            email,
            phone,
            normalizedPhone: normPhone,
            source: file.name,
            notes: `Row ${r + 1}`,
            isValidEmail: isValidEmail(email),
            isValidPhone: isValidPhone(phone),
            selected: true
          });
        }

        resolve(contacts);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Universal Client/Server Extractor for DOC, DOCX, TXT, JPG, PNG, and Paste
 */
export async function extractContactsFromFile(file: File): Promise<ExtractedContact[]> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Excel & CSV
  if (['xlsx', 'xls', 'csv'].includes(extension)) {
    return parseSpreadsheetFile(file);
  }

  // 2. Images (JPG, JPEG, PNG)
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension) || file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Data = dataUrl.split(',')[1] || '';
          
          const res = await fetch('/api/admin/extract-contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type || (extension === 'png' ? 'image/png' : 'image/jpeg'),
              fileName: file.name
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.contacts) && data.contacts.length > 0) {
              const mapped = data.contacts.map((c: any) => ({
                id: generateUUID(),
                name: (c.name || '').trim() || 'Contact',
                email: (c.email || '').trim().toLowerCase(),
                phone: (c.phone || '').trim(),
                normalizedPhone: normalizePhoneNumber(c.phone || ''),
                source: `${file.name} (Vision OCR)`,
                notes: c.notes || '',
                isValidEmail: isValidEmail(c.email || ''),
                isValidPhone: isValidPhone(c.phone || ''),
                selected: true
              }));
              resolve(mapped);
              return;
            }
          }
          resolve([]);
        } catch (err) {
          console.warn('Vision extraction fallback:', err);
          resolve([]);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 3. Plain Text / Markdown
  if (['txt', 'log', 'md'].includes(extension) || file.type === 'text/plain') {
    const text = await file.text();
    return extractContactsFromText(text, file.name);
  }

  // 4. DOC / DOCX
  // Try reading text directly or sending to server
  try {
    const text = await file.text();
    const extracted = extractContactsFromText(text, file.name);
    if (extracted.length > 0) {
      return extracted;
    }
  } catch (e) {}

  // Fallback to server AI extractor for binary docs
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(',')[1] || '';
        const res = await fetch('/api/admin/extract-contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: file.type || 'application/octet-stream',
            fileName: file.name
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.contacts)) {
            resolve(json.contacts.map((c: any) => ({
              id: generateUUID(),
              name: c.name || 'Contact',
              email: c.email || '',
              phone: c.phone || '',
              normalizedPhone: normalizePhoneNumber(c.phone || ''),
              source: file.name,
              isValidEmail: isValidEmail(c.email || ''),
              isValidPhone: isValidPhone(c.phone || ''),
              selected: true
            })));
            return;
          }
        }
      } catch (e) {}
      resolve([]);
    };
    reader.readAsDataURL(file);
  });
}
