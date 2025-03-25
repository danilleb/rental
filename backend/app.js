const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload')
const app = express();

const allowedOrigins = [
  'http://localhost:3000'
]
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))

const usersRoutes = require('./routes/users');
const rentalPointsRoutes = require('./routes/rental_points');
const notificationsRoutes = require('./routes/notifications');
const logsRoutes = require('./routes/logs');
const inventoryRoutes = require('./routes/inventory');
const feedbackRoutes = require('./routes/feedback');
const faqRoutes = require('./routes/faq');
const categoriesRoutes = require('./routes/categories');
const bookingsRoutes = require('./routes/bookings');
const filesRoutes = require('./routes/files');

app.use('/api/users', usersRoutes);
app.use('/api/rentalPoints', rentalPointsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/files', filesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});