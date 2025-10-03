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
    const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (!isPublicRoute) {
          navigate("/login");
        }
        return;
      }
      
      // Se estiver em rota pública e tiver token, verifica se é válido
      if (isPublicRoute) {
        try {
          const data = await getMe(token);
          if (data && !data.message) {
            setUser(data);
            setRole(data.role);
            // Redireciona para a página correta baseada no role
            if (data.role === "admin") {
              navigate("/admin-dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        } catch (error) {
          // Token inválido, remove e continua na página pública
          localStorage.removeItem("token");
          setToken(null);
        }
        setLoading(false);
        return;
      }
      
      // Para rotas privadas, valida o token
      const data = await getMe(token);
      if (!data || data.message) {
        setUser(null);
        setRole(null);
        setLoading(false);
        navigate("/login");
        return;
      }
      setUser(data);
      setRole(data.role);
      setLoading(false);
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
