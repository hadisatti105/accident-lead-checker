const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 API Keys (for dev only — use .env in production)
const API_KEY = 'PZZdW7Su-4s8V-1Bt4-LSlz-zFbUks2YYPhG';
const API_SECRET = 'b91e66f510b681c8e87e7850e232add90143e35f';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files like index.html
app.use(express.static(path.join(__dirname)));

// POST endpoint for lead checking
app.post('/check-lead', async (req, res) => {
  const { lead_email, lead_phone } = req.body;

  // Validation
  if (!lead_email || !lead_phone) {
    return res.status(400).json({
      success: false,
      message: 'Missing lead_email or lead_phone',
    });
  }

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

    // Forward raw XML from Accident.com back to client
    res.type('application/xml').send(response.data);
  } catch (error) {
    console.error('❌ Error contacting Accident.com:', error.message);

    // If error includes a response from API
    if (error.response) {
      return res.status(error.response.status).send(error.response.data);
    }

    res.status(500).json({
      success: false,
      message: 'Error contacting Accident.com API',
    });
  }
});

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
