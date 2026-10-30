import { useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Avatar, Badge, Empty, Field, Modal, Notice, Pager, fmtDate, useDebounced, useList, useT } from '../ui';

const STATUS_TONE = { active: 'ok', pending: 'warn', suspended: 'bad', banned: 'bad' };

export default function Users() {
  const { t, locale } = useT();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const { rows, meta, loading, error, reload } = useList('/api/v1/admin/users', { q: dq, role, status, page, per_page: 20 });
  const [modal, setModal] = useState(null); // {type:'create'|'edit'|'password'|'delete', user?}
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const open = (type, user) => { setMsg({}); setModal({ type, user }); setForm(user ? { name: user.name, phone: user.phone || '', role: user.role, status: user.status === 'banned' ? 'suspended' : user.status } : { role: 'user', status: 'active' }); };
  const close = () => setModal(null);

  async function run(fn, okText) {
    setBusy(true); setMsg({});
    try { await fn(); setMsg({ ok: okText }); reload(); return true; }
    catch (e) { setMsg({ error: errorMessage(e) }); return false; }
    finally { setBusy(false); }
  }
  const quick = (user, action, okText) => run(() => api.post(`/api/v1/admin/users/${user.id}/${action}`), okText);

  async function submit() {
    const { type, user } = modal;
    let ok = false;
    if (type === 'create') ok = await run(() => api.post('/api/v1/admin/users', form), t('User created', 'تم إنشاء المستخدم'));
    if (type === 'edit') ok = await run(() => api.patch(`/api/v1/admin/users/${user.id}`, { name: form.name, phone: form.phone, role: form.role, status: form.status }), t('Saved', 'تم الحفظ'));
    if (type === 'password') ok = await run(() => api.post(`/api/v1/admin/users/${user.id}/password`, { password: form.password }), t('Password changed', 'تم تغيير كلمة السر'));
    if (type === 'delete') ok = await run(() => api.del(`/api/v1/admin/users/${user.id}`), t('Deleted', 'تم الحذف'));
    if (ok) close();
  }

  return (
    <>
      <div className="ad-toolbar">
        <input className="ad-input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('Search name, email, phone…', 'ابحث بالاسم أو الإيميل أو الهاتف…')} />
        <select className="ad-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="role">
          <option value="">{t('All roles', 'كل الأدوار')}</option><option value="user">{t('User', 'مستخدم')}</option><option value="admin">{t('Admin', 'أدمن')}</option>
        </select>
        <select className="ad-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="status">
          <option value="">{t('All statuses', 'كل الحالات')}</option>
          {['active', 'pending', 'suspended', 'banned'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="button" className="ad-btn ad-btn--primary" onClick={() => open('create')}>+ {t('New user', 'مستخدم جديد')}</button>
      </div>
      <Notice error={error || msg.error} ok={!modal && msg.ok} />
      <div className="ad-card">
        {!rows.length ? <Empty loading={loading} /> : (
          <div className="ad-tablewrap">
            <table className="ad-table">
              <thead><tr><th>{t('User', 'المستخدم')}</th><th>{t('Role', 'الدور')}</th><th>{t('Status', 'الحالة')}</th><th>{t('Last login', 'آخر دخول')}</th><th /></tr></thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td data-label={t('User', 'المستخدم')}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Avatar name={u.name} /><div className="ad-cell-main"><b>{u.name}</b><small dir="ltr">{u.email}</small></div></div></td>
                    <td data-label={t('Role', 'الدور')}><Badge tone={u.role === 'admin' ? 'brand' : ''}>{u.role}</Badge></td>
                    <td data-label={t('Status', 'الحالة')}><Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>{u.locked && <> <Badge tone="bad">{t('locked', 'مقفول')}</Badge></>}{!u.verified && <> <Badge tone="warn">{t('unverified', 'غير مؤكد')}</Badge></>}</td>
                    <td data-label={t('Last login', 'آخر دخول')}>{fmtDate(u.last_login_at, locale)}</td>
                    <td className="actions-cell"><div className="actions">
                      <button type="button" className="ad-btn ad-btn--sm" onClick={() => open('edit', u)}>{t('Edit', 'تعديل')}</button>
                      <button type="button" className="ad-btn ad-btn--sm" onClick={() => open('password', u)}>{t('Password', 'كلمة السر')}</button>
                      {u.locked && <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => quick(u, 'unlock', t('Unlocked', 'تم فك القفل'))}>{t('Unlock', 'فك القفل')}</button>}
                      <button type="button" className="ad-btn ad-btn--sm" disabled={busy} onClick={() => quick(u, 'sign-out', t('Signed out everywhere', 'تم تسجيل الخروج من كل الأجهزة'))}>{t('Sign out', 'إخراج')}</button>
                      <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={() => open('delete', u)}>{t('Delete', 'حذف')}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} page={page} setPage={setPage} />
      </div>

      {modal && (
        <Modal
          title={{ create: t('New user', 'مستخدم جديد'), edit: t('Edit user', 'تعديل المستخدم'), password: t('Set a new password', 'تعيين كلمة سر جديدة'), delete: t('Delete user?', 'حذف المستخدم؟') }[modal.type]}
          onClose={close}
          footer={<><button type="button" className="ad-btn" onClick={close}>{t('Cancel', 'إلغاء')}</button>
            <button type="button" className={`ad-btn ${modal.type === 'delete' ? 'ad-btn--danger' : 'ad-btn--primary'}`} disabled={busy} onClick={submit}>{modal.type === 'delete' ? t('Delete', 'حذف') : t('Save', 'حفظ')}</button></>}
        >
          <Notice error={msg.error} />
          {modal.type === 'delete' && <p>{t('This removes', 'سيتم حذف')} <b>{modal.user.name}</b> {t('and signs them out. Continue?', 'وتسجيل خروجه. متأكد؟')}</p>}
          {modal.type === 'password' && (
            <Field label={t('New password (min 8)', 'كلمة السر الجديدة (8 على الأقل)')}><input className="ad-input" type="password" dir="ltr" autoComplete="new-password" value={form.password || ''} onChange={set('password')} /></Field>
          )}
          {(modal.type === 'create' || modal.type === 'edit') && (
            <>
              <Field label={t('Name', 'الاسم')}><input className="ad-input" value={form.name || ''} onChange={set('name')} /></Field>
              {modal.type === 'create' && <Field label={t('Email', 'البريد الإلكتروني')}><input className="ad-input" type="email" dir="ltr" value={form.email || ''} onChange={set('email')} /></Field>}
              {modal.type === 'create' && <Field label={t('Password (min 8)', 'كلمة السر (8 على الأقل)')}><input className="ad-input" type="password" dir="ltr" autoComplete="new-password" value={form.password || ''} onChange={set('password')} /></Field>}
              <Field label={t('Phone', 'الهاتف')}><input className="ad-input" dir="ltr" value={form.phone || ''} onChange={set('phone')} /></Field>
              <div className="ad-row2">
                <Field label={t('Role', 'الدور')}><select className="ad-select" value={form.role} onChange={set('role')}><option value="user">user</option><option value="admin">admin</option></select></Field>
                <Field label={t('Status', 'الحالة')}><select className="ad-select" value={form.status} onChange={set('status')}><option value="active">active</option><option value="pending">pending</option><option value="suspended">suspended</option></select></Field>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
