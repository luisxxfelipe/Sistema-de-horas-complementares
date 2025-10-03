import { useState, useEffect, useCallback } from "react";
import { getActivities, updateActivity } from "../api/activities";
import { formatDecimalHours } from "../lib/hoursFormatter";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Sidebar from "../components/Sidebar";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";

// Componentes estilizados
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  overflow: "hidden",
  overflowX: "auto", // Permite scroll horizontal no mobile
  marginBottom: theme.spacing(4),
  width: "100%",
  "& .MuiTable-root": {
    minWidth: 900, // Define largura mínima da tabela
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  "& .MuiTableCell-head": {
    fontWeight: 600,
    color: "#3C6178",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  "&:hover": {
    backgroundColor: "rgba(60, 97, 120, 0.05)",
  },
  transition: "background-color 0.2s",
}));

const SecretariaDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    all: true,
    pendente: false,
  });
  useEffect(() => {
    fetchActivities();
  }, []);

  // Atualizar atividades filtradas quando a busca ou filtros mudam
  const filterActivities = useCallback(() => {
    let filtered = [...activities];
    // Aplicar filtro de status
    if (!activeFilters.all) {
      if (activeFilters.pendente) {
        filtered = filtered.filter(
          (activity) => activity.status.toLowerCase() === "pendente"
        );
      }
    }
    // Aplicar busca por nome ou matrícula
    if (search) {
      filtered = filtered.filter(
        (activity) =>
          activity.users.nome.toLowerCase().includes(search.toLowerCase()) ||
          activity.users.matricula.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredActivities(filtered);
  }, [activities, activeFilters, search]);
  
  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await getActivities(token);
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        setActivities([]);
        setSnackbar({
          open: true,
          message: data?.message || "Erro ao carregar atividades",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao carregar atividades",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  // Abrir modal de avaliação
  const handleOpenDialog = (activity) => {
    setSelectedActivity(activity);
    setOpenDialog(true);
  };

  // Fechar modal
  const handleCloseDialog = () => {
    setSelectedActivity(null);
    setOpenDialog(false);
    setComment("");
  };

  // Aprovar atividade
  const handleApprove = async () => {
    if (!selectedActivity) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateActivity(
        selectedActivity.id,
        {
          status: "Aprovada",
          comentario: comment || "Aprovado sem comentário",
        },
        token
      );
      if (result && !result.message) {
        setSnackbar({
          open: true,
          message: "Atividade aprovada com sucesso!",
          severity: "success",
        });
        setActivities(
          activities.map((act) =>
            act.id === selectedActivity.id
              ? { ...act, status: "Aprovada" }
              : act
          )
        );
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: result?.message || "Erro ao aprovar a atividade",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Erro ao aprovar a atividade",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Rejeitar atividade
  const handleReject = async () => {
    if (!selectedActivity) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateActivity(
        selectedActivity.id,
        {
          status: "Rejeitada",
          comentario: comment || "Rejeitado sem comentário",
        },
        token
      );
      if (result && !result.message) {
        setSnackbar({
          open: true,
          message: "Atividade rejeitada com sucesso!",
          severity: "success",
        });
        setActivities(
          activities.map((act) =>
            act.id === selectedActivity.id
              ? { ...act, status: "Rejeitada" }
              : act
          )
        );
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: result?.message || "Erro ao rejeitar a atividade",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Erro ao rejeitar a atividade",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filterType) => {
    if (filterType === "all") {
      setActiveFilters({
        all: true,
        pendente: false,
      });
    } else {
      setActiveFilters({
        all: false,
        pendente: filterType === "pendente",
      });
    }
    handleFilterClose();
  };

  const getStatusChip = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "aprovada":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Aprovada"
            color="success"
            size="small"
          />
        );
      case "rejeitada":
        return (
          <Chip
            icon={<CancelIcon />}
            label="Rejeitada"
            color="error"
            size="small"
          />
        );
      default:
        return (
          <Chip
            label="Pendente"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
    }
  };

  // Estatísticas
  const totalActivities = activities.length;
  const pendingActivities = activities.filter(
    (a) => a.status.toLowerCase() === "pendente"
  ).length;
  const approvedActivities = activities.filter(
    (a) => a.status.toLowerCase() === "aprovada"
  ).length;
  const rejectedActivities = activities.filter(
    (a) => a.status.toLowerCase() === "rejeitada"
  ).length;

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
        }}
      >
        {/* Toolbar para compensar AppBar no mobile */}
        <Box sx={{ display: { xs: "block", sm: "none" }, height: 64 }} />
        
        <Box sx={{ 
          p: { xs: 2, sm: 4 }, // Padding responsivo
          width: "100%",
          maxWidth: "100%", // Garante que não extrapole a tela
        }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#3C6178"
            gutterBottom
          >
            Painel da Secretaria
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Gerencie e aprove as atividades complementares dos alunos
          </Typography>

          {/* Cards de estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(60, 97, 120, 0.1)",
                        color: "#3C6178",
                        mr: 2,
                      }}
                    >
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totalActivities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atividades registradas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(255, 152, 0, 0.1)",
                        color: "#ff9800",
                        mr: 2,
                      }}
                    >
                      <AccessTimeIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Pendentes
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {pendingActivities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aguardando avaliação
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.1)",
                        color: "#4caf50",
                        mr: 2,
                      }}
                    >
                      <CheckCircleIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Aprovadas
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {approvedActivities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atividades aprovadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "rgba(244, 67, 54, 0.1)",
                        color: "#f44336",
                        mr: 2,
                      }}
                    >
                      <CancelIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Rejeitadas
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {rejectedActivities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Atividades rejeitadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Barra de ferramentas */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <TextField
              placeholder="Buscar por aluno ou matrícula"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flexGrow: 1, maxWidth: 500 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                sx={{
                  borderColor: "#3C6178",
                  color: "#3C6178",
                  "&:hover": {
                    borderColor: "#2e4f5e",
                    backgroundColor: "rgba(60, 97, 120, 0.04)",
                  },
                }}
              >
                Filtrar
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <MenuItem
                  onClick={() => handleFilterChange("all")}
                  selected={activeFilters.all}
                >
                  Todas as atividades
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilterChange("pendente")}
                  selected={activeFilters.pendente}
                >
                  Apenas pendentes
                </MenuItem>
              </Menu>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  backgroundColor: "#3C6178",
                  "&:hover": {
                    backgroundColor: "#2e4f5e",
                  },
                }}
              >
                {refreshing ? "Atualizando..." : "Atualizar"}
              </Button>
            </Box>
          </Box>

          {/* Tabela de atividades */}
          <StyledTableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Atividade</TableCell>
                  <TableCell>Horas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Certificado</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {loading && filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={30} sx={{ color: "#3C6178" }} />
                      <Typography sx={{ mt: 1 }}>
                        Carregando atividades...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Nenhuma atividade encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <StyledTableRow key={activity.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              bgcolor: "#3C6178",
                            }}
                          >
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {activity.users?.nome || "Nome não disponível"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<SchoolIcon />}
                          label={activity.users?.matricula || "N/A"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{activity.activity_types?.nome || "Tipo não disponível"}</TableCell>
                      <TableCell>
                        <Chip
                          label={formatDecimalHours(activity.horas)}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(60, 97, 120, 0.1)",
                            color: "#3C6178",
                          }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(activity.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<DescriptionIcon />}
                          component={Link}
                          href={activity.certificado_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "#3C6178" }}
                        >
                          Certificado
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Avaliar atividade">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(activity)}
                            sx={{
                              color: "#3C6178",
                              "&:hover": {
                                backgroundColor: "rgba(60, 97, 120, 0.1)",
                              },
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </Box>

        {/* Modal de avaliação */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Avaliação de Atividade
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedActivity && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        bgcolor: "#3C6178",
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedActivity.users.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Matrícula: {selectedActivity.users.matricula}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Atividade
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.activity_types.nome}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Horas
                  </Typography>
                  <Typography variant="body1">
                    {formatDecimalHours(selectedActivity.horas)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Certificado
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    component={Link}
                    href={selectedActivity.certificado_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    Visualizar Certificado
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Comentário"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Adicione um comentário sobre esta atividade..."
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ color: "#666" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              {loading ? "Processando..." : "Rejeitar"}
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={loading}
            >
              {loading ? "Processando..." : "Aprovar"}
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

export default SecretariaDashboard;
