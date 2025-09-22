"use client";

import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import ActivityList from "../components/ActivityList";
import Sidebar from "../components/Sidebar";
import Reports from "../components/Reports";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
  AccessTime as ClockIcon,
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
  const [userId, setUserId] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [tabInitialized, setTabInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setTabInitialized(true);
  }, [location.search]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;
      if (data?.user) setUserId(data.user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return;
      }
      if (data?.user) {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("activities")
        .select(
          `
            id,
            descricao,
            horas,
            externa,
            status,
            comentario,
            activity_types (
              nome,
              categories:categoria_id ( nome )
            )
          `
        )
        .eq("user_id", userId);

      if (error) {
      } else {
        setActivities(
          data.map((item) => ({
            id: item.id,
            descricao: item.descricao,
            horas: item.horas ?? 0,
            externa: item.externa ? "Sim" : "Não",
            status: item.status,
            comentario: item.comentario,
            categoria:
              item.activity_types?.categories?.nome || "Não especificado",
            grupo: item.activity_types?.nome || "Não especificado",
          }))
        );
      }

      setLoading(false);
    };

    fetchActivities();
  }, [userId]);

  // Calcular estatísticas
  const totalHoras = activities.reduce(
    (sum, activity) => sum + activity.horas,
    0
  );
  const aprovadas = activities.filter((a) => a.status === "aprovada").length;
  const pendentes = activities.filter((a) => a.status === "pendente").length;
  const rejeitadas = activities.filter((a) => a.status === "rejeitada").length;

  // Calcular progresso (exemplo: meta de 100 horas)
  const meta = 545;
  const progresso = Math.min(Math.round((totalHoras / meta) * 100), 100);

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

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
              {/* Cards de estatísticas */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <CardHeader
                      title="Total de Horas"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={<ClockIcon sx={{ color: "text.secondary" }} />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">
                        {totalHoras}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta: {meta} horas
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progresso}
                        sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <CardHeader
                      title="Atividades Aprovadas"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={
                        <CheckCircleIcon sx={{ color: "success.main" }} />
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">
                        {aprovadas}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {aprovadas > 0
                          ? `${Math.round(
                              (aprovadas / activities.length) * 100
                            )}%`
                          : "0%"}{" "}
                        do total
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <CardHeader
                      title="Atividades Pendentes"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={<PendingIcon sx={{ color: "warning.main" }} />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">
                        {pendentes}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pendentes > 0
                          ? `${Math.round(
                              (pendentes / activities.length) * 100
                            )}%`
                          : "0%"}{" "}
                        do total
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <CardHeader
                      title="Atividades Rejeitadas"
                      titleTypographyProps={{ variant: "subtitle2" }}
                      action={<CancelIcon sx={{ color: "error.main" }} />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold">
                        {rejeitadas}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rejeitadas > 0
                          ? `${Math.round(
                              (rejeitadas / activities.length) * 100
                            )}%`
                          : "0%"}{" "}
                        do total
                      </Typography>
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
