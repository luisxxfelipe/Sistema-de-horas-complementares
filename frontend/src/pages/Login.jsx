import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { login } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Componentes estilizados
const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
}));

const LogoCircle = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: "50%",
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontWeight: 600,
  "&:hover": {
    textDecoration: "underline",
  },
}));

const Login = () => {
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await login(formData.email, formData.senha);
      if (data && data.token) {
        handleLogin(data.token);
      } else {
        setError(data.message || "Credenciais inválidas.");
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #3C6178 0%, #2e4f5e 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <LogoContainer>
          <LogoCircle>
            <SchoolIcon sx={{ fontSize: 40, color: "#3C6178" }} />
          </LogoCircle>
        </LogoContainer>

        <LoginPaper elevation={0}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Bem-vindo de volta
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Entre com suas credenciais para acessar o sistema
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              placeholder="seu.email@discente.uemg.br"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              name="senha"
              type={showPassword ? "text" : "password"}
              value={formData.senha}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              placeholder="••••••••"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mb: 2 }}
            >
              <Typography variant="body2">
                <StyledLink to="/forgot-password">Esqueceu a senha?</StyledLink>
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                backgroundColor: "#3C6178",
                color: "#FFF",
                "&:hover": { backgroundColor: "#2e4f5e" },
                borderRadius: 2,
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Ainda não tem uma conta?{" "}
                <StyledLink to="/signup">Cadastre-se</StyledLink>
              </Typography>
            </Box>
          </form>
        </LoginPaper>
      </Container>
    </Box>
  );
};

export default Login;
