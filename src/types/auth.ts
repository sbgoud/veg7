export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'user' | 'admin' | 'rider'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}