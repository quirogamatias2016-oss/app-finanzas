interface AppLoaderProps {
  message?: string;
}

export function AppLoader({ message = 'Cargando tu panel...' }: AppLoaderProps) {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="app-loader__card">
        <span className="app-loader__logo">F</span>
        <p className="app-loader__title">Finanzas Pro</p>
        <p className="app-loader__text">{message}</p>
        <span className="app-loader__spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
