import React, { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminNotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/app-updates');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.notifications) {
         setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async () => {
    if (!title || !message) return alert("Title and message required.");
    setIsSending(true);
    try {
      const res = await fetch('/api/app-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      
      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(`HTTP ${res.status} | Text: ${textResponse.substring(0, 200)}...`);
      }

      if (data.success) {
        setTitle('');
        setMessage('');
        alert("Notification broadcasted successfully!");
        fetchNotifications();
      } else {
        alert("Error: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to send notification. Error: " + (e.message || String(e)));
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this broadcast notification?")) return;
    try {
      const res = await fetch(`/api/app-updates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNotifications();
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
          <Bell className="w-3.5 h-3.5" /> In-App Announcements
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
          System Broadcasts & App Updates
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Broadcast global notifications, product announcements, and system alerts to all user dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10">
          <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Dispatch New Global Alert
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Announcement Title</label>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New NFC Card Styles Are Now Live!"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Announcement Body</label>
              <textarea 
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843] h-32 resize-none"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter details visible in the bell notification drawer across all user accounts..."
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={isSending || !title || !message}
              className="w-full py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-50 font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Broadcasting...' : 'Broadcast to All User Accounts'}
            </button>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Sent Announcement Archive
            </h3>
            <button 
              onClick={fetchNotifications} 
              className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                No system announcements broadcasted yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-bold text-neutral-950 dark:text-white text-sm">{n.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(n.created_at.replace(" ", "T") + "Z").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => handleDelete(n.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
