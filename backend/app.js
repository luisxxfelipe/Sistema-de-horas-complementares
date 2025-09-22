const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/atividades', require('./routes/activities'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api', require('./routes/catalog'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
