require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'taller-service' });
});

app.listen(PORT, () => {
  console.log('Taller Service corriendo en puerto ' + PORT);
});