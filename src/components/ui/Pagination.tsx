import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ui.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  const { t } = useTranslation('common');

  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: number[] = [];
    const left = Math.max(2, currentPage - siblingCount);
    const right = Math.min(totalPages - 1, currentPage + siblingCount);

    pages.push(1);
    if (left > 2) pages.push(-1);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push(-2);
    if (totalPages > 1) pages.push(totalPages);

    const result: (number | 'ellipsis')[] = [];
    for (const p of pages) {
      if (p < 0) {
        result.push('ellipsis');
      } else {
        result.push(p);
      }
    }
    return result;
  };

  const btnBase: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--outline-variant)',
    backgroundColor: 'var(--surface)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const pageBtn = (p: number): React.CSSProperties => ({
    ...btnBase,
    padding: '6px 12px',
    border: `1px solid ${currentPage === p ? 'var(--primary)' : 'var(--outline-variant)'}`,
    backgroundColor: currentPage === p ? 'var(--primary)' : 'var(--surface)',
    color: currentPage === p ? 'var(--on-primary)' : 'var(--on-surface)',
    fontWeight: currentPage === p ? 700 : 400,
    fontSize: '13px',
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderTop: '1px solid var(--outline-variant)',
        backgroundColor: 'var(--surface-container-low)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
        {t('showingXofY', { x: `${from}–${to}`, y: totalItems })}
      </span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            ...btnBase,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        {generatePageNumbers().map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`e${idx}`}
              style={{ padding: '0 4px', color: 'var(--on-surface-variant)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              style={pageBtn(p as number)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            ...btnBase,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
