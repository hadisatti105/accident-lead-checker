require('dotenv').config(); // Load API keys from .env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Get API credentials from environment
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname)));

// API route to check lead
app.post('/check-lead', async (req, res) => {
  const { lead_email, lead_phone } = req.body;

  if (!lead_email || !lead_phone) {
    return res.status(400).json({
      success: false,
      message: 'Missing lead_email or lead_phone',
    });
  }

  console.log(`🔎 Checking lead: ${lead_email}, ${lead_phone}`);

  try {
    const response = await axios.post(
      'https://api.accident.com/api/lead-ping',
      {
        lead_email,
        lead_phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
          'api-secret': API_SECRET,
        },
      }
    );

    console.log('✅ API response received');
    res.type('application/xml').send(response.data);
  } catch (error) {
    console.error('❌ Error contacting Accident.com API:', error.message);

    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    res.status(500).json({
      success: false,
      message: 'Server error while contacting Accident.com API',
    });
  }
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
