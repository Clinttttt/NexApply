export type UserRole = 'Student' | 'Company';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  error?: string;
  statusCode?: number;
  validationErrors?: Record<string, string[]>;
}
