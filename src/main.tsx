import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Bersihkan service worker dev lama yang sempat men-cache bundel lama di browser
if (import.meta.env.DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => {
      reg.unregister().catch(() => {});
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
