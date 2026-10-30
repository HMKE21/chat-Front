import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { PublicNav, PublicFooter } from './Landing';

export default function Privacy() {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const t = (en, a) => (ar ? a : en);
  const S = [
    [t('Information we collect', 'المعلومات اللي بنجمعها'), [
      t('Account details: your name, email address and profile photo.', 'بيانات الحساب: الاسم والبريد الإلكتروني وصورة الملف الشخصي.'),
      t('Content you send: messages, files, voice notes, stories and meeting chat.', 'المحتوى اللي بتبعته: رسائل وملفات ورسائل صوتية وستوريز وشات الاجتماعات.'),
      t('Technical data: device type, browser, IP address and sign-in activity, used for security.', 'بيانات تقنية: نوع الجهاز والمتصفح وعنوان IP ونشاط الدخول، وبنستخدمها للأمان.'),
    ]],
    [t('How we use it', 'بنستخدمها في إيه'), [
      t('To deliver messages, calls and meetings and keep your account working.', 'لتوصيل الرسائل والمكالمات والاجتماعات وتشغيل حسابك.'),
      t('To protect accounts: two-factor sign-in, device management and abuse prevention.', 'لحماية الحسابات: تسجيل الدخول بخطوتين وإدارة الأجهزة ومنع الإساءة.'),
      t('To send service emails such as verification codes and security alerts.', 'لإرسال إيميلات الخدمة زي رموز التأكيد وتنبيهات الأمان.'),
    ]],
    [t('Calls and meetings', 'المكالمات والاجتماعات'), [
      t('Audio and video are used only to run the call. A meeting is recorded only when the host starts a recording, and participants are notified.', 'الصوت والفيديو بيُستخدموا لتشغيل المكالمة فقط. الاجتماع بيتسجّل بس لما المضيف يبدأ التسجيل، والمشاركين بيتم إشعارهم.'),
      t('Guests joining from a link are only identified by the name they enter.', 'الضيوف اللي بيدخلوا من لينك بيتعرّفوا بالاسم اللي بيكتبوه بس.'),
    ]],
    [t('Sharing', 'المشاركة'), [
      t('We do not sell your personal data.', 'مش بنبيع بياناتك الشخصية.'),
      t('We share data only with service providers needed to run Palora, or when the law requires it.', 'بنشارك البيانات بس مع مزوّدي الخدمة اللازمين لتشغيل Palora، أو لما القانون يطلب كده.'),
    ]],
    [t('Your controls', 'التحكم في بياناتك'), [
      t('Edit your profile, manage devices and sessions, and control chat privacy in Settings.', 'عدّل ملفك وأدر الأجهزة والجلسات وتحكم في خصوصية الشات من الإعدادات.'),
      t('You can delete messages you sent and ask us to delete your account and data.', 'تقدر تمسح الرسائل اللي بعتها وتطلب حذف حسابك وبياناتك.'),
    ]],
    [t('Retention and security', 'الاحتفاظ بالبيانات والأمان'), [
      t('We keep data only as long as your account is active or as needed to provide the service. Data is transmitted over encrypted connections.', 'بنحتفظ بالبيانات طالما حسابك نشط أو حسب الحاجة لتقديم الخدمة. والبيانات بتتنقل عبر اتصالات مشفّرة.'),
    ]],
  ];
  return (
    <div className="pl">
      <PublicNav />
      <main className="pl-doc">
        <div className="pl-doc__wrap">
          <h1>{t('Privacy policy', 'سياسة الخصوصية')}</h1>
          <p className="pl-doc__meta">{t('Last updated: October 2026', 'آخر تحديث: أكتوبر 2026')}</p>
          <p className="pl-doc__intro">{t('Palora is a chat, calling and meeting app. This page explains in plain language what we collect, why, and the choices you have.', 'Palora تطبيق للشات والمكالمات والاجتماعات. الصفحة دي بتشرح بلغة بسيطة إيه اللي بنجمعه ولييه والاختيارات المتاحة ليك.')}</p>
          {S.map(([h, items]) => (
            <section key={h}>
              <h2>{h}</h2>
              <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          ))}
          <section>
            <h2>{t('Contact', 'تواصل معنا')}</h2>
            <p>{t('Questions about this policy? Reach us from the app\'s Settings page, or go back to ', 'عندك سؤال عن السياسة؟ تواصل معنا من صفحة الإعدادات في التطبيق، أو ارجع ')}<Link to="/" style={{ color: 'var(--pa-azure-600)', fontWeight: 600 }}>{t('the home page', 'للصفحة الرئيسية')}</Link>.</p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
