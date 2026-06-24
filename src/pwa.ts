import { registerSW } from 'virtual:pwa-register';

export function registerPwaServiceWorker(): void {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      void updateSW(true);
    },
    onOfflineReady() {
      console.info('[PWA] App lista para uso offline.');
    },
    onRegistered(registration) {
      console.info('[PWA] Service worker registrado.', registration?.scope);

      if (!navigator.onLine) {
        console.info('[PWA] Modo offline activo — datos en localStorage.');
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Error al registrar service worker.', error);
    },
  });

  window.addEventListener('online', () => {
    console.info('[PWA] Conexión restaurada.');
  });

  window.addEventListener('offline', () => {
    console.info('[PWA] Sin internet — la app sigue funcionando con datos locales.');
  });
}
