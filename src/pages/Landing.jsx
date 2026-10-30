import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { roleHome } from '../config/roleHome';

export function PublicNav({ landing = false }) {
  const { locale, toggleLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, status } = useAuth();
  const t = (en, ar) => (locale === 'ar' ? ar : en);
  const authed = status === 'authenticated' && user;
  return (
    <header className="pl-nav">
      <div className="pl-wrap pl-nav__row">
        <Link to="/" className="pl-brand">
          <img src="/images/logo/uip-mark.png" srcSet="/images/logo/uip-mark@2x.png 2x" alt="" />
          <span>Palora</span>
        </Link>
        {landing && (
          <nav className="pl-links">
            <a href="#chat">{t('Chat', 'الشات')}</a>
            <a href="#calls">{t('Calls', 'المكالمات')}</a>
            <a href="#meetings">{t('Meetings', 'الاجتماعات')}</a>
            <a href="#security">{t('Security', 'الأمان')}</a>
          </nav>
        )}
        <div className="pl-actions">
          <button type="button" className="pl-icon" onClick={toggleLocale} title={t('العربية', 'English')} aria-label={t('العربية', 'English')}><Icon name="globe" size={18} /></button>
          <button type="button" className="pl-icon" onClick={toggleTheme} title={t('Toggle dark mode', 'تبديل الوضع الليلي')} aria-label={t('Toggle dark mode', 'تبديل الوضع الليلي')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} /></button>
          {authed ? (
            <Link to={roleHome(user.role)} className="pl-btn pl-btn--primary">{t('Open Palora', 'افتح Palora')}</Link>
          ) : (
            <>
              <Link to="/auth/login" className="pl-btn pl-btn--ghost">{t('Sign in', 'تسجيل الدخول')}</Link>
              <Link to="/auth/register" className="pl-btn pl-btn--primary">{t('Get started', 'ابدأ الآن')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const { locale } = useLanguage();
  const t = (en, ar) => (locale === 'ar' ? ar : en);
  return (
    <footer className="pl-foot">
      <div className="pl-wrap pl-foot__row">
        <span>© {new Date().getFullYear()} Palora. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}</span>
        <nav>
          <Link to="/privacy">{t('Privacy policy', 'سياسة الخصوصية')}</Link>
          <Link to="/auth/login">{t('Sign in', 'تسجيل الدخول')}</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { locale } = useLanguage();
  const { user, status } = useAuth();
  const t = (en, ar) => (locale === 'ar' ? ar : en);
  const authed = status === 'authenticated' && user;
  const primaryTo = authed ? roleHome(user.role) : '/auth/register';

  const features = [
    { id: 'chat', ic: 'message-square', tone: 'blue', h: t('Chat that feels instant', 'شات سريع وخفيف'), p: t('One-to-one and group conversations, voice notes, files, reactions and stories — all in a clean, fast inbox.', 'محادثات فردية وجروبات، رسائل صوتية، ملفات، ردود فعل وستوريز — كله في صندوق رسائل نضيف وسريع.') },
    { id: 'calls', ic: 'phone', tone: 'green', h: t('Voice & video calls', 'مكالمات صوت وفيديو'), p: t('Call anyone in one tap, with clear audio, noise reduction and a call screen that stays out of your way.', 'اتصل بأي حد بضغطة واحدة، بصوت واضح وعزل للضوضاء وشاشة مكالمة بسيطة.') },
    { id: 'meetings', ic: 'video', tone: 'violet', h: t('Meetings with a link', 'اجتماعات بلينك'), p: t('Schedule or start a meeting, share the link, and let guests join without an account. Chat, share your screen, record.', 'جدول أو ابدأ اجتماع، ابعت اللينك، والضيوف يدخلوا من غير حساب. شات ومشاركة شاشة وتسجيل.') },
    { id: 'security', ic: 'shield', tone: 'navy', h: t('Private by default', 'خصوصية أولًا'), p: t('Two-factor sign-in, device management and view-once media keep your conversations yours.', 'تسجيل دخول بخطوتين، إدارة الأجهزة، ووسائط تُشاهد مرة واحدة عشان محادثاتك تفضل ليك.') },
    { id: 'stories', ic: 'users', tone: 'cyan', h: t('Stories & groups', 'ستوريز وجروبات'), p: t('Share moments that disappear, and keep teams and friends together with roles, pinned messages and invite links.', 'شارك لحظات بتختفي، واجمع الفريق والأصدقاء بصلاحيات ورسائل مثبّتة ولينكات دعوة.') },
    { id: 'lang', ic: 'globe', tone: 'amber', h: t('Arabic & English', 'عربي وإنجليزي'), p: t('A real right-to-left experience, not an afterthought. Switch language and light/dark mode any time.', 'تجربة حقيقية من اليمين للشمال، مش مجرد ترجمة. بدّل اللغة والوضع الليلي في أي وقت.') },
  ];
  const steps = [
    [t('Create your account', 'اعمل حسابك'), t('Sign up with your email and confirm it with a short code.', 'سجّل بإيميلك وأكّده برمز قصير.')],
    [t('Find your people', 'ابحث عن ناسك'), t('Start a chat, build a group or invite someone with a link.', 'ابدأ محادثة أو اعمل جروب أو ادعي حد بلينك.')],
    [t('Talk, call, meet', 'اتكلم واتصل واجتمع'), t('Move from a message to a call or a meeting without leaving the app.', 'انتقل من رسالة لمكالمة أو اجتماع من غير ما تسيب التطبيق.')],
  ];

  return (
    <div className="pl">
      <PublicNav landing />
      <main>
        <section className="pl-hero">
          <div className="pl-wrap pl-hero__grid">
            <div>
              <span className="pl-pill"><Icon name="message-square" size={14} /> {t('Chat · Calls · Meetings', 'شات · مكالمات · اجتماعات')}</span>
              <h1 className="pl-h1">{t('Everyone you talk to,', 'كل الناس اللي بتتكلم معاهم،')} <em>{t('in one place', 'في مكان واحد')}</em></h1>
              <p className="pl-lead">{t('Palora brings your conversations, voice and video calls and meetings together — fast, private and simple, in Arabic and English.', 'Palora بيجمّع محادثاتك ومكالماتك الصوتية والمرئية واجتماعاتك في مكان واحد — سريع وخاص وبسيط، بالعربي والإنجليزي.')}</p>
              <div className="pl-cta">
                <Link to={primaryTo} className="pl-btn pl-btn--primary pl-btn--lg">{authed ? t('Open Palora', 'افتح Palora') : t('Create free account', 'أنشئ حساب مجاني')} <Icon name={locale === 'ar' ? 'arrow-left' : 'arrow-right'} size={18} /></Link>
                {!authed && <Link to="/auth/login" className="pl-btn pl-btn--ghost pl-btn--lg">{t('Sign in', 'تسجيل الدخول')}</Link>}
              </div>
              <p className="pl-note">{t('Guests can join a meeting from a link — no account needed.', 'الضيوف يقدروا يدخلوا الاجتماع من اللينك — من غير حساب.')}</p>
            </div>
            <div className="pl-mock" aria-hidden="true">
              <div className="pl-mock__bar"><span className="pl-mock__av">M</span><div><b>{t('Mona Adel', 'منى عادل')}</b><small>{t('online', 'متصلة الآن')}</small></div></div>
              <div className="pl-mock__body">
                <div className="pl-b">{t('Ready for the 5pm meeting?', 'جاهز لاجتماع الساعة 5؟')}</div>
                <div className="pl-b pl-b--me">{t('Yes! Sending you the file now.', 'أيوه! هبعتلك الملف دلوقتي.')}</div>
                <div className="pl-call"><i><Icon name="video" size={15} /></i>{t('Design review · 5:00 PM', 'مراجعة التصميم · 5:00 م')}</div>
                <div className="pl-b">{t('Perfect, see you there ✨', 'تمام، نتقابل هناك ✨')}</div>
              </div>
              <div className="pl-mock__in">{t('Type a message…', 'اكتب رسالة…')}</div>
            </div>
          </div>
        </section>

        <section className="pl-sec pl-sec--alt" id="chat">
          <div className="pl-wrap">
            <h2 className="pl-h2">{t('Everything you need to stay connected', 'كل اللي محتاجه عشان تفضل على تواصل')}</h2>
            <p className="pl-sub">{t('Three tools, one app, one account.', 'تلات أدوات، تطبيق واحد، حساب واحد.')}</p>
            <div className="pl-grid">
              {features.map((f) => (
                <article className="pl-card" key={f.id} id={f.id === 'chat' ? undefined : f.id}>
                  <span className={`pl-card__ic pl-ic--${f.tone}`}><Icon name={f.ic} size={22} /></span>
                  <h3>{f.h}</h3><p>{f.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pl-sec">
          <div className="pl-wrap">
            <h2 className="pl-h2">{t('Up and running in a minute', 'تبدأ في دقيقة')}</h2>
            <p className="pl-sub">{t('No setup, no downloads required.', 'من غير إعدادات ومن غير تحميل.')}</p>
            <div className="pl-steps">{steps.map(([h, p]) => (<div className="pl-step" key={h}><h3>{h}</h3><p>{p}</p></div>))}</div>
          </div>
        </section>

        {!authed && (
          <div className="pl-wrap">
            <div className="pl-band">
              <h2>{t('Ready to talk?', 'جاهز تبدأ؟')}</h2>
              <p>{t('Create your account and start your first conversation today.', 'أنشئ حسابك وابدأ أول محادثة النهاردة.')}</p>
              <Link to="/auth/register" className="pl-btn pl-btn--primary pl-btn--lg">{t('Get started', 'ابدأ الآن')}</Link>
            </div>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
