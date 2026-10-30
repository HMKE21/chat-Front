import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import { Avatar, Badge } from '../admin/ui';
import '../admin/admin.css';

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

  const MODES = [['light', L('Light', 'فاتح')], ['classic', L('Classic', 'كلاسيك')], ['dark', L('Dark', 'داكن')]];
  const shownName = name || user?.full_name || user?.email || '';

  return (
    <div className="ad ad-embed">
      <div className="ad-page ad-page--narrow">
        <div className="ad-pagehead">
          <div><h2 className="ad-embed__title">{L('Settings', 'الإعدادات')}</h2><p>{L('Your profile, look and signed-in devices.', 'ملفك الشخصي والمظهر والأجهزة المسجّل دخولك منها.')}</p></div>
        </div>

        <form className="ad-card" onSubmit={save}>
          <div className="ad-card__head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={shownName} />
              <div className="ad-cell-main"><b>{shownName}</b><small dir="ltr">{user?.email}</small></div>
            </div>
          </div>
          <div className="ad-formgrid">
            <label className="ad-field">{L('Name', 'الاسم')}<input className="ad-input" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required /></label>
            <label className="ad-field">{L('Phone', 'الموبايل')}<input className="ad-input" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          </div>
          {msg && <div className={`ad-alert${msg.ok ? ' ad-alert--ok' : ''}`} role={msg.ok ? 'status' : 'alert'} style={{ marginTop: 14 }}>{msg.text}</div>}
          <div style={{ marginTop: 16 }}><button className="ad-btn ad-btn--primary" type="submit">{L('Save changes', 'حفظ التغييرات')}</button></div>
        </form>

        <section className="ad-card">
          <div className="ad-card__head"><div><h2>{L('Appearance & language', 'المظهر واللغة')}</h2></div></div>
          <div className="ad-set-row">
            <span className="ad-muted">{L('Theme', 'المظهر')}</span>
            <div className="ad-tabs" role="group" aria-label={L('Theme', 'المظهر')}>
              {MODES.map(([m, label]) => <button key={m} type="button" className={`ad-tab${mode === m ? ' is-on' : ''}`} aria-pressed={mode === m} onClick={() => setMode(m)}>{label}</button>)}
            </div>
          </div>
          <div className="ad-set-row">
            <span className="ad-muted">{L('Language', 'اللغة')}</span>
            <div className="ad-tabs" role="group" aria-label={L('Language', 'اللغة')}>
              {['en', 'ar'].map((l) => <button key={l} type="button" className={`ad-tab${locale === l ? ' is-on' : ''}`} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l === 'ar' ? 'العربية' : 'English'}</button>)}
            </div>
          </div>
        </section>

        <Link to="/app/messages/settings" className="ad-card ad-set-link">
          <span className="ad-stat__ic"><Icon name="message-square" size={20} /></span>
          <div className="ad-cell-main"><b>{L('Chat settings', 'إعدادات الشات')}</b><small>{L('Privacy, wallpapers and notifications', 'الخصوصية والخلفيات والإشعارات')}</small></div>
          <Icon name="chevron-right" size={18} />
        </Link>

        <section className="ad-card">
          <div className="ad-card__head"><div><h2>{L('Devices', 'الأجهزة')}</h2><p>{L('Where you are signed in right now.', 'الأجهزة المسجّل دخولك منها حاليًا.')}</p></div></div>
          {sessions.length === 0 && <div className="ad-muted">{L('No other sessions.', 'مفيش جلسات تانية.')}</div>}
          <ul className="ad-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <span className="ad-stat__ic" style={{ margin: 0 }}><Icon name="monitor" size={18} /></span>
                <div className="grow"><b>{s.device_label || s.user_agent || `#${s.id}`}</b></div>
                {s.is_current ? <Badge tone="ok">{L('This device', 'الجهاز ده')}</Badge> : <button type="button" className="ad-btn ad-btn--sm ad-btn--danger" onClick={() => revoke(s.id)}>{L('Sign out', 'خروج')}</button>}
              </li>
            ))}
          </ul>
        </section>

        <div><button type="button" className="ad-btn ad-btn--danger" onClick={async () => { await logout(); navigate('/auth/login', { replace: true }); }}><Icon name="logout" size={16} />{L('Sign out', 'تسجيل الخروج')}</button></div>
      </div>
    </div>
  );
}
