import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerPwaServiceWorker } from './pwa';
import './index.css';

registerPwaServiceWorker();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento root de la aplicación.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
