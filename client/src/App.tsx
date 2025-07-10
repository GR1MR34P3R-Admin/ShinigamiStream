import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteProvider } from '@/contexts/SiteContext';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AnimeLibraryPage } from '@/pages/AnimeLibraryPage';
import { AnimeDetailPage } from '@/pages/AnimeDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { SiteSettingsPage } from '@/pages/SiteSettingsPage';
import { StaffManagementPage } from '@/pages/StaffManagementPage';
import { MyListPage } from '@/pages/MyListPage';

function App() {
  return (
    <SiteProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/anime" element={<AnimeLibraryPage />} />
                  <Route path="/anime/:id" element={<AnimeDetailPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/settings" element={<SiteSettingsPage />} />
                  <Route path="/admin/staff" element={<StaffManagementPage />} />
                  <Route path="/my-list" element={<MyListPage />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </SiteProvider>
  );
}

export default App;
