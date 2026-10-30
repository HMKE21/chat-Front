import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';
import './admin.css';

const NAV = [
  { to: '/admin', end: true, icon: 'home', en: 'Overview', ar: 'نظرة عامة' },
  { group: true, en: 'Users & Access', ar: 'المستخدمون والصلاحيات' },
  { to: '/admin/users', icon: 'users', en: 'Users', ar: 'المستخدمون' },
  { to: '/admin/roles', icon: 'shield', en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' },
  { to: '/admin/team', icon: 'user', en: 'Team', ar: 'فريق الإدارة' },
  { group: true, en: 'Insights', ar: 'التحليلات' },
  { to: '/admin/activity', icon: 'pulse', en: 'System Activity', ar: 'نشاط النظام' },
  { to: '/admin/analytics', icon: 'bar-chart', en: 'Platform Analytics', ar: 'تحليلات المنصة' },
  { group: true, en: 'Threat Monitoring', ar: 'مراقبة التهديدات' },
  { to: '/admin/incidents', icon: 'alert-triangle', en: 'Incidents', ar: 'الحوادث' },
  { to: '/admin/alerts', icon: 'bell', en: 'Alerts', ar: 'التنبيهات' },
  { to: '/admin/sessions', icon: 'monitor', en: 'Sessions', ar: 'الجلسات' },
  { group: true, en: 'Security & Audit', ar: 'الأمان والتدقيق' },
  { to: '/admin/security-logs', icon: 'shield', en: 'Security Logs', ar: 'سجلات الأمان' },
  { to: '/admin/audit-logs', icon: 'file', en: 'Audit Logs', ar: 'سجلات التدقيق' },
  { to: '/admin/policies', icon: 'lock', en: 'Security Policies', ar: 'سياسات الأمان' },
  { group: true, en: 'Messaging Admin', ar: 'إدارة الرسائل' },
  { to: '/admin/reports', icon: 'flag', en: 'Chat Reports', ar: 'بلاغات الشات' },
  { to: '/admin/conversations', icon: 'message-square', en: 'Conversations', ar: 'المحادثات' },
  { to: '/admin/messaging/oversight', icon: 'eye', en: 'Messaging Oversight', ar: 'الرقابة على الرسائل' },
  { to: '/admin/meetings', icon: 'video', en: 'Meetings Monitoring', ar: 'مراقبة الاجتماعات' },
  { to: '/admin/messaging/analytics', icon: 'bar-chart', en: 'Messaging Analytics', ar: 'تحليلات الرسائل' },
  { to: '/admin/messaging/settings', icon: 'wrench', en: 'Messaging Settings', ar: 'إعدادات الرسائل' },
  { to: '/admin/notifications/settings', icon: 'bell', en: 'Notification Settings', ar: 'إعدادات الإشعارات' },
  { group: true, en: 'Platform', ar: 'المنصة' },
  { to: '/admin/settings', icon: 'settings', en: 'Platform settings', ar: 'إعدادات المنصة' },
];
const LINKS = NAV.filter((n) => n.to);

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

  const current = [...LINKS].sort((x, y) => y.to.length - x.to.length).find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));
  const name = user.full_name || user.email || 'Admin';

  return (
    <div className="ad">
      <div className={`ad-shell${open ? ' is-open' : ''}`}>
        <aside className="ad-side" aria-label={ar ? 'القائمة' : 'Menu'}>
          <div className="ad-brand"><img src="/images/logo/uip-mark.png" alt="" /><div>Palora<small>{ar ? 'لوحة الإدارة' : 'ADMIN PANEL'}</small></div></div>
          <nav className="ad-nav">
            {NAV.map((n) => (n.group ? <div key={n.en} className="ad-navgroup">{ar ? n.ar : n.en}</div> : (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `ad-link${isActive ? ' is-active' : ''}`}>
                <Icon name={n.icon} size={19} /><span>{ar ? n.ar : n.en}</span>
              </NavLink>
            )))}
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
