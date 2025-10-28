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
const verifyToken = require('./controllers/verifyLoginToken.js');
const adminRoutes = require('./routes/adminRoutes.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookmarks', bookmarks);
app.use('/api/activity', activityRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/verifyToken', verifyToken);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('✅ Welcome to the XShare Backend API!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
