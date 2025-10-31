require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth')

// const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));
