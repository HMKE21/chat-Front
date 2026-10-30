import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Modal, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';
import { PageHead, Stats } from '../widgets';

const SEV = { info: '', warning: 'warn', high: 'bad', critical: 'bad' };
const ST = { open: 'bad', escalated: 'bad', acknowledged: 'warn', resolved: 'ok' };

/** view="alerts" lists everything; view="incidents" only high/critical or escalated. */
export default function Alerts({ view = 'alerts' }) {
  const { t, locale } = useT();
  const inc = view === 'incidents';
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error, reload } = useList('/api/v1/admin/alerts', { view, status, severity, q: dq, page, per_page: 15 });
  const [modal, setModal] = useState(null); // {alert, status}
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const counts = meta?.counts || {};

  async function send(alert, st, n) {
    setBusy(true); setMsg({});
    try { await api.post(`/api/v1/admin/alerts/${alert.id}/status`, { status: st, note: n }); setModal(null); setNote(''); reload(); }
    catch (e) { setMsg({ error: errorMessage(e) }); }
    finally { setBusy(false); }
  }
  const act = (a, st) => (st === 'acknowledged' ? send(a, st) : (setMsg({}), setNote(''), setModal({ alert: a, status: st })));

  return (
    <>
      <PageHead title={inc ? t('Incidents', 'الحوادث') : t('Security alerts', 'التنبيهات الأمنية')}
        sub={inc ? t('High and critical alerts, plus anything escalated.', 'التنبيهات العالية والحرجة وأي حاجة اتصعّدت.') : t('Raised automatically from failed sign-ins, lockouts, brute force and unusual sessions.', 'بتتولد تلقائي من محاولات الدخول الفاشلة والقفل والـ brute force والجلسات الغريبة.')} />
      <Stats items={[[t('Open', 'مفتوحة'), counts.open || 0], [t('Escalated', 'مصعّدة'), counts.escalated || 0], [t('Acknowledged', 'تم الاطلاع'), counts.acknowledged || 0], [t('Resolved', 'تم حلها'), counts.resolved || 0]]} />
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search title, IP or e-mail…', 'ابحث بالعنوان أو IP أو الإيميل…')} />
        <select className="ad-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="status">
          <option value="">{t('Any status', 'أي حالة')}</option>{['open', 'escalated', 'acknowledged', 'resolved'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="ad-select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }} aria-label="severity">
          <option value="">{t('Any severity', 'أي مستوى')}</option>{['info', 'warning', 'high', 'critical'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Notice error={error || (!modal && msg.error)} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading}>{t('All quiet — nothing to show.', 'كله هادي — مفيش حاجة تتعرض.')}</Empty> : rows.map((a) => (
          <div key={a.id} className="ad-alertcard">
            <div className="ad-alertcard__top">
              <b>{a.title}</b>
              <Badge tone={SEV[a.severity]}>{a.severity}</Badge><Badge tone={ST[a.status]}>{a.status}</Badge>
              {a.occurrences > 1 && <Badge>×{a.occurrences}</Badge>}
            </div>
            {a.message && <p className="ad-muted">{a.message}</p>}
            <small className="ad-muted">{a.user_name ? `${a.user_name} · ` : ''}<span dir="ltr">{a.source_ip || '—'}</span> · {a.type} · {fmtDate(a.created_at, locale)}</small>
            {(a.resolution_note || a.escalation_note) && <small className="ad-muted">“{a.resolution_note || a.escalation_note}”</small>}
            {a.status !== 'resolved' && (
              <div className="actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {a.status === 'open' && <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => act(a, 'acknowledged')}>{t('Acknowledge', 'اطّلعت')}</button>}
                {a.status !== 'escalated' && <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={() => act(a, 'escalated')}>{t('Escalate', 'تصعيد')}</button>}
                <button type="button" className="ad-btn ad-btn--sm ad-btn--primary" onClick={() => act(a, 'resolved')}>{t('Resolve', 'تم الحل')}</button>
              </div>
            )}
          </div>
        ))}
        <Pager meta={meta} page={page} setPage={setPage} />
      </div>
      {modal && (
        <Modal title={modal.status === 'resolved' ? t('Resolve alert', 'حل التنبيه') : t('Escalate alert', 'تصعيد التنبيه')} onClose={() => setModal(null)}
          footer={<><button type="button" className="ad-btn" onClick={() => setModal(null)}>{t('Cancel', 'إلغاء')}</button><button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={() => send(modal.alert, modal.status, note)}>{t('Confirm', 'تأكيد')}</button></>}>
          <Notice error={msg.error} />
          <p><b>{modal.alert.title}</b></p>
          <label className="ad-field">{t('Note (optional)', 'ملاحظة (اختياري)')}<input className="ad-input" maxLength={250} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        </Modal>
      )}
    </>
  );
}
