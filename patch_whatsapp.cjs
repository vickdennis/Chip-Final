const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

const replacement = `        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2348100764154"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-10"
        aria-label="Contact on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M12.031 0C5.385 0 0 5.388 0 12.034c0 2.122.553 4.195 1.603 6.012L.15 23.4l5.485-1.439A12.001 12.001 0 0012.031 24c6.643 0 12.034-5.388 12.034-12.034C24.065 5.388 18.674 0 12.031 0zm0 22.012c-1.802 0-3.565-.483-5.111-1.398l-.367-.217-3.8.997 1.018-3.705-.238-.378A10.024 10.024 0 012.01 12.034C2.01 6.502 6.504 2.01 12.031 2.01c5.524 0 10.022 4.492 10.022 10.024 0 5.534-4.498 10.024-10.022 10.024zm5.503-7.514c-.302-.152-1.788-.883-2.064-.985-.276-.101-.477-.152-.678.151-.202.302-.78 1.033-.956 1.285-.176.253-.353.253-.654.101-1.543-.76-2.584-1.488-3.551-3.14-.176-.303.176-.279.475-.877.102-.202.052-.379-.025-.531-.076-.151-.678-1.636-.93-2.241-.243-.589-.492-.51-.678-.52-.176-.01-.379-.01-.58-.01-.202 0-.529.076-.806.379-.276.302-1.055 1.033-1.055 2.52 0 1.488 1.08 2.924 1.231 3.125.151.202 2.13 3.253 5.161 4.56.721.313 1.284.5 1.722.641.724.233 1.383.2 1.9.122.576-.086 1.788-.731 2.039-1.437.251-.707.251-1.312.176-1.438-.076-.127-.278-.202-.58-.354z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#0C0C0C]"></span>
        </span>
      </a>
    </div>
  );
}`;

content = content.replace(/        \)\}\s*<\/AnimatePresence>\s*<\/div>\s*\);\s*\}\s*$/g, replacement + '\n}\n');

fs.writeFileSync('src/views/LandingView.tsx', content);
