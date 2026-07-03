import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/auth/Login';
import DashboardPage from './pages/dashboard/Dashboard';
import HomeInfoPage from './pages/dashboard/HomeInfo';
import ClanPage from './pages/clan/ClanList';
import ClanAddPage from './pages/clan/ClanAdd';
import ClanEditPage from './pages/clan/ClanEdit';
import ClanTrackPage from './pages/clan/ClanTrack';
import UserPage from './pages/user/UserList';
import UserAddPage from './pages/user/UserAdd';
import UserEditPage from './pages/user/UserEdit';
import UserClansPage from './pages/user/UserClans';
import TrackPage from './pages/track/TrackList';
import TrackInsertPage from './pages/track/TrackInsert';
import RoundPage from './pages/track/RoundList';
import RoundAddPage from './pages/track/RoundAdd';
import OperateLogPage from './pages/log/OperateLog';
import LoginLogPage from './pages/log/LoginLog';
import SettingsPage from './pages/settings/Settings';
import MiddleTrackPage from './pages/middle/MiddleTrack';
import ReadCompoPage from './pages/middle/ReadCompo';
import { useUserStore } from './store/user';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useUserStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useUserStore((s) => s.token);
  const isAdmin = useUserStore((s) => s.isAdmin());
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/middle-track/:tag" element={
          <DashboardLayout>
            <MiddleTrackPage />
          </DashboardLayout>
        } />
        <Route path="/read-compo" element={
          <DashboardLayout>
            <ReadCompoPage />
          </DashboardLayout>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/home-info" element={
          <ProtectedRoute>
            <DashboardLayout>
              <HomeInfoPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clan" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClanPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clan-add" element={
          <AdminRoute>
            <DashboardLayout>
              <ClanAddPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/clan-update/:id" element={
          <AdminRoute>
            <DashboardLayout>
              <ClanEditPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/clan-track/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClanTrackPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <AdminRoute>
            <DashboardLayout>
              <UserPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/user-add" element={
          <AdminRoute>
            <DashboardLayout>
              <UserAddPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/user-update/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserEditPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/user-clans/:id" element={
          <AdminRoute>
            <DashboardLayout>
              <UserClansPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/track" element={
          <AdminRoute>
            <DashboardLayout>
              <TrackPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/track-insert" element={
          <AdminRoute>
            <DashboardLayout>
              <TrackInsertPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/round" element={
          <AdminRoute>
            <DashboardLayout>
              <RoundPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/round-insert" element={
          <AdminRoute>
            <DashboardLayout>
              <RoundAddPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/operate-log" element={
          <ProtectedRoute>
            <DashboardLayout>
              <OperateLogPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/login-log" element={
          <AdminRoute>
            <DashboardLayout>
              <LoginLogPage />
            </DashboardLayout>
          </AdminRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
