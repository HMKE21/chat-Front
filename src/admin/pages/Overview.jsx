import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { Avatar, Badge, Empty, Icon, Notice, fmtDate, useT } from '../ui';
import { LineChart, Stats } from '../widgets';

export default function Overview() {
  const { t, locale } = useT();
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/api/v1/admin/overview').then((j) => setD(j.data)).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <Notice error={error} />;
  if (!d) return <Empty loading />;

  const stats = [
    [t('Users', 'المستخدمون'), d.users.total, `${d.users.new_7d} ${t('new this week', 'جديد هذا الأسبوع')}`, 'users'],
    [t('Online now', 'متصل الآن'), d.users.online, `${d.users.active} ${t('active accounts', 'حساب نشط')}`, 'pulse', 'ok'],
    [t('Messages today', 'رسائل اليوم'), d.messages.today, `${d.messages.total} ${t('total', 'إجمالي')}`, 'message-square', 'cyan'],
    [t('Conversations', 'المحادثات'), d.conversations.total, `${d.conversations.groups} ${t('groups', 'جروب')}`, 'chat', 'violet'],
    [t('Live meetings', 'اجتماعات جارية'), d.meetings.live, `${d.meetings.scheduled} ${t('scheduled', 'مجدولة')}`, 'video', 'ok'],
    [t('Open reports', 'بلاغات مفتوحة'), d.reports_open, t('Chat reports', 'بلاغات الشات'), 'flag', d.reports_open ? 'warn' : ''],
    [t('Security alerts 24h', 'تنبيهات أمنية 24س'), d.security_24h, t('warning + critical', 'تحذير + حرج'), 'alert-triangle', d.security_24h ? 'bad' : ''],
    [t('Suspended', 'موقوفون'), d.users.suspended, `${d.users.pending} ${t('pending', 'قيد التفعيل')}`, 'user-x', 'warn'],
  ];

  return (
    <>
      {d.maintenance && <Notice error={t('Maintenance mode is ON — only admins can sign in.', 'وضع الصيانة شغال — الأدمن فقط يقدر يدخل.')} />}
      <section className="ad-hero">
        <div>
          <span className="ad-pulse"><i />{d.users.online} {t('online now', 'متصل الآن')}</span>
          <h2>{t('Platform at a glance', 'ملخص المنصة')}</h2>
          <p>{d.reports_open || d.security_24h
            ? t(`${d.reports_open} open reports and ${d.security_24h} security alerts need a look.`, `فيه ${d.reports_open} بلاغ مفتوح و${d.security_24h} تنبيه أمني محتاجين مراجعة.`)
            : t('No open reports or security alerts. Everything is calm.', 'مفيش بلاغات مفتوحة أو تنبيهات أمنية. كله هادي.')}</p>
        </div>
        <div className="ad-hero__act">
          <Link to="/admin/reports" className="ad-btn ad-btn--primary"><Icon name="flag" size={16} />{t('Review reports', 'مراجعة البلاغات')}</Link>
          <Link to="/admin/alerts" className="ad-btn"><Icon name="bell" size={16} />{t('Alerts', 'التنبيهات')}</Link>
        </div>
      </section>
      <Stats items={stats} />
      <div className="ad-two">
        <div className="ad-card">
          <h2>{t('Last 14 days', 'آخر 14 يوم')}</h2>
          <LineChart series={d.series} keys={[{ k: 'messages', color: '#2563eb', label: t('Messages', 'الرسائل') }, { k: 'signups', color: '#06b6d4', label: t('Sign-ups', 'التسجيلات') }]} />
        </div>
        <div className="ad-card">
          <h2>{t('Newest users', 'أحدث المستخدمين')}</h2>
          <ul className="ad-list">
            {d.recent_users.map((u) => (
              <li key={u.id}>
                <Avatar name={u.name} />
                <div className="grow"><b>{u.name}</b><small>{u.email} · {fmtDate(u.created_at, locale)}</small></div>
                <Badge tone={u.status === 'active' ? 'ok' : 'warn'}>{u.status}</Badge>
              </li>
            ))}
          </ul>
          <Link to="/admin/users" className="ad-btn ad-btn--sm" style={{ marginTop: 12 }}>{t('Manage users', 'إدارة المستخدمين')}<Icon name="arrow-right" size={14} /></Link>
        </div>
      </div>
    </>
  );
}
