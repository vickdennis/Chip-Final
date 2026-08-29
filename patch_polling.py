import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

old_use_effect = """  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(err => console.error(err));
  }, []);"""

new_use_effect = """  useEffect(() => {
    const fetchNotifs = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(err => console.error(err));
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);"""

if old_use_effect in code:
    code = code.replace(old_use_effect, new_use_effect)
    with open('src/views/UserDashboard.tsx', 'w') as f:
        f.write(code)
    print("Successfully added polling to UserDashboard.")
else:
    print("Could not find the useEffect block.")
