import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getNavConfig } from '../config/navConfig';
import './app-shell.css';

const ICONS = { 'message-circle': 'message-square' };
const NO_CHROME = /^\/app\/meetings\/[^/]+\/room\/?$/; // the meeting room is full-screen

export default function AppShell() {
  const { user, logout } = useAuth();
  const { locale, toggleLocale } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const items = Object.values(getNavConfig(user?.role)).flat();
  const label = (i) => (locale === 'ar' ? i.ar : i.en);

  if (NO_CHROME.test(location.pathname)) return <Outlet />;

  async function signOut() {
    await logout();
    navigate('/auth/login', { replace: true });
  }

  return (
    <div className="shell">
      <aside className="shell__side">
        <div className="shell__brand">{locale === 'ar' ? 'تطبيقي' : 'SocialApp'}</div>
        <nav className="shell__nav">
          {items.map((i) => (
            <NavLink key={i.key} to={i.route} className={({ isActive }) => `shell__link${isActive ? ' is-active' : ''}`}>
              <Icon name={ICONS[i.icon] || i.icon} size={20} />
              <span>{label(i)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="shell__me">
          <div className="shell__name" title={user?.email}>{user?.full_name || user?.email}</div>
          <button type="button" className="shell__btn" onClick={toggleLocale}>{locale === 'ar' ? 'EN' : 'عربي'}</button>
          <button type="button" className="shell__btn" onClick={signOut} title={locale === 'ar' ? 'خروج' : 'Sign out'}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
      <main className="shell__main"><Outlet /></main>
      <nav className="shell__tabs">
        {items.slice(0, 4).map((i) => (
          <NavLink key={i.key} to={i.route} className={({ isActive }) => `shell__tab${isActive ? ' is-active' : ''}`}>
            <Icon name={ICONS[i.icon] || i.icon} size={22} />
            <span>{label(i)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
