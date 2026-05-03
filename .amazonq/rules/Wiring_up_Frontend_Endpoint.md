Wire Frontend to Backend Endpoint
Project: NexApply — React + TypeScript Client

Feature: [Feature Name]
Slice: [CommandName / QueryName]
Endpoint: [HTTP_METHOD] /api/[route]
Role: [Student / Company / Public]

Based on: [page name / component description]

Generate:
1. TypeScript Types
Location: NexApply.Web/src/types/index.ts OR NexApply.Web/src/services/[feature]Service.ts

Add interfaces for Command/Query and Response DTO

Use string for Guid, string for DateTime (ISO 8601)

Match C# Contracts exactly

2. API Service Method
Location: NexApply.Web/src/services/[feature]Service.ts

Add method to existing service or create new service file

Use apiClient from @/lib/apiClient

Return Promise<Result<T>>

Wrap in try-catch block

Extract error from error.response?.data?.error or error.response?.data?.message

3. Update Page/Component
Location: NexApply.Web/src/pages/[Role]/[ComponentName].tsx

Import service method

Call service in useEffect or event handler

Use useState for loading, error, and data states

Handle result.isSuccess and result.value

Display loading spinner, error message, and data

Rules:
Types match C# Contracts exactly (Guid → string, DateTime → string)

Service methods use apiClient (NOT direct axios import)

Try-catch wraps every API call

Result pattern: { isSuccess, value?, error?, statusCode? }

Error extraction: error.response?.data?.error || error.response?.data?.message || 'Fallback message'

Components use useState for isLoading, error, data

Never store tokens manually (handled by apiClient interceptors)

Always use withCredentials: true (already in apiClient)

Example Structure:
1. Types (in service file or types/index.ts)
export interface [Command/Query] {
  field1: string;
  field2?: number;
}

export interface [Response]Dto {
  id: string;
  name: string;
  createdAt: string;
}

Copy
typescript
2. Service Method
// services/[feature]Service.ts
import apiClient from '../lib/apiClient';
import type { Result } from '../types';

export const [feature]Service = {
  async [methodName]([params]): Promise<Result<[Response]Dto>> {
    try {
      const response = await apiClient.[method]<[Response]Dto>('/[route]', [body]);
      return { isSuccess: true, value: response.data };
    } catch (error: any) {
      return {
        isSuccess: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Operation failed',
        statusCode: error.response?.status
      };
    }
  }
};


Copy
typescript
3. Component Usage
// pages/[Role]/[Component].tsx
import { useState, useEffect } from 'react';
import { [feature]Service } from '../../services/[feature]Service';

const [data, setData] = useState<[Response]Dto[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    const result = await [feature]Service.[methodName]();
    
    if (result.isSuccess && result.value) {
      setData(result.value);
    } else {
      setError(result.error || 'Failed to load data');
    }
    
    setIsLoading(false);
  };
  
  fetchData();
}, []);

// Render
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}
{!isLoading && !error && data.map(...)}


Copy
typescript
HTTP Methods:
GET: apiClient.get<T>('/route')

POST: apiClient.post<T>('/route', body)

PUT: apiClient.put<T>('/route', body)

DELETE: apiClient.delete<T>('/route')

Notes:

If service file exists, add method only

If types exist in types/index.ts, use them; otherwise define in service file

Update existing component state management, don't recreate

Follow existing patterns in companyProfileService.ts and CompanyApplicants.tsx