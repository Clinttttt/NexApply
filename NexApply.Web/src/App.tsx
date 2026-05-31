import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './services/authService';
import { Login } from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { BrowseJobs }  from './pages/Students/BrowseJobs';
import { CompanyProfile } from './pages/Company/CompanyProfile';
import { Dashboard } from './pages/Students/StudentDashboard';
import Applications from './pages/Students/Applications';
import JobBoard from './pages/Students/JobBoard';
import {Notifications} from './pages/Students/Notifications';
import {SavedJobs} from './pages/Students/SavedJobs';
import CompanyDashboard from './pages/Company/CompanyDashboard';
import CompanyPostJob from './pages/Company/CompanyPostJob';
import CompanyManageJobs from './pages/Company/CompanyManageJobs';  
import CompanyApplicants from './pages/Company/CompanyApplicants';
import CompanyApplicantProfile from './pages/Company/CompanyApplicantProfile';
import CompanyInterviews from './pages/Company/CompanyInterviews';
import CompanyMessages from './pages/Company/CompanyMessages';
import CompanyJobView from './pages/Company/CompanyJobView';
import CompanyEditJob from './pages/Company/CompanyEditJob';
import CompanySettings from './pages/Company/CompanySettings';
import { StudentProfile } from './pages/Students/StudentProfile';
import StudentMessages from './pages/Students/StudentMessages';
import StudentSettings from './pages/Students/StudentSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

     
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse-jobs"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <BrowseJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-board"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <JobBoard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <SavedJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-post-job"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyPostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-manage-jobs"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyManageJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-applicants"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyApplicants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-applicants/:applicationId"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyApplicantProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-interviews"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyInterviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-messages"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyMessages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyJobView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/jobs/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyEditJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-profile"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/settings"
            element={
              <ProtectedRoute allowedRoles={['Company']}>
                <CompanySettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              authService.isAuthenticated()
                ? <Navigate to={authService.getDefaultDashboardRoute()} replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
