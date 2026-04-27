# NexApply React Client Architecture Pattern

## Overview
React 18 + TypeScript SPA following clean architecture principles with API service layer, component-based UI, and centralized state management.

**IMPORTANT:** NexApply has migrated from Blazor Server to React + TypeScript.
- **NexApply.Client/** — DEPRECATED (Old Blazor Server project)
- **NexApply.Web/** — CURRENT (React + TypeScript + Vite)

---

## Project Structure

```
NexApply.Web/    (CURRENT - React + TypeScript + Vite)
├── src/
│   ├── components/
│   │   ├── layout/              ← Shared layout components (Sidebar, Header, etc.)
│   │   ├── ui/                  ← Reusable UI components (Button, Card, Badge, etc.)
│   │   └── features/            ← Feature-specific components
│   ├── pages/                   ← Route pages
│   ├── services/                ← API service implementations
│   │   ├── auth/
│   │   └── profile/
│   ├── hooks/                   ← Custom React hooks
│   ├── types/                   ← TypeScript types (generated from Contracts)
│   ├── utils/                   ← Helper functions
│   ├── contexts/                ← React contexts (Auth, Theme, etc.)
│   ├── App.tsx                  ← Root component
│   └── main.tsx                 ← Entry point
├── public/                      ← Static assets
└── package.json
```

---

## Tech Stack

- **React 18** — UI library
- **TypeScript** — Type safety
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **React Query (TanStack Query)** — Server state management
- **Zustand** — Client state management (optional)
- **React Hook Form** — Form handling
- **Zod** — Runtime validation
- **Vite** — Build tool

---

## Adding a New Feature (Step-by-Step)

### Step 1: Generate TypeScript Types from Contracts
**Tool:** NSwag or custom script to generate types from C# DTOs

```typescript
// types/feature.types.ts
export interface FeatureDto {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateFeatureCommand {
  name: string;
}

export interface UpdateFeatureCommand {
  id: string;
  name: string;
}
```

**Rules:**
- Types are generated from `NexApply.Contracts` DTOs
- Never manually write types that exist in Contracts
- Use `string` for Guid, `string` for DateTime (ISO 8601)

---

### Step 2: Create API Service
**Location:** `services/{feature}/{feature}.service.ts`

```typescript
import axios from 'axios';
import { Result } from '@/types/common.types';
import { FeatureDto, CreateFeatureCommand } from '@/types/feature.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const featureService = {
  getFeatures: async (): Promise<Result<FeatureDto[]>> => {
    const { data } = await axios.get<Result<FeatureDto[]>>(`${API_BASE}/api/features`);
    return data;
  },

  getFeature: async (id: string): Promise<Result<FeatureDto>> => {
    const { data } = await axios.get<Result<FeatureDto>>(`${API_BASE}/api/features/${id}`);
    return data;
  },

  createFeature: async (command: CreateFeatureCommand): Promise<Result<FeatureDto>> => {
    const { data } = await axios.post<Result<FeatureDto>>(`${API_BASE}/api/features`, command);
    return data;
  },

  updateFeature: async (command: UpdateFeatureCommand): Promise<Result<FeatureDto>> => {
    const { data } = await axios.put<Result<FeatureDto>>(`${API_BASE}/api/features`, command);
    return data;
  },

  deleteFeature: async (id: string): Promise<Result<boolean>> => {
    const { data } = await axios.delete<Result<boolean>>(`${API_BASE}/api/features/${id}`);
    return data;
  },
};
```

**Rules:**
- One service per feature area
- All methods return `Promise<Result<T>>`
- Use axios for HTTP calls
- Read base URL from environment variables
- Export service as object with methods

---

### Step 3: Create React Query Hooks
**Location:** `hooks/use{Feature}.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureService } from '@/services/feature/feature.service';
import { CreateFeatureCommand } from '@/types/feature.types';

export const useFeatures = () => {
  return useQuery({
    queryKey: ['features'],
    queryFn: featureService.getFeatures,
  });
};

export const useFeature = (id: string) => {
  return useQuery({
    queryKey: ['features', id],
    queryFn: () => featureService.getFeature(id),
    enabled: !!id,
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: featureService.createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: featureService.updateFeature,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['features', variables.id] });
    },
  });
};

export const useDeleteFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: featureService.deleteFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};
```

**Rules:**
- Use React Query for server state
- Query keys follow pattern: `['resource']` or `['resource', id]`
- Invalidate queries after mutations
- Use `enabled` flag for conditional queries

---

### Step 4: Create Page Component
**Location:** `pages/{Feature}Page.tsx`

```typescript
import { useState } from 'react';
import { useFeatures, useCreateFeature } from '@/hooks/useFeature';
import { CreateFeatureCommand } from '@/types/feature.types';

export const FeaturePage = () => {
  const { data: result, isLoading, error } = useFeatures();
  const createMutation = useCreateFeature();

  const handleCreate = async (command: CreateFeatureCommand) => {
    try {
      const result = await createMutation.mutateAsync(command);
      if (result.isSuccess) {
        // Success handling
      } else {
        // Error handling
      }
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load data" />;
  }

  if (!result?.isSuccess || !result.value) {
    return <ErrorMessage message={result?.errorMessage ?? 'No data'} />;
  }

  return (
    <div className="page-container">
      <PageHeader title="Feature" subtitle="Description" />
      
      <div className="page-content">
        {result.value.length === 0 ? (
          <EmptyState message="No items found" />
        ) : (
          <div className="items-grid">
            {result.value.map((item) => (
              <FeatureCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

**Rules:**
- Use React Query hooks for data fetching
- Handle loading, error, and empty states
- Extract reusable components
- Use TypeScript for type safety
- Follow Result<T> pattern from API

---

## Authentication Flow

### Token Storage
- Tokens stored in httpOnly cookies (set by API)
- Axios interceptor attaches cookies automatically
- No manual token management in React code

### Axios Configuration
**Location:** `utils/axios.config.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies with requests
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {}, {
          withCredentials: true,
        });

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Auth Context
**Location:** `contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth/auth.service';
import { UserDto } from '@/types/auth.types';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (result.isSuccess && result.value) {
          setUser(result.value);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login({ username, password });
    if (result.isSuccess && result.value) {
      setUser(result.value.user);
    } else {
      throw new Error(result.errorMessage ?? 'Login failed');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Protected Routes

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

---

## Result<T> Pattern

### Type Definition
```typescript
// types/common.types.ts
export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  errorMessage?: string;
  statusCode?: number;
  validationErrors?: Record<string, string[]>;
}
```

### Usage in Components
```typescript
const { data: result } = useFeatures();

if (result?.isSuccess && result.value) {
  // Use result.value
}

if (!result?.isSuccess) {
  // Show result.errorMessage
}
```

---

## Component Patterns

### Loading State
```tsx
{isLoading && (
  <div className="loading-container">
    <LoadingSpinner />
    <p>Loading...</p>
  </div>
)}
```

### Error State
```tsx
{error && (
  <div className="error-container">
    <ErrorIcon />
    <p>{error.message}</p>
    <button onClick={refetch}>Retry</button>
  </div>
)}
```

### Empty State
```tsx
{items.length === 0 && (
  <div className="empty-state">
    <EmptyIcon />
    <h3>No items found</h3>
    <p>Get started by creating your first item</p>
    <button onClick={handleCreate}>Create Item</button>
  </div>
)}
```

---

## Best Practices

### DO ✅
- Use React Query for server state
- Use TypeScript for type safety
- Generate types from C# Contracts
- Store tokens in httpOnly cookies
- Use axios interceptors for token refresh
- Handle loading, error, and empty states
- Extract reusable components
- Use custom hooks for business logic
- Follow Result<T> pattern from API
- Use environment variables for config

### DON'T ❌
- Don't store tokens in localStorage
- Don't manually manage auth tokens
- Don't put business logic in components
- Don't use `any` type
- Don't hardcode API URLs
- Don't expose stack traces to users
- Don't forget error handling
- Don't skip loading states
- Don't reference NexApply.Api from Client

---

## File Naming Conventions

- **Components:** `ComponentName.tsx` (PascalCase)
- **Pages:** `PageName.tsx` or `PageNamePage.tsx`
- **Services:** `feature.service.ts` (camelCase)
- **Hooks:** `useFeatureName.ts` (camelCase)
- **Types:** `feature.types.ts` (camelCase)
- **Utils:** `utilName.ts` (camelCase)
- **Contexts:** `FeatureContext.tsx` (PascalCase)

---

## Folder Organization

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageHeader.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   └── features/
│       └── job/
│           ├── JobCard.tsx
│           └── JobList.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── JobsPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── auth/
│   │   └── auth.service.ts
│   └── job/
│       └── job.service.ts
├── hooks/
│   ├── useAuth.ts
│   └── useJobs.ts
├── types/
│   ├── common.types.ts
│   ├── auth.types.ts
│   └── job.types.ts
└── utils/
    ├── axios.config.ts
    └── formatters.ts
```

---

## Summary

1. **Generate TypeScript types** from C# Contracts
2. **Create API service** with axios
3. **Create React Query hooks** for data fetching
4. **Create page component** with loading/error/empty states
5. **Use AuthContext** for authentication
6. **Use Result<T> pattern** for API responses
7. **Store tokens in httpOnly cookies** (no manual management)

Follow this pattern for every new feature to maintain consistency! 🚀
