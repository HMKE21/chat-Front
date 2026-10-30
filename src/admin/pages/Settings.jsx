import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, Switch, useT } from '../ui';

export default function Settings() {
  const { t } = useT();
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/api/v1/admin/settings').then((j) => setS(j.data)).catch((e) => setMsg({ error: errorMessage(e) })); }, []);

  async function save(patch, okText) {
    setBusy(true); setMsg({});
    try { const j = await api.put('/api/v1/admin/settings', patch); setS(j.data); setMsg({ ok: okText || t('Saved', 'تم الحفظ') }); }
    catch (e) { setMsg({ error: errorMessage(e) }); }
    finally { setBusy(false); }
  }
  if (!s) return msg.error ? <Notice error={msg.error} /> : <Empty loading />;

  const rows = [
    ['maintenance_mode', t('Maintenance mode', 'وضع الصيانة'), t('Only admins can sign in while it is on.', 'الأدمن فقط يقدر يدخل وهو شغال.')],
    ['registration_enabled', t('Open registration', 'التسجيل مفتوح'), t('Let new people create accounts.', 'السماح للناس الجديدة بإنشاء حسابات.')],
    ['persistent_login', t('Stay signed in', 'البقاء مسجّل الدخول'), t('Keep users signed in between visits.', 'إبقاء المستخدمين مسجّلين بين الزيارات.')],
    ['animations_enabled', t('Animations', 'الحركات'), t('Interface animations for everyone.', 'حركات الواجهة للجميع.')],
  ];
  return (
    <>
      <Notice error={msg.error} ok={msg.ok} />
      <div className="ad-card">
        <h2>{t('Platform switches', 'مفاتيح المنصة')}</h2>
        {rows.map(([k, title, sub]) => (
          <div key={k} className="ad-switchrow">
            <div><b>{title}</b><small>{sub}</small></div>
            <Switch checked={s[k]} label={title} disabled={busy} onChange={(v) => save({ [k]: v })} />
          </div>
        ))}
      </div>
      <div className="ad-card">
        <h2>{t('Notifications cleanup', 'تنظيف الإشعارات')}</h2>
        <div className="ad-row2">
          <label className="ad-field">{t('Auto-archive after (days, 0 = off)', 'أرشفة تلقائية بعد (يوم، 0 = إيقاف)')}
            <input className="ad-input" type="number" min="0" max="3650" value={s.notification_auto_archive_days} onChange={(e) => setS({ ...s, notification_auto_archive_days: e.target.value })} /></label>
          <label className="ad-field">{t('Auto-delete after (days, 0 = off)', 'حذف تلقائي بعد (يوم، 0 = إيقاف)')}
            <input className="ad-input" type="number" min="0" max="3650" value={s.notification_auto_delete_days} onChange={(e) => setS({ ...s, notification_auto_delete_days: e.target.value })} /></label>
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={() => save({ notification_auto_archive_days: Number(s.notification_auto_archive_days) || 0, notification_auto_delete_days: Number(s.notification_auto_delete_days) || 0 })}>{t('Save', 'حفظ')}</button>
        </div>
      </div>
    </>
  );
}
