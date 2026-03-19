import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  login: (user: { email: string; password: string }) => Promise<void>;
  signUp: (user: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

const signUp = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const { data } = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });
    if (data.user) {
      localStorage.setItem("token", data.token);
      setUser(data.user as IUser);
      setIsLoggedIn(true);
    }
    toast.success(data.message);
  } catch (error: any) {
    // Show the backend error message to the user
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }
};

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const { data } = await api.post("/api/auth/login", {
      email,
      password,
    });
    if (data.user) {
      localStorage.setItem("token", data.token);
      setUser(data.user as IUser);
      setIsLoggedIn(true);
    }
    toast.success(data.message);
  } catch (error: any) {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
  }
};

const navigate = useNavigate()
  const logout = async () => {
    try {
      const { data } = await api.post("/api/auth/logout");
      // Remove token from localStorage on logout
      localStorage.removeItem("token");
      setUser(null);
      setIsLoggedIn(false);
      navigate('/')
      toast.success(data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUser = async () => {
    try {
      // Only fetch if token exists — avoids unnecessary 401 errors on load
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await api.get("/api/auth/verify");
      if (data.user) {
        setUser(data.user as IUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      // Token is expired or invalid — clean it up silently
      localStorage.removeItem("token");
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUser();
    })();
  }, []);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    signUp,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);