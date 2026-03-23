import { useEffect, useState } from 'react';
import { getCurrentAdminUser, loginAdmin, logoutAdmin } from '@/services/adminAuth';
import { getStoredAdminUser } from '@/lib/adminSession';
import { AdminUser } from '@/types/admin';
import { AuthContext } from '@/contexts/auth-context';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredAdminUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);

    try {
      const currentUser = await getCurrentAdminUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Admin session refresh failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const session = await loginAdmin({ email, password, rememberMe });
      setUser(session.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    void logoutAdmin();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;