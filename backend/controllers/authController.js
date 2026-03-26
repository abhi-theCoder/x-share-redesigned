// controllers/authController.js - Contains the business logic for auth routes.
const { supabase } = require('../services/supabase.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

// Controller function to handle user registration
async function registerUser(req, res) {
  const { name, email, password, role, company, location } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  try {
    // Check if the user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the user data for insertion
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      points: 50,
      // Conditionally add company and location if the role is 'senior' or 'working professional'
      ...((role === 'senior' || role === 'working professional') && { company, location }),
    };

    // Insert the new user into the database
    const { data: insertedData, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate a JWT token for immediate login after registration
    const token = jwt.sign({ id: insertedData.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      userId: insertedData.id
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// Controller function to handle user login
async function loginUser(req, res) {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Fetch the user from the database
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      throw fetchError;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful.', token, userId: user.id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// Controller function to handle social login initiation
async function initiateSocialLogin(req, res) {
  const { provider } = req.params;
  const allowedProviders = ['google', 'github', 'linkedin'];

  if (!allowedProviders.includes(provider)) {
    return res.status(400).json({ message: `Unsupported provider: ${provider}` });
  }

  // Redirect back to our backend callback
  const redirectUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/social/callback`;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('Supabase OAuth error:', error.message);
      return res.status(400).json({ message: error.message });
    }

    if (data?.url) {
      res.redirect(data.url);
    } else {
      throw new Error('No redirection URL returned from Supabase.');
    }
  } catch (error) {
    console.error('Error in initiateSocialLogin:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

// Controller function to handle the callback from Supabase/Provider
async function handleSocialCallback(req, res) {
  // Pure Backend: Server a page to extract the hash/fragment and send it back to the server
  res.send(`
    <html>
      <body style="background: #030014; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; flex-direction: column;">
        <div style="text-align: center;">
          <h2>Authenticating...</h2>
          <p>Please wait while we finalize your login.</p>
          <div id="error-message" style="color: #ef4444; margin-top: 1rem; display: none;"></div>
        </div>
        <script>
          setTimeout(() => {
            const hash = window.location.hash;
            if (hash && hash.substring(1)) {
              // Parse the implicit grant hash parameters
              const params = new URLSearchParams(hash.substring(1));
              const accessToken = params.get('access_token');
              
              if (accessToken) {
                // Redirect to the actual process-token backend endpoint
                window.location.replace('/api/auth/social/process-token?access_token=' + encodeURIComponent(accessToken));
              } else {
                document.getElementById('error-message').innerText = 'Authentication failed: No access token found in URL hash.';
                document.getElementById('error-message').style.display = 'block';
              }
            } else {
              // Check for code if using PKCE (though standard Supabase uses implicit by default)
              const searchParams = new URLSearchParams(window.location.search);
              if (searchParams.has('error_description')) {
                 document.getElementById('error-message').innerText = 'Authentication error: ' + searchParams.get('error_description');
              } else {
                 document.getElementById('error-message').innerText = 'Authentication failed: No response hash found from provider.';
              }
              document.getElementById('error-message').style.display = 'block';
            }
          }, 500); // 500ms delay to ensure browser parses hash properly
        </script>
      </body>
    </html>
  `);
}

// Controller function to process the access token and create/login the user
async function processSocialToken(req, res) {
  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required.' });
  }

  try {
    // Use the access token to get user info from Supabase
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      throw error || new Error('User not found');
    }

    const email = user.email;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];

    // Check if the user already exists in our 'users' table
    let { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let finalUser = existingUser;

    if (!existingUser) {
      // Create a new user if they don't exist
      const newUser = {
        name,
        email,
        role: 'student', // Default role
        points: 50,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      finalUser = insertedData;
    }

    // Generate our application JWT token
    const token = jwt.sign({ id: finalUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Redirect to the frontend with the token and userId
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}&userId=${finalUser.id}`);
  } catch (error) {
    console.error('Error in processing social token:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

module.exports = { registerUser, loginUser, initiateSocialLogin, handleSocialCallback, processSocialToken };
