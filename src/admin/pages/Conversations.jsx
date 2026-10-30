import { useState } from 'react';
import { Badge, Empty, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';

export default function Conversations() {
  const { t, locale } = useT();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error } = useList('/api/v1/admin/conversations', { q: dq, type, page, per_page: 20 });
  return (
    <>
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search group name…', 'ابحث باسم الجروب…')} />
        <select className="ad-select" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="type">
          <option value="">{t('All types', 'كل الأنواع')}</option>
          <option value="direct">{t('Direct', 'خاصة')}</option>
          <option value="group">{t('Groups', 'جروبات')}</option>
        </select>
      </div>
      <Notice error={error} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('Conversation', 'المحادثة')}</th><th>{t('Type', 'النوع')}</th><th>{t('Members', 'الأعضاء')}</th><th>{t('Messages', 'الرسائل')}</th><th>{t('Last activity', 'آخر نشاط')}</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td data-label={t('Conversation', 'المحادثة')}><div className="ad-cell-main"><b>{c.title || (c.members || []).join(' · ') || `#${c.id}`}</b><small>#{c.id}</small></div></td>
                    <td data-label={t('Type', 'النوع')}><Badge tone={c.is_group ? 'brand' : ''}>{c.is_group ? t('Group', 'جروب') : t('Direct', 'خاصة')}</Badge></td>
                    <td data-label={t('Members', 'الأعضاء')}>{c.members_count}</td>
                    <td data-label={t('Messages', 'الرسائل')}>{c.messages}</td>
                    <td data-label={t('Last activity', 'آخر نشاط')}>{fmtDate(c.updated_at, locale)}</td>
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
