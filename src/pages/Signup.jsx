"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  School as CourseIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Today as CalendarIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Componentes estilizados
const SignupPaper = styled(Paper)(({ theme }) => ({
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

const Signup = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    matricula: "",
    turno: "",
    semestreEntrada: "",
    course_id: "",
    unit_id: "",
  });

  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const steps = ["Informações Pessoais", "Dados Acadêmicos"];

  // Buscar cursos e unidades
  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, nome");

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, nome");

      if (!coursesError) setCourses(coursesData);
      if (!unitsError) setUnits(unitsData);
    };

    fetchData();
  }, []);

  // Filtrar unidades com base no curso selecionado
  useEffect(() => {
    if (formData.course_id) {
      const fetchCourseUnits = async () => {
        const { data, error } = await supabase
          .from("course_units")
          .select("unit_id")
          .eq("course_id", formData.course_id);

        if (!error) {
          const unitIds = data.map((item) => item.unit_id);
          const filtered = units.filter((unit) => unitIds.includes(unit.id));
          setFilteredUnits(filtered);
        }
      };

      fetchCourseUnits();
    } else {
      setFilteredUnits([]);
    }
  }, [formData.course_id, units]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "matricula") {
      // Remove tudo que não for número
      let numericValue = value.replace(/\D/g, "");

      // Adiciona o hífen automaticamente no formato XX-XXXXX
      if (numericValue.length > 2) {
        numericValue = `${numericValue.slice(0, 2)}-${numericValue.slice(
          2,
          7
        )}`;
      }

      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateStep = (step) => {
    setError("");

    if (step === 0) {
      if (!formData.nome.trim()) {
        setError("Nome é obrigatório");
        return false;
      }
      if (!formData.email.trim()) {
        setError("E-mail é obrigatório");
        return false;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@(discente\.)?uemg\.br$/;
      if (!emailRegex.test(formData.email)) {
        setError(
          "O e-mail deve ser institucional (@discente.uemg.br ou @uemg.br)"
        );
        return false;
      }

      if (!formData.senha || formData.senha.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
        return false;
      }
    } else if (step === 1) {
      if (!formData.matricula.trim()) {
        setError("Matrícula é obrigatória");
        return false;
      }
      if (!formData.course_id) {
        setError("Curso é obrigatório");
        return false;
      }
      if (!formData.unit_id) {
        setError("Unidade é obrigatória");
        return false;
      }
      if (!formData.turno) {
        setError("Turno é obrigatório");
        return false;
      }

      const semestreRegex = /^\d{4}\/[1-2]$/;
      if (!semestreRegex.test(formData.semestreEntrada.trim())) {
        setError(
          "Semestre deve estar no formato correto (ex: 2024/1 ou 2024/2)"
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateStep(activeStep)) {
      return;
    }

    setIsLoading(true);

    const userData = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      senha: formData.senha.trim(),
      matricula: formData.matricula.trim(),
      turno: formData.turno,
      semestreEntrada: formData.semestreEntrada.trim(),
      course_id: formData.course_id || null,
      unit_id: formData.unit_id || null,
      role: "aluno",
    };

    try {
      // Criar usuário no Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.senha,
      });

      if (authError || !data?.user) {
        throw new Error("Erro ao criar usuário no Supabase Auth.");
      }

      const userId = data.user.id;

      // Inserir usuário na tabela `users`
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          id: userId,
          email: userData.email,
          nome: userData.nome,
          matricula: userData.matricula,
          turno: userData.turno,
          semestre_entrada: userData.semestreEntrada,
          unit_id: userData.unit_id,
          role: "aluno",
        },
      ]);

      if (userInsertError) {
        throw new Error("Erro ao salvar dados do usuário.");
      }

      // Inserir relação na tabela `user_courses`
      if (userData.course_id) {
        const { error: courseError } = await supabase
          .from("user_courses")
          .insert([
            {
              user_id: userId,
              course_id: userData.course_id,
              matricula: userData.matricula,
              turno: userData.turno,
              semestre_entrada: userData.semestreEntrada,
              unit_id: userData.unit_id,
            },
          ]);

        if (courseError) {
          throw new Error(
            `Erro ao associar usuário ao curso: ${courseError.message}`
          );
        }
      }

      alert("Conta criada com sucesso!");
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
      <Container maxWidth="md">
        <LogoContainer>
          <LogoCircle>
            <SchoolIcon sx={{ fontSize: 40, color: "#3C6178" }} />
          </LogoCircle>
        </LogoContainer>

        <SignupPaper elevation={0}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Cadastro de Aluno
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mb: 3 }}
          >
            Preencha os dados abaixo para criar sua conta
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form
            onSubmit={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
          >
            {activeStep === 0 ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome Completo"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="Digite seu nome completo"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="E-mail Institucional"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={handleChange}
                    fullWidth
                    required
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
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="button"
                    variant="contained"
                    fullWidth
                    onClick={handleNext}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      backgroundColor: "#3C6178",
                      color: "#FFF",
                      "&:hover": { backgroundColor: "#2e4f5e" },
                      borderRadius: 2,
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Próximo
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Matrícula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="XX-XXXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel id="curso-label">Curso</InputLabel>
                    <Select
                      labelId="curso-label"
                      id="curso-select"
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      label="Curso"
                      startAdornment={
                        <InputAdornment position="start">
                          <CourseIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.nome}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>Carregando cursos...</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    required
                    variant="outlined"
                    disabled={!formData.course_id}
                  >
                    <InputLabel id="unidade-label">Unidade</InputLabel>
                    <Select
                      labelId="unidade-label"
                      name="unit_id"
                      value={formData.unit_id}
                      onChange={handleChange}
                      label="Unidade"
                      startAdornment={
                        <InputAdornment position="start">
                          <LocationIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map((unit) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            {unit.nome}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {formData.course_id
                            ? "Nenhuma unidade disponível"
                            : "Selecione um curso primeiro"}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel id="turno-label">Turno</InputLabel>
                    <Select
                      labelId="turno-label"
                      name="turno"
                      value={formData.turno}
                      onChange={handleChange}
                      label="Turno"
                      startAdornment={
                        <InputAdornment position="start">
                          <ScheduleIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Matutino">Matutino</MenuItem>
                      <MenuItem value="Vespertino">Vespertino</MenuItem>
                      <MenuItem value="Noturno">Noturno</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Semestre de Entrada"
                    name="semestreEntrada"
                    value={formData.semestreEntrada}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    placeholder="Ex: 2024/1"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderColor: "#3C6178",
                        color: "#3C6178",
                        "&:hover": {
                          borderColor: "#2e4f5e",
                          backgroundColor: "rgba(60, 97, 120, 0.04)",
                        },
                        borderRadius: 2,
                      }}
                      startIcon={<ArrowBackIcon />}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        flex: 1,
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
                          <PersonAddIcon />
                        )
                      }
                    >
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Já tem uma conta? <StyledLink to="/login">Faça login</StyledLink>
            </Typography>
          </Box>
        </SignupPaper>
      </Container>
    </Box>
  );
};

export default Signup;
