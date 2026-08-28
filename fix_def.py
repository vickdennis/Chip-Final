import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

notification_code = """
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasDismissedNfcPrompt, setHasDismissedNfcPrompt] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const systemNotifications = [];
  if (profile && !hasDismissedNfcPrompt) {
     const joinedDays = (new Date().getTime() - new Date(profile.created_at || Date.now()).getTime()) / (1000 * 3600 * 24);
     if (joinedDays < 30) {
       systemNotifications.push({
         id: 'sys-nfc',
         title: 'Get Your NFC Card',
         message: 'Complete your setup by ordering a physical NFC smart card to share your profile instantly.',
         isSystem: true
       });
     }
  }

  const allNotifications = [...systemNotifications, ...notifications];
  const unreadCount = allNotifications.length;

  const NotificationBell = () => (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-black dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden z-50">
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-black dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-[#B600A8] text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="p-8 text-center text-black/40 dark:text-white/40 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {allNotifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left relative">
                    <h4 className="font-bold text-sm text-black dark:text-white mb-1 pr-6">{notif.title}</h4>
                    <p className="text-xs text-black/60 dark:text-white/60">{notif.message}</p>
                    
                    {notif.isSystem && (
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={() => {
                            setActiveTab('nfc');
                            setTimeout(() => {
                              document.getElementById('nfc-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                            setShowNotifications(false);
                          }}
                          className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg font-bold"
                        >
                          Order Now
                        </button>
                        <button 
                          onClick={() => setHasDismissedNfcPrompt(true)}
                          className="text-xs bg-black/10 dark:bg-white/10 text-black dark:text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black/20 dark:hover:bg-white/20"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
"""

if "const NotificationBell =" not in code:
    code = code.replace(
        "const completionRate = Math.round((completedSteps / setupSteps.length) * 100);",
        "const completionRate = Math.round((completedSteps / setupSteps.length) * 100);\n" + notification_code
    )

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Applied NotificationBell definition")
