import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, Switch, useT } from '../ui';
import { PageHead } from '../widgets';

const human = (k) => k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** One policy: edits every field of its JSON value with a control that matches the field's type. */
function PolicyCard({ p, onSaved }) {
  const { t, ar } = useT();
  const [val, setVal] = useState(p.value);
  const [msg, setMsg] = useState({});
  const [busy, setBusy] = useState(false);
  const [raw, setRaw] = useState({}); // text for list / object fields while typing
  const dirty = JSON.stringify(val) !== JSON.stringify(p.value);
  const set = (k, v) => setVal((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true); setMsg({});
    try {
      const out = { ...val };
      for (const [k, txt] of Object.entries(raw)) {
        if (Array.isArray(p.value[k])) out[k] = txt.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean).map((x) => (typeof p.value[k][0] === 'number' ? Number(x) : x));
        else out[k] = JSON.parse(txt);
      }
      const j = await api.put(`/api/v1/admin/policies/${p.key}`, { value: out });
      setMsg({ ok: t('Saved', 'تم الحفظ') }); setRaw({}); onSaved(p.key, j.data || out);
    } catch (e) { setMsg({ error: e instanceof SyntaxError ? t('One of the fields is not valid JSON.', 'واحدة من الخانات مش JSON صحيح.') : errorMessage(e) }); }
    finally { setBusy(false); }
  }

  return (
    <div className="ad-card">
      <h2>{ar ? p.title_ar : p.title_en}</h2>
      <Notice error={msg.error} ok={msg.ok} />
      {Object.entries(val).map(([k, v]) => {
        if (typeof v === 'boolean') {
          return <div key={k} className="ad-switchrow"><div><b>{human(k)}</b></div><Switch checked={v} label={human(k)} disabled={busy} onChange={(x) => set(k, x)} /></div>;
        }
        return (
          <label key={k} className="ad-field" style={{ marginTop: 10 }}>{human(k)}
            {typeof v === 'number'
              ? <input className="ad-input" type="number" value={v} onChange={(e) => set(k, e.target.value === '' ? 0 : Number(e.target.value))} />
              : typeof v === 'string'
                ? <input className="ad-input" value={v} onChange={(e) => set(k, e.target.value)} />
                : <textarea className="ad-input" rows={Array.isArray(v) ? 2 : 4} dir="ltr" style={{ padding: 10, fontFamily: 'monospace' }}
                    value={raw[k] ?? (Array.isArray(v) ? v.join(', ') : JSON.stringify(v, null, 2))} onChange={(e) => setRaw((s) => ({ ...s, [k]: e.target.value }))} />}
          </label>
        );
      })}
      <div style={{ marginTop: 14 }}><button type="button" className="ad-btn ad-btn--primary" disabled={busy || (!dirty && !Object.keys(raw).length)} onClick={save}>{t('Save policy', 'حفظ السياسة')}</button></div>
    </div>
  );
}

export default function Policies() {
  const { t } = useT();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/api/v1/admin/policies').then((j) => setRows(j.data || [])).catch((e) => setError(errorMessage(e))); }, []);
  if (error) return <Notice error={error} />;
  if (!rows) return <Empty loading />;
  const onSaved = (key, value) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, value } : r)));
  return (
    <>
      <PageHead title={t('Security policies', 'سياسات الأمان')} sub={t('Passwords, lockout, sessions, two-factor, uploads and device rules. Changes apply to the next sign-in or upload and are written to the audit log.', 'كلمات السر والقفل والجلسات والتحقق بخطوتين والرفع وقواعد الأجهزة. التغييرات بتتطبق من أول دخول أو رفع جديد وبتتسجل في سجل التدقيق.')} />
      <div className="ad-three">{rows.map((p) => <PolicyCard key={p.key} p={p} onSaved={onSaved} />)}</div>
    </>
  );
}
