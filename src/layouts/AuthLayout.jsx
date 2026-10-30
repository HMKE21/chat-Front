import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import AuthClock from '../components/AuthClock';
import AuthIllustration from '../components/auth/AuthIllustration';
import LanguageMenu from '../components/auth/LanguageMenu';
import useInspectGuard from '../hooks/useInspectGuard';
import { useTheme } from '../context/ThemeContext';
import { useTranslations } from '../context/LanguageContext';
import i18nCommon from '../i18n/common';
import i18nPage from '../i18n/layouts/auth-layout';

const translations = { ...i18nCommon, ...i18nPage };

const FEATURES = [
  { icon: 'message-square', tone: 'blue', title: 'Chat with anyone', text: 'Private and group conversations, stories and voice or video calls.' },
  { icon: 'video', tone: 'violet', title: 'Meetings that just work', text: 'Share a link, chat, share your screen and record - guests can join without an account.' },
  { icon: 'shield', tone: 'green', title: 'Secure by default', text: 'Two-factor auth, device management and account protection.' },
];

/**
 * Shared shell for every unauthenticated screen (login, register,
 * forgot/reset password, two-factor, verify/confirm-email).
 *
 * Layout (see styles/css/pages/auth.css):
 *   ≥1200px  hero text | illustration | form card
 *   900-1199 hero text | form card            (illustration hidden)
 *   <900px   hero headline → form card → feature list   (form first, no
 *            long marketing block in front of the fields)
 *
 * API is unchanged: `title` / `subtitle` come already translated from the
 * calling page; `error` / `success` render the shared `.auth-alert`.
 */
export default function AuthLayout({ title, subtitle, error, success, wide = false, children }) {
  const t = useTranslations(translations);
  const { theme, toggleTheme } = useTheme();
  useInspectGuard();

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true">
        <span className="auth-bg__orb auth-bg__orb--1" />
        <span className="auth-bg__orb auth-bg__orb--2" />
        <span className="auth-bg__grid" />
      </div>

      <a className="auth-skip" href="#auth-card">{t('Skip to form')}</a>

      <header className="auth-topbar">
        <Link to="/" className="auth-brand" aria-label="Palora">
          <img src="/images/logo/uip-mark.png" alt="" width="44" height="44" />
          <span className="auth-brand__text">
            <strong>Palora</strong>
            
          </span>
        </Link>

        <AuthClock />

        <div className="auth-topbar__actions">
          <LanguageMenu />
          <button
            type="button"
            className="auth-chip auth-chip--icon"
            onClick={toggleTheme}
            aria-label={t('Toggle dark / light mode')}
            title={t('Toggle dark / light mode')}
          >
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={17} />
          </button>
        </div>
      </header>

      <div className={`auth-main ${wide ? 'auth-main--wide' : ''}`}>
        <section className="auth-hero">
          <span className="auth-pill">
            {t('Chat')}<i /> {t('Call')}<i /> {t('Meet')}
          </span>
          <h2 className="auth-hero__title">
            {t('Everyone you talk to,')} <span className="auth-grad-text">{t('in one place')}</span>
          </h2>
          <p className="auth-hero__sub">
            {t('Palora brings your chats, voice and video calls, stories and meetings together — fast, private and simple.')}
          </p>
        </section>

        <div className="auth-art-wrap"><AuthIllustration /></div>

        <main className="auth-card" id="auth-card" tabIndex={-1}>
          {title && <h1 className="auth-title">{title}</h1>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}

          {error && (
            <div className="auth-alert auth-alert--error" role="alert">
              <Icon name="alert-triangle" size={18} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-alert auth-alert--success" role="status">
              <Icon name="check-circle" size={18} />
              <span>{success}</span>
            </div>
          )}

          {children}
        </main>

        <ul className="auth-features">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className={`auth-feature__icon auth-feature__icon--${f.tone}`}><Icon name={f.icon} size={20} /></span>
              <div>
                <strong>{t(f.title)}</strong>
                <span>{t(f.text)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <footer className="auth-footer">
        <Icon name="lock" size={14} />
        <span>{t('Your data is encrypted and protected under industry-standard security practices.')}</span>
      </footer>
    </div>
  );
}
