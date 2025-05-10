const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const submitVoiceRoute = require('./routes/submitVoice');

const app = express();
app.use(bodyParser.json());

app.use('/api', submitVoiceRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
