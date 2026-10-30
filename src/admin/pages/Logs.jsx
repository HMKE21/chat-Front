import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';

const SEV = { info: '', warning: 'warn', critical: 'bad' };

/** fixed = 'audit' | 'security' pins the source (own sidebar entries); without it the page keeps its two tabs. */
export default function Logs({ fixed }) {
  const { t, locale } = useT();
  const [tab, setSource] = useState('audit');
  const source = fixed || tab;
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dlErr, setDlErr] = useState(null);
  const [severity, setSeverity] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error } = useList('/api/v1/admin/logs', { source, q: dq, from, to, ...(source === 'security' && severity ? { severity } : {}), page, per_page: 25 });
  const sec = source === 'security';
  async function download() {
    setDlErr(null);
    try {
      const res = await api.blob('/api/v1/admin/logs/export', { source, q: dq, from, to });
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a'); a.href = url; a.download = `${source}-logs.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { setDlErr(errorMessage(e)); }
  }
  return (
    <>
      {!fixed && <div className="ad-tabs" role="tablist">
        {[['audit', t('Admin audit', 'سجل الإدارة')], ['security', t('Security', 'الأمان')]].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={source === k} className={`ad-tab${source === k ? ' is-on' : ''}`} onClick={() => { setSource(k); setPage(1); }}>{l}</button>
        ))}
      </div>}
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search action, IP or e-mail…', 'ابحث بالإجراء أو الـIP أو الإيميل…')} />
        {sec && (
          <select className="ad-select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} aria-label="severity">
            <option value="">{t('All severities', 'كل المستويات')}</option>
            {['info', 'warning', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      <div className="ad-range">
        <input className="ad-input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label={t('From', 'من')} />
        <input className="ad-input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} aria-label={t('To', 'إلى')} />
        <button type="button" className="ad-btn" onClick={download}>{t('Export CSV', 'تصدير CSV')}</button>
      </div>
      <Notice error={error || dlErr} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('Event', 'الحدث')}</th>{sec && <th>{t('Level', 'المستوى')}</th>}<th>{t('User', 'المستخدم')}</th><th>IP</th><th>{t('Time', 'الوقت')}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${source}-${r.id}`}>
                    <td data-label={t('Event', 'الحدث')}><div className="ad-cell-main"><b dir="ltr">{r.action}</b>{r.subject_type && <small dir="ltr">{r.subject_type}{r.subject_id ? ` #${r.subject_id}` : ''}</small>}</div></td>
                    {sec && <td data-label={t('Level', 'المستوى')}><Badge tone={SEV[r.severity]}>{r.severity}</Badge></td>}
                    <td data-label={t('User', 'المستخدم')}><div className="ad-cell-main"><b>{r.user_name || '—'}</b><small dir="ltr">{r.user_email}</small></div></td>
                    <td data-label="IP" dir="ltr">{r.ip_address || '—'}</td>
                    <td data-label={t('Time', 'الوقت')}>{fmtDate(r.created_at, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} page={page} setPage={setPage} />
      </div>
    </>
  );
}
