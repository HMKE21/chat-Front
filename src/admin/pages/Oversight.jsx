import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Notice, useT } from '../ui';
import { HBars, PageHead, Stats } from '../widgets';

export default function Oversight() {
  const { t } = useT();
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/api/v1/admin/messaging/oversight').then((j) => setD(j.data)).catch((e) => setError(errorMessage(e))); }, []);
  if (error) return <Notice error={error} />;
  if (!d) return <Empty loading />;
  const s = d.reports_by_status || {};
  const n = d.numbers;
  return (
    <>
      <PageHead title={t('Messaging oversight', 'الرقابة على الرسائل')}
        sub={t('A safety overview built from reports and blocks. Message text is never shown here — open a report to see the snapshot its author attached.', 'نظرة أمان مبنية على البلاغات والحظر. نص الرسائل مش بيظهر هنا — افتح البلاغ عشان تشوف اللقطة المرفقة.')}
        actions={<Link to="/admin/reports" className="ad-btn ad-btn--primary">{t('Review reports', 'مراجعة البلاغات')}</Link>} />
      <Stats items={[
        [t('Pending reports', 'بلاغات معلّقة'), s.pending || 0, `${s.reviewing || 0} ${t('in review', 'قيد المراجعة')}`],
        [t('Resolved', 'تم حلها'), s.resolved || 0, `${s.dismissed || 0} ${t('dismissed', 'مرفوضة')}`],
        [t('Blocks', 'عمليات الحظر'), n.blocks],
        [t('Suspended / banned', 'موقوفون / محظورون'), n.suspended_users, `${n.locked_users} ${t('locked', 'مقفول')}`],
        [t('Groups', 'المجموعات'), n.groups, `${n.new_groups_7d} ${t('new this week', 'جديدة هذا الأسبوع')}`],
        [t('Deleted messages (7d)', 'رسائل محذوفة (7 أيام)'), n.deleted_msgs_7d],
      ]} />
      <div className="ad-three">
        <div className="ad-card">
          <h2>{t('Most reported people', 'أكتر أشخاص عليهم بلاغات')}</h2>
          {!d.top_reported.length ? <div className="ad-empty">{t('No reports yet', 'لا بلاغات بعد')}</div> : (
            <ul className="ad-list">{d.top_reported.map((u) => (
              <li key={u.id}><div className="grow"><b>{u.name}</b><small dir="ltr">{u.email}</small></div><Badge tone={u.status === 'active' ? '' : 'bad'}>{u.reports}</Badge></li>
            ))}</ul>
          )}
        </div>
        <div className="ad-card">
          <h2>{t('Most reported chats', 'أكتر محادثات عليها بلاغات')}</h2>
          <HBars color="#e5484d" items={d.top_chats.map((c) => ({ label: c.is_group ? (c.title || `#${c.id}`) : `${t('Direct chat', 'محادثة فردية')} #${c.id}`, value: c.reports }))} />
        </div>
        <div className="ad-card">
          <h2>{t('Report reasons', 'أسباب البلاغات')}</h2>
          <HBars color="#e8920c" items={d.reasons.map((r) => ({ label: r.reason, value: r.count }))} />
        </div>
      </div>
    </>
  );
}
