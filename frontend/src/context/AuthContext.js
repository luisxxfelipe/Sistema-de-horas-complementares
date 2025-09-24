import { createContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe } from "../api/auth";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
        return;
      }
      const data = await getMe(token);
      if (!data || data.message) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (location.pathname !== "/login" && location.pathname !== "/signup") {
          navigate("/login");
        }
        return;
      }
      setUser(data);
      setRole(data.role);
      setLoading(false);
      // Se estiver na tela de login, redireciona para dashboard
      if (location.pathname === "/login" || location.pathname === "/signup") {
        navigate("/dashboard");
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [navigate, location, token]);

  useEffect(() => {
    // Aplica dark mode global quando usuário logado e preferência ativa
    if (user && user.dark_mode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [user]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, role, setUser, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
