import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import '../admin/admin.css';
import Icon from '../components/Icon';
import { Avatar, Badge } from '../admin/ui';
import { REPORT_REASONS, REPORT_STATUSES, reasonLabel, statusMeta } from '../components/messaging/safety';

/**
 * Chat reports follow-up queue — one page for three portals:
 *   /admin/chat-reports       → every report on the platform
 *   /university/chat-reports  → reports about people of this university
 *   /faculty/chat-reports     → reports about people of this faculty
 * Data: GET /api/v1/chat-reports, POST /api/v1/chat-reports/{id}/status
 * (the backend scopes the list by role, so the page never filters by itself).
 */

const ROLE_LABELS = {
  student: ['Student', 'طالب'], university: ['University', 'جامعة'], faculty: ['Faculty', 'كلية'], supervisor: ['Supervisor', 'مشرف'],
  academic_staff: ['Academic staff', 'عضو هيئة تدريس'], admin: ['Admin', 'مدير'], security_admin: ['Security', 'أمان'],
  security_officer: ['Security', 'أمان'], data_analyst: ['Data analyst', 'محلل بيانات'],
};

export default function ChatReports() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const ar = locale === 'ar';
  const t = (en, arText) => (ar ? arText : en);
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState({ items: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});
  const [deleteMsg, setDeleteMsg] = useState({});
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const h = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(h);
  }, [q]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (status) params.status = status;
    if (reason) params.reason = reason;
    if (debouncedQ) params.q = debouncedQ;
    api.get('/api/v1/chat-reports', params)
      .then((json) => setData(json.data || { items: [], counts: {} }))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [status, reason, debouncedQ]);

  useEffect(() => { load(); }, [load]);

  async function update(r, nextStatus) {
    const wantsDelete = isAdmin && !!deleteMsg[r.id] && !!r.message_id;
    if (wantsDelete && !window.confirm(t('Delete the reported message for everyone?', 'حذف الرسالة المبلَّغ عنها للجميع؟'))) return;
    setBusyId(r.id);
    setActionError(null);
    try {
      await api.post(`/api/v1/chat-reports/${r.id}/status`, {
        status: nextStatus,
        notes: notes[r.id] || '',
        ...(wantsDelete ? { action: 'delete_message' } : {}),
      });
      load();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const counts = data.counts || {};
  const total = useMemo(() => REPORT_STATUSES.reduce((n, s) => n + (counts[s.key] || 0), 0), [counts]);
  const roleName = (slug) => { const r = ROLE_LABELS[slug]; return r ? (ar ? r[1] : r[0]) : (slug || ''); };
  const fmtDate = (v) => (v || '').slice(0, 16).replace('T', ' ');

  const scopeNote = isAdmin
    ? t('All chat reports across the platform.', 'كل بلاغات الشات على مستوى المنصة.')
    : user?.role === 'faculty'
      ? t('Chat reports about people of your faculty.', 'بلاغات الشات الخاصة بأفراد كليتك.')
      : t('Chat reports about people of your university.', 'بلاغات الشات الخاصة بأفراد جامعتك.');

  const TONE = { pending: 'warn', reviewing: 'brand', resolved: 'ok', dismissed: '' };
  const STAT_TONE = { pending: 'warn', reviewing: 'violet', resolved: 'ok', dismissed: '' };

  return (
    <div className="ad ad-embed">
      <div className="ad-page">
        <div className="ad-pagehead">
          <div>
            <h2 className="ad-embed__title">{t('Chat Reports', 'بلاغات الشات')}</h2>
            <p>{scopeNote}</p>
          </div>
        </div>

        <div className="ad-stats">
          <button type="button" className={`ad-card ad-stat ad-stat--btn${status === '' ? ' is-on' : ''}`} onClick={() => setStatus('')}>
            <span>{t('All', 'الكل')}</span><b>{total}</b>
          </button>
          {REPORT_STATUSES.map((s) => (
            <button key={s.key} type="button" className={`ad-card ad-stat ad-stat--btn${STAT_TONE[s.key] ? ` ad-stat--${STAT_TONE[s.key]}` : ''}${status === s.key ? ' is-on' : ''}`} onClick={() => setStatus(status === s.key ? '' : s.key)}>
              <span>{ar ? s.ar : s.en}</span><b>{counts[s.key] || 0}</b>
            </button>
          ))}
        </div>

        <div className="ad-toolbar">
          <input className="ad-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search names, emails, message text…', 'ابحث بالاسم أو الإيميل أو نص الرسالة…')} />
          <select className="ad-select" value={reason} onChange={(e) => setReason(e.target.value)} aria-label={t('Reason', 'السبب')}>
            <option value="">{t('All reasons', 'كل الأسباب')}</option>
            {REPORT_REASONS.map((r) => <option key={r.key} value={r.key}>{ar ? r.ar : r.en}</option>)}
          </select>
        </div>

        {actionError && <div className="ad-alert" role="alert">{actionError}</div>}
        {error && <div className="ad-alert" role="alert">{error}</div>}
        {loading && !data.items.length && (
          <div className="ad-card" role="status" aria-label={t('Loading…', 'جارٍ التحميل…')} style={{ display: 'grid', gap: 12 }}>
            {[0, 1, 2].map((i) => <div key={i} className="ad-skel" style={{ height: 44, opacity: 1 - i * 0.25 }} />)}
          </div>
        )}

        {!loading && !error && data.items.length === 0 && (
          <div className="ad-card ad-empty">
            <span className="ad-empty__ic"><Icon name="check-circle" size={24} /></span>
            <span>{t('No reports here. Nothing needs review.', 'لا توجد بلاغات. مفيش حاجة محتاجة مراجعة.')}</span>
          </div>
        )}

        {!error && data.items.map((r) => {
          const busy = busyId === r.id;
          const st = statusMeta(r.status);
          const open = r.status === 'pending' || r.status === 'reviewing';
          return (
            <article key={r.id} className="ad-card">
              <div className="ad-report">
                <div className="ad-report__main">
                  <div className="ad-badges">
                    <Badge tone={TONE[r.status]}>{ar ? st.ar : st.en}</Badge>
                    <Badge>{reasonLabel(r.reason, locale)}</Badge>
                    <Badge>{r.message_id ? t('Message', 'رسالة') : t('User', 'مستخدم')}</Badge>
                    {r.reported_total_reports > 1 && <Badge tone="warn">{t(`${r.reported_total_reports} reports on this person`, `${r.reported_total_reports} بلاغات على هذا الشخص`)}</Badge>}
                  </div>
                  <div className="ad-report__who">
                    <Avatar name={r.reported_name} />
                    <div className="ad-cell-main">
                      <b>{r.reported_name}{roleName(r.reported_role) && <span className="ad-muted"> · {roleName(r.reported_role)}</span>}</b>
                      <small dir="ltr">{r.reported_email}</small>
                    </div>
                  </div>
                  <small>{t('Reported by', 'المُبلِّغ')} {r.reporter_name}{roleName(r.reporter_role) ? ` (${roleName(r.reporter_role)})` : ''} · {fmtDate(r.created_at)}</small>
                  {r.message_snapshot && <blockquote>{r.message_snapshot}</blockquote>}
                  {r.details && <p className="ad-muted"><b>{t('Reporter says:', 'قال المُبلِّغ:')}</b> {r.details}</p>}
                  {r.reviewed_at && (
                    <small>{t('Last update by', 'آخر تحديث بواسطة')} {r.reviewer_name || '—'} · {fmtDate(r.reviewed_at)}{r.resolution_notes ? ` — ${r.resolution_notes}` : ''}</small>
                  )}
                  {isAdmin && r.conversation_id && (
                    <Link className="ad-btn ad-btn--sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} to={`/admin/messaging/oversight/${r.conversation_id}`}>{t('Open the conversation', 'فتح المحادثة')}</Link>
                  )}
                </div>

                <div className="ad-report__side">
                  <input className="ad-input" type="text" maxLength={1000} placeholder={t('Notes (shown to the reporter)', 'ملاحظات (تظهر للمُبلِّغ)')} value={notes[r.id] ?? ''} onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))} />
                  {r.can_delete_message && open && (
                    <label className="ad-check"><input type="checkbox" checked={!!deleteMsg[r.id]} onChange={(e) => setDeleteMsg((p) => ({ ...p, [r.id]: e.target.checked }))} />{t('Also delete the message', 'احذف الرسالة أيضًا')}</label>
                  )}
                  {r.status === 'pending' && <button type="button" className="ad-btn" disabled={busy} onClick={() => update(r, 'reviewing')}>{t('Start review', 'بدء المراجعة')}</button>}
                  {open && (
                    <>
                      <button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={() => update(r, 'resolved')}>{t('Resolve', 'تمت المعالجة')}</button>
                      <button type="button" className="ad-btn ad-btn--danger" disabled={busy} onClick={() => update(r, 'dismissed')}>{t('Dismiss', 'رفض البلاغ')}</button>
                    </>
                  )}
                  {!open && <button type="button" className="ad-btn" disabled={busy} onClick={() => update(r, 'reviewing')}>{t('Reopen', 'إعادة فتح')}</button>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
