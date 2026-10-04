require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./database');

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Define Routes
app.use('/', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 3000;

// Test DB Connection and sync models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect or sync the database:', err);
  });
