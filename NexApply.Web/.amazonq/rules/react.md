# NexApply React Frontend

## Stack
- React 19 + TypeScript + Vite
- React Query (TanStack Query) for data fetching
- React Router v7 for routing
- Tailwind CSS v4 for styling
- Axios for HTTP client
- Backend: .NET 9 API at https://localhost:7001

## Project Structure
```
src/
├── components/       ← Reusable UI (ProtectedRoute, Sidebar, etc.)
├── pages/           ← Page components (Dashboard, Login, BrowseJobs, etc.)
├── services/        ← API service functions (authService, jobService, etc.)
├── lib/             ← Utilities (apiClient with interceptors)
├── types/           ← TypeScript interfaces (DTOs from C#)
├── hooks/           ← Custom React hooks
└── App.tsx          ← Main app with Router + QueryClient
```

## Key Patterns

### API Calls with React Query
```tsx
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

const { data, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: async () => {
    const res = await apiClient.get('/jobs');
    return res.data;
  }
});
```

### Mutations (POST/PUT/DELETE)
```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/jobs', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }
});
```

### Protected Routes
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Authentication
- Tokens stored in **secure cookies** (NOT localStorage)
- Uses `js-cookie` library with security flags:
  - `secure: true` (HTTPS only in production)
  - `sameSite: 'strict'` (CSRF protection)
  - `expires: 1` day for accessToken, 7 days for refreshToken
- apiClient automatically attaches Bearer token to requests
- Auto-refresh on 401 responses
- Use `cookieService` helper for all cookie operations
- Never access cookies directly, always use `cookieService`

## Design System
Use existing NexApply colors:
- Primary: #1D4ED8
- Slate grays: #0F172A, #475569, #64748B, #E2E8F0, #F8FAFC
- Accent: Amber (#D97706), Green (#059669), Red (#DC2626)

## Rules
- Always use TypeScript
- Use functional components with hooks
- Use React Query for ALL API calls
- Handle loading, error, and empty states
- Use Tailwind CSS classes, avoid inline styles
- Keep components under 200 lines
- Extract reusable logic into custom hooks
- Use proper TypeScript types
