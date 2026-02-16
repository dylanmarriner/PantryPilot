import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "./api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = await apiService.getAuthToken();
      if (token) {
        await validateToken();
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const validateToken = async () => {
    try {
      const response = await apiService.get("/auth/validate");
      setUser(response.user);
    } catch (error) {
      console.error("Token validation failed:", error);
      await apiService.clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });
      const { user: userData, token } = response;

      await apiService.setAuthToken(token);
      setUser(userData);

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || "Sign in failed";
      throw new Error(message);
    }
  };

  const signUp = async (userData) => {
    try {
      const { email, password, firstName, lastName } = userData;
      const response = await apiService.post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });
      const { user, token } = response;

      await apiService.setAuthToken(token);
      setUser(user);

      return user;
    } catch (error) {
      const message = error.response?.data?.message || "Sign up failed";
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      await apiService.clearAuthToken();
      setUser(null);
    }
  };

  const resetPassword = async (email) => {
    try {
      await apiService.post("/auth/reset-password", { email });
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.put("/auth/profile", profileData);
      setUser(response.user);
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
