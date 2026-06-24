interface LedgerShowMoreProps {
  hasMore: boolean;
  remaining: number;
  onShowMore: () => void;
}

export function LedgerShowMore({ hasMore, remaining, onShowMore }: LedgerShowMoreProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <footer className="ledger-panel__footer">
      <button type="button" className="btn btn--ghost btn--block ledger-panel__more" onClick={onShowMore}>
        Ver más ({remaining} restantes)
      </button>
    </footer>
  );
}
