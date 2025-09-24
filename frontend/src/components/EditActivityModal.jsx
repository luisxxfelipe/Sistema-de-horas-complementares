import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const EditActivityModal = ({ open, onClose, activity, onSave, loading }) => {
  const [form, setForm] = useState({
    descricao: activity?.descricao || "",
    horas: activity?.horas || "",
    file: null,
  });

  React.useEffect(() => {
    setForm({
      descricao: activity?.descricao || "",
      horas: activity?.horas || "",
      file: null,
    });
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setForm((prev) => ({ ...prev, file: selectedFile }));
    }
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Atividade</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          label="Descrição"
          name="descricao"
          fullWidth
          value={form.descricao}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          label="Horas"
          name="horas"
          type="number"
          fullWidth
          value={form.horas}
          onChange={handleChange}
          inputProps={{ min: 0, step: 0.1 }}
        />
        <Box sx={{ mt: 2 }}>
          <Button component="label" variant="contained" sx={{ bgcolor: "#3C6178", color: "#fff" }}>
            Anexar novo certificado (PDF)
            <input type="file" accept="application/pdf" hidden onChange={handleFileChange} />
          </Button>
          {form.file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {form.file.name}
            </Typography>
          )}
          {activity?.certificado_url && !form.file && (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Certificado atual: <a href={activity.certificado_url} target="_blank" rel="noopener noreferrer">Visualizar</a>
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditActivityModal;
