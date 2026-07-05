const fs = require('fs');
let code = fs.readFileSync('src/views/AdminLeadsManager.tsx', 'utf8');

const oldFetch = `const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching leads (maybe table not created yet?):", error);
    }
    if (data) setLeads(data);`;

const newFetch = `try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else {
        console.error("Error fetching leads:", await res.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/views/AdminLeadsManager.tsx', code);
