import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register BBA PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[BBA PWA] Service Worker registrado com sucesso:', registration.scope);
      })
      .catch((err) => {
        console.error('[BBA PWA] Falha ao registrar Service Worker:', err);
      });
  });
}
