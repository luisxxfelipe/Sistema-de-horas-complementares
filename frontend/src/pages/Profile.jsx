"use client";

import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile, updateUserPreferences, updateUserPassword, uploadAvatar, getUserPreferences, getUserLoginLogs } from "../api/users";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import InputMask from "react-input-mask";
import React from "react";
import Sidebar from "../components/Sidebar";

// Componentes estilizados
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Estados para dados do usuário
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    matricula: "",
    phone: "",
    curso: "",
    semestreEntrada: "",
    avatar_url: null,
  });

  // Estados para formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Estados para preferências
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false,
    activityReminders: true,
  });

  // Estado para logs de login
  const [loginLogs, setLoginLogs] = useState([]);

  // Carregar dados do usuário e logs de login
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const data = await getUserProfile(token);
        if (!data || data.message) throw new Error(data?.message || "Erro ao carregar dados do usuário");
        setUserData({
          nome: data.nome || "Nome do Usuário",
          email: data.email || "email@exemplo.com",
          matricula: data.matricula || "000000",
          phone: data.phone || "(00) 00000-0000",
          cursos: data.cursos || [],
          semestreEntrada: data.semestre_entrada,
          avatar_url: data.url_profile || null,
        });
        // Buscar preferências reais
        const pref = await getUserPreferences(token);
        setPreferences({
          emailNotifications: !!pref.email_notifications,
          darkMode: !!pref.dark_mode,
          activityReminders: !!pref.activity_reminders,
        });
        // Buscar logs de login reais
        const logs = await getUserLoginLogs(token);
        setLoginLogs(Array.isArray(logs) ? logs : []);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Erro ao carregar dados do usuário",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Recarregar dados originais se cancelar a edição
      // Aqui você poderia fazer uma nova chamada à API ou usar dados em cache
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handlePreferenceChange = (name) => (event) => {
    setPreferences({
      ...preferences,
      [name]: event.target.checked,
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateUserProfile({
        nome: userData.nome,
        phone: userData.phone,
      }, token);
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: result.message || "Perfil atualizado com sucesso!",
          severity: "success",
        });
        setEditMode(false);
      } else {
        throw new Error(result?.message || "Erro ao atualizar perfil");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao atualizar perfil",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateUserPreferences({
        email_notifications: preferences.emailNotifications,
        dark_mode: preferences.darkMode,
        activity_reminders: preferences.activityReminders,
      }, token);
      if (result && !result.message) {
        setSnackbar({
          open: true,
          message: "Preferências atualizadas com sucesso!",
          severity: "success",
        });
      } else {
        throw new Error(result?.message || "Erro ao atualizar preferências");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao atualizar preferências",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: "As senhas não coincidem",
        severity: "error",
      });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token);
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: "Senha atualizada com sucesso!",
          severity: "success",
        });
        setOpenPasswordDialog(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(result?.message || "Erro ao atualizar senha");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao atualizar senha",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const result = await uploadAvatar(file, token);
      if (result && result.url_profile) {
        setUserData((prev) => ({
          ...prev,
          avatar_url: result.url_profile,
        }));
        setSnackbar({
          open: true,
          message: "Avatar atualizado com sucesso!",
          severity: "success",
        });
      } else {
        throw new Error(result?.message || "Erro ao atualizar avatar");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Erro ao atualizar avatar",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7f9" }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          minHeight: "100vh",
          pt: { xs: 8, sm: 0 }, // <- aqui adiciona espaço no topo no mobile
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="#3C6178">
            Meu Perfil
          </Typography>
          <Button
            variant={editMode ? "outlined" : "contained"}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={handleEditToggle}
            sx={{
              backgroundColor: editMode ? "transparent" : "#3C6178",
              borderColor: "#3C6178",
              color: editMode ? "#3C6178" : "#fff",
              "&:hover": {
                backgroundColor: editMode
                  ? "rgba(60, 97, 120, 0.04)"
                  : "#2e4f5e",
                borderColor: "#2e4f5e",
              },
            }}
          >
            {editMode ? "Cancelar Edição" : "Editar Perfil"}
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100vh - 64px)",
            }}
          >
            <CircularProgress sx={{ color: "#3C6178" }} />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {/* Cabeçalho do perfil */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                gap: 4,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <ProfileAvatar
                  src={userData.avatar_url || "/placeholder.svg"}
                  alt={userData.nome}
                >
                  {!userData.avatar_url && userData.nome.charAt(0)}
                </ProfileAvatar>
                {editMode && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                  >
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarUpload}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        component="span"
                        sx={{
                          backgroundColor: "#3C6178",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "#2e4f5e",
                          },
                        }}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                  </Box>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {userData.nome}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {userData.cursos.length > 0 ? (
                    userData.cursos.map((curso, index) => (
                      <Chip
                        key={index}
                        icon={<SchoolIcon />}
                        label={curso}
                        variant="outlined"
                        sx={{
                          borderColor: "#3C6178",
                          color: "#3C6178",
                          mr: 1,
                          mb: 1,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Nenhum curso registrado
                    </Typography>
                  )}

                  <Chip
                    icon={<BadgeIcon />}
                    label={`Matrícula: ${userData.matricula}`}
                    variant="outlined"
                  />
                  <Chip
                    icon={<CalendarMonthIcon />}
                    label={`Ingresso: ${userData.semestreEntrada}`}
                    variant="outlined"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmailIcon color="action" />
                    <Typography variant="body1">{userData.email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1">{userData.phone}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Abas */}
            <Paper sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: "1px solid #e0e0e0",
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#3C6178",
                  },
                  "& .Mui-selected": {
                    color: "#3C6178 !important",
                  },
                }}
              >
                <Tab label="Informações Pessoais" />
                <Tab label="Segurança" />
                <Tab label="Preferências" />
              </Tabs>

              {/* Aba de Informações Pessoais */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      name="nome"
                      value={userData.nome}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      name="email"
                      value={userData.email}
                      disabled={true} // Email não pode ser alterado
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {/* Corrigido: InputMask customizado com forwardRef */}
                    <TextField
                      fullWidth
                      label="Telefone"
                      name="phone"
                      variant="outlined"
                      disabled={!editMode}
                      InputProps={{
                        inputComponent: React.forwardRef(function MaskedInput(props, ref) {
                          const { inputRef, ...other } = props;
                          return (
                            <InputMask
                              {...other}
                              mask="(99) 99999-9999"
                              value={userData.phone}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              ref={ref}
                            >
                              {(inputProps) => <input {...inputProps} />}
                            </InputMask>
                          );
                        }),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Matrícula"
                      name="matricula"
                      value={userData.matricula}
                      disabled={true} // Matrícula não pode ser alterada
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Semestre de Ingresso"
                      name="semestreEntrada"
                      type="text"
                      value={userData.semestreEntrada}
                      disabled={true}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {editMode && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          disabled={saving}
                          sx={{
                            backgroundColor: "#3C6178",
                            "&:hover": {
                              backgroundColor: "#2e4f5e",
                            },
                          }}
                        >
                          {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              {/* Aba de Segurança */}
              <TabPanel value={tabValue} index={1}>
                <ProfileCard>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "rgba(60, 97, 120, 0.1)",
                            color: "#3C6178",
                          }}
                        >
                          <LockIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">Senha</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Altere sua senha periodicamente para maior segurança
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={() => setOpenPasswordDialog(true)}
                        sx={{
                          borderColor: "#3C6178",
                          color: "#3C6178",
                          "&:hover": {
                            borderColor: "#2e4f5e",
                            backgroundColor: "rgba(60, 97, 120, 0.04)",
                          },
                        }}
                      >
                        Alterar Senha
                      </Button>
                    </Box>
                  </CardContent>
                </ProfileCard>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Atividade da Conta
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Monitore as atividades recentes da sua conta para garantir
                    que não haja acessos não autorizados.
                  </Typography>

                  <ProfileCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Últimos Acessos
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {loginLogs.length > 0 ? (
                          loginLogs.map((log, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 1,
                                borderRadius: 1,
                                bgcolor:
                                  index % 2 === 0
                                    ? "rgba(60, 97, 120, 0.04)"
                                    : "transparent",
                              }}
                            >
                              <Box>
                                <Typography variant="body1">
                                  {log.device_info || "Dispositivo desconhecido"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {log.location || log.ip_address || "Localização/IP desconhecido"} • {log.login_time ? new Date(log.login_time).toLocaleString() : ""}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum log de acesso encontrado
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </ProfileCard>
                </Box>
              </TabPanel>

              {/* Aba de Preferências */}
              <TabPanel value={tabValue} index={2}>
                <ProfileCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notificações
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.emailNotifications}
                            onChange={handlePreferenceChange(
                              "emailNotifications"
                            )}
                            color="primary"
                          />
                        }
                        label="Receber notificações por e-mail"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.activityReminders}
                            onChange={handlePreferenceChange(
                              "activityReminders"
                            )}
                            color="primary"
                          />
                        }
                        label="Lembretes de atividades pendentes"
                      />
                    </Box>
                  </CardContent>
                </ProfileCard>

                <ProfileCard sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Aparência
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.darkMode}
                          onChange={handlePreferenceChange("darkMode")}
                          color="primary"
                        />
                      }
                      label="Modo Escuro"
                    />
                  </CardContent>
                </ProfileCard>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSavePreferences}
                    disabled={saving}
                    sx={{
                      backgroundColor: "#3C6178",
                      "&:hover": {
                        backgroundColor: "#2e4f5e",
                      },
                    }}
                  >
                    {saving ? "Salvando..." : "Salvar Preferências"}
                  </Button>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        )}

        {/* Dialog para alteração de senha */}
        <Dialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Para alterar sua senha, preencha os campos abaixo:
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenPasswordDialog(false)}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              variant="contained"
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword ||
                saving
              }
              sx={{
                backgroundColor: "#3C6178",
                "&:hover": {
                  backgroundColor: "#2e4f5e",
                },
              }}
            >
              {saving ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Profile;
