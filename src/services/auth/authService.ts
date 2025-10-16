import { supabase } from '../api/supabase'
import { SignUpData, SignInData, User } from '../../types/auth'

export class AuthService {
  // Sign up with email and password (no email verification required)
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      console.log('🔄 Starting signup process for:', data.email);

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
        console.error('❌ Auth signup failed:', authError);
        return { user: null, error: authError.message }
      }

      if (authData.user) {
        console.log('✅ Auth user created:', authData.user.id);

        // Wait for auth to be fully processed and try to get current session
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the current session to ensure we're authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.log('⚠️ No active session after signup, but continuing...');
        }

        // Try to create the user profile
        try {
          console.log('🔄 Attempting to create user profile...');

          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email: data.email,
              full_name: data.full_name,
              phone: data.phone || '',
              role: 'user',
              is_active: true,
              password_hash: 'supabase-managed', // Dummy value since Supabase handles auth
            })
            .select()
            .single();

          if (profileError) {
            console.error('❌ Profile creation failed:', profileError);
            // Don't return error here, the user account was created successfully
            // The profile can be created later during first login
          } else {
            console.log('✅ User profile created successfully');
          }
        } catch (error) {
          console.error('❌ Profile creation error:', error);
          // Continue anyway - the auth user was created successfully
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

        console.log('✅ Signup process completed successfully');
        return { user, error: null }
      }

      console.error('❌ Unexpected signup failure');
      return { user: null, error: 'Signup failed' }
    } catch (error) {
      console.error('❌ Signup error:', error)
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
        return await this.getOrCreateUserProfile(authData.user.id, data.email, authData.user.user_metadata)
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

  // Helper method to get or create user profile
  static async getOrCreateUserProfile(userId: string, email: string, userMetadata?: any): Promise<{ user: User | null; error: string | null }> {
     try {
       // Try to get user profile from our custom users table
       const { data: profile, error: profileError } = await supabase
         .from('users')
         .select('*')
         .eq('id', userId)
         .single()

       if (profileError && profileError.code === 'PGRST116') {
         // Profile doesn't exist, create one automatically
         console.log('User profile not found, creating one...')

         try {
           const { error: createError } = await supabase
             .from('users')
             .upsert({
               id: userId,
               email: email,
               full_name: userMetadata?.full_name || 'User',
               phone: userMetadata?.phone || '',
               role: 'user',
               is_active: true,
               password_hash: 'supabase-managed', // Dummy value since Supabase handles auth
             })

           if (createError) {
             console.error('Failed to create user profile:', createError.message);
             // Return a basic user object even if profile creation fails
             // This allows the app to continue working
             const user: User = {
               id: userId,
               email: email,
               full_name: userMetadata?.full_name || 'User',
               phone: userMetadata?.phone || '',
               role: 'user',
               is_active: true,
               created_at: new Date().toISOString(),
               updated_at: new Date().toISOString(),
             }
             return { user, error: null }
           }

           console.log('User profile created successfully');
         } catch (error) {
           console.error('Error creating user profile:', error);
           // Return basic user object to keep app functional
         }

         // Wait a bit and try to fetch the profile again
         await new Promise(resolve => setTimeout(resolve, 1000));

         const { data: newProfile, error: fetchError } = await supabase
           .from('users')
           .select('*')
           .eq('id', userId)
           .single()

         if (fetchError) {
           console.log('Profile not found after creation, using basic user object');
         } else {
           const user: User = {
             id: newProfile.id,
             email: newProfile.email,
             full_name: newProfile.full_name,
             phone: newProfile.phone,
             role: newProfile.role,
             is_active: newProfile.is_active,
             created_at: newProfile.created_at,
             updated_at: newProfile.updated_at,
           }
           return { user, error: null }
         }
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
     } catch (error) {
       console.error('Get or create user profile error:', error)
       // Return basic user object to prevent app crashes
       const user: User = {
         id: userId,
         email: email,
         full_name: userMetadata?.full_name || 'User',
         phone: userMetadata?.phone || '',
         role: 'user',
         is_active: true,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString(),
       }
       return { user, error: null }
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
         return await this.getOrCreateUserProfile(authUser.id, authUser.email || '', authUser.user_metadata)
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