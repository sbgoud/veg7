import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthState, User, SignUpData, SignInData } from '../../types/auth'
import { AuthService } from './authService'
import { supabase } from '../api/supabase'

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{ user: User | null; error: string | null }>
  signIn: (data: SignInData) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  refreshUser: () => Promise<void>
  isProfileComplete: boolean
  checkProfileComplete: (user: User) => boolean
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

  const [isProfileComplete, setIsProfileComplete] = useState(false)

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

  const checkProfileComplete = (user: User): boolean => {
    return !!(user.full_name && user.full_name.trim() !== '' &&
              user.phone && user.phone.trim() !== '');
  }

  const refreshUser = async (): Promise<void> => {
    const { user, error } = await AuthService.getCurrentUser()

    if (user && !error) {
      const profileComplete = checkProfileComplete(user)
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }))
      setIsProfileComplete(profileComplete)
    } else {
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }))
      setIsProfileComplete(false)
    }
  }

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isProfileComplete,
    checkProfileComplete,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}