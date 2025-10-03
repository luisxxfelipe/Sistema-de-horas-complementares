import { useState, useEffect, useMemo } from "react";
import { formatDecimalHours } from "../lib/hoursFormatter";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";

// Componentes estilizados
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const SummaryItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(60, 97, 120, 0.05)",
  marginBottom: theme.spacing(1),
}));

const Reports = ({ activities }) => {
  const [filterType] = useState("all");
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalHours: 0,
    totalActivities: 0,
    averageHours: 0,
    categoryCounts: {},
    statusCounts: {},
    externalCount: 0,
    internalCount: 0,
  });
  const STATUS_COLORS = useMemo(() => ({
    aprovada: "#4caf50",
    pendente: "#ff9800",
    rejeitada: "#f44336",
  }), []);

  useEffect(() => {
    if (activities.length > 0) {
      setLoading(true);
      let filteredActivities = [...activities];
      if (filterType !== "all") {
        filteredActivities = activities.filter(
          (activity) => activity.status === filterType
        );
      }
      const categoryCount = {};
      const categoryHours = {};
      filteredActivities.forEach((activity) => {
        const category = activity.categoria;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        categoryHours[category] = Math.round(((categoryHours[category] || 0) + activity.horas) * 100) / 100;
      });
      const categoryChartData = Object.keys(categoryHours).map((category) => ({
        name: category,
        horas: Math.round(categoryHours[category] * 100) / 100,
        atividades: categoryCount[category],
      }));
      const statusCount = {
        aprovada: 0,
        pendente: 0,
        rejeitada: 0,
      };
      const statusHours = {
        aprovada: 0,
        pendente: 0,
        rejeitada: 0,
      };
      filteredActivities.forEach((activity) => {
        const normalizedStatus = activity.status.toLowerCase();
        statusCount[normalizedStatus] = (statusCount[normalizedStatus] || 0) + 1;
        statusHours[normalizedStatus] =
          Math.round(((statusHours[normalizedStatus] || 0) + activity.horas) * 100) / 100;
        statusHours[activity.status] =
          Math.round(((statusHours[activity.status] || 0) + activity.horas) * 100) / 100;
      });
      const statusChartData = Object.keys(statusCount).map((status) => {
        let label = "";
        if (status === "aprovada") label = "Aprovada";
        else if (status === "pendente") label = "Pendente";
        else if (status === "rejeitada") label = "Rejeitada";
        return {
          name: label,
          value: statusCount[status],
          horas: Math.round(statusHours[status] * 100) / 100,
          color: STATUS_COLORS[status],
        };
      });
      const monthlyActivityData = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
        monthlyActivityData[monthKey] = {
          month: getMonthName(month),
          horas: 0,
          atividades: 0,
        };
      }
      filteredActivities.forEach((activity) => {
        const randomMonthOffset = Math.floor(Math.random() * 6);
        const activityMonth = new Date(
          now.getFullYear(),
          now.getMonth() - randomMonthOffset,
          1
        );
        const monthKey = `${activityMonth.getFullYear()}-${
          activityMonth.getMonth() + 1
        }`;
        if (monthlyActivityData[monthKey]) {
          monthlyActivityData[monthKey].horas += activity.horas;
          monthlyActivityData[monthKey].atividades += 1;
        }
      });
      const monthlyChartData = Object.values(monthlyActivityData);
      const totalHours = Math.round(
        filteredActivities.reduce(
          (sum, activity) => sum + activity.horas,
          0
        ) * 100
      ) / 100; // Arredonda para 2 casas decimais
      const externalCount = filteredActivities.filter(
        (activity) => activity.externa === "Sim"
      ).length;
      const summaryInfo = {
        totalHours,
        totalActivities: filteredActivities.length,
        averageHours:
          filteredActivities.length > 0
            ? (totalHours / filteredActivities.length).toFixed(1)
            : 0,
        categoryCounts: categoryCount,
        statusCounts: statusCount,
        externalCount,
        internalCount: filteredActivities.length - externalCount,
      };
      setCategoryData(categoryChartData);
      setStatusData(statusChartData);
      setMonthlyData(monthlyChartData);
      setSummaryData(summaryInfo);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [activities, filterType, STATUS_COLORS]);

  const getMonthName = (date) => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return months[date.getMonth()];
  };

  // handleFilterChange removido pois não é utilizado

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 2 }}>
          <Typography variant="subtitle2">{label}</Typography>
          {payload.map((entry, index) => (
            <Box
              key={`item-${index}`}
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  mr: 1,
                  borderRadius: "50%",
                }}
              />
              <Typography variant="body2">
                {entry.name}: {entry.value}{" "}
                {entry.dataKey === "horas" ? "horas" : "atividades"}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderTopActivities = () => {
    // Ordenar atividades por horas (decrescente)
    const sortedActivities = [...activities]
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 5);

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "rgba(60, 97, 120, 0.1)" }}>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedActivities.map((activity) => (
              <TableRow key={activity.id} hover>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activity.descricao}
                </TableCell>
                <TableCell>{activity.categoria}</TableCell>
                <TableCell>{formatDecimalHours(activity.horas)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={
                      activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)
                    }
                    color={
                      activity.status === "aprovada"
                        ? "success"
                        : activity.status === "pendente"
                        ? "warning"
                        : "error"
                    }
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress sx={{ color: "#3C6178" }} />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nenhuma atividade registrada. Adicione atividades para visualizar
        relatórios.
      </Alert>
    );
  }

  const filteredStatusData = statusData.filter((item) => item.value > 0);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Cabeçalho e Filtros */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Relatórios e Análises
        </Typography>
      </Box>

      {/* Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardHeader
              title="Resumo Geral"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ pb: 1 }}
            />
            <CardContent>
              <SummaryItem>
                <Typography variant="body2">Total de Atividades</Typography>
                <Typography variant="h6">
                  {summaryData.totalActivities}
                </Typography>
              </SummaryItem>
              <SummaryItem>
                <Typography variant="body2">Total de Horas</Typography>
                <Typography variant="h6">{summaryData.totalHours}</Typography>
              </SummaryItem>
              <SummaryItem>
                <Typography variant="body2">
                  Média de Horas por Atividade
                </Typography>
                <Typography variant="h6">{summaryData.averageHours}</Typography>
              </SummaryItem>
              <SummaryItem>
                <Typography variant="body2">Atividades Externas</Typography>
                <Typography variant="h6">
                  {summaryData.externalCount}
                </Typography>
              </SummaryItem>
              <SummaryItem>
                <Typography variant="body2">Atividades Internas</Typography>
                <Typography variant="h6">
                  {summaryData.internalCount}
                </Typography>
              </SummaryItem>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardHeader
              title="Distribuição por Status"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ pb: 1 }}
            />
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon
                    sx={{ color: STATUS_COLORS.aprovada, mr: 1 }}
                  />
                  <Typography variant="body2">
                    Aprovadas: {summaryData.statusCounts.aprovada || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PendingIcon sx={{ color: STATUS_COLORS.pendente, mr: 1 }} />
                  <Typography variant="body2">
                    Pendentes: {summaryData.statusCounts.pendente || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CancelIcon sx={{ color: STATUS_COLORS.rejeitada, mr: 1 }} />
                  <Typography variant="body2">
                    Rejeitadas: {summaryData.statusCounts.rejeitada || 0}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        percent > 0
                          ? `${name} ${(percent * 100).toFixed(0)}%`
                          : ""
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Horas por Categoria"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="horas" fill="#3C6178" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              title="Evolução Mensal"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="horas"
                    stroke="#3C6178"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="atividades"
                    stroke="#82ca9d"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Atividades com mais horas */}
      <StyledCard sx={{ mb: 4 }}>
        <CardHeader
          title="Atividades com Mais Horas"
          titleTypographyProps={{ variant: "h6" }}
          sx={{ pb: 1 }}
        />
        <CardContent>{renderTopActivities()}</CardContent>
      </StyledCard>

      {/* Distribuição por Categoria (Tabela) */}
      <StyledCard>
        <CardHeader
          title="Distribuição Detalhada por Categoria"
          titleTypographyProps={{ variant: "h6" }}
          sx={{ pb: 1 }}
        />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ backgroundColor: "rgba(60, 97, 120, 0.1)" }}>
                <TableRow>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="center">Quantidade</TableCell>
                  <TableCell align="center">Horas</TableCell>
                  <TableCell align="center">% do Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryData.map((category) => (
                  <TableRow key={category.name} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CategoryIcon sx={{ mr: 1, color: "#3C6178" }} />
                        {category.name}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{category.atividades}</TableCell>
                    <TableCell align="center">{category.horas}</TableCell>
                    <TableCell align="center">
                      {summaryData.totalHours > 0
                        ? `${(
                            (category.horas / summaryData.totalHours) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "rgba(60, 97, 120, 0.05)" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {summaryData.totalActivities}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {summaryData.totalHours}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    100%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default Reports;
