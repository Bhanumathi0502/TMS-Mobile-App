import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API, { setAuthToken } from "../api";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("tms_token");
        const saved = await AsyncStorage.getItem("tms_user");
        if (token && saved) {
          setAuthToken(token);
          setUser(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    await AsyncStorage.setItem("tms_token", data.token);
    await AsyncStorage.setItem("tms_user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setUser(data.user);
  };

  const bootstrapSuperAdmin = async (payload) => {
    const { data } = await API.post("/auth/bootstrap-superadmin", payload);
    await AsyncStorage.setItem("tms_token", data.token);
    await AsyncStorage.setItem("tms_user", JSON.stringify(data.user));
    setAuthToken(data.token);
    setUser(data.user);
  };

  const updateUser = async (updatedUser) => {
    if (!updatedUser) return;
    await AsyncStorage.setItem("tms_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    const { data } = await API.get("/auth/me");
    await updateUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["tms_token", "tms_user"]);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, bootstrapSuperAdmin, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
