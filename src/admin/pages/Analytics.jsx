import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Empty, Notice, useT } from '../ui';
import { Columns, HBars, LineChart, PageHead, Stats } from '../widgets';

/** focus="platform" (sign-ups, meetings, calls) or "messaging" (message volume, mix, groups, busy hours) */
export default function Analytics({ focus = 'platform' }) {
  const { t } = useT();
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { setD(null); api.get('/api/v1/admin/analytics', { days }).then((j) => setD(j.data)).catch((e) => setError(errorMessage(e))); }, [days]);
  const msgMode = focus === 'messaging';
  const range = (
    <div className="ad-tabs" role="tablist">
      {[7, 30, 90].map((n) => <button key={n} type="button" role="tab" aria-selected={days === n} className={`ad-tab${days === n ? ' is-on' : ''}`} onClick={() => setDays(n)}>{n} {t('days', 'يوم')}</button>)}
    </div>
  );
  if (error && !d) return <Notice error={error} />;
  const head = <PageHead title={msgMode ? t('Messaging analytics', 'تحليلات الرسائل') : t('Platform analytics', 'تحليلات المنصة')} actions={range} />;
  if (!d) return <>{head}<Empty loading /></>;
  const tt = d.totals;
  const keys = msgMode
    ? [{ k: 'messages', color: '#2563eb', label: t('Messages', 'الرسائل') }, { k: 'active', color: '#12a36b', label: t('Active senders', 'مرسلون نشطون') }]
    : [{ k: 'signups', color: '#06b6d4', label: t('Sign-ups', 'التسجيلات') }, { k: 'meetings', color: '#7c5cff', label: t('Meetings', 'الاجتماعات') }, { k: 'calls', color: '#e8920c', label: t('Calls', 'المكالمات') }];
  const stats = msgMode
    ? [[t('Messages', 'الرسائل'), tt.messages], [t('Per day', 'في اليوم'), tt.avg_per_day], [t('Peak active senders', 'أعلى مرسلين نشطين'), tt.peak_active], [t('Stories (7d)', 'استوري (7 أيام)'), tt.stories_7d]]
    : [[t('New users', 'مستخدمون جدد'), tt.signups], [t('Meetings', 'الاجتماعات'), tt.meetings], [t('Calls', 'المكالمات'), tt.calls], [t('Messages', 'الرسائل'), tt.messages]];
  return (
    <>
      {head}
      <Stats items={stats} />
      <div className="ad-card"><h2>{t('Daily trend', 'الاتجاه اليومي')}</h2><LineChart series={d.series} keys={keys} /></div>
      {msgMode && (
        <div className="ad-three">
          <div className="ad-card"><h2>{t('Message types', 'أنواع الرسائل')}</h2><HBars items={d.mix.map((m) => ({ label: m.type, value: m.count }))} /></div>
          <div className="ad-card"><h2>{t('Most active groups', 'أنشط المجموعات')}</h2><HBars color="#12a36b" items={d.top_groups.map((g) => ({ label: g.title || `#${g.id}`, value: g.messages }))} /></div>
          <div className="ad-card"><h2>{t('Busy hours (last 7 days)', 'ساعات الذروة (آخر 7 أيام)')}</h2><Columns items={d.by_hour.map((n, h) => ({ label: `${h}:00`, a: n }))} /></div>
        </div>
      )}
    </>
  );
}
