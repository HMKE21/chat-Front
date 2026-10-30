import { useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client';
import { Badge, Empty, Notice, useT } from '../ui';
import { PageHead, Stats } from '../widgets';

const CAPS = {
  chat: ['Direct & group chat', 'المحادثات الفردية والجماعية'],
  groups: ['Create groups', 'إنشاء مجموعات'],
  stories: ['Stories', 'الاستوري'],
  calls: ['Voice & video calls', 'المكالمات الصوتية والمرئية'],
  meetings: ['Meetings', 'الاجتماعات'],
  admin_panel: ['Open the admin panel', 'دخول لوحة الإدارة'],
  manage_users: ['Manage users', 'إدارة المستخدمين'],
  manage_reports: ['Review chat reports', 'مراجعة بلاغات الشات'],
  view_logs: ['See audit & security logs', 'عرض سجلات التدقيق والأمان'],
  security_policies: ['Edit security policies', 'تعديل سياسات الأمان'],
  platform_settings: ['Platform settings', 'إعدادات المنصة'],
};

export default function Roles() {
  const { t, ar } = useT();
  const [d, setD] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { api.get('/api/v1/admin/roles').then((j) => setD(j.data)).catch((e) => setError(errorMessage(e))); }, []);
  if (error) return <Notice error={error} />;
  if (!d) return <Empty loading />;
  const name = { admin: t('Admin', 'أدمن'), user: t('User', 'مستخدم') };
  return (
    <>
      <PageHead title={t('Roles & permissions', 'الأدوار والصلاحيات')} sub={t('Palora has two built-in roles. Change a person’s role from Users or Team.', 'في Palora دورين أساسيين. غيّر دور أي شخص من صفحة المستخدمين أو الفريق.')} />
      <Stats items={d.roles.map((r) => [name[r.key], r.count, Object.entries(r.by_status || {}).map(([s, n]) => `${n} ${s}`).join(' · ') || '—'])} />
      <div className="ad-card">
        <h2>{t('What each role can do', 'إيه اللي يقدر يعمله كل دور')}</h2>
        <div className="ad-tablewrap">
          <table className="ad-matrix">
            <thead><tr><th>{t('Capability', 'الصلاحية')}</th><th>{name.admin}</th><th>{name.user}</th></tr></thead>
            <tbody>
              {d.capabilities.map((c) => (
                <tr key={c.key}>
                  <td>{ar ? CAPS[c.key]?.[1] : CAPS[c.key]?.[0] || c.key}</td>
                  {['admin', 'user'].map((r) => <td key={r}>{c[r] ? <span className="ad-yes" aria-label="yes">✓</span> : <span className="ad-no" aria-label="no">—</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ad-muted" style={{ marginTop: 12 }}><Badge tone="brand">{t('Built-in', 'مدمج')}</Badge> {t('These rules are enforced by the server and cannot be edited here.', 'القواعد دي بيفرضها السيرفر ومينفعش تتعدل من هنا.')}</p>
      </div>
    </>
  );
}
