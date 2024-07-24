var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

const {connection} = require('../utils/connection');



const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  
  process.env.REDIRECT_URI,

);

console.log("These are ",  process.env.CLIENT_ID,
process.env.CLIENT_SECRET,

process.env.REDIRECT_URI)

router.get('/google', (req, res) => {

  const userId = req.query.id; // Ensure user_id is available

  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,

    state: userId

  });
  res.redirect(url);
});

// Callback endpoint for OAuth flow
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query; 
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { access_token, refresh_token, expiry_date, scope, token_type } = tokens;


    console.log("ueserId",userId)

    const query = `INSERT INTO user_tokens (user_id, access_token, refresh_token, expiry_date, scope, token_type) 
                   VALUES (?, ?, ?, ?, ?, ?) 
                   ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), expiry_date = VALUES(expiry_date), scope = VALUES(scope), token_type = VALUES(token_type)`;
    
    connection.query(query, [userId, access_token, refresh_token, expiry_date, scope, token_type], (err, result) => {
      if (err) {
        console.error('Error saving tokens to database:', err);
        return res.status(500).send('Failed to save tokens.');
      }

      console.log('Tokens saved successfully:', result);
      res.redirect('http://localhost:5173/manage-tasks');
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Authentication failed.');
  }
});








module.exports = router;
