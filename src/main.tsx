import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Handle SPA redirect preservation & dynamic import chunk reload when new deployment is released
if (typeof window !== 'undefined') {
  try {
    const savedRedirect = sessionStorage.getItem('chipng_spa_redirect');
    if (savedRedirect) {
      sessionStorage.removeItem('chipng_spa_redirect');
      window.history.replaceState(null, '', savedRedirect);
    }
  } catch (e) {}

  window.addEventListener('vite:preloadError', () => {
    try {
      const lastReload = sessionStorage.getItem('chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_reload', now.toString());
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <HelmetProvider><App /></HelmetProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (mountErr) {
    console.error('Fatal mount error in CHIP NG:', mountErr);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0A0B0E; color: #FFFFFF; font-family: -apple-system, sans-serif; padding: 24px; text-align: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">CHIP NG</h2>
        <p style="font-size: 13px; color: #888888; margin-bottom: 16px;">Interface initializing... Please refresh.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; border-radius: 9999px; background-color: #16a34a; color: #000000; font-weight: 700; font-size: 13px; border: none; cursor: pointer;">Reload CHIP NG</button>
      </div>
    `;
  }
}
