import { APP_PREFIX } from './roleHome';

/** Everyone lives under one URL prefix (/app). Kept as a function because older pages call portalPrefix(role). */
export function portalPrefix() {
  return 'app';
}

export const SECTION_TITLES = {
  main: { en: 'Main', ar: 'الرئيسية' },
  account: { en: 'Account', ar: 'الحساب' },
};

const ITEMS = [
  { key: 'messages', en: 'Messages', ar: 'الرسائل', icon: 'message-circle' },
  { key: 'meetings', en: 'Meetings', ar: 'الاجتماعات', icon: 'video' },
  { key: 'notifications', en: 'Notifications', ar: 'الإشعارات', icon: 'bell' },
  { key: 'settings', en: 'Settings', ar: 'الإعدادات', icon: 'settings' },
];

export function getNavConfig(role) {
  const items = ITEMS.map((i) => ({ ...i, route: `${APP_PREFIX}/${i.key}`, built: true }));
  if (role === 'admin') items.push({ key: 'chat-reports', en: 'Chat reports', ar: 'بلاغات الشات', icon: 'shield', route: `${APP_PREFIX}/chat-reports`, built: true });
  return { main: items };
}

export function matchNavItem(role, pathname) {
  return Object.values(getNavConfig(role)).flat()
    .filter((i) => pathname === i.route || pathname.startsWith(`${i.route}/`))
    .sort((a, b) => b.route.length - a.route.length)[0] || null;
}
