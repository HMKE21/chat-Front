import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';
import { PageHead } from '../widgets';

function deviceOf(r) {
  if (r.device_label) return r.device_label;
  const ua = r.user_agent || '';
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iOS/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return [br, os].filter(Boolean).join(' · ') || '—';
}

export default function Sessions() {
  const { t, locale } = useT();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error, reload } = useList('/api/v1/admin/sessions', { q: dq, page, per_page: 20 });
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(null);
  async function revoke(r) {
    if (!window.confirm(t('Sign this device out?', 'تسجيل خروج الجهاز ده؟'))) return;
    setBusy(r.id); setMsg({});
    try { await api.post(`/api/v1/admin/sessions/${r.id}/revoke`); setMsg({ ok: t('Session revoked', 'تم إنهاء الجلسة') }); reload(); }
    catch (e) { setMsg({ error: errorMessage(e) }); }
    finally { setBusy(null); }
  }
  return (
    <>
      <PageHead title={t('Active sessions', 'الجلسات النشطة')} sub={t('Every signed-in device right now. Revoking signs that device out.', 'كل جهاز مسجّل دخول دلوقتي. إنهاء الجلسة بيطرد الجهاز ده.')} />
      <div className="ad-toolbar"><input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search name, email or IP…', 'ابحث بالاسم أو الإيميل أو IP…')} /></div>
      <Notice error={error || msg.error} ok={msg.ok} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('User', 'المستخدم')}</th><th>{t('Device', 'الجهاز')}</th><th>IP</th><th>{t('Last active', 'آخر نشاط')}</th><th /></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td data-label={t('User', 'المستخدم')}><div className="ad-cell-main"><b>{r.user_name}</b><small dir="ltr">{r.user_email}</small></div></td>
                    <td data-label={t('Device', 'الجهاز')}><div className="ad-cell-main"><b>{deviceOf(r)}</b>{r.location_label && <small>{r.location_label}</small>}</div></td>
                    <td data-label="IP" dir="ltr">{r.ip_address || '—'}</td>
                    <td data-label={t('Last active', 'آخر نشاط')}>{fmtDate(r.last_activity_at, locale)}</td>
                    <td className="actions-cell"><div className="actions"><button type="button" className="ad-btn ad-btn--sm ad-btn--danger" disabled={busy === r.id} onClick={() => revoke(r)}>{t('Revoke', 'إنهاء')}</button></div></td>
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
