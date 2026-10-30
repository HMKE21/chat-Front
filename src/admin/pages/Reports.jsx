import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { REPORT_REASONS, REPORT_STATUSES, reasonLabel, statusMeta } from '../../components/messaging/safety';
import { Badge, Empty, Notice, fmtDate, useDebounced, useT } from '../ui';

const TONE = { pending: 'warn', reviewing: 'brand', resolved: 'ok', dismissed: '' };

export default function Reports() {
  const { t, ar, locale } = useT();
  const [data, setData] = useState({ items: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [q, setQ] = useState('');
  const [notes, setNotes] = useState({});
  const [del, setDel] = useState({});
  const [busyId, setBusyId] = useState(null);
  const dq = useDebounced(q);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    const params = {};
    if (status) params.status = status;
    if (reason) params.reason = reason;
    if (dq.trim()) params.q = dq.trim();
    api.get('/api/v1/chat-reports', params).then((j) => setData(j.data || { items: [], counts: {} })).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false));
  }, [status, reason, dq]);
  useEffect(() => { load(); }, [load]);

  async function update(r, next) {
    const wantsDelete = !!del[r.id] && !!r.message_id;
    if (wantsDelete && !window.confirm(t('Delete the reported message for everyone?', 'حذف الرسالة المبلَّغ عنها للجميع؟'))) return;
    setBusyId(r.id);
    try {
      await api.post(`/api/v1/chat-reports/${r.id}/status`, { status: next, notes: notes[r.id] || '', ...(wantsDelete ? { action: 'delete_message' } : {}) });
      load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusyId(null); }
  }

  const counts = data.counts || {};
  const total = REPORT_STATUSES.reduce((n, s) => n + (counts[s.key] || 0), 0);
  const items = data.items || [];

  return (
    <>
      <div className="ad-stats">
        <button type="button" className={`ad-card ad-stat ad-stat--btn${status === '' ? ' is-on' : ''}`} onClick={() => setStatus('')}><span>{t('All', 'الكل')}</span><b>{total}</b></button>
        {REPORT_STATUSES.map((s) => (
          <button key={s.key} type="button" className={`ad-card ad-stat ad-stat--btn${status === s.key ? ' is-on' : ''}`} onClick={() => setStatus(status === s.key ? '' : s.key)}><span>{ar ? s.ar : s.en}</span><b>{counts[s.key] || 0}</b></button>
        ))}
      </div>
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search names, emails, message text…', 'ابحث بالاسم أو الإيميل أو نص الرسالة…')} />
        <select className="ad-select" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="reason">
          <option value="">{t('All reasons', 'كل الأسباب')}</option>
          {REPORT_REASONS.map((r) => <option key={r.key} value={r.key}>{ar ? r.ar : r.en}</option>)}
        </select>
      </div>
      <Notice error={error} />
      {!items.length ? <div className="ad-card"><Empty loading={loading}>{t('No reports.', 'لا توجد بلاغات.')}</Empty></div> : items.map((r) => {
        const st = statusMeta(r.status);
        const open = r.status === 'pending' || r.status === 'reviewing';
        const busy = busyId === r.id;
        return (
          <div key={r.id} className="ad-card ad-report">
            <div className="ad-report__main">
              <div className="ad-badges">
                <Badge tone={TONE[r.status]}>{ar ? st.ar : st.en}</Badge>
                <Badge>{reasonLabel(r.reason, locale)}</Badge>
                {r.reported_total_reports > 1 && <Badge tone="warn">{r.reported_total_reports} {t('reports on this person', 'بلاغات على هذا الشخص')}</Badge>}
              </div>
              <p><b>{r.reported_name}</b> <small dir="ltr">{r.reported_email}</small></p>
              <small>{t('Reported by', 'المُبلِّغ')} {r.reporter_name} · {(r.created_at || '').slice(0, 16).replace('T', ' ')}</small>
              {r.message_snapshot && <blockquote>{r.message_snapshot}</blockquote>}
              {r.details && <p className="ad-muted">{r.details}</p>}
              {r.reviewed_at && <small>{t('Last update by', 'آخر تحديث بواسطة')} {r.reviewer_name || '—'}{r.resolution_notes ? ` — ${r.resolution_notes}` : ''}</small>}
            </div>
            <div className="ad-report__side">
              <input className="ad-input" maxLength={1000} placeholder={t('Notes (shown to the reporter)', 'ملاحظات (تظهر للمُبلِّغ)')} value={notes[r.id] ?? ''} onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))} />
              {r.can_delete_message && open && <label className="ad-check"><input type="checkbox" checked={!!del[r.id]} onChange={(e) => setDel((p) => ({ ...p, [r.id]: e.target.checked }))} />{t('Also delete the message', 'احذف الرسالة أيضًا')}</label>}
              {r.status === 'pending' && <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => update(r, 'reviewing')}>{t('Start review', 'بدء المراجعة')}</button>}
              {open ? <>
                <button type="button" className="ad-btn ad-btn--sm ad-btn--primary" disabled={busy} onClick={() => update(r, 'resolved')}>{t('Resolve', 'تمت المعالجة')}</button>
                <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => update(r, 'dismissed')}>{t('Dismiss', 'رفض البلاغ')}</button>
              </> : <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => update(r, 'reviewing')}>{t('Reopen', 'إعادة فتح')}</button>}
            </div>
          </div>
        );
      })}
    </>
  );
}
