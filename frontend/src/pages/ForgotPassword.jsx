import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { forgotPassword } from '../api/auth';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  padding: theme.spacing(2),
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3C6178',
  color: '#fff !important',
  padding: '12px 0',
  borderRadius: 8,
  fontSize: '16px',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#2e4f5e',
    color: '#fff !important',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: '#3C6178',
  textTransform: 'none',
  marginBottom: theme.spacing(2),
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSent(true);
        setMessage(result.message || 'Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else {
        setMessage(result.message || 'Erro ao enviar email de recuperação.');
      }
    } catch (error) {
      setMessage('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #3C6178 0%, #2e4f5e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <StyledCard>
        <CardContent>
          <BackButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
          >
            Voltar ao Login
          </BackButton>

          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="#3C6178" gutterBottom>
              Esqueceu a Senha?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digite seu email para receber as instruções de recuperação
            </Typography>
          </Box>

          {message && (
            <Alert 
              severity={sent ? "success" : "error"} 
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          {!sent && (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ mb: 3 }}
              />

              <StyledButton
                type="submit"
                fullWidth
                disabled={loading || !email}
                sx={{ mb: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Enviar Email de Recuperação'
                )}
              </StyledButton>
            </form>
          )}

          {sent && (
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Não recebeu o email?{' '}
                <Button 
                  variant="text" 
                  onClick={() => {setSent(false); setMessage('');}}
                  sx={{ color: '#3C6178', textTransform: 'none' }}
                >
                  Tentar novamente
                </Button>
              </Typography>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default ForgotPassword;