import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import PageLoading from './components/PageLoading';
import { AuthProvider } from './context/AuthContext';
import RealtimeBridge from './components/RealtimeBridge';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CallProvider } from './context/CallContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AppShell from './layouts/AppShell';
import ServerError from './pages/errors/ServerError';

const NotFound = lazy(() => import('./pages/errors/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const TwoFactor = lazy(() => import('./pages/TwoFactor'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ConfirmEmailChange = lazy(() => import('./pages/ConfirmEmailChange'));
const Messages = lazy(() => import('./pages/Messages'));
const MessagesRoute = lazy(() => import('./pages/MessagesRoute'));
const JoinGroup = lazy(() => import('./pages/JoinGroup'));
const ChatReports = lazy(() => import('./pages/ChatReports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const MeetingPreJoin = lazy(() => import('./pages/meetings/MeetingPreJoin'));
const MyMeetings = lazy(() => import('./pages/meetings/MyMeetings'));
const MeetingCalendar = lazy(() => import('./pages/meetings/MeetingCalendar'));
const MeetingDetails = lazy(() => import('./pages/meetings/MeetingDetails'));
const MeetingRoom = lazy(() => import('./pages/meetings/MeetingRoom'));

/** The API's notification / e-mail links are /messages/:id and /meetings/:uuid — send them into the app. */
function ToApp({ base }) {
  const { '*': rest } = useParams();
  return <Navigate to={`/app/${base}${rest ? `/${rest}` : ''}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <RealtimeBridge />
            <CallProvider>
              <ErrorBoundary>
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/app/messages" replace />} />

                    {/* Public */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/two-factor" element={<TwoFactor />} />
                    <Route path="/auth/verify-email" element={<VerifyEmail />} />
                    <Route path="/auth/confirm-email-change" element={<ConfirmEmailChange />} />
                    {/* Meeting invite link: guests can open it without an account. */}
                    <Route path="/join/:joinToken" element={<MeetingPreJoin />} />

                    {/* Links produced by the API (notifications / e-mails) */}
                    <Route path="/messages/*" element={<ToApp base="messages" />} />
                    <Route path="/meetings/*" element={<ToApp base="meetings" />} />
                    <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/join/group/:token" element={<JoinGroup />} />
                      <Route element={<AppShell />}>
                        <Route path="/app" element={<Navigate to="/app/messages" replace />} />
                        <Route path="/app/messages" element={<Messages />} />
                        <Route path="/app/messages/:conversationId" element={<MessagesRoute />} />
                        <Route path="/app/meetings" element={<MyMeetings />} />
                        <Route path="/app/meetings/calendar" element={<MeetingCalendar />} />
                        <Route path="/app/meetings/:uuid" element={<MeetingDetails />} />
                        <Route path="/app/meetings/:uuid/room" element={<MeetingRoom />} />
                        <Route path="/app/notifications" element={<Notifications />} />
                        <Route path="/app/settings" element={<Settings />} />
                        <Route path="/app/chat-reports" element={<ChatReports />} />
                      </Route>
                    </Route>

                    <Route path="/error" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </CallProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
