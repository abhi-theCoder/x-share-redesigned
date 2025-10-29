const { supabase } = require('../services/supabase.js'); // your supabase client
async function leaderboard(req, res) {
  try {
    const userID = req.userId;

    // Fetch all users points only to calculate rank
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, points')
      .order('points', { ascending: false });

    if (allError) throw allError;

    // Calculate rank from sorted list
    const rank = allUsers.findIndex(u => u.id === userID) + 1;

    // ✅ Fetch Top 5 users
    const { data: topUsers, error: topError } = await supabase
      .from('users')
      .select('id, name, avatar_url, points, total_contributions, company')
      .order('points', { ascending: false })
      .limit(5);

    if (topError) throw topError;

    // ✅ Fetch current user's full details
    const { data: myData, error: myError } = await supabase
      .from('users')
      .select('id, name, avatar_url, points, total_contributions, company')
      .eq('id', userID)
      .single();

    if (myError) throw myError;

    const formattedTopUsers = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar_url,
      points: user.points,
      contributions: user.total_contributions,
      company: user.company,
      level: getLevelInfo(user.points),
      youAreHere: user.id === userID
    }));

    const formattedCurrent = {
      id: myData.id,
      name: myData.name,
      avatar: myData.avatar_url,
      points: myData.points,
      contributions: myData.total_contributions,
      company: myData.company,
      level: getLevelInfo(myData.points),
      rank,
      youAreHere: true
    };

    res.json({
      topUsers: formattedTopUsers,
      currentUser: formattedCurrent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// ✅ Level System (same names you use)
const levels = [
  { name: 'Beginner', min: 0, max: 199 },
  { name: 'Intermediate', min: 200, max: 499 },
  { name: 'Wood', min: 500, max: 799 },
  { name: 'Stone', min: 800, max: 1499 },
  { name: 'Bronze', min: 1500, max: 1999 },
  { name: 'Silver', min: 2000, max: 2499 },
  { name: 'Gold', min: 2500, max: 3499 },
  { name: 'Platinum', min: 3500, max: 4499 },
  { name: 'Diamond', min: 4500, max: 5999 },
  { name: 'Elite', min: 6000, max: 7999 },
  { name: 'Legendary', min: 8000, max: 9999 },
  { name: 'Mythic', min: 10000, max: 14999 },
  { name: 'Ultimate', min: 15000, max: Infinity }
];

function getLevelInfo(points) {
  const levelIndex = levels.findIndex(l => points >= l.min && points <= l.max);
  const levelObj = levels[levelIndex];

  const nextObj = levels[levelIndex + 1] || null;
  const pointsToNextLevel = nextObj ? nextObj.min - points : 0;

  const progressPercent = ((points - levelObj.min) / (levelObj.max - levelObj.min)) * 100;

  return {
    level: levelObj.name,
    nextLevel: nextObj ? nextObj.name : null,
    pointsToNextLevel: pointsToNextLevel < 0 ? 0 : pointsToNextLevel,
    progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent)))
  };
}

module.exports = { leaderboard };