import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// A group invite link opened while signed out: remembered for this tab and resumed right after any kind of sign-in.
const PENDING_KEY = 'uip.postLogin';
const INVITE_PATH = /^\/join\/group\/[A-Za-z0-9_-]{8,64}\/?$/;
// Read-only on purpose (render must stay pure); JoinGroup clears it once it is on screen.
const takePending = () => {
  try {
    const p = sessionStorage.getItem(PENDING_KEY);
    return p && INVITE_PATH.test(p) ? p : null;
  } catch { return null; }
};

export default function ProtectedRoute() {
  const { status } = useAuth();
  const { locale } = useLanguage();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="page-loading">{locale === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}</div>;
  }
  if (status === 'guest') {
    if (INVITE_PATH.test(location.pathname)) {
      try { sessionStorage.setItem(PENDING_KEY, location.pathname); } catch { /* not remembered */ }
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  const pending = takePending();
  if (pending && pending !== location.pathname) return <Navigate to={pending} replace />;
  return <Outlet />;
}
