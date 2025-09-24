"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { createActivity } from "../api/activities";
import { supabase } from "../supabase";
import { getCategories } from "../api/categories";
import { getGroupsByCategory, getGroupDetails } from "../api/groups";

import {
  AttachFile as AttachFileIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Timer as TimerIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FilePreview = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(60, 97, 120, 0.08)",
  marginTop: theme.spacing(1),
}));

const ActivityForm = ({ onActivityAdded }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    group: "",
    description: "",
    hours: "",
    external: false,
  });

  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});
  const [categoryDetails, setCategoryDetails] = useState(null);

  const steps = ["Informações Básicas", "Detalhes da Atividade", "Certificado"];

  // Carregar as categorias ao carregar o componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const categoriesData = await getCategories(token);
        setCategories(categoriesData);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || "Erro ao processar requisição",
          severity: "error",
        });
      }
    };

    fetchCategories();
  }, []);

  // Carregar os grupos de atividades com base na categoria selecionada
  useEffect(() => {
    const fetchGroups = async () => {
      if (formData.category) {
        try {
          const token = localStorage.getItem("token");
          const groupsData = await getGroupsByCategory(
            formData.category,
            token
          );
          setGroupOptions(groupsData);
          setFormData((prevData) => ({ ...prevData, group: "" }));
        } catch (error) {
          setSnackbar({
            open: true,
            message: error.message || "Erro ao processar requisição",
            severity: "error",
          });
        }
      }
    };

    fetchGroups();
  }, [formData.category]);

  // Carregar detalhes do grupo selecionado
  useEffect(() => {
    const fetchGroupDetailsAsync = async () => {
      if (formData.group) {
        try {
          const token = localStorage.getItem("token");
          const data = await getGroupDetails(formData.group, token);
          setCategoryDetails(data);
        } catch (error) {
          setCategoryDetails(null);
        }
      } else {
        setCategoryDetails(null);
      }
    };

    fetchGroupDetailsAsync();
  }, [formData.group]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" && { group: "" }),
    }));

    // Limpar erro do campo quando o usuário digitar
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFormErrors((prev) => ({
        ...prev,
        file: null,
      }));
    } else {
      setSnackbar({
        open: true,
        message: "Por favor, selecione um arquivo PDF válido.",
        severity: "error",
      });
      setFile(null);
      setFormErrors((prev) => ({
        ...prev,
        file: "Selecione um arquivo PDF válido",
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.category) {
        errors.category = "Selecione uma categoria";
        isValid = false;
      }
      if (!formData.group) {
        errors.group = "Selecione um grupo";
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.description) {
        errors.description = "Informe a descrição da atividade";
        isValid = false;
      }
      if (!formData.hours) {
        errors.hours = "Informe a quantidade de horas";
        isValid = false;
      } else if (isNaN(formData.hours) || Number(formData.hours) <= 0) {
        errors.hours = "Informe um valor válido para horas";
        isValid = false;
      }
    } else if (step === 2) {
      if (!file) {
        errors.file = "Anexe o certificado em PDF";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
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

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado.");

      // 1. Upload do arquivo para o Supabase Storage
      let certificado_url = null;
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("certificates")
          .upload(fileName, file);
        if (uploadError)
          throw new Error(
            "Erro ao fazer upload do certificado: " + uploadError.message
          );
        // 2. Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from("certificates")
          .getPublicUrl(fileName);
        certificado_url = publicUrlData.publicUrl;
      }

      // 3. Montar objeto da atividade
      const activity = {
        category: formData.category,
        group: formData.group,
        description: formData.description,
        hours: formData.hours,
        external: formData.external,
        certificado_url,
      };

      // 4. Enviar para o backend
      const data = await createActivity(activity, token);

      // Se a resposta indicar erro, trate corretamente
      if (
        data &&
        (data.success === false ||
          data.error ||
          (data.message && data.message.includes("violates check constraint")))
      ) {
        let errorMsg =
          data.message || data.error || "Erro ao salvar atividade.";
        // Mensagem amigável para erro de constraint
        if (
          errorMsg.includes("violates check constraint") ||
          errorMsg.includes("activities_horas_check")
        ) {
          errorMsg =
            "Não foi possível registrar: a quantidade de horas informada não é permitida para este grupo.";
        } else if (
          errorMsg.includes("limite") ||
          errorMsg.includes("excedido")
        ) {
          errorMsg =
            "Não foi possível registrar: limite de horas do grupo excedido.";
        } else if (errorMsg.includes("zero") || errorMsg.includes("0 horas")) {
          errorMsg =
            "Não foi possível registrar: atividade não pode ser registrada com 0 horas.";
        }
        setSnackbar({
          open: true,
          message: errorMsg,
          severity: "error",
        });
      } else if (data && (data.success === true || !data.error)) {
        setSnackbar({
          open: true,
          message: "Atividade adicionada com sucesso!",
          severity: "success",
        });
        setFormData({
          category: "",
          group: "",
          description: "",
          hours: "",
          external: false,
        });
        setFile(null);
        setActiveStep(0);
        setTimeout(() => {
          if (onActivityAdded) onActivityAdded();
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: "Erro ao salvar atividade.",
          severity: "error",
        });
      }
    } catch (error) {
      let errorMsg = error.message || "Erro ao processar requisição.";
      // Tratamento para erros comuns de restrição
      if (
        errorMsg.includes("violates check constraint") ||
        errorMsg.includes("activities_horas_check")
      ) {
        errorMsg =
          "Não foi possível registrar: a quantidade de horas informada não é permitida para este grupo.";
      } else if (errorMsg.includes("limite") || errorMsg.includes("excedido")) {
        errorMsg =
          "Não foi possível registrar: limite de horas do grupo excedido.";
      } else if (errorMsg.includes("zero") || errorMsg.includes("0 horas")) {
        errorMsg =
          "Não foi possível registrar: atividade não pode ser registrada com 0 horas.";
      }
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    }

    setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Selecione a categoria e o grupo da atividade
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Escolha a categoria e o grupo que melhor representam sua
                atividade complementar.
              </Typography>
            </Grid>

            {/* Seleção de Categoria */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel id="categoria-label">Categoria</InputLabel>
                <Select
                  labelId="categoria-label"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Categoria"
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <Typography color="error" variant="caption">
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Seleção de Grupo */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                disabled={!formData.category}
                error={!!formErrors.group}
              >
                <InputLabel id="grupo-label">Grupo</InputLabel>
                <Select
                  labelId="grupo-label"
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  label="Grupo"
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  }
                >
                  {groupOptions.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.nome} {group.hours && `(Máx: ${group.hours}h)`}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.group && (
                  <Typography color="error" variant="caption">
                    {formErrors.group}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Detalhes do grupo selecionado */}
            {categoryDetails && (
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{ bgcolor: "rgba(60, 97, 120, 0.05)", mt: 1 }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <InfoIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2">
                        Informações do Grupo
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Limite de Horas:</strong> {categoryDetails.hours}{" "}
                      horas
                    </Typography>
                    {categoryDetails.description && (
                      <Typography variant="body2">
                        <strong>Descrição:</strong>{" "}
                        {categoryDetails.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Detalhes da Atividade
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Informe os detalhes da atividade complementar que você realizou.
              </Typography>
            </Grid>

            {/* Campo de Descrição */}
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.description}
                helperText={formErrors.description}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Campo de Horas */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Horas"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.hours}
                helperText={formErrors.hours}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimerIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Checkbox Atividade Externa */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="external"
                    checked={formData.external}
                    onChange={handleChange}
                    sx={{
                      color: "#3C6178",
                      "&.Mui-checked": {
                        color: "#3C6178",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Atividade Externa</Typography>
                    <Tooltip title="Marque esta opção se a atividade foi realizada fora da instituição">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Certificado
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Anexe o certificado que comprova a realização da atividade
                (somente PDF).
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 5,
                  border: "2px dashed",
                  borderColor: file ? "primary.main" : "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(60, 97, 120, 0.04)",
                  },
                }}
              >
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    mb: 2,
                    bgcolor: "#3C6178",
                    "&:hover": {
                      bgcolor: "#2e4f5e",
                    },
                  }}
                >
                  Selecionar Certificado
                  <VisuallyHiddenInput
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Arraste e solte ou clique para selecionar
                </Typography>
                {formErrors.file && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {formErrors.file}
                  </Typography>
                )}
              </Box>
            </Grid>

            {file && (
              <Grid item xs={12}>
                <FilePreview>
                  <AttachFileIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Pronto para envio"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </FilePreview>
              </Grid>
            )}

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Certifique-se de que o certificado está legível e contém todas
                as informações necessárias para validação.
              </Alert>
            </Grid>
          </Grid>
        );
      default:
        return "Passo desconhecido";
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ mb: 3 }} />

      <form
        onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}
      >
        {getStepContent(activeStep)}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: "#3C6178",
              color: "#3C6178",
              "&:hover": {
                borderColor: "#2e4f5e",
                bgcolor: "rgba(60, 97, 120, 0.04)",
              },
            }}
          >
            Voltar
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
              sx={{
                bgcolor: "#3C6178",
                "&:hover": {
                  bgcolor: "#2e4f5e",
                },
              }}
            >
              {loading ? "Enviando..." : "Enviar Atividade"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "#3C6178",
                "&:hover": {
                  bgcolor: "#2e4f5e",
                },
              }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default ActivityForm;
