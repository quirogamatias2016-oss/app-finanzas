import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPanel() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) {
      setInstalled(true);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setFeedback('App instalada en tu pantalla de inicio.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      setFeedback('En Chrome/Android: menú ⋮ → "Instalar app" o "Añadir a pantalla de inicio".');
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === 'accepted') {
      setFeedback('Instalación iniciada.');
      setInstallEvent(null);
    } else {
      setFeedback('Instalación cancelada.');
    }
  };

  return (
    <div className="config-panel">
      <h3 className="config-panel__title">Instalar como app (PWA)</h3>
      <p className="config-panel__copy">
        Funciona sin internet después del primer acceso. Los datos se guardan en este dispositivo bajo la clave{' '}
        <code>app-finanzas</code> en localStorage.
      </p>

      {installed ? (
        <p className="form-feedback form-feedback--success">Ya estás usando la app instalada.</p>
      ) : (
        <button type="button" className="btn btn--primary btn--compact" onClick={() => void handleInstall()}>
          Instalar App Finanzas
        </button>
      )}

      {feedback ? <p className="form-hint">{feedback}</p> : null}
    </div>
  );
}
