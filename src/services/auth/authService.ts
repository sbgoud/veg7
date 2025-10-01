import { supabase } from '../api/supabase'
import { SignUpData, SignInData, User } from '../../types/auth'

export class AuthService {
  // Sign up with email and password (no email verification required)
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone || '',
          }
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (authData.user) {
        // Create user profile in our custom users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone || '',
            role: 'user',
            is_active: true,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          return { user: null, error: 'Failed to create user profile' }
        }

        const user: User = {
          id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        return { user, error: null }
      }

      return { user: null, error: 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with email and password
  static async signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (authData.user) {
        // Try to get user profile from our custom users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one automatically
          console.log('User profile not found, creating one...')

          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: data.email,
              full_name: authData.user.user_metadata?.full_name || 'User',
              phone: authData.user.user_metadata?.phone || '',
              role: 'user',
              is_active: true,
            })

          if (createError) {
            console.error('Error creating user profile:', createError)
            // Continue with basic auth user info instead of failing
            console.log('Continuing with basic authentication...')
          }

          // Wait a bit for profile creation to complete
          await new Promise(resolve => setTimeout(resolve, 500));

          // Try to fetch the profile again
          const { data: newProfile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching new user profile:', fetchError)
          }

          const user: User = {
            id: authData.user.id,
            email: data.email,
            full_name: authData.user.user_metadata?.full_name || 'User',
            phone: authData.user.user_metadata?.phone || '',
            role: 'user',
            is_active: true,
            created_at: newProfile?.created_at || new Date().toISOString(),
            updated_at: newProfile?.updated_at || new Date().toISOString(),
          }

          return { user, error: null }
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError)
          return { user: null, error: 'Failed to fetch user profile' }
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        }

        return { user, error: null }
      }

      return { user: null, error: 'Sign in failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (authUser) {
        // Try to get user profile from our custom users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one automatically
          console.log('User profile not found, creating one...')

          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || 'User',
              phone: authUser.user_metadata?.phone || '',
              role: 'user',
              is_active: true,
            })

          if (createError) {
            console.error('Error creating user profile:', createError)
            // Continue with basic auth user info instead of failing
          }

          // Wait a bit for profile creation to complete
          await new Promise(resolve => setTimeout(resolve, 500));

          // Try to fetch the profile again
          const { data: newProfile, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching new user profile:', fetchError)
          }

          const user: User = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || 'User',
            phone: authUser.user_metadata?.phone || '',
            role: 'user',
            is_active: true,
            created_at: newProfile?.created_at || new Date().toISOString(),
            updated_at: newProfile?.updated_at || new Date().toISOString(),
          }

          return { user, error: null }
        } else if (profileError) {
          console.error('Error fetching user profile:', profileError)
          return { user: null, error: 'Failed to fetch user profile' }
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          is_active: profile.is_active,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        }

        return { user, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Reset password (if needed later)
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error: error?.message || null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }
}