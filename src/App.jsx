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
const Landing = lazy(() => import('./pages/Landing'));
const Privacy = lazy(() => import('./pages/Privacy'));
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
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminOverview = lazy(() => import('./admin/pages/Overview'));
const AdminUsers = lazy(() => import('./admin/pages/Users'));
const AdminConversations = lazy(() => import('./admin/pages/Conversations'));
const AdminMeetings = lazy(() => import('./admin/pages/Meetings'));
const AdminReports = lazy(() => import('./admin/pages/Reports'));
const AdminLogs = lazy(() => import('./admin/pages/Logs'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));
const AdminRoles = lazy(() => import('./admin/pages/Roles'));
const AdminTeam = lazy(() => import('./admin/pages/Team'));
const AdminActivity = lazy(() => import('./admin/pages/Activity'));
const AdminAnalytics = lazy(() => import('./admin/pages/Analytics'));
const AdminOversight = lazy(() => import('./admin/pages/Oversight'));
const AdminMsgSettings = lazy(() => import('./admin/pages/MessagingSettings'));
const AdminNotifSettings = lazy(() => import('./admin/pages/NotificationSettings'));
const AdminSessions = lazy(() => import('./admin/pages/Sessions'));
const AdminPolicies = lazy(() => import('./admin/pages/Policies'));
const AdminAlerts = lazy(() => import('./admin/pages/Alerts'));

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
                    <Route path="/" element={<Landing />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/privacy-policy" element={<Privacy />} />

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

                    {/* Admin panel: own login, own layout (checks role itself) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="conversations" element={<AdminConversations />} />
                      <Route path="meetings" element={<AdminMeetings />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="logs" element={<AdminLogs />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="roles" element={<AdminRoles />} />
                      <Route path="team" element={<AdminTeam />} />
                      <Route path="activity" element={<AdminActivity />} />
                      <Route path="analytics" element={<AdminAnalytics focus="platform" />} />
                      <Route path="messaging/analytics" element={<AdminAnalytics focus="messaging" />} />
                      <Route path="messaging/oversight" element={<AdminOversight />} />
                      <Route path="messaging/settings" element={<AdminMsgSettings />} />
                      <Route path="notifications/settings" element={<AdminNotifSettings />} />
                      <Route path="sessions" element={<AdminSessions />} />
                      <Route path="policies" element={<AdminPolicies />} />
                      <Route path="alerts" element={<AdminAlerts view="alerts" />} />
                      <Route path="incidents" element={<AdminAlerts view="incidents" />} />
                      <Route path="security-logs" element={<AdminLogs fixed="security" />} />
                      <Route path="audit-logs" element={<AdminLogs fixed="audit" />} />
                      <Route path="meetings/monitoring" element={<Navigate to="/admin/meetings" replace />} />
                    </Route>

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
