const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.js');
const experienceRoutes = require('./routes/experience.js');
const profileRoutes = require('./routes/profile.js');
const bookmarks = require('./routes/bookmark.js');
const activityRoutes = require('./routes/activityRoutes.js');
const qnaRoutes = require('./routes/qnaRoutes.js');
const leaderboardRoutes = require('./routes/leaderboardRoutes.js');
const jobRoutes = require('./routes/jobs.js');
const resourceRoutes = require('./routes/resourcesRoutes.js');
const verifyToken = require('./controllers/verifyLoginToken.js');
const adminExperienceRoutes = require('./routes/admin/adminExperienceRoutes.js');
const adminJobRoutes = require('./routes/admin/adminJobRoutes.js');
const adminResourceRoutes = require("./routes/admin/adminResourceRoutes.js");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to enable CORS and parse JSON request bodies
app.use(cors());
app.use(express.json());

// Mount the authentication routes under the /api/auth path
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/bookmarks', bookmarks);
app.use('/api/activity', activityRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/verifyToken', verifyToken);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/admin/jobs', adminJobRoutes);
app.use("/api/admin/resources", adminResourceRoutes);
app.use('/api/admin', adminExperienceRoutes);

// A simple welcome route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the XShare Backend API!');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});