import { useState } from 'react';
import { Badge, Empty, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';

const SEV = { info: '', warning: 'warn', critical: 'bad' };

export default function Logs() {
  const { t, locale } = useT();
  const [source, setSource] = useState('audit');
  const [severity, setSeverity] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error } = useList('/api/v1/admin/logs', { source, q: dq, ...(source === 'security' && severity ? { severity } : {}), page, per_page: 25 });
  const sec = source === 'security';
  return (
    <>
      <div className="ad-tabs" role="tablist">
        {[['audit', t('Admin audit', 'سجل الإدارة')], ['security', t('Security', 'الأمان')]].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={source === k} className={`ad-tab${source === k ? ' is-on' : ''}`} onClick={() => { setSource(k); setPage(1); }}>{l}</button>
        ))}
      </div>
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search action, IP or e-mail…', 'ابحث بالإجراء أو الـIP أو الإيميل…')} />
        {sec && (
          <select className="ad-select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} aria-label="severity">
            <option value="">{t('All severities', 'كل المستويات')}</option>
            {['info', 'warning', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      <Notice error={error} />
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
