import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, MessageCircle } from 'lucide-react';

export default function AdminLeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        console.error("Error fetching leads:", await res.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const downloadCSV = () => {
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
  };

  return (
    <div className="bg-white dark:bg-[#111] rounded-md shadow-sm border border-[#cfc4c5] dark:border-[#333] p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-sans">WhatsApp Leads</h2>
        <button onClick={downloadCSV} className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#cfc4c5] dark:border-[#333] px-4 py-2 rounded-md font-bold text-sm flex items-center hover:bg-black/5">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border border-[#cfc4c5] dark:border-[#333] rounded-md text-center">
          <div className="text-2xl font-bold">{leads.length}</div>
          <div className="text-xs text-[#7e7576] uppercase tracking-wider">Total Leads</div>
        </div>
        <div className="p-4 border border-[#cfc4c5] dark:border-[#333] rounded-md text-center">
          <div className="text-2xl font-bold text-[#25D366]">{leads.filter(l => l.source === 'inline').length}</div>
          <div className="text-xs text-[#7e7576] uppercase tracking-wider">Inline Converts</div>
        </div>
        <div className="p-4 border border-[#cfc4c5] dark:border-[#333] rounded-md text-center">
          <div className="text-2xl font-bold text-[#25D366]">{leads.filter(l => l.source === 'sticky').length}</div>
          <div className="text-xs text-[#7e7576] uppercase tracking-wider">Sticky Bar Converts</div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#7e7576]">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="py-8 text-center text-[#7e7576] border border-dashed border-[#cfc4c5] dark:border-[#333] rounded-md">
          No leads captured yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#cfc4c5] dark:border-[#333] text-sm text-[#7e7576]">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">WhatsApp</th>
                <th className="p-3 font-medium">City</th>
                <th className="p-3 font-medium">Source Blog</th>
                <th className="p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-[#cfc4c5] dark:border-[#333] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a]">
                  <td className="p-3 text-sm text-[#7e7576]">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-sm">{lead.name}</td>
                  <td className="p-3 font-mono text-sm">{lead.whatsapp}</td>
                  <td className="p-3 text-sm">{lead.city || '-'}</td>
                  <td className="p-3 text-xs text-[#7e7576]">
                    <div className="flex flex-col">
                      <span>/{lead.post_slug}</span>
                      <span className="opacity-50 text-[10px]">via {lead.source}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <a 
                      href={`https://wa.me/${lead.whatsapp.replace('+', '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> Chat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
