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
        // Wait a moment for auth to be fully processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create user profile in our custom users table with retry logic
        const maxRetries = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
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

            if (!profileError) {
              console.log('User profile created successfully');
              break;
            }

            lastError = profileError;
            console.log(`Profile creation attempt ${attempt} failed:`, profileError.message);

            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          } catch (error) {
            lastError = error;
            console.error(`Profile creation attempt ${attempt} error:`, error);
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        if (lastError) {
          console.error('Final error creating user profile:', lastError);
          return { user: null, error: 'Failed to create user profile: ' + lastError.message }
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
         // Profile doesn't exist, create one automatically with retry logic
         console.log('User profile not found, creating one...')

         const maxRetries = 3;
         let lastError;

         for (let attempt = 1; attempt <= maxRetries; attempt++) {
           try {
             const { error: createError } = await supabase
               .from('users')
               .insert({
                 id: userId,
                 email: email,
                 full_name: userMetadata?.full_name || 'User',
                 phone: userMetadata?.phone || '',
                 role: 'user',
                 is_active: true,
               })

             if (!createError) {
               console.log('User profile created successfully');
               break;
             }

             lastError = createError;
             console.log(`Profile creation attempt ${attempt} failed:`, createError.message);

             if (attempt < maxRetries) {
               await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
             }
           } catch (error) {
             lastError = error;
             console.error(`Profile creation attempt ${attempt} error:`, error);
             if (attempt < maxRetries) {
               await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
             }
           }
         }

         if (lastError) {
           console.error('Failed to create user profile after retries:', lastError);
           return { user: null, error: 'Failed to create user profile: ' + lastError.message }
         }

         // Wait a bit for profile creation to complete
         await new Promise(resolve => setTimeout(resolve, 500));

         // Try to fetch the profile again
         const { data: newProfile, error: fetchError } = await supabase
           .from('users')
           .select('*')
           .eq('id', userId)
           .single()

         if (fetchError) {
           console.error('Error fetching newly created profile:', fetchError)
           return { user: null, error: 'Failed to fetch user profile' }
         }

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
       return { user: null, error: 'An unexpected error occurred' }
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