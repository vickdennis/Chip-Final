const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add session state
content = content.replace('const [sessionLoading, setSessionLoading] = useState(true);', 'const [sessionLoading, setSessionLoading] = useState(true);\n  const [session, setSession] = useState<any>(null);');

// Update getSession
content = content.replace('supabase.auth.getSession().then(({ data: { session } }) => {', 'supabase.auth.getSession().then(({ data: { session } }) => {\n      setSession(session);');

// Update onAuthStateChange
content = content.replace('const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {', 'const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {\n      setSession(session);');

// Fix redirect logic in onAuthStateChange
const badLogic = `} else if (session && (prevView === 'login' || prevView === 'landing')) {
          return 'user-dashboard';
        }`;
const goodLogic = `} else if (session && prevView === 'login') {
          return 'user-dashboard';
        }`;
content = content.replace(badLogic, goodLogic);

// Add session to LandingView
content = content.replace('{currentView === \'landing\' && <LandingView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}', '{currentView === \'landing\' && <LandingView onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} session={session} />}');

fs.writeFileSync('src/App.tsx', content);
