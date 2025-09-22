import { Container, Typography, Box, Breadcrumbs, Link } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import ActivityForm from "../components/ActivityForm"
import { Home as HomeIcon, Add as AddIcon, NavigateNext as NavigateNextIcon } from "@mui/icons-material"

// Componentes estilizados
const PageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#f5f7f9",
}))

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: "#f5f7f9",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}))

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}))

const RegisterActivity = () => {
  const navigate = useNavigate()

  const handleActivityAdded = () => {
    navigate("/dashboard")
  }

  return (
    <PageContainer>
      <Sidebar />
      <MainContent>
        <PageHeader>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
              color="inherit"
              href="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "#3C6178",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "medium",
              }}
            >
              <AddIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Registrar Atividade
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" fontWeight="bold" color="#3C6178" sx={{ mb: 1 }}>
            Registrar Nova Atividade
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Preencha o formulário abaixo para registrar uma nova atividade complementar.
          </Typography>
        </PageHeader>

        <Container maxWidth="md" sx={{ mb: 4 }}>
          <ActivityForm onActivityAdded={handleActivityAdded} />
        </Container>
      </MainContent>
    </PageContainer>
  )
}

export default RegisterActivity

