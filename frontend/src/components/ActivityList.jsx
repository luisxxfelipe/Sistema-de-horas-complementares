"use client"

import { useState } from "react"
import { supabase } from "../supabase"
import EditActivityModal from "./EditActivityModal"
import { generatePDF as generatePDFAPI } from "../api/pdf"
import { deleteActivity, updateActivity } from "../api/activities"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  TextField,
  Backdrop,
  CircularProgress,
  Divider,
} from "@mui/material"

import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"

const ActivityList = ({ activities, setActivities, simplified = false }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertSeverity, setAlertSeverity] = useState("success")
  const [searchTerm, setSearchTerm] = useState("")
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [selectedActivityId, setSelectedActivityId] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editActivity, setEditActivity] = useState(null)

  // Manipuladores de menu
  const handleMenuOpen = (event, activityId) => {
    setMenuAnchorEl(event.currentTarget)
    setSelectedActivityId(activityId)
  }

  // Corrige bug: abre modal direto ao clicar em Editar, sem depender do menu
  const handleEditClick = () => {
    const activity = activities.find((a) => a.id === selectedActivityId)
    if (!activity) return
    if (activity.status === "aprovada") {
      setAlertMessage("Não é possível editar uma atividade aprovada.")
      setAlertSeverity("warning")
      setOpenSnackbar(true)
      return
    }
    setEditActivity(activity)
    setEditDialogOpen(true)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedActivityId(null)
  }


  const handleEditSave = async (form) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado.")
      let updates = {
        descricao: form.descricao,
        horas: Number(form.horas),
      }
      // Se anexou novo arquivo, faz upload e atualiza URL
      if (form.file) {
        const fileExt = form.file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(fileName, form.file)
        if (uploadError) throw new Error("Erro ao fazer upload do certificado: " + uploadError.message)
        const { data: publicUrlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
        updates.certificado_url = publicUrlData.publicUrl
      }
      const data = await updateActivity(editActivity.id, updates, token)
      if (data && data.success !== false) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === editActivity.id
              ? { ...a, descricao: updates.descricao, horas: updates.horas, certificado_url: updates.certificado_url || a.certificado_url }
              : a
          )
        )
        setAlertMessage("Atividade editada com sucesso!")
        setAlertSeverity("success")
        setOpenSnackbar(true)
        setEditDialogOpen(false)
      } else {
        throw new Error(data.message || "Erro ao editar atividade.")
      }
    } catch (error) {
      setAlertMessage("Erro ao editar atividade: " + error.message)
      setAlertSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setEditActivity(null)
  }

  // Retorna o ícone e chip correspondente ao status
  const getStatusChip = (status) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "aprovada":
        return <Chip icon={<CheckCircleIcon />} label="Aprovada" color="success" size="small" />
      case "rejeitada":
        return <Chip icon={<CancelIcon />} label="Rejeitada" color="error" size="small" />
      default:
        return <Chip icon={<PendingIcon />} label="Pendente" color="warning" size="small" />
    }
  }

  // Função de exclusão corrigida para remover apenas a atividade certa
  const handleDeleteActivity = async (id) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado.")
      const data = await deleteActivity(id, token)
      if (data && data.success !== false) {
        setActivities((prevActivities) => prevActivities.filter((activity) => activity.id !== id))
        setAlertMessage("Atividade excluída com sucesso!")
        setAlertSeverity("success")
        setOpenSnackbar(true)
      } else {
        throw new Error(data.message || "Erro ao excluir atividade.")
      }
    } catch (error) {
      setAlertMessage("Erro ao excluir atividade: " + error.message)
      setAlertSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
      handleMenuClose()
    }
  }

  // Calcula totais separados por categoria
  const totalHorasPorCategoria = activities.reduce((acc, activity) => {
    const category = activity.categoria || "Não especificado"
    acc[category] = (acc[category] || 0) + activity.horas
    return acc
  }, {})

  // Calcula totais separados por grupo
  const totalHorasPorGrupo = activities.reduce((acc, activity) => {
    const group = activity.grupo || "Não especificado"
    acc[group] = (acc[group] || 0) + activity.horas
    return acc
  }, {})

  // Separação entre horas internas e externas
  const totalHorasExternas = activities.reduce(
    (acc, activity) => (activity.externa === "Sim" ? acc + activity.horas : acc),
    0,
  )
  const totalHorasInternas = activities.reduce(
    (acc, activity) => (activity.externa === "Não" ? acc + activity.horas : acc),
    0,
  )

  // Exportação para CSV agora inclui a categoria
  const exportToCSV = () => {
    const rows = [
      ["Categoria", "Grupo", "Descrição", "Horas", "Externa", "Status", "Comentário"],
      ...activities.map((act) => [
        act.categoria || "Não especificado",
        act.grupo || "Não especificado",
        act.descricao,
        act.horas,
        act.externa,
        act.status,
        act.comentario || "",
      ]),
    ]
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", "atividades.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setAlertMessage("Arquivo CSV exportado com sucesso!")
    setAlertSeverity("success")
    setOpenSnackbar(true)
  }

  const handleGeneratePDF = async (tipoAtividade) => {
    if (activities.length === 0) {
      setAlertMessage("Nenhuma atividade disponível para o PDF.")
      setAlertSeverity("warning")
      setOpenSnackbar(true)
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Usuário não autenticado.")

      // Busca os dados do usuário do contexto global (AuthContext) ou de props, se necessário
      // Aqui, para simplificação, vamos assumir que userData está disponível via localStorage ou contexto
      const userData = JSON.parse(localStorage.getItem("userData")) || {}

      // Filtra atividades conforme tipo
      const filteredActivities = activities.filter((activity) => {
        if (tipoAtividade === "extensao") {
          return (
            activity.categoria?.toLowerCase().includes("extensão") ||
            activity.grupo?.toLowerCase().includes("extensão")
          )
        } else {
          return (
            !activity.categoria?.toLowerCase().includes("extensão") &&
            !activity.grupo?.toLowerCase().includes("extensão")
          )
        }
      })

      if (filteredActivities.length === 0) {
        setAlertMessage(`Nenhuma atividade encontrada para o tipo: ${tipoAtividade}.`)
        setAlertSeverity("warning")
        setOpenSnackbar(true)
        return
      }

      const pdfBlob = await generatePDFAPI(userData, filteredActivities, tipoAtividade, token)

      // Download automático do PDF
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `relatorio_${tipoAtividade}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setAlertMessage("PDF gerado com sucesso!")
      setAlertSeverity("success")
      setOpenSnackbar(true)
    } catch (error) {
      setAlertMessage("Erro inesperado ao gerar o PDF: " + error.message)
      setAlertSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  // Filtragem de atividades
  const filteredActivities = activities.filter(
    (activity) =>
      activity.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.grupo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      {!simplified && (
        <>
          {/* Barra de pesquisa */}
          <Box sx={{ display: "flex", mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar atividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              size="small"
              sx={{ maxWidth: 400 }}
            />
          </Box>

          {/* Cartões de Totais */}
          <Grid container spacing={3} sx={{ marginBottom: 4 }}>
            {[
              { title: "Total por Categoria", data: totalHorasPorCategoria },
              { title: "Total por Grupo", data: totalHorasPorGrupo },
              {
                title: "Total de Horas",
                data: {
                  Internas: totalHorasInternas,
                  Externas: totalHorasExternas,
                },
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: 2,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1, color: "#3C6178" }}>
                      {item.title}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {Object.entries(item.data).map(([key, value]) => (
                        <li key={key}>
                          <Typography variant="body2">
                            <strong>{key}:</strong> {new Intl.NumberFormat("pt-BR").format(value)} horas
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Tabela de Atividades */}
      <TableContainer
        component={Paper}
        sx={{
          marginBottom: 4,
          boxShadow: 2,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grupo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Horas</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Externa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              {!simplified && <TableCell sx={{ fontWeight: "bold" }}>Comentário</TableCell>}
              <TableCell sx={{ fontWeight: "bold" }} align="right">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <TableRow
                  key={activity.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                >
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {activity.descricao}
                  </TableCell>
                  <TableCell>{activity.categoria}</TableCell>
                  <TableCell>{activity.grupo}</TableCell>
                  <TableCell>{new Intl.NumberFormat("pt-BR").format(activity.horas)} horas</TableCell>
                  <TableCell>{activity.externa}</TableCell>
                  <TableCell>{getStatusChip(activity.status)}</TableCell>
                  {!simplified && (
                    <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Typography variant="body2" sx={{ color: "#555" }}>
                        {activity.comentario || "Sem comentário"}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, activity.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={simplified ? 7 : 8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhuma atividade registrada.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu de ações para cada atividade */}
      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditClick();
            handleMenuClose();
          }}
          disabled={(() => {
            const activity = activities.find((a) => a.id === selectedActivityId)
            return activity?.status === "aprovada"
          })()}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      {/* Modal de edição de atividade */}
      <EditActivityModal
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); setEditActivity(null); }}
        activity={editActivity}
        onSave={handleEditSave}
        loading={loading}
      />
        <Divider />
        <MenuItem onClick={() => handleDeleteActivity(selectedActivityId)} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {!simplified && (
        <>
          {/* Botões de Ação */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              marginBottom: 2,
            }}
          >
            <Button
              onClick={() => {
                setLoading(true)
                try {
                  exportToCSV()
                } catch (error) {
                  setAlertMessage("Erro ao exportar o arquivo CSV: " + error.message)
                  setAlertSeverity("error")
                  setOpenSnackbar(true)
                } finally {
                  setLoading(false)
                }
              }}
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{
                backgroundColor: "#3C6178",
                "&:hover": { backgroundColor: "#2e4f5e" },
              }}
            >
              Exportar CSV - Todas as Atividades
            </Button>

            <Button
              onClick={() => handleGeneratePDF("extensao")}
              variant="contained"
              startIcon={<PdfIcon />}
              sx={{
                backgroundColor: "#007bff",
                "&:hover": { backgroundColor: "#0069d9" },
              }}
            >
              Gerar PDF - Atividades de Extensão
            </Button>

            <Button
              onClick={() => handleGeneratePDF("complementares")}
              variant="contained"
              startIcon={<PdfIcon />}
              sx={{
                backgroundColor: "#6f42c1",
                "&:hover": { backgroundColor: "#5e35b1" },
              }}
            >
              Gerar PDF - Atividades Complementares
            </Button>
          </Box>
        </>
      )}

      {/* Notificação ao Exportar CSV e Erros Gerais */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default ActivityList

