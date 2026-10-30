import { useEffect, useMemo, useRef, useState } from 'react';
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
let _g = { en: '', ar: '' };
const LINKS = NAV.reduce((a, n) => { if (n.group) _g = n; else a.push({ ...n, groupEn: _g.en, groupAr: _g.ar }); return a; }, []);

const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

/** Ctrl/⌘ + K quick jump to any admin page. */
function Palette({ ar, onClose, onGo }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const items = useMemo(() => {
    const n = q.trim().toLowerCase();
    return LINKS.filter((l) => !n || l.en.toLowerCase().includes(n) || l.ar.includes(n));
  }, [q]);
  useEffect(() => { setSel(0); }, [q]);
  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && items[sel]) onGo(items[sel].to);
  };
  return (
    <div className="ad-palette" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ad-palette__box" role="dialog" aria-modal="true" aria-label={ar ? 'بحث سريع' : 'Quick search'}>
        <div className="ad-palette__in">
          <Icon name="search" size={18} />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder={ar ? 'اذهب إلى صفحة…' : 'Go to a page…'} />
          <span className="ad-kbd">Esc</span>
        </div>
        <div className="ad-palette__list" role="listbox">
          {items.length === 0 && <div className="ad-palette__empty">{ar ? 'لا توجد صفحة بهذا الاسم' : 'No page matches that name'}</div>}
          {items.map((l, i) => (
            <button key={l.to} type="button" role="option" aria-selected={i === sel} className={`ad-palette__item${i === sel ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => onGo(l.to)}>
              <Icon name={l.icon} size={18} /><span>{ar ? l.ar : l.en}</span><small>{ar ? l.groupAr : l.groupEn}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, status, logout } = useAuth();
  const { locale, toggleLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const ar = locale === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mini, setMini] = useState(() => store.get('ad.mini', false));
  const [closed, setClosed] = useState(() => store.get('ad.closed', {}));
  const [cmd, setCmd] = useState(false);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd((v) => !v); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  const toggleMini = () => setMini((v) => { store.set('ad.mini', !v); return !v; });
  const toggleGroup = (k) => setClosed((c) => { const n = { ...c, [k]: !c[k] }; store.set('ad.closed', n); return n; });

  if (status === 'loading') return <div className="page-loading">{ar ? 'جارٍ التحميل…' : 'Loading…'}</div>;
  if (status !== 'authenticated' || user?.role !== 'admin') return <Navigate to="/admin/login" replace />;

  const current = [...LINKS].sort((x, y) => y.to.length - x.to.length).find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));
  const name = user.full_name || user.email || 'Admin';

  const sections = [];
  NAV.forEach((n) => { if (n.group) sections.push({ ...n, items: [] }); else if (sections.length) sections[sections.length - 1].items.push(n); else sections.push({ en: '', ar: '', items: [n], bare: true }); });
  const sec = sections.find((s) => s.items.some((i) => i.to === current?.to));

  return (
    <div className="ad">
      <div className={`ad-shell${open ? ' is-open' : ''}${mini ? ' is-mini' : ''}`}>
        <aside className="ad-side" aria-label={ar ? 'القائمة' : 'Menu'}>
          <div className="ad-brand"><img src="/images/logo/uip-mark.png" alt="" /><div>Palora<small>{ar ? 'لوحة الإدارة' : 'Admin console'}</small></div></div>
          <nav className="ad-nav">
            {sections.map((s) => {
              const isClosed = !!closed[s.en] && !s.items.some((i) => i.to === current?.to);
              return (
                <div key={s.en || 'top'}>
                  {!s.bare && (
                    <button type="button" className={`ad-navgroup${isClosed ? ' is-closed' : ''}`} aria-expanded={!isClosed} onClick={() => toggleGroup(s.en)}>
                      <span>{ar ? s.ar : s.en}</span><Icon name="chevron-down" size={14} />
                    </button>
                  )}
                  <div className={`ad-navitems${isClosed ? ' is-closed' : ''}`}><div>
                    {s.items.map((n) => (
                      <NavLink key={n.to} to={n.to} end={n.end} title={ar ? n.ar : n.en} className={({ isActive }) => `ad-link${isActive ? ' is-active' : ''}`}>
                        <Icon name={n.icon} size={19} /><span>{ar ? n.ar : n.en}</span>
                      </NavLink>
                    ))}
                  </div></div>
                </div>
              );
            })}
          </nav>
          <div className="ad-side__foot">
            <div className="ad-me"><span className="ad-avatar">{name.slice(0, 1).toUpperCase()}</span><span className="ad-me__t"><b>{name}</b><small>{ar ? 'مدير النظام' : 'Administrator'}</small></span></div>
            <div className="ad-side__tools">
              <button type="button" className="ad-btn ad-btn--sm" onClick={() => navigate('/app/messages')}>{ar ? 'التطبيق' : 'App'}</button>
              <button type="button" className="ad-btn ad-btn--sm ad-keep" aria-label={ar ? 'خروج' : 'Sign out'} title={ar ? 'خروج' : 'Sign out'} onClick={async () => { await logout(); navigate('/admin/login', { replace: true }); }}><Icon name="logout" size={16} /></button>
            </div>
          </div>
        </aside>
        <div className="ad-scrim" onClick={() => setOpen(false)} />
        <div className="ad-main">
          <header className="ad-top">
            <button type="button" className="ad-btn ad-icon ad-burger" aria-label={ar ? 'القائمة' : 'Menu'} onClick={() => setOpen(true)}><Icon name="menu" size={20} /></button>
            <button type="button" className="ad-btn ad-icon ad-collapse" aria-label={ar ? 'طي القائمة' : 'Collapse menu'} aria-pressed={mini} onClick={toggleMini}><Icon name="panel-left" size={19} /></button>
            <div className="ad-crumb">
              {sec && !sec.bare && <small>{ar ? sec.ar : sec.en}</small>}
              <h1>{current ? (ar ? current.ar : current.en) : (ar ? 'الإدارة' : 'Admin')}</h1>
            </div>
            <div className="ad-top__act">
              <button type="button" className="ad-cmdk" onClick={() => setCmd(true)} aria-label={ar ? 'بحث سريع' : 'Quick search'}>
                <Icon name="search" size={16} /><span>{ar ? 'اذهب إلى…' : 'Jump to…'}</span><kbd className="ad-kbd">Ctrl K</kbd>
              </button>
              <button type="button" className="ad-btn ad-icon" onClick={toggleLocale} aria-label={ar ? 'English' : 'العربية'}>{ar ? 'EN' : 'ع'}</button>
              <button type="button" className="ad-btn ad-icon" onClick={toggleTheme} aria-label={ar ? 'تغيير المظهر' : 'Toggle theme'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
            </div>
          </header>
          <div className="ad-page"><Outlet /></div>
        </div>
      </div>
      {cmd && <Palette ar={ar} onClose={() => setCmd(false)} onGo={(to) => { setCmd(false); navigate(to); }} />}
    </div>
  );
}
