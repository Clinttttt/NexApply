import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Auth/Login';
import Register from './pages/Auth/Register';
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
import CompanyInterviews from './pages/Company/CompanyInterviews';
import CompanyMessages from './pages/Company/CompanyMessages';
import CompanyJobView from './pages/Company/CompanyJobView';
import CompanyEditJob from './pages/Company/CompanyEditJob';


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

     
          <Route path="/browse-jobs" element={ <ProtectedRoute> <BrowseJobs /> </ProtectedRoute> } />

          <Route path="/company-profile" element={ <ProtectedRoute> <CompanyProfile /> </ProtectedRoute> } />
        
          <Route path="/dashboard" element = { <Dashboard /> }/>

          <Route path="/my-applications" element={ <Applications /> } />

          <Route path="/job-board" element={ <JobBoard /> } />

          <Route path="/notifications" element={ <Notifications /> } />

          <Route path="/saved-jobs" element={ <SavedJobs /> } />

          <Route path="/company-dashboard" element={ <CompanyDashboard /> } />

          <Route path="/company-post-job" element={ <CompanyPostJob /> } />

          <Route path="/company-manage-jobs" element={ <CompanyManageJobs /> } />

          <Route path="/company-applicants" element={ <CompanyApplicants /> } />

          <Route path="/company-interviews" element={ <CompanyInterviews /> } />

          <Route path="/company-messages" element={ <CompanyMessages /> } />

          <Route path="/company/jobs/:id" element={ <CompanyJobView /> } />

          <Route path="/company/jobs/:id/edit" element={ <CompanyEditJob /> } />

          <Route path="/" element={<Navigate to="/dashboard" replace />}  />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;