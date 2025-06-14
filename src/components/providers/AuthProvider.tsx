// src/components/providers/AuthProvider.tsx
'use client';

import { 
  createContext, 
  useState, 
  ReactNode, 
  useRef, 
  useCallback, 
  useEffect,
  useContext
} from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);
  const authSubscriptionRef = useRef<any>(null);

  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      if (!data) {
        console.log('ℹ️ Profile not found, creating new profile...');
        
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authUser?.user && !authError) {
          const userData = authUser.user;
          const fullName = userData.user_metadata?.full_name || 
                          userData.user_metadata?.name ||
                          userData.email?.split('@')[0] || 
                          'Usuario';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userData.email || '',
              full_name: fullName,
              role: userData.user_metadata?.role || 'parent',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ Error creating profile:', createError);
            return null;
          }
          
          console.log('✅ Profile created successfully:', newProfile.full_name);
          return newProfile as Profile;
        }
        return null;
      }

      console.log('✅ Profile fetched successfully:', data.full_name);
      return data as Profile;
    } catch (err) {
      console.error('❌ Unexpected error fetching profile:', err);
      return null;
    }
  }, [supabase]);

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Could not check admin status:', error);
        return false;
      }

      if (!data) {
        console.warn('⚠️ No profile found for admin check');
        return false;
      }

      return data.role === 'admin';
    } catch (err) {
      console.error('❌ Error checking admin status:', err);
      return false;
    }
  }, [supabase]);

  const updateLastLogin = useCallback(async (userId: string): Promise<void> => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (err) {
      console.warn('⚠️ Could not update last login:', err);
    }
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: UserRole): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('❌ Sign up error:', err);
      setError(err.message || 'Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: any) {
      console.error('❌ Sign out error:', err);
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev && { ...prev, ...updates });
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      setError(err.message || 'Error al actualizar el perfil');
      throw err;
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (err: any) {
      console.error('❌ Error resetting password:', err);
      setError(err.message || 'Error al restablecer la contraseña');
      throw err;
    }
  }, [supabase]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        if (profile) {
          setUser(profile);
          const adminStatus = await checkAdminStatus(data.session.user.id);
          setIsAdmin(adminStatus);
        }
      }
    } catch (err: any) {
      console.error('❌ Error refreshing user:', err);
      setError(err.message || 'Error al refrescar el usuario');
      throw err;
    }
  }, [supabase, fetchProfile, checkAdminStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSignedIn = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      await updateLastLogin(userId);
      const profile = await fetchProfile(userId);
      if (profile && mountedRef.current) {
        setUser(profile);
        const adminStatus = await checkAdminStatus(userId);
        if (mountedRef.current) {
          setIsAdmin(adminStatus);
        }
      }
    } catch (err) {
      console.error('❌ Error handling signed in state:', err);
      if (mountedRef.current) {
        setError('Error en el cambio de estado de autenticación');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [mountedRef, setLoading, setUser, setIsAdmin, setError, fetchProfile, checkAdminStatus, updateLastLogin]);

  const handleSignedOut = useCallback(() => {
    if (mountedRef.current) {
      setUser(null);
      setIsAdmin(false);
      setError(null);
    }
  }, [mountedRef, setUser, setIsAdmin, setError]);

  const handleTokenRefreshed = useCallback((userId: string | undefined) => {
    if (userId && mountedRef.current) {
      console.log('🔄 Token refreshed, maintaining user state');
    }
  }, [mountedRef]);

  const setupAuthListener = useCallback(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('🔄 Auth state changed:', event);
        
        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session?.user) {
                console.log('✅ User signed in, fetching profile...');
                await handleSignedIn(session.user.id);
              }
              break;
            
            case 'SIGNED_OUT':
              handleSignedOut();
              break;
            
            case 'TOKEN_REFRESHED':
              handleTokenRefreshed(session?.user?.id);
              break;
          }
        } catch (err) {
          console.error('❌ Error handling auth state change:', err);
          if (mountedRef.current) {
            setError('Error en el cambio de estado de autenticación');
          }
        }
      }
    );
    
    authSubscriptionRef.current = subscription;
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, mountedRef, setError, handleSignedIn, handleSignedOut, handleTokenRefreshed]);

  useEffect(() => {
    if (initializedRef.current) return;
    
    initializedRef.current = true;
    mountedRef.current = true;

    console.log('🚀 Initializing AuthProvider (ONE TIME ONLY)...');

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        }
      }

      const unsubscribe = setupAuthListener();

      return () => {
        console.log('🧹 Cleaning up AuthProvider...');
        mountedRef.current = false;
        
        if (unsubscribe) {
          unsubscribe();
          authSubscriptionRef.current = null;
        }
      };
    };

    initializeAuth();
  }, []);

  const contextValue = {
    user,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    refreshUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}