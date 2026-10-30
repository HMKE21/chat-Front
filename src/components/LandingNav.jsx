import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function LandingNav() {
  const { locale } = useLanguage();
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
      <Link to="/" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'inherit', textDecoration: 'none' }}>{locale === 'ar' ? 'تطبيقي' : 'SocialApp'}</Link>
      <Link to="/auth/login" className="btn btn-primary">{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Link>
    </header>
  );
}
