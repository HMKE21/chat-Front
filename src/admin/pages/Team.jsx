import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Field, Modal, Notice, fmtDate, useList, useT } from '../ui';
import { PageHead } from '../widgets';

export default function Team() {
  const { t, locale } = useT();
  const { rows, loading, error, reload } = useList('/api/v1/admin/users', { role: 'admin', per_page: 100 });
  const [modal, setModal] = useState(null); // {type:'add'|'demote', user?}
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function run(fn, ok) {
    setBusy(true); setMsg({});
    try { await fn(); setMsg({ ok }); setModal(null); reload(); }
    catch (e) { setMsg({ error: errorMessage(e), keep: true }); }
    finally { setBusy(false); }
  }
  const submit = () => (modal.type === 'add'
    ? run(() => api.post('/api/v1/admin/users', { name: form.name, email: form.email, password: form.password, role: 'admin' }), t('Admin added', 'تمت إضافة الأدمن'))
    : run(() => api.patch(`/api/v1/admin/users/${modal.user.id}`, { role: 'user' }), t('Role changed to user', 'تم تحويله لمستخدم عادي')));

  return (
    <>
      <PageHead title={t('Team', 'فريق الإدارة')} sub={t('Everyone who can open this panel. Keep it small and turn on two-factor for each person.', 'كل اللي يقدروا يفتحوا اللوحة دي. خليه صغير وفعّل التحقق بخطوتين للكل.')}
        actions={<button type="button" className="ad-btn ad-btn--primary" onClick={() => { setForm({}); setMsg({}); setModal({ type: 'add' }); }}>+ {t('Add admin', 'إضافة أدمن')}</button>} />
      <Notice error={error || (!modal && msg.error)} ok={!modal && msg.ok} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('Member', 'العضو')}</th><th>{t('Security', 'الأمان')}</th><th>{t('Last login', 'آخر دخول')}</th><th /></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td data-label={t('Member', 'العضو')}><div className="ad-cell-main"><b>{u.name}</b><small dir="ltr">{u.email}</small></div></td>
                    <td data-label={t('Security', 'الأمان')}>
                      <Badge tone={u.two_factor ? 'ok' : 'warn'}>{u.two_factor ? t('2FA on', '2FA مفعّل') : t('2FA off', '2FA متوقف')}</Badge>{' '}
                      <Badge tone={u.status === 'active' ? 'ok' : 'bad'}>{u.status}</Badge>{u.locked && <> <Badge tone="bad">{t('locked', 'مقفول')}</Badge></>}
                    </td>
                    <td data-label={t('Last login', 'آخر دخول')}>{fmtDate(u.last_login_at, locale)}</td>
                    <td className="actions-cell"><div className="actions">
                      <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={() => { setMsg({}); setModal({ type: 'demote', user: u }); }}>{t('Remove admin', 'سحب الصلاحية')}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <Modal title={modal.type === 'add' ? t('Add an admin', 'إضافة أدمن') : t('Remove admin access', 'سحب صلاحية الأدمن')} onClose={() => setModal(null)}
          footer={<><button type="button" className="ad-btn" onClick={() => setModal(null)}>{t('Cancel', 'إلغاء')}</button>
            <button type="button" className={`ad-btn ${modal.type === 'add' ? 'ad-btn--primary' : 'ad-btn--danger'}`} disabled={busy} onClick={submit}>{modal.type === 'add' ? t('Add', 'إضافة') : t('Remove', 'سحب')}</button></>}>
          <Notice error={msg.error} />
          {modal.type === 'add' ? (
            <>
              <Field label={t('Name', 'الاسم')}><input className="ad-input" value={form.name || ''} onChange={set('name')} /></Field>
              <Field label={t('Email', 'البريد الإلكتروني')}><input className="ad-input" type="email" dir="ltr" value={form.email || ''} onChange={set('email')} /></Field>
              <Field label={t('Password (min 8)', 'كلمة السر (8 على الأقل)')}><input className="ad-input" type="password" dir="ltr" autoComplete="new-password" value={form.password || ''} onChange={set('password')} /></Field>
            </>
          ) : <p><b>{modal.user.name}</b> {t('will become a regular user and lose access to this panel.', 'هيبقى مستخدم عادي ويفقد الدخول للوحة دي.')}</p>}
        </Modal>
      )}
    </>
  );
}
