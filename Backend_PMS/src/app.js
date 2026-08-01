const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { corsOriginCallback } = require('./config/corsOrigin');

const app = express();

app.use(cors({ origin: corsOriginCallback, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/allocations', require('./routes/allocationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
