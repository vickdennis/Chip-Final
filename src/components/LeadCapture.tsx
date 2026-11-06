import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MessageCircle, CheckCircle } from 'lucide-react';

interface LeadFormProps {
  postSlug: string;
  postTitle: string;
  source: 'inline' | 'sticky';
  onSuccess?: () => void;
}

export function formatWhatsAppNumber(phone: string) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  return '+' + cleaned;
}

export function LeadForm({ postSlug, postTitle, source, onSuccess }: LeadFormProps) {
  const [formData, setFormData] = useState({ name: '', whatsapp: '', city: 'Lagos' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const lastSub = localStorage.getItem('chipng_lead_submitted');
    if (lastSub && Date.now() - parseInt(lastSub) < 24 * 60 * 60 * 1000) {
      setSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    setSubmitting(true);

    try {
      const formattedWa = formatWhatsAppNumber(formData.whatsapp);
      
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formattedWa,
          city: formData.city,
          post_slug: postSlug,
          source: source
        })
      });

      if (!res.ok) {
         console.error('Lead save error:', await res.text());
      }

      localStorage.setItem('chipng_lead_submitted', Date.now().toString());
      setSubmitted(true);

      // Track Event
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({ event: 'generate_lead', source, postSlug });
      }

      // WhatsApp redirection
      const text = `Hi Chipng, I read ${postTitle} and want the NFC card price.`;
      const url = `https://wa.me/2348100764154?text=${encodeURIComponent(text)}&utm_source=blog&utm_medium=${postSlug}`;
      window.open(url, '_blank');
      
      if (onSuccess) onSuccess();

    } catch (err: any) {
      alert('Error submitting form: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`bg-[#25D366]/10 border border-[#25D366]/30 p-6 rounded-xl flex flex-col items-center justify-center text-center ${source === 'inline' ? 'my-8' : ''}`}>
        <CheckCircle className="w-8 h-8 text-[#25D366] mb-2" />
        <h4 className="font-bold text-white">Opened WhatsApp!</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">We'll send your quote now.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-[#111] border ${source === 'inline' ? 'border-gray-200 dark:border-gray-800 rounded-2xl p-6 my-8 shadow-sm' : 'border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg'}`}>
      {source === 'inline' && (
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold font-sans text-white flex justify-center items-center gap-2">
            <MessageCircle className="text-[#25D366] w-6 h-6" /> Get NFC Card Price on WhatsApp
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">We reply in 5 minutes. ₦12,500 launch price.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={source === 'inline' ? "flex flex-col gap-4 max-w-md mx-auto" : "flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto items-center"}>
        {source === 'sticky' && (
          <div className="text-sm font-bold whitespace-nowrap text-white mb-2 sm:mb-0 mr-2 flex items-center gap-2">
            <MessageCircle className="text-[#25D366] w-5 h-5" /> Want an NFC Card in Lagos?
          </div>
        )}
        <input 
          type="text" 
          placeholder="Name" 
          required 
          className="w-full px-4 py-2 bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:border-[#25D366] transition-colors"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="tel" 
          placeholder="WhatsApp (080...)" 
          required 
          className="w-full px-4 py-2 bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:border-[#25D366] transition-colors"
          value={formData.whatsapp}
          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
        />
        {source === 'inline' && (
          <select 
            className="w-full px-4 py-2 bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none focus:border-[#25D366] transition-colors"
            value={formData.city}
            onChange={e => setFormData({...formData, city: e.target.value})}
          >
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="PH">Port Harcourt</option>
            <option value="Other">Other</option>
          </select>
        )}
        <button 
          type="submit" 
          disabled={submitting}
          className="w-full sm:w-auto whitespace-nowrap px-6 py-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? 'Opening...' : source === 'inline' ? 'Get Price Now' : 'Chat on WhatsApp'}
        </button>
      </form>
    </div>
  );
}
