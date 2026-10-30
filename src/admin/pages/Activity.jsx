import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, fmtDate, useT } from '../ui';
import { Columns, HBars, PageHead, Stats } from '../widgets';

export default function Activity() {
  const { t, locale } = useT();
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  const load = () => api.get('/api/v1/admin/activity').then((j) => setD(j.data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); const h = setInterval(load, 30000); return () => clearInterval(h); }, []);
  if (error && !d) return <Notice error={error} />;
  if (!d) return <Empty loading />;
  const tone = (r) => (r.severity === 'critical' ? 'bad' : r.severity === 'warning' ? 'warn' : r.source === 'audit' ? '' : 'ok');
  return (
    <>
      <PageHead title={t('System activity', 'نشاط النظام')} sub={t('Admin actions and security events, refreshed every 30 seconds.', 'إجراءات الإدارة والأحداث الأمنية، بتتحدث كل 30 ثانية.')} />
      <Stats items={[
        [t('Admin actions 24h', 'إجراءات الإدارة 24س'), d.totals_24h.audit],
        [t('Security events 24h', 'أحداث أمنية 24س'), d.totals_24h.security],
        [t('Critical 24h', 'حرجة 24س'), d.totals_24h.critical],
        [t('Sign-ins 24h', 'تسجيلات دخول 24س'), d.totals_24h.logins],
      ]} />
      <div className="ad-two">
        <div className="ad-card">
          <h2>{t('Events per hour', 'الأحداث في الساعة')}</h2>
          <div className="ad-legend"><span><i style={{ background: '#2563eb' }} />{t('Admin', 'الإدارة')}</span><span><i style={{ background: '#e8920c' }} />{t('Security', 'الأمان')}</span></div>
          <Columns items={d.histogram.map((h) => ({ label: h.hour, a: h.audit, b: h.security }))} />
        </div>
        <div className="ad-card">
          <h2>{t('Busiest IPs (security)', 'أكتر عناوين IP (أمان)')}</h2>
          <HBars items={d.top_ips.map((i) => ({ label: i.ip, value: i.count }))} color="#e8920c" />
        </div>
      </div>
      <div className="ad-card">
        <h2>{t('Latest events', 'آخر الأحداث')}</h2>
        {!d.feed.length ? <div className="ad-empty">{t('Nothing yet', 'لا شيء بعد')}</div> : (
          <ul className="ad-feed">
            {d.feed.map((r) => (
              <li key={`${r.source}-${r.id}`}>
                <span className={`ad-dot${tone(r) ? ` ad-dot--${tone(r)}` : ''}`} />
                <div className="grow"><b dir="ltr">{r.action}</b><small>{r.user_name || t('System', 'النظام')} · <span dir="ltr">{r.ip_address || '—'}</span> · {r.source === 'audit' ? t('admin', 'إدارة') : t('security', 'أمان')} · {fmtDate(r.created_at, locale)}</small></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
