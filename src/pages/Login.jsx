import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, ApiError } from '../context/AuthContext';
import { api, errorMessage } from '../api/client';
import AuthLayout from '../layouts/AuthLayout';
import Icon from '../components/Icon';
import { AuthField, PasswordField } from '../components/auth/AuthField';
import { roleHome } from '../config/roleHome';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { locale } = useLanguage();
  const L = (en, ar) => (locale === 'ar' ? ar : en);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success] = useState(location.state?.success ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resend, setResend] = useState({ busy: false, done: false });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setUnverified(false); setResend({ busy: false, done: false });
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) {
        navigate('/auth/two-factor', { state: { challengeToken: result.challengeToken } });
        return;
      }
      const from = location.state?.from?.pathname;
      navigate(from && from.startsWith('/app') ? from : roleHome(result.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.payload?.errors?.code === 'email_not_verified') setUnverified(true);
      setError(err instanceof ApiError ? errorMessage(err) : L('Something went wrong. Please try again.', 'حصلت مشكلة. جرّب تاني.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendVerification() {
    setResend({ busy: true, done: false });
    try { await api.post('/api/v1/auth/resend-verification', { email }); } catch { /* generic reply */ }
    setResend({ busy: false, done: true });
  }

  return (
    <AuthLayout title={L('Welcome back', 'أهلًا بعودتك')} subtitle={L('Sign in to continue', 'سجّل الدخول للمتابعة')} error={error} success={success}>
      <form onSubmit={handleSubmit}>
        <AuthField id="email" type="email" label={L('Email', 'البريد الإلكتروني')} icon="mail" ltr value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="username"
          inputMode="email" autoCapitalize="none" spellCheck={false} required autoFocus />
        <PasswordField id="password" label={L('Password', 'كلمة السر')}
          labelAside={<Link to="/auth/forgot-password" className="auth-link" style={{ fontSize: '0.8125rem' }}>{L('Forgot password?', 'نسيت كلمة السر؟')}</Link>}
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          autoComplete="current-password" showCapsWarning required />
        <button type="submit" className={`auth-btn ${submitting ? 'is-loading' : ''}`} disabled={submitting}>
          <span>{submitting ? L('Signing in…', 'جارٍ الدخول…') : L('Sign in', 'تسجيل الدخول')}</span>
          {!submitting && <span className="auth-dir-icon"><Icon name="arrow-right" size={18} /></span>}
        </button>
      </form>

      {unverified && (
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <Link to="/auth/verify-email" state={{ email }} className="auth-link" style={{ display: 'inline-block', padding: '10px 0', fontWeight: 700 }}>
            {L('Enter confirmation code', 'اكتب رمز التأكيد')}
          </Link>
          {resend.done ? (
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{L('A new code is on its way. Check your inbox and spam.', 'بعتنالك رمز جديد. بص في الوارد والسبام.')}</p>
          ) : (
            <button type="button" className="auth-link" disabled={resend.busy} onClick={resendVerification}
              style={{ background: 'none', border: 0, padding: '10px 0', cursor: 'pointer', fontWeight: 700, display: 'block', margin: '0 auto' }}>
              {resend.busy ? L('Sending…', 'جارٍ الإرسال…') : L('Resend confirmation code', 'إعادة إرسال الرمز')}
            </button>
          )}
        </div>
      )}

      <div className="auth-footer-link">
        {L("Don't have an account?", 'معندكش حساب؟')} <Link to="/auth/register" className="auth-link">{L('Create one', 'أنشئ حساب')}</Link>
      </div>
    </AuthLayout>
  );
}
