import { createContext } from "react";
import { AdminUser } from "@/types/admin";

export interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
