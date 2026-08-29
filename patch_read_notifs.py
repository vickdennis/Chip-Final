import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

old_state = "  const [showNotifications, setShowNotifications] = useState(false);"
new_state = """  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifs, setReadNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chip_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => String(n.id));
    const newRead = [...new Set([...readNotifs, ...allIds])];
    setReadNotifs(newRead);
    localStorage.setItem('chip_read_notifs', JSON.stringify(newRead));
  };"""

code = code.replace(old_state, new_state)

old_unread = "  const unreadCount = allNotifications.length;"
new_unread = """  const unreadCount = allNotifications.filter(n => !readNotifs.includes(String(n.id))).length;"""

code = code.replace(old_unread, new_unread)

old_bell = """      <button 
        onClick={() => setShowNotifications(!showNotifications)}"""
new_bell = """      <button 
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) markAllAsRead();
        }}"""

code = code.replace(old_bell, new_bell)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Successfully added read states.")
