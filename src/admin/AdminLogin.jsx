import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '../context/AuthContext';
import { api, errorMessage } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import './admin.css';

/** Admin sign-in: /admin/login. Uses the normal login API, then lets only role "admin" through. */
export default function AdminLogin() {
  const { locale, toggleLocale } = useLanguage();
  const t = (en, ar) => (locale === 'ar' ? ar : en);
  const { login, logout, user, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated' && user?.role === 'admin') return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const r = await login(email.trim(), password);
      if (r.requiresTwoFactor) { navigate('/auth/two-factor', { state: { challengeToken: r.challengeToken } }); return; }
      if (r.role !== 'admin') {
        await logout().catch(() => {});
        setError(t('This account is not an administrator.', 'هذا الحساب ليس حساب أدمن.'));
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? errorMessage(err) : t('Something went wrong. Try again.', 'حصلت مشكلة. جرّب تاني.'));
    } finally { setBusy(false); }
  }
  void api;

  return (
    <div className="adl">
      <section className="adl__art">
        <div className="adl__top"><img src="/images/logo/uip-mark.png" alt="" /> Palora</div>
        <div>
          <h2>{t('Run the whole platform from one place', 'أدِر المنصة كلها من مكان واحد')}</h2>
          <p>{t('Users, chats, meetings, reports, security logs and platform switches.', 'المستخدمين، المحادثات، الاجتماعات، البلاغات، سجلات الأمان وإعدادات المنصة.')}</p>
        </div>
        <ul className="adl__feat">
          <li><Icon name="users" size={20} />{t('Create, suspend and unlock accounts', 'إنشاء الحسابات وإيقافها وفك القفل')}</li>
          <li><Icon name="video" size={20} />{t('End live meetings instantly', 'إنهاء الاجتماعات الجارية فورًا')}</li>
          <li><Icon name="shield" size={20} />{t('Maintenance mode and sign-up control', 'وضع الصيانة والتحكم في التسجيل')}</li>
        </ul>
      </section>
      <section className="adl__form">
        <form className="adl__card" onSubmit={submit}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="adl__top"><img src="/images/logo/uip-mark.png" alt="" /> {t('Admin', 'الإدارة')}</div>
            <button type="button" className="adl__lang" onClick={toggleLocale}>{locale === 'ar' ? 'EN' : 'ع'}</button>
          </div>
          <h1>{t('Admin sign in', 'دخول الأدمن')}</h1>
          <p className="sub">{t('Administrators only.', 'للمشرفين فقط.')}</p>
          {error && <div className="adl__err" role="alert">{error}</div>}
          <label>{t('Email', 'البريد الإلكتروني')}
            <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label>{t('Password', 'كلمة السر')}
            <input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <button className="adl__btn" disabled={busy}>{busy ? t('Signing in…', 'جارٍ الدخول…') : t('Sign in', 'تسجيل الدخول')}</button>
        </form>
      </section>
    </div>
  );
}
