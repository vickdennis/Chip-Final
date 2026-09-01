import React, { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

export default function AdminNotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/app-updates');
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
      const data = await res.json();
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black dark:text-white tracking-tight mb-1">
          App Notifications
        </h2>
        <p className="text-[16px] text-black/60 dark:text-white/60">Broadcast in-app updates to all users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10">
          <h3 className="font-sans font-bold text-lg mb-6 flex items-center gap-2">
            <Send className="w-5 h-5" />
            New Broadcast
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Notification Title</label>
              <input 
                type="text"
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 rounded-xl text-[14px] bg-white dark:bg-[#121212] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., New Feature Alert!"
              />
            </div>
            
            <div>
              <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Message Body</label>
              <textarea 
                className="w-full px-4 py-3 border border-black/10 dark:border-white/10 rounded-xl text-[14px] bg-white dark:bg-[#121212] focus:outline-none focus:border-black dark:focus:border-white transition-colors h-32 resize-none"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write your update message here..."
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={isSending || !title || !message}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isSending ? 'Broadcasting...' : 'Send to All Users'}
            </button>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Broadcasts
            </h3>
            <button onClick={fetchNotifications} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-black/40 dark:text-white/40">
                No notifications broadcasted yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-[15px]">{n.title}</h4>
                    <span className="text-[10px] text-black/40 dark:text-white/40 font-mono">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-black/60 dark:text-white/60">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
