import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import AuthLayout from '../layouts/AuthLayout';
import { AuthField, PasswordField } from '../components/auth/AuthField';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';

export default function Register() {
  const { locale } = useLanguage();
  const L = (en, ar) => (locale === 'ar' ? ar : en);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.password_confirmation) {
      setError(L('Passwords do not match.', 'كلمتا السر غير متطابقتين.'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/v1/auth/register', { ...form, preferred_language: locale === 'ar' ? 'ar' : 'en' });
      if (res?.data?.requires_verification) {
        navigate('/auth/verify-email', { state: { email: form.email } });
      } else {
        navigate('/auth/login', { state: { success: res?.message || L('Account created. You can sign in now.', 'تم إنشاء الحساب. تقدر تسجّل الدخول.') } });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title={L('Create your account', 'أنشئ حسابك')} subtitle={L('It only takes a minute', 'هياخد دقيقة')} error={error}>
      <form onSubmit={handleSubmit}>
        <AuthField id="name" label={L('Full name', 'الاسم')} icon="user" value={form.name} onChange={set('name')} autoComplete="name" required autoFocus />
        <AuthField id="email" type="email" label={L('Email', 'البريد الإلكتروني')} icon="mail" ltr value={form.email} onChange={set('email')}
          placeholder="name@example.com" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required />
        <PasswordField id="password" label={L('Password', 'كلمة السر')} value={form.password} onChange={set('password')}
          placeholder="••••••••" autoComplete="new-password" minLength={8} required />
        <PasswordField id="password_confirmation" label={L('Confirm password', 'تأكيد كلمة السر')} value={form.password_confirmation}
          onChange={set('password_confirmation')} placeholder="••••••••" autoComplete="new-password" minLength={8} required />
        <button type="submit" className={`auth-btn ${submitting ? 'is-loading' : ''}`} disabled={submitting}>
          <span>{submitting ? L('Creating…', 'جارٍ الإنشاء…') : L('Create account', 'إنشاء الحساب')}</span>
          {!submitting && <span className="auth-dir-icon"><Icon name="arrow-right" size={18} /></span>}
        </button>
      </form>
      <div className="auth-footer-link">
        {L('Already have an account?', 'عندك حساب؟')} <Link to="/auth/login" className="auth-link">{L('Sign in', 'سجّل الدخول')}</Link>
      </div>
    </AuthLayout>
  );
}
