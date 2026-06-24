import { useCallback, useState } from 'react';

export const LEDGER_PAGE_SIZE = 10;

export function useLedgerPagination(total: number, pageSize = LEDGER_PAGE_SIZE) {
  const [limit, setLimit] = useState(pageSize);

  const showMore = useCallback(() => {
    setLimit((current) => current + pageSize);
  }, [pageSize]);

  const hasMore = total > limit;
  const remaining = Math.max(0, total - limit);

  return { limit, showMore, hasMore, remaining };
}
