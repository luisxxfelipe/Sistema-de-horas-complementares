import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabase } from "../supabase";

const ResetPaper = styled(Paper)(({ theme }) => ({
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

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se tem os parâmetros necessários na URL
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    
    if (!accessToken || !refreshToken) {
      setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
      return;
    }

    // Configurar a sessão do Supabase com os tokens
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar a senha no Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess("Senha redefinida com sucesso!");
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
      <Container maxWidth="sm">
        <LogoContainer>
          <LogoCircle>
            <SchoolIcon sx={{ fontSize: 40, color: "#3C6178" }} />
          </LogoCircle>
        </LogoContainer>

        <ResetPaper elevation={0}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Nova Senha
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Digite sua nova senha abaixo
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nova Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="••••••••"
              sx={{ mb: 3 }}
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

            <TextField
              label="Confirmar Nova Senha"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="••••••••"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: "#3C6178",
                color: "#FFF",
                "&:hover": { backgroundColor: "#2e4f5e" },
                borderRadius: 2,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>
        </ResetPaper>
      </Container>
    </Box>
  );
};

export default ResetPassword;