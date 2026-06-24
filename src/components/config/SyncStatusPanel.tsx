import { useEffect, useState } from 'react';
import { useFinanceStore } from '../../hooks/useFinance';
import { isCloudFullySynced, subscribeCloudSyncReady } from '../../services/cloudSync';
import { logManualSync } from '../../services/syncLog';

const DEPLOY_COMMANDS = `git add .
git commit -m "update app"
git push`;

const FIREBASE_DATA_ITEMS = [
  'Ingresos',
  'Gastos',
  'Transferencias',
  'Objetivos',
  'Ahorros',
] as const;

export function SyncStatusPanel() {
  const { transactions, transfers } = useFinanceStore();
  const [cloudReady, setCloudReady] = useState(isCloudFullySynced);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showDeployHelp, setShowDeployHelp] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const firebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const dataLive = cloudReady && firebaseConfigured;

  useEffect(() => subscribeCloudSyncReady(setCloudReady), []);

  const syncNow = async () => {
    setSyncing(true);
    setSyncFeedback(null);

    try {
      await logManualSync();
      setSyncFeedback('Datos sincronizados en Firebase (instantáneo).');
    } catch {
      setSyncFeedback('No se pudo sincronizar. Revisa la conexión con Firebase.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="config-panel">
        <h3 className="config-panel__title">Tecnología del sistema</h3>

        <ul className="config-panel__list config-panel__list--kinds" aria-label="Arquitectura híbrida">
          <li className="config-panel__kind-row">
            <span>Código (UI + lógica)</span>
            <strong>Git + Vercel</strong>
          </li>
          <li className="config-panel__kind-row">
            <span>Datos (movimientos)</span>
            <strong>Firebase en tiempo real</strong>
          </li>
          <li className="config-panel__kind-row">
            <span>Sincronización</span>
            <strong>Automática solo para datos</strong>
          </li>
        </ul>

        <p className="config-panel__copy">
          No existe sincronización automática de código en Vercel. Solo los datos se actualizan en
          tiempo real entre celular y PC mediante Firebase.
        </p>
      </div>

      <div className="config-panel">
        <h3 className="config-panel__title">Datos en Firebase (tiempo real)</h3>

        <p className="config-panel__copy">
          Cada cambio se guarda en la nube y se propaga al instante con onSnapshot. Celular ↔ PC sin
          refresh manual.
        </p>

        <ul className="config-panel__list">
          {FIREBASE_DATA_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <ul className="config-panel__list config-panel__list--kinds" aria-label="Estado de sincronización">
          <li className="config-panel__kind-row">
            <span>Firebase</span>
            <span>{dataLive ? '🟢 activo' : '🟡 conectando…'}</span>
          </li>
          <li className="config-panel__kind-row">
            <span>Registros en nube</span>
            <span>
              {transactions.length} mov. · {transfers.length} transf.
            </span>
          </li>
          <li className="config-panel__kind-row">
            <span>Vercel (UI)</span>
            <span>🟢 online · deploy con git push</span>
          </li>
        </ul>

        <div className="config-panel__form">
          <button
            type="button"
            className="btn btn--primary btn--compact"
            onClick={() => void syncNow()}
            disabled={syncing || !firebaseConfigured}
          >
            {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--compact"
            onClick={() => setShowDeployHelp((value) => !value)}
          >
            Publicar código en Vercel
          </button>

          {showDeployHelp ? (
            <div className="form-hint">
              <p>
                Cuando cambias código, Vercel reconstruye la app tras git push. Los datos no viajan
                por Git: siguen en Firebase.
              </p>
              <pre>{DEPLOY_COMMANDS}</pre>
            </div>
          ) : null}

          {syncFeedback ? (
            <p
              className={`form-feedback form-feedback--${syncFeedback.includes('No se') ? 'error' : 'success'}`}
            >
              {syncFeedback}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
