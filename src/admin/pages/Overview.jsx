import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Notice, fmtDate, useT } from '../ui';

function Chart({ series }) {
  const W = 640, H = 220, P = 28;
  const max = Math.max(1, ...series.map((s) => Math.max(s.signups, s.messages)));
  const x = (i) => P + (i * (W - P * 2)) / Math.max(1, series.length - 1);
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const line = (k) => series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[k]).toFixed(1)}`).join(' ');
  return (
    <svg className="ad-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="activity">
      {[0, 0.5, 1].map((g) => <line key={g} x1={P} x2={W - P} y1={y(max * g)} y2={y(max * g)} stroke="var(--line)" />)}
      <text x={4} y={y(max) + 4} fontSize="11" fill="var(--text3)">{max}</text>
      <path d={line('messages')} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={line('signups')} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" />
      {series.map((s, i) => (i % 3 === 0 || i === series.length - 1) && <text key={s.date} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--text3)">{s.date.slice(5)}</text>)}
    </svg>
  );
}

export default function Overview() {
  const { t, locale } = useT();
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/api/v1/admin/overview').then((j) => setD(j.data)).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <Notice error={error} />;
  if (!d) return <Empty loading />;

  const stats = [
    [t('Users', 'المستخدمون'), d.users.total, `${d.users.new_7d} ${t('new this week', 'جديد هذا الأسبوع')}`],
    [t('Online now', 'متصل الآن'), d.users.online, `${d.users.active} ${t('active accounts', 'حساب نشط')}`],
    [t('Messages today', 'رسائل اليوم'), d.messages.today, `${d.messages.total} ${t('total', 'إجمالي')}`],
    [t('Conversations', 'المحادثات'), d.conversations.total, `${d.conversations.groups} ${t('groups', 'جروب')}`],
    [t('Live meetings', 'اجتماعات جارية'), d.meetings.live, `${d.meetings.scheduled} ${t('scheduled', 'مجدولة')}`],
    [t('Open reports', 'بلاغات مفتوحة'), d.reports_open, t('Chat reports', 'بلاغات الشات')],
    [t('Security alerts 24h', 'تنبيهات أمنية 24س'), d.security_24h, t('warning + critical', 'تحذير + حرج')],
    [t('Suspended', 'موقوفون'), d.users.suspended, `${d.users.pending} ${t('pending', 'قيد التفعيل')}`],
  ];

  return (
    <>
      {d.maintenance && <Notice error={t('Maintenance mode is ON — only admins can sign in.', 'وضع الصيانة شغال — الأدمن فقط يقدر يدخل.')} />}
      <div className="ad-stats">
        {stats.map(([label, n, sub]) => (
          <div key={label} className="ad-card ad-stat"><span>{label}</span><b>{n}</b><i>{sub}</i></div>
        ))}
      </div>
      <div className="ad-two">
        <div className="ad-card">
          <h2>{t('Last 14 days', 'آخر 14 يوم')}</h2>
          <div className="ad-legend"><span><i style={{ background: '#2563eb' }} />{t('Messages', 'الرسائل')}</span><span><i style={{ background: '#06b6d4' }} />{t('Sign-ups', 'التسجيلات')}</span></div>
          <Chart series={d.series} />
        </div>
        <div className="ad-card">
          <h2>{t('Newest users', 'أحدث المستخدمين')}</h2>
          <ul className="ad-list">
            {d.recent_users.map((u) => (
              <li key={u.id}>
                <div className="grow"><b>{u.name}</b><small>{u.email} · {fmtDate(u.created_at, locale)}</small></div>
                <Badge tone={u.status === 'active' ? 'ok' : 'warn'}>{u.status}</Badge>
              </li>
            ))}
          </ul>
          <Link to="/admin/users" className="ad-btn ad-btn--sm" style={{ marginTop: 12 }}>{t('Manage users', 'إدارة المستخدمين')}</Link>
        </div>
      </div>
    </>
  );
}
