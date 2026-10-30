import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import './admin.css';

const NAV = [
  { to: '/admin', end: true, icon: 'home', en: 'Overview', ar: 'نظرة عامة' },
  { to: '/admin/users', icon: 'users', en: 'Users', ar: 'المستخدمون' },
  { to: '/admin/conversations', icon: 'message-square', en: 'Conversations', ar: 'المحادثات' },
  { to: '/admin/meetings', icon: 'video', en: 'Meetings', ar: 'الاجتماعات' },
  { to: '/admin/reports', icon: 'flag', en: 'Chat reports', ar: 'بلاغات الشات' },
  { to: '/admin/logs', icon: 'shield', en: 'Logs & security', ar: 'السجلات والأمان' },
  { to: '/admin/settings', icon: 'settings', en: 'Platform settings', ar: 'إعدادات المنصة' },
];

export default function AdminLayout() {
  const { user, status, logout } = useAuth();
  const { locale, toggleLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const ar = locale === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (status === 'loading') return <div className="page-loading">{ar ? 'جارٍ التحميل…' : 'Loading…'}</div>;
  if (status !== 'authenticated' || user?.role !== 'admin') return <Navigate to="/admin/login" replace />;

  const current = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));
  const name = user.full_name || user.email || 'Admin';

  return (
    <div className="ad">
      <div className={`ad-shell${open ? ' is-open' : ''}`}>
        <aside className="ad-side" aria-label={ar ? 'القائمة' : 'Menu'}>
          <div className="ad-brand"><img src="/images/logo/uip-mark.png" alt="" /><div>Palora<small>{ar ? 'لوحة الإدارة' : 'ADMIN PANEL'}</small></div></div>
          <nav className="ad-nav">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `ad-link${isActive ? ' is-active' : ''}`}>
                <Icon name={n.icon} size={19} /><span>{ar ? n.ar : n.en}</span>
              </NavLink>
            ))}
          </nav>
          <div className="ad-side__foot">
            <div className="ad-me"><span className="ad-avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name}</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="ad-btn ad-btn--sm ad-grow" onClick={() => navigate('/app/messages')}>{ar ? 'التطبيق' : 'App'}</button>
              <button type="button" className="ad-btn ad-btn--sm" onClick={toggleLocale}>{ar ? 'EN' : 'ع'}</button>
              <button type="button" className="ad-btn ad-btn--sm" onClick={toggleTheme} aria-label="theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} /></button>
              <button type="button" className="ad-btn ad-btn--sm" aria-label={ar ? 'خروج' : 'Sign out'} onClick={async () => { await logout(); navigate('/admin/login', { replace: true }); }}><Icon name="logout" size={16} /></button>
            </div>
          </div>
        </aside>
        <div className="ad-scrim" onClick={() => setOpen(false)} />
        <div className="ad-main">
          <header className="ad-top">
            <button type="button" className="ad-btn ad-icon ad-burger" aria-label="menu" onClick={() => setOpen(true)}><Icon name="menu" size={20} /></button>
            <h1>{current ? (ar ? current.ar : current.en) : (ar ? 'الإدارة' : 'Admin')}</h1>
          </header>
          <div className="ad-page"><Outlet /></div>
        </div>
      </div>
    </div>
  );
}
