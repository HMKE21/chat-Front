import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Modal, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';

const TONE = { live: 'ok', lobby: 'warn', scheduled: 'brand', ended: '', cancelled: 'bad' };

export default function Meetings() {
  const { t, locale } = useT();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error, reload } = useList('/api/v1/admin/meetings', { q: dq, status, page, per_page: 20 });
  const [confirm, setConfirm] = useState(null); // {kind:'end'|'delete', m}
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);

  async function go() {
    const { kind, m } = confirm;
    setBusy(true); setMsg({});
    try {
      if (kind === 'end') await api.post(`/api/v1/admin/meetings/${m.id}/end`);
      else await api.del(`/api/v1/admin/meetings/${m.id}`);
      setMsg({ ok: kind === 'end' ? t('Meeting ended', 'تم إنهاء الاجتماع') : t('Meeting deleted', 'تم حذف الاجتماع') });
      setConfirm(null); reload();
    } catch (e) { setMsg({ error: errorMessage(e) }); setConfirm(null); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search title, code or host…', 'ابحث بالعنوان أو الكود أو المضيف…')} />
        <select className="ad-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="status">
          <option value="">{t('All statuses', 'كل الحالات')}</option>
          {['live', 'lobby', 'scheduled', 'ended', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Notice error={error || msg.error} ok={msg.ok} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('Meeting', 'الاجتماع')}</th><th>{t('Host', 'المضيف')}</th><th>{t('Status', 'الحالة')}</th><th>{t('People', 'الحضور')}</th><th>{t('When', 'الموعد')}</th><th /></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td data-label={t('Meeting', 'الاجتماع')}><div className="ad-cell-main"><b>{m.title || '—'}</b><small dir="ltr">{m.meeting_code}</small></div></td>
                    <td data-label={t('Host', 'المضيف')}><div className="ad-cell-main"><b>{m.host_name || '—'}</b><small dir="ltr">{m.host_email}</small></div></td>
                    <td data-label={t('Status', 'الحالة')}><Badge tone={TONE[m.status]}>{m.status}</Badge></td>
                    <td data-label={t('People', 'الحضور')}>{m.participants}</td>
                    <td data-label={t('When', 'الموعد')}>{fmtDate(m.started_at || m.scheduled_start_at || m.created_at, locale)}</td>
                    <td className="actions-cell"><div className="actions">
                      {(m.status === 'live' || m.status === 'lobby') && <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={() => setConfirm({ kind: 'end', m })}>{t('End now', 'إنهاء الآن')}</button>}
                      <button type="button" className="ad-btn ad-btn--sm" onClick={() => setConfirm({ kind: 'delete', m })}>{t('Delete', 'حذف')}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} page={page} setPage={setPage} />
      </div>
      {confirm && (
        <Modal
          title={confirm.kind === 'end' ? t('End this meeting?', 'إنهاء الاجتماع؟') : t('Delete this meeting?', 'حذف الاجتماع؟')}
          onClose={() => setConfirm(null)}
          footer={<><button type="button" className="ad-btn" onClick={() => setConfirm(null)}>{t('Cancel', 'إلغاء')}</button><button type="button" className="ad-btn ad-btn--danger" disabled={busy} onClick={go}>{confirm.kind === 'end' ? t('End now', 'إنهاء الآن') : t('Delete', 'حذف')}</button></>}
        >
          <p><b>{confirm.m.title || confirm.m.meeting_code}</b></p>
        </Modal>
      )}
    </>
  );
}
