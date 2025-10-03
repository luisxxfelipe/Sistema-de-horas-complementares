import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import RegisterActivity from "./pages/RegisterActivity";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./routes/AdminRoute";
import StudentRoute from "./routes/StudentRoute";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import "./assets/styles/index.css";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Root = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rotas para alunos */}
        <Route
          path="/dashboard"
          element={
            <StudentRoute>
              <Dashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/register-activity"
          element={
            <StudentRoute>
              <RegisterActivity />
            </StudentRoute>
          }
        />

        {/* Rota para profile */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Rotas para administradores */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Redirecionamento baseado na role */}
        <Route path="/" element={<RedirectByRole />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

// Componente separado para garantir que o redirecionamento ocorra corretamente
const RedirectByRole = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate("/login");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, role, navigate]);
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
