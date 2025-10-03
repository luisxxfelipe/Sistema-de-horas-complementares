import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const StudentRoute = ({ children }) => {
  const { user, role } = useAuth();

  if (!user || role === "admin") {
    return <Navigate to="/admin-dashboard" />; // Redireciona admins para o AdminPanel
  }

  return children;
};

export default StudentRoute;