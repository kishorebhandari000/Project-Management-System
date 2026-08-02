const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { corsOriginCallback } = require('./config/corsOrigin');
const { UPLOADS_ROOT } = require('./config/cloudinary');

const app = express();

app.use(cors({ origin: corsOriginCallback, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Serves files saved by the local-disk storage fallback (used when
// Cloudinary credentials aren't configured) - a no-op path otherwise.
app.use('/uploads', express.static(UPLOADS_ROOT));

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
app.use('/api/groups', require('./routes/groupRoutes'));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
