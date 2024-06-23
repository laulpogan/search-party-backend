const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { GPT } = require('@openai/whisper-gpt');
const fs = require('fs');

const app = express();
const port = 3000;

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);
const gpt = new GPT({});

// Middleware to handle file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${uuidv4()}_${file.originalname}`);
    },
  }),
});

// Endpoint to handle audio transcription
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const { path } = req.file;

    // Example: Use Whisper GPT for transcription (replace with your actual GPT implementation)
    const transcription = await gpt.transcribeAudio(path);

    // Store transcription in Supabase
    const { data, error } = await supabase.from('transcriptions').insert([
      { text: transcription },
    ]);

    if (error) {
      throw new Error(`Failed to store transcription: ${error.message}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing transcription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
