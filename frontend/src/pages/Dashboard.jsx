"use client";

import { useState, useEffect } from "react";
import { getActivities } from "../api/activities";
import ActivityList from "../components/ActivityList";
import Sidebar from "../components/Sidebar";
import Reports from "../components/Reports";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { formatDecimalHours } from "../lib/hoursFormatter";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  School as SchoolIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  FactCheck as FactCheckIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";

// Componentes estilizados
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTabs-indicator": {
    backgroundColor: "#3C6178",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  "&.Mui-selected": {
    color: "#3C6178",
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const Dashboard = () => {
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    navigate(`/dashboard?tab=${newValue}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = Number.parseInt(params.get("tab"), 10);
    if (!isNaN(tab)) {
      setTabValue(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setActivities([]);
          return;
        }
        const data = await getActivities(token);
        setActivities(
          data.map((item) => ({
            id: item.id,
            descricao: item.descricao,
            horas: item.horas ?? 0,
            externa: item.externa ? "Sim" : "Não",
            status: item.status,
            comentario: item.comentario,
            categoria: item.categoria || "Não especificado",
            grupo: item.grupo || "Não especificado",
            tipo_id: item.tipo_id, // Garante que o tipo_id vai para o PDF
          }))
        );
      } catch (error) {
        setActivities([]);
      }
    };
    fetchActivities();
  }, []);

  // Estatísticas
  const metaExtensao = 405;
  const metaComplementares = 150;
  const totalHorasExtensao = activities
    .filter((a) => a.categoria === "Atividades de Extensão" && a.status !== "Rejeitada")
    .reduce((sum, activity) => sum + activity.horas, 0);
  const totalHorasComplementares = activities
    .filter((a) => a.categoria && a.categoria.includes("(Complementar)") && a.status !== "Rejeitada")
    .reduce((sum, activity) => sum + activity.horas, 0);
  const aprovadas = activities.filter((a) => a.status === "Aprovada").length;
  const pendentes = activities.filter((a) => a.status === "Pendente").length;
  const rejeitadas = activities.filter((a) => a.status === "Rejeitada").length;
  const progressoExtensao = Math.min(
    Math.round((totalHorasExtensao / metaExtensao) * 100),
    100
  );
  const progressoComplementares = Math.min(
    Math.round((totalHorasComplementares / metaComplementares) * 100),
    100
  );

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
        {/* Empurra o conteúdo para baixo do AppBar no mobile */}
        <Toolbar sx={{ display: { xs: "block", sm: "none" } }} />

        <Container 
          maxWidth="lg" 
          sx={{ 
            mt: 4, 
            mb: 4,
            px: { xs: 2, sm: 3 }, // Padding responsivo para mobile
            width: "100%",
            maxWidth: { xs: "100%", lg: "lg" }, // Usa toda largura no mobile
          }}
        >
          {/* Cabeçalho da página */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Dashboard
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/register-activity")} // Redireciona para Registro de Atividade
              sx={{
                backgroundColor: "#3C6178",
                "&:hover": { backgroundColor: "#2e4f5e" },
              }}
            >
              Nova Atividade
            </Button>
          </Box>

          {/* Abas */}
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
          >
            <StyledTab label="Visão Geral" />
            <StyledTab label="Atividades" />
            <StyledTab label="Relatórios" />
          </StyledTabs>

          {/* Conteúdo da aba Visão Geral */}
          {tabValue === 0 && (
            <Box sx={{ pt: 3 }}>
              {/* Cards de estatísticas ajustados */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <StatsCard>
                    <CardHeader
                      title="Horas de Extensão"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={
                        <SchoolIcon sx={{ color: totalHorasExtensao >= metaExtensao ? "#43a047" : "#f57c00" }} />
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color={totalHorasExtensao >= metaExtensao ? "#43a047" : "#f57c00"}
                      >
                        {formatDecimalHours(totalHorasExtensao)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta: {metaExtensao} horas
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progressoExtensao}
                        sx={{
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: totalHorasExtensao >= metaExtensao ? "#e8f5e9" : "#fff3e0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: totalHorasExtensao >= metaExtensao ? "#43a047" : "#f57c00",
                          },
                        }}
                      />
                    </CardContent>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatsCard>
                    <CardHeader
                      title="Horas Complementares"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={
                        <WorkspacePremiumIcon sx={{ color: totalHorasComplementares >= metaComplementares ? "#43a047" : "#f57c00" }} />
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color={totalHorasComplementares >= metaComplementares ? "#43a047" : "#f57c00"}
                      >
                        {formatDecimalHours(totalHorasComplementares)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta: {metaComplementares} horas
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progressoComplementares}
                        sx={{
                          mt: 2,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: totalHorasComplementares >= metaComplementares ? "#e8f5e9" : "#fff3e0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: totalHorasComplementares >= metaComplementares ? "#43a047" : "#f57c00",
                          },
                        }}
                      />
                    </CardContent>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatsCard>
                    <CardHeader
                      title="Status das Atividades"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={<FactCheckIcon sx={{ color: "#3C6178" }} />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <CheckCircleIcon
                          sx={{ color: "success.main", mr: 1 }}
                        />
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ mr: 1 }}
                        >
                          Aprovadas:
                        </Typography>
                        <Typography variant="body1">{aprovadas}</Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PendingIcon sx={{ color: "warning.main", mr: 1 }} />
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ mr: 1 }}
                        >
                          Pendentes:
                        </Typography>
                        <Typography variant="body1">{pendentes}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CancelIcon sx={{ color: "error.main", mr: 1 }} />
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          sx={{ mr: 1 }}
                        >
                          Rejeitadas:
                        </Typography>
                        <Typography variant="body1">{rejeitadas}</Typography>
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>
              </Grid>

              {/* Atividades Recentes */}
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Atividades Recentes
              </Typography>
              <ActivityList
                activities={activities.slice(0, 5)}
                setActivities={setActivities}
                simplified={true}
              />
            </Box>
          )}

          {/* Conteúdo da aba Atividades */}
          {tabValue === 1 && (
            <Box sx={{ pt: 3 }}>
              <ActivityList
                activities={activities}
                setActivities={setActivities}
                simplified={false}
              />
            </Box>
          )}

          {/* Conteúdo da aba Relatórios */}
          {tabValue === 2 && (
            <Box sx={{ pt: 3 }}>
              <Reports activities={activities} />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
