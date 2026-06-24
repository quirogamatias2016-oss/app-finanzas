import AccountCard from '../components/AccountCard';
import TransferModal from '../components/TransferModal';

export default function Ahorro() {
  return (
    <div className="app-page">
      <header className="app-page__header">
        <p className="app-page__eyebrow">Reserva</p>
        <h2 className="app-page__title">Ahorro</h2>
        <p className="app-page__caption">Dinero guardado fuera de la operación diaria</p>
      </header>

      <AccountCard title="Ahorro" />

      <TransferModal from="ahorro" />
    </div>
  );
}
