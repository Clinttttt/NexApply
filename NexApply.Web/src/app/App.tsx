import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { authService } from '@/shared/api/authService';
import { Login } from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import { ForgotPassword } from '@/features/auth/ForgotPassword';
import { BrowseJobs }  from '@/features/student/jobs/BrowseJobs';
import { CompanyProfile } from '@/features/company/profile/CompanyProfile';
import { Dashboard } from '@/features/student/dashboard/StudentDashboard';
import Applications from '@/features/student/applications/Applications';
import JobBoard from '@/features/student/job-board/JobBoard';
import {Notifications} from '@/features/student/notifications/Notifications';
import {SavedJobs} from '@/features/student/saved-jobs/SavedJobs';
import CompanyDashboard from '@/features/company/dashboard/CompanyDashboard';
import CompanyPostJob from '@/features/company/jobs/CompanyPostJob';
import CompanyManageJobs from '@/features/company/jobs/CompanyManageJobs';
import CompanyApplicants from '@/features/company/applicants/CompanyApplicants';
import CompanyApplicantProfile from '@/features/company/applicants/CompanyApplicantProfile';
import CompanyInterviews from '@/features/company/interviews/CompanyInterviews';
import CompanyMessages from '@/features/company/messages/CompanyMessages';
import CompanyJobView from '@/features/company/jobs/CompanyJobView';
import CompanyEditJob from '@/features/company/jobs/CompanyEditJob';
import CompanySettings from '@/features/company/settings/CompanySettings';
import { StudentProfile } from '@/features/student/profile/StudentProfile';
import StudentMessages from '@/features/student/messages/StudentMessages';
import StudentSettings from '@/features/student/settings/StudentSettings';

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
