import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, useT } from '../ui';
import { NumberField, PageHead, Stats } from '../widgets';

export default function NotificationSettings() {
  const { t } = useT();
  const [d, setD] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const apply = (data) => { setD(data); setForm({ auto_archive_days: String(data.auto_archive_days), auto_delete_days: String(data.auto_delete_days) }); };
  useEffect(() => { api.get('/api/v1/admin/notifications/settings').then((j) => apply(j.data)).catch((e) => setMsg({ error: errorMessage(e) })); }, []);
  if (!d) return msg.error ? <Notice error={msg.error} /> : <Empty loading />;
  async function save() {
    setBusy(true); setMsg({});
    try { const j = await api.put('/api/v1/admin/notifications/settings', { auto_archive_days: Number(form.auto_archive_days) || 0, auto_delete_days: Number(form.auto_delete_days) || 0 }); apply(j.data); setMsg({ ok: t('Saved', 'تم الحفظ') }); }
    catch (e) { setMsg({ error: errorMessage(e) }); }
    finally { setBusy(false); }
  }
  return (
    <>
      <PageHead title={t('Notification settings', 'إعدادات الإشعارات')} sub={t('How long notifications stay before they are archived or removed.', 'المدة اللي بتفضل فيها الإشعارات قبل ما تتأرشف أو تتحذف.')} />
      <Stats items={[
        [t('Total', 'الإجمالي'), d.stats.total], [t('Unread', 'غير مقروءة'), d.stats.unread],
        [t('Last 24h', 'آخر 24 ساعة'), d.stats.last_24h], [t('Push devices', 'أجهزة الإشعارات'), d.stats.push_devices],
      ]} />
      <Notice error={msg.error} ok={msg.ok} />
      <div className="ad-card">
        <h2>{t('Automatic clean-up', 'التنظيف التلقائي')}</h2>
        <div className="ad-formgrid">
          <NumberField label={t('Archive after (days)', 'أرشفة بعد (يوم)')} hint={t('0 = never', '0 = أبدًا')} min={0} max={3650} value={form.auto_archive_days} onChange={(v) => setForm((s) => ({ ...s, auto_archive_days: v }))} />
          <NumberField label={t('Delete after (days)', 'حذف بعد (يوم)')} hint={t('0 = never', '0 = أبدًا')} min={0} max={3650} value={form.auto_delete_days} onChange={(v) => setForm((s) => ({ ...s, auto_delete_days: v }))} />
        </div>
        <div style={{ marginTop: 16 }}><button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={save}>{t('Save', 'حفظ')}</button></div>
      </div>
    </>
  );
}
