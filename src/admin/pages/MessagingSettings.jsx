import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Notice, useT } from '../ui';
import { NumberField, PageHead } from '../widgets';

export default function MessagingSettings() {
  const { t } = useT();
  const [d, setD] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const apply = (data) => { setD(data); setForm(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v.value)]))); };
  useEffect(() => { api.get('/api/v1/admin/messaging/settings').then((j) => apply(j.data)).catch((e) => setMsg({ error: errorMessage(e) })); }, []);
  if (!d) return msg.error ? <Notice error={msg.error} /> : <Empty loading />;

  const L = {
    max_message_length: [t('Max message length', 'أقصى طول للرسالة'), t('characters', 'حرف')],
    max_attachments_per_message: [t('Attachments per message', 'عدد المرفقات في الرسالة'), t('files', 'ملف')],
    edit_window_minutes: [t('Edit window', 'مدة السماح بالتعديل'), t('minutes · 0 = no limit', 'دقيقة · 0 = بلا حد')],
    delete_for_everyone_window_minutes: [t('Delete-for-everyone window', 'مدة الحذف للجميع'), t('minutes · 0 = not allowed', 'دقيقة · 0 = غير مسموح')],
    undo_send_window_seconds: [t('Undo-send window', 'مدة التراجع عن الإرسال'), t('seconds · 0 = off', 'ثانية · 0 = متوقف')],
  };
  async function save(patch) {
    setBusy(true); setMsg({});
    try { const j = await api.put('/api/v1/admin/messaging/settings', patch); apply(j.data); setMsg({ ok: t('Saved — applies within a minute', 'تم الحفظ — بيتطبق خلال دقيقة') }); }
    catch (e) { setMsg({ error: errorMessage(e) }); }
    finally { setBusy(false); }
  }
  return (
    <>
      <PageHead title={t('Messaging settings', 'إعدادات الرسائل')} sub={t('Limits applied to every chat. Leave a field empty and save to go back to the default.', 'حدود بتتطبق على كل المحادثات. سيب الخانة فاضية واحفظ عشان ترجع للقيمة الافتراضية.')} />
      <Notice error={msg.error} ok={msg.ok} />
      <div className="ad-card">
        <div className="ad-formgrid">
          {Object.entries(d).map(([k, f]) => (
            <NumberField key={k} label={<>{L[k]?.[0] || k} {f.custom && <Badge tone="brand">{t('custom', 'معدّل')}</Badge>}</>}
              hint={`${L[k]?.[1] || ''} · ${t('default', 'الافتراضي')} ${f.default} · ${f.min}–${f.max}`}
              min={f.min} max={f.max} value={form[k]} onChange={(v) => setForm((s) => ({ ...s, [k]: v }))} />
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="ad-btn ad-btn--primary" disabled={busy} onClick={() => save(form)}>{t('Save', 'حفظ')}</button>
          <button type="button" className="ad-btn" disabled={busy} onClick={() => save(Object.fromEntries(Object.keys(d).map((k) => [k, ''])))}>{t('Reset to defaults', 'استرجاع الافتراضي')}</button>
        </div>
      </div>
    </>
  );
}
