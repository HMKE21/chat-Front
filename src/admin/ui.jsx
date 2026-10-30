import { useCallback, useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';

export function useT() {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  return { ar, locale, t: (en, arText) => (ar ? arText : en) };
}

export function fmtDate(v, locale) {
  if (!v) return '—';
  const d = new Date(String(v).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** GET helper: { rows, meta, loading, error, reload }. Refetches when path/params change. */
export function useList(path, params) {
  const [state, setState] = useState({ rows: [], meta: null, loading: true, error: null });
  const key = JSON.stringify(params || {});
  const seq = useRef(0);
  const load = useCallback(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path, JSON.parse(key))
      .then((j) => { if (id === seq.current) setState({ rows: j.data || [], meta: j.meta || null, loading: false, error: null }); })
      .catch((e) => { if (id === seq.current) setState((s) => ({ ...s, loading: false, error: errorMessage(e) })); });
  }, [path, key]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const h = setTimeout(() => setV(value), ms); return () => clearTimeout(h); }, [value, ms]);
  return v;
}

export function Pager({ meta, page, setPage }) {
  const { t } = useT();
  if (!meta) return null;
  return (
    <div className="ad-pager">
      <span>{t('Total', 'الإجمالي')}: {meta.total}</span>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" className="ad-btn ad-btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><Icon name="chevron-left" size={14} />{t('Prev', 'السابق')}</button>
        <span>{page} / {meta.last_page}</span>
        <button type="button" className="ad-btn ad-btn--sm" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>{t('Next', 'التالي')}<Icon name="chevron-right" size={14} /></button>
      </span>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const box = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const first = box.current?.querySelector('input,select,textarea,button');
    first?.focus();
    return () => prev?.focus?.();
  }, []);
  return (
    <div className="ad-modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ad-dialog" ref={box} role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
        {footer && <div className="ad-dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return <label className="ad-field">{label}{children}</label>;
}

export function Switch({ checked, onChange, label, disabled }) {
  return <button type="button" role="switch" aria-checked={!!checked} aria-label={label} disabled={disabled} className="ad-switch" onClick={() => onChange(!checked)} />;
}

export function Badge({ tone, children }) {
  return <span className={`ad-badge${tone ? ` ad-badge--${tone}` : ''}`}>{children}</span>;
}

export function Notice({ error, ok }) {
  if (error) return <div className="ad-alert" role="alert">{error}</div>;
  if (ok) return <div className="ad-alert ad-alert--ok" role="status">{ok}</div>;
  return null;
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <div className="ad-skel" style={{ height: h, width: w, ...style }} aria-hidden="true" />;
}

export function Empty({ loading, children }) {
  const { t } = useT();
  if (loading) {
    return (
      <div role="status" aria-label={t('Loading…', 'جارٍ التحميل…')} style={{ display: 'grid', gap: 12, padding: '8px 0' }}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} h={40} style={{ opacity: 1 - i * 0.2 }} />)}
      </div>
    );
  }
  return (
    <div className="ad-empty">
      <span className="ad-empty__ic"><Icon name="inbox" size={24} /></span>
      <span>{children || t('Nothing here yet', 'لا يوجد شيء بعد')}</span>
    </div>
  );
}

export function Avatar({ name, size }) {
  const n = String(name || '?').trim();
  const hue = [...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <span className={`ad-avatar${size === 'sm' ? ' ad-avatar--sm' : ''}`} style={{ background: `linear-gradient(135deg,hsl(${hue} 70% 52%),hsl(${(hue + 40) % 360} 70% 42%))` }}>{n.slice(0, 1).toUpperCase()}</span>;
}

export { Icon };
