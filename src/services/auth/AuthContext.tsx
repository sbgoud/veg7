import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, User, SignUpData, SignInData } from '../../types/auth'
import { AuthService } from './authService'

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{ user: User | null; error: string | null }>
  signIn: (data: SignInData) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Check for existing session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user, error } = await AuthService.getCurrentUser()

        if (user && !error) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initializeAuth()
  }, [])

  const signUp = async (data: SignUpData): Promise<{ user: User | null; error: string | null }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    const result = await AuthService.signUp(data)

    if (result.user && !result.error) {
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    return result
  }

  const signIn = async (data: SignInData): Promise<{ user: User | null; error: string | null }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    const result = await AuthService.signIn(data)

    if (result.user && !result.error) {
      setAuthState({
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    return result
  }

  const signOut = async (): Promise<{ error: string | null }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    const result = await AuthService.signOut()

    if (!result.error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }

    return result
  }

  const refreshUser = async (): Promise<void> => {
    const { user, error } = await AuthService.getCurrentUser()

    if (user && !error) {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }))
    } else {
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }))
    }
  }

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}