require('dotenv').config();
const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventory.routes');
const warrantyRoutes = require('./routes/warranty.routes');
const sparePartsRoutes = require('./routes/spareParts.routes');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'legacy-service' });
});

app.use('/inventory', inventoryRoutes);
app.use('/warranty', warrantyRoutes);
app.use('/spare-parts', sparePartsRoutes);

app.listen(PORT);
