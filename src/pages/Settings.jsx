import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const card = { background: 'var(--surface, #fff)', border: '1px solid var(--border, rgba(0,0,0,.08))', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 };
const input = { padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, rgba(0,0,0,.15))', font: 'inherit', background: 'transparent', color: 'inherit' };
const btn = { padding: '10px 16px', borderRadius: 10, border: 0, background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' };

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { locale, setLocale } = useLanguage();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const L = (en, ar) => (locale === 'ar' ? ar : en);
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/api/v1/auth/me').then((r) => { setName(r.data?.full_name || ''); setPhone(r.data?.phone || ''); }).catch(() => {});
    api.get('/api/v1/auth/sessions').then((r) => setSessions(Array.isArray(r.data) ? r.data : (r.data?.sessions || []))).catch(() => {});
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const r = await api.patch('/api/v1/auth/me', { name, phone: phone || null, preferred_language: locale });
      updateUser?.({ full_name: r.data?.full_name });
      setMsg({ ok: true, text: L('Saved.', 'تم الحفظ.') });
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) });
    }
  }

  async function revoke(id) {
    try { await api.del(`/api/v1/auth/sessions/${id}`); setSessions((s) => s.filter((x) => x.id !== id)); } catch { /* ignore */ }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ margin: 0 }}>{L('Settings', 'الإعدادات')}</h1>

      <form style={card} onSubmit={save}>
        <h3 style={{ margin: 0 }}>{L('Profile', 'الملف الشخصي')}</h3>
        <label>{L('Name', 'الاسم')}<input style={{ ...input, width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} minLength={2} required /></label>
        <label>{L('Phone', 'الموبايل')}<input style={{ ...input, width: '100%' }} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <div style={{ opacity: .7, fontSize: '.9rem' }} dir="ltr">{user?.email}</div>
        <button style={btn} type="submit">{L('Save', 'حفظ')}</button>
        {msg && <div style={{ color: msg.ok ? '#16a34a' : '#dc2626' }}>{msg.text}</div>}
      </form>

      <div style={card}>
        <h3 style={{ margin: 0 }}>{L('Appearance & language', 'المظهر واللغة')}</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['light', 'classic', 'dark'].map((m) => (
            <button key={m} type="button" style={{ ...btn, background: mode === m ? '#4f46e5' : 'rgba(99,102,241,.15)', color: mode === m ? '#fff' : 'inherit' }} onClick={() => setMode(m)}>{m}</button>
          ))}
          {['en', 'ar'].map((l) => (
            <button key={l} type="button" style={{ ...btn, background: locale === l ? '#4f46e5' : 'rgba(99,102,241,.15)', color: locale === l ? '#fff' : 'inherit' }} onClick={() => setLocale(l)}>{l === 'ar' ? 'العربية' : 'English'}</button>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: 0 }}>{L('Chat', 'الشات')}</h3>
        <Link to="/app/messages/settings">{L('Chat privacy, wallpapers & notifications', 'خصوصية الشات والخلفيات والإشعارات')}</Link>
      </div>

      <div style={card}>
        <h3 style={{ margin: 0 }}>{L('Devices', 'الأجهزة')}</h3>
        {sessions.length === 0 && <div style={{ opacity: .7 }}>{L('No other sessions.', 'مفيش جلسات تانية.')}</div>}
        {sessions.map((s) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <span>{s.device_label || s.user_agent || `#${s.id}`}{s.is_current ? ` (${L('this device', 'الجهاز ده')})` : ''}</span>
            {!s.is_current && <button type="button" style={{ ...btn, background: '#dc2626' }} onClick={() => revoke(s.id)}>{L('Sign out', 'خروج')}</button>}
          </div>
        ))}
      </div>

      <button type="button" style={{ ...btn, background: '#dc2626' }} onClick={async () => { await logout(); navigate('/auth/login', { replace: true }); }}>{L('Sign out', 'تسجيل الخروج')}</button>
    </div>
  );
}
